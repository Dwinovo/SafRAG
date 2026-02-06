package com.dwinovo.safrag.pojo;

import java.util.Date;
import lombok.Data;

@Data
public class Node {
    private String id;
    private Long documentId;
    private String context;
    private Date createdAt;
    private Date updatedAt;
}
