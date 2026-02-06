package com.dwinovo.safrag.service;

import com.dwinovo.safrag.pojo.Document;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {

    Document uploadDocument(Long knowledgeBaseId, MultipartFile file);

    List<Document> listDocuments(Long knowledgeBaseId);

    Document getDocument(Long knowledgeBaseId, Long documentId);

    void deleteDocument(Long knowledgeBaseId, Long documentId);
}
