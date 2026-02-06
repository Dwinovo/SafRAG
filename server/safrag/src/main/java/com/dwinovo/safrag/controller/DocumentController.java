package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.ApiResponse;
import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.pojo.Document;
import com.dwinovo.safrag.pojo.KnowledgeBase;
import com.dwinovo.safrag.service.DocumentService;
import com.dwinovo.safrag.service.KnowledgeBaseService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@Validated
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private KnowledgeBaseService knowledgeBaseService;


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Document> uploadDocument(@RequestParam("knowledgeBaseId") Long knowledgeBaseId,
                                                @RequestPart("file") MultipartFile file,
                                                HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        KnowledgeBase kb = knowledgeBaseService.getKnowledgeBase(userId, knowledgeBaseId);
        if (kb == null || kb.getUserId() == null || !kb.getUserId().equals(userId)) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        Document document = documentService.uploadDocument(knowledgeBaseId, file);
        return ApiResponse.success(document);
    }

    @GetMapping
    public ApiResponse<List<Document>> listDocuments(@RequestParam("knowledgeBaseId") Long knowledgeBaseId,
                                                     HttpServletRequest request) {
        return ApiResponse.success(documentService.listDocuments(knowledgeBaseId));
    }

    @GetMapping("/{documentId}")
    public ApiResponse<Document> getDocument(@RequestParam("knowledgeBaseId") Long knowledgeBaseId,
                                             @PathVariable("documentId") Long documentId,
                                             HttpServletRequest request) {

        return ApiResponse.success(documentService.getDocument(knowledgeBaseId, documentId));
    }

    @DeleteMapping("/{documentId}")
    public ApiResponse<Void> deleteDocument(@RequestParam("knowledgeBaseId") Long knowledgeBaseId,
                                            @PathVariable("documentId") Long documentId,
                                            HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        KnowledgeBase kb = knowledgeBaseService.getKnowledgeBase(userId, knowledgeBaseId);
        if (kb == null || kb.getUserId() == null || !kb.getUserId().equals(userId)) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        documentService.deleteDocument(knowledgeBaseId, documentId);
        return ApiResponse.success(null);
    }
}
