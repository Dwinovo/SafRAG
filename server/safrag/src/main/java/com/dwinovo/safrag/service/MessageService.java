package com.dwinovo.safrag.service;

public interface MessageService {

    Long addMessage(Long userId, Long conversationId, String role, String content);

    int clearConversationMessages(Long userId, Long conversationId);

    java.util.List<com.dwinovo.safrag.pojo.Message> listConversationMessages(Long userId, Long conversationId);
}


