package com.dwinovo.safrag.pojo;

import lombok.Data;

import java.util.Date;

@Data
public class Message {

    private Long id;
    private Long conversationId;
    private String role;      // user / assistant / system
    private String content;   // message content
    private Date createdAt;
}


