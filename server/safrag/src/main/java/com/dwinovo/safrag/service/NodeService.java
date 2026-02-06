package com.dwinovo.safrag.service;

import com.dwinovo.safrag.pojo.Node;
import java.util.List;

public interface NodeService {

    List<Node> listNodesByDocument(Long documentId);
}
