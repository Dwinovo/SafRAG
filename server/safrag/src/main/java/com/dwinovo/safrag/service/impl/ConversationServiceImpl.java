package com.dwinovo.safrag.service.impl;

import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.mapper.ConversationMapper;
import com.dwinovo.safrag.mapper.MessageMapper;
import com.dwinovo.safrag.pojo.Conversation;
import com.dwinovo.safrag.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConversationServiceImpl implements ConversationService {

    @Autowired
    private ConversationMapper conversationMapper;

    @Autowired
    private MessageMapper messageMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createConversation(Long userId, String title) {
        if (userId == null || title == null || title.isBlank()) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        // 创建会话
        Conversation c = new Conversation();
        c.setUserId(userId);
        c.setTitle(title);
        int n = conversationMapper.insert(c);
        if (n <= 0 || c.getId() == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }

        
        return c.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteConversation(Long userId, Long conversationId) {
        if (userId == null || conversationId == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        
        // 先删除该会话的所有消息
        messageMapper.deleteByConversationId(conversationId);
        
        // 再删除会话本身
        int n = conversationMapper.deleteByIdAndUserId(conversationId, userId);
        return n > 0;
    }

    @Override
    public List<Conversation> listUserConversations(Long userId) {
        if (userId == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        return conversationMapper.listByUserId(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateConversationTitle(Long userId, Long conversationId, String newTitle) {
        if (userId == null || conversationId == null || newTitle == null || newTitle.isBlank()) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }

        int n = conversationMapper.updateTitleByIdAndUserId(conversationId, userId, newTitle);
        return n > 0;
    }
}



