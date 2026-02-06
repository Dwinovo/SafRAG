package com.dwinovo.safrag.service;

import com.dwinovo.safrag.pojo.Conversation;
import java.util.List;

public interface ConversationService {

    Long createConversation(Long userId, String title);

    boolean deleteConversation(Long userId, Long conversationId);

    List<Conversation> listUserConversations(Long userId);

    boolean updateConversationTitle(Long userId, Long conversationId, String newTitle);
}



