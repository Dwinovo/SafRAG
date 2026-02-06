package com.dwinovo.safrag.pojo;

import java.util.Date;

import lombok.Data;

@Data
public class Document {

    private Long id;
    private Long knowledgeBaseId;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String processingStatus;
    private Date createdAt;
    private Date updatedAt;
}

