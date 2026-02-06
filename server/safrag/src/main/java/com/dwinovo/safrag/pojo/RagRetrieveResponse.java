package com.dwinovo.safrag.pojo;

import java.util.List;
import lombok.Data;

@Data
public class RagRetrieveResponse {

    private Integer code;
    private String message;
    private DataPayload data;

    @Data
    public static class DataPayload {
        private List<RagNode> nodes;
    }

    @Data
    public static class RagNode {
        private String nodeId;
        private Long documentId;
        private String context;
    }
}
