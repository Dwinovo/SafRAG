package com.dwinovo.safrag.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RagIngestRequest {

    @JsonProperty("knowledge_base_id")
    private Long knowledgeBaseId;

    @JsonProperty("document_url")
    private String documentUrl;

    @JsonProperty("document_id")
    private Long documentId;

    public RagIngestRequest() {
    }

    public RagIngestRequest(Long knowledgeBaseId, String documentUrl, Long documentId) {
        this.knowledgeBaseId = knowledgeBaseId;
        this.documentUrl = documentUrl;
        this.documentId = documentId;
    }

    public Long getKnowledgeBaseId() {
        return knowledgeBaseId;
    }

    public void setKnowledgeBaseId(Long knowledgeBaseId) {
        this.knowledgeBaseId = knowledgeBaseId;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    // Builder pattern manually implemented to match usage in DocumentServiceImpl
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long knowledgeBaseId;
        private String documentUrl;
        private Long documentId;

        public Builder knowledgeBaseId(Long knowledgeBaseId) {
            this.knowledgeBaseId = knowledgeBaseId;
            return this;
        }

        public Builder documentUrl(String documentUrl) {
            this.documentUrl = documentUrl;
            return this;
        }

        public Builder documentId(Long documentId) {
            this.documentId = documentId;
            return this;
        }

        public RagIngestRequest build() {
            return new RagIngestRequest(knowledgeBaseId, documentUrl, documentId);
        }
    }
}
