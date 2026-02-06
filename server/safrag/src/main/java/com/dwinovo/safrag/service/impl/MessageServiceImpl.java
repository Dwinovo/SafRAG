package com.dwinovo.safrag.service.impl;

import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.mapper.ConversationMapper;
import com.dwinovo.safrag.mapper.MessageMapper;
import com.dwinovo.safrag.pojo.Message;
import com.dwinovo.safrag.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private ConversationMapper conversationMapper;



    @Autowired
    private MessageMapper messageMapper;

    @Override
    public Long addMessage(Long userId, Long conversationId, String role, String content) {
        if (userId == null || conversationId == null || role == null || role.isBlank() || content == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        int count = conversationMapper.countByIdAndUserId(conversationId, userId);
        if (count <= 0) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        Message m = new Message();
        m.setConversationId(conversationId);
        m.setRole(role);
        m.setContent(content);
        int n = messageMapper.insert(m);
        if (n <= 0 || m.getId() == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        return m.getId();
    }

    @Override
    public int clearConversationMessages(Long userId, Long conversationId) {
        if (userId == null || conversationId == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        int count = conversationMapper.countByIdAndUserId(conversationId, userId);
        if (count <= 0) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        return messageMapper.deleteByConversationId(conversationId);
    }

    @Override
    public List<Message> listConversationMessages(Long userId, Long conversationId) {
        if (userId == null || conversationId == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        int count = conversationMapper.countByIdAndUserId(conversationId, userId);
        if (count <= 0) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        return messageMapper.listByConversationId(conversationId);
    }
}


