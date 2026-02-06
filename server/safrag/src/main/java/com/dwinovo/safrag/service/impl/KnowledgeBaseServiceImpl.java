package com.dwinovo.safrag.service.impl;

import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.mapper.KnowledgeBaseMapper;
import com.dwinovo.safrag.pojo.KnowledgeBase;
import com.dwinovo.safrag.pojo.User;
import com.dwinovo.safrag.mapper.UserMapper;
import com.dwinovo.safrag.service.KnowledgeBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
@Service
public class KnowledgeBaseServiceImpl implements KnowledgeBaseService {

    @Autowired
    private KnowledgeBaseMapper knowledgeBaseMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createKnowledgeBase(Long userId, String name, String description) {
        if (userId == null || name == null || name.isBlank()) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        KnowledgeBase kb = new KnowledgeBase();
        kb.setUserId(userId);
        kb.setName(name);
        kb.setDescription(description);
        int n = knowledgeBaseMapper.insert(kb);
        if (n <= 0 || kb.getId() == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        return kb.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteKnowledgeBase(Long userId, Long id) {
        if (userId == null || id == null) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        int n = knowledgeBaseMapper.deleteByIdAndUserId(id, userId);
        return n > 0;
    }

    @Override
    public List<KnowledgeBase> listUserKnowledgeBases(Long userId) {
        if (userId == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        return knowledgeBaseMapper.listByUserId(userId);
    }

    @Override
    public KnowledgeBase getKnowledgeBase(Long userId, Long id) {
        if (userId == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        if (id == null) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }

        User current = userMapper.findById(userId);
        if (current == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }

        KnowledgeBase kb = knowledgeBaseMapper.findById(id);
        if (kb == null) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }

        Integer currentPriority = current.getPriority();
        User owner = userMapper.findById(kb.getUserId());
        Integer ownerPriority = owner != null ? owner.getPriority() : null;

        if (ownerPriority != null && currentPriority != null && ownerPriority < currentPriority) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }

        if (owner != null) {
            kb.setOwnerName(owner.getUsername());
            kb.setOwnerLevelName(owner.getLevelName());
            kb.setOwnerAvatar(owner.getAvatarUrl());
            kb.setOwnerPriority(ownerPriority);
        }
        return kb;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateKnowledgeBase(Long userId, Long id, String name, String description) {
        if (userId == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        if (id == null || name == null || name.isBlank()) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        int affected = knowledgeBaseMapper.updateByIdAndUserId(id, userId, name, description);
        if (affected <= 0) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
    }

    @Override
    public List<KnowledgeBase> listAvailableKnowledgeBases(Long userId) {
        if (userId == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        User current = userMapper.findById(userId);
        if (current == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        Integer priority = current.getPriority();
        if (priority == null) {
            return List.of();
        }
        List<KnowledgeBase> available = knowledgeBaseMapper.listAvailableByPriority(userId, priority);
        if (available != null) {
            for (KnowledgeBase kb : available) {
                if (kb == null) {
                    continue;
                }
                if (kb.getOwnerName() == null || kb.getOwnerName().isBlank()
                        || kb.getOwnerLevelName() == null || kb.getOwnerLevelName().isBlank()
                        || kb.getOwnerAvatar() == null || kb.getOwnerAvatar().isBlank()
                        || kb.getOwnerPriority() == null) {
                    User owner = userMapper.findById(kb.getUserId());
                    if (owner != null) {
                        kb.setOwnerName(owner.getUsername());
                        kb.setOwnerLevelName(owner.getLevelName());
                        kb.setOwnerAvatar(owner.getAvatarUrl());
                        kb.setOwnerPriority(owner.getPriority());
                    }
                }
            }
        }
        List<KnowledgeBase> self = knowledgeBaseMapper.listByUserId(userId);
        if (self != null) {
            for (KnowledgeBase kb : self) {
                if (kb != null) {
                    kb.setOwnerName(current.getUsername());
                    kb.setOwnerLevelName(current.getLevelName());
                    kb.setOwnerAvatar(current.getAvatarUrl());
                    kb.setOwnerPriority(priority);
                }
            }
        }
        java.util.Map<Long, KnowledgeBase> merged = new LinkedHashMap<>();
        if (available != null) {
            for (KnowledgeBase kb : available) {
                if (kb != null) merged.put(kb.getId(), kb);
            }
        }
        if (self != null) {
            for (KnowledgeBase kb : self) {
                if (kb != null) merged.put(kb.getId(), kb);
            }
        }
        List<KnowledgeBase> result = new ArrayList<>(merged.values());
        result.sort((a, b) -> {
            int pa = a.getOwnerPriority() != null ? a.getOwnerPriority() : Integer.MAX_VALUE;
            int pb = b.getOwnerPriority() != null ? b.getOwnerPriority() : Integer.MAX_VALUE;
            if (pa != pb) {
                return Integer.compare(pa, pb);
            }
            long ta = a.getCreatedAt() != null ? a.getCreatedAt().getTime() : Long.MAX_VALUE;
            long tb = b.getCreatedAt() != null ? b.getCreatedAt().getTime() : Long.MAX_VALUE;
            if (ta != tb) {
                return Long.compare(ta, tb);
            }
            long ida = a.getId() != null ? a.getId() : Long.MAX_VALUE;
            long idb = b.getId() != null ? b.getId() : Long.MAX_VALUE;
            return Long.compare(ida, idb);
        });
        return result;
    }
}
