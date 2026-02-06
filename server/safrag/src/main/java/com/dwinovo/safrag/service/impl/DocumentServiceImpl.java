package com.dwinovo.safrag.service.impl;

import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.mapper.DocumentMapper;
import com.dwinovo.safrag.mapper.NodeMapper;
import com.dwinovo.safrag.pojo.Document;
import com.dwinovo.safrag.pojo.Node;
import com.dwinovo.safrag.pojo.RagIngestResponse;
import com.dwinovo.safrag.service.DocumentService;
import com.dwinovo.safrag.utils.OSSUtils;
import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
public class DocumentServiceImpl implements DocumentService {

    private static final String DEFAULT_STATUS = "PENDING";
    private static final String STATUS_PROCESSING = "PROCESSING";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_FAILED = "FAILED";

    @Autowired
    private DocumentMapper documentMapper;

    @Autowired
    private NodeMapper nodeMapper;

    @Autowired
    private OSSUtils ossUtils;

    @Value("${rag.server.host:}")
    private String ragServerHost;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public Document uploadDocument(Long knowledgeBaseId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "上传文件不能为空");
        }

        String fileUrl = ossUtils.uploadDocument(file);
        Document document = new Document();
        document.setKnowledgeBaseId(knowledgeBaseId);
        String originalFilename = file.getOriginalFilename();
        document.setFileName(StringUtils.hasText(originalFilename) ? originalFilename : file.getName());
        document.setFileUrl(fileUrl);
        document.setFileSize(file.getSize());
        document.setProcessingStatus(DEFAULT_STATUS);
        int affected = documentMapper.insert(document);
        if (affected <= 0 || document.getId() == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "保存文档信息失败");
        }

        CompletableFuture.runAsync(() -> processIngestion(document));

        return document;
    }

    @Override
    public List<Document> listDocuments(Long knowledgeBaseId) {
        return documentMapper.listByKnowledgeBaseId(knowledgeBaseId);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteDocument(Long knowledgeBaseId, Long documentId) {
        Document document = getDocument(knowledgeBaseId, documentId);
        if (document == null) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        // 删掉文档
        int affected = documentMapper.deleteById(documentId);
        if (affected <= 0) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "删除文档失败");
        }
        // 删掉节点
        nodeMapper.deleteByDocumentId(documentId);
        if (StringUtils.hasText(document.getFileUrl())) {
            try {
                // 删掉OSS
                ossUtils.delete(document.getFileUrl());
            } catch (Exception ex) {
                log.warn("删除 OSS 文档资源失败: {}", document.getFileUrl(), ex);
            }
        }
        // 删掉RAG侧数据（如果有的话）
        deleteNodesFromRag(document.getKnowledgeBaseId(), documentId);

    }
    @Override
    public Document getDocument(Long knowledgeBaseId, Long documentId) {
        if (knowledgeBaseId == null || documentId == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "缺少必要的文档参数");
        }
        Document existing = documentMapper.findById(documentId);
        if (existing == null || !knowledgeBaseId.equals(existing.getKnowledgeBaseId())) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        return existing;
    }
    

    private void processIngestion(Document document) {
        Long documentId = document.getId();
        if (documentId == null) {
            return;
        }
        updateDocumentStatus(documentId, STATUS_PROCESSING);
        if (restTemplate == null) {
            log.warn("RestTemplate 未初始化，跳过文档 {} 的切片。", documentId);
            updateDocumentStatus(documentId, STATUS_FAILED);
            return;
        }
        String ingestUrl = ragServerHost+"/ingest";
        if (!StringUtils.hasText(ingestUrl)) {
            log.warn("RAG Server 未配置，跳过文档 {} 的切片。", documentId);
            updateDocumentStatus(documentId, STATUS_FAILED);
            return;
        }

        Map<String, Object> payload = new HashMap<>(4);
        payload.put("knowledge_base_id", document.getKnowledgeBaseId());
        payload.put("document_url", document.getFileUrl());
        payload.put("document_id", documentId);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            
            ResponseEntity<RagIngestResponse> response = restTemplate.postForEntity(ingestUrl, entity, RagIngestResponse.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                updateDocumentStatus(documentId, STATUS_FAILED);
                return;
            }

            RagIngestResponse body = response.getBody();
            if (body == null || body.getCode() == null || body.getCode() != 200) {
                updateDocumentStatus(documentId, STATUS_FAILED);
                return;
            }

            if (body.getData() == null || body.getData().getDocument() == null) {
                insertNodes(documentId, Collections.<RagIngestResponse.RagNode>emptyList());
            } else {
                List<RagIngestResponse.RagNode> ragNodes = body.getData().getDocument().getNodes();
                insertNodes(documentId, ragNodes != null ? ragNodes : Collections.<RagIngestResponse.RagNode>emptyList());
            }

            updateDocumentStatus(documentId, STATUS_COMPLETED);
        } catch (HttpClientErrorException httpError) {
            updateDocumentStatus(documentId, STATUS_FAILED);
        } catch (Exception ex) {
            log.error("处理文档 {} 的 RAG 切片时发生异常", documentId, ex);
            updateDocumentStatus(documentId, STATUS_FAILED);
        }
    }


    private void insertNodes(Long documentId, List<RagIngestResponse.RagNode> ragNodes) {
        List<Node> nodes = ragNodes.stream()
                .filter(node -> StringUtils.hasText(node.getContext()) && StringUtils.hasText(node.getNodeId()))
                .map(node -> {
                    Node item = new Node();
                    item.setId(node.getNodeId());
                    item.setDocumentId(documentId);
                    item.setContext(node.getContext());
                    return item;
                })
                .collect(Collectors.toList());
        if (!nodes.isEmpty()) {
            nodeMapper.insertBatch(nodes);
        }
    }

    private void updateDocumentStatus(Long documentId, String status) {
        Document toUpdate = new Document();
        toUpdate.setId(documentId);
        toUpdate.setProcessingStatus(status);
        try {
            documentMapper.update(toUpdate);
        } catch (Exception ex) {
            log.warn("更新文档 {} 状态为 {} 失败", documentId, status, ex);
        }
    }

    private void deleteNodesFromRag(Long knowledgeBaseId, Long documentId) {
        if (knowledgeBaseId == null || documentId == null) {
            return;
        }
        if (restTemplate == null) {
            log.warn("RestTemplate 未初始化，跳过文档 {} 的 RAG 节点删除。", documentId);
            return;
        }
        String nodesUrl = ragServerHost+"/nodes";
        if (!StringUtils.hasText(nodesUrl)) {
            log.warn("RAG Server 未配置，跳过文档 {} 的 RAG 节点删除。", documentId);
            return;
        }

        try {
            URI uri = UriComponentsBuilder.fromUriString(nodesUrl)
                    .queryParam("knowledge_base_id", knowledgeBaseId)
                    .queryParam("document_id", documentId)
                    .build(true)
                    .toUri();
            restTemplate.delete(uri);
        } catch (HttpClientErrorException httpError) {

        } catch (Exception ex) {
            log.error("删除文档 {} 的 RAG 节点时发生异常", documentId, ex);
        }
    }
}
