package com.dwinovo.safrag.service.impl;

import com.dwinovo.safrag.mapper.NodeMapper;
import com.dwinovo.safrag.pojo.Node;
import com.dwinovo.safrag.service.NodeService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NodeServiceImpl implements NodeService {

    @Autowired
    private NodeMapper nodeMapper;

    @Override
    public List<Node> listNodesByDocument(Long documentId) {
        if (documentId == null) {
            return List.of();
        }
        return nodeMapper.listByDocumentId(documentId);
    }
}
