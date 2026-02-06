package com.dwinovo.safrag.service;

import com.dwinovo.safrag.pojo.KnowledgeBase;
import java.util.List;

public interface KnowledgeBaseService {

    Long createKnowledgeBase(Long userId, String name, String description);

    boolean deleteKnowledgeBase(Long userId, Long id);

    List<KnowledgeBase> listUserKnowledgeBases(Long userId);

    KnowledgeBase getKnowledgeBase(Long userId, Long id);

    void updateKnowledgeBase(Long userId, Long id, String name, String description);

    List<KnowledgeBase> listAvailableKnowledgeBases(Long userId);
}
