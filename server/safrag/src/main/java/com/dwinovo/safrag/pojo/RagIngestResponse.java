package com.dwinovo.safrag.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;

@Data
public class RagIngestResponse {

    private Integer code;
    private String message;
    private DataPayload data;

    @Data
    public static class DataPayload {
        private RagDocument document;
        @JsonProperty("nodes_inserted")
        private Integer nodesInserted;
    }

    @Data
    public static class RagDocument {
        @JsonProperty("document_id")
        private String documentId;
        @JsonProperty("document_url")
        private String documentUrl;
        private String filename;
        private List<RagNode> nodes;
    }

    @Data
    public static class RagNode {
        @JsonProperty("node_id")
        private String nodeId;
        @JsonProperty("document_id")
        private String documentId;
        private String context;
    }
}

