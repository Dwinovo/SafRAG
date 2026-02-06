package com.dwinovo.safrag.pojo;

import lombok.Data;

import java.util.Date;

@Data
public class KnowledgeBase {

    private Long id;
    private Long userId;
    private String name;
    private String description;
    private Date createdAt;
    private Date updatedAt;
    private String ownerName;
    private String ownerLevelName;
    private String ownerAvatar;
    private Integer ownerPriority;
}
