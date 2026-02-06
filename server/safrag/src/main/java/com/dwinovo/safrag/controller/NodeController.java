package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.ApiResponse;
import com.dwinovo.safrag.pojo.Node;
import com.dwinovo.safrag.service.NodeService;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nodes")
@Validated
public class NodeController {

    @Autowired
    private NodeService nodeService;

    @GetMapping
    public ApiResponse<List<Node>> listNodes(@RequestParam("documentId") @NotNull Long documentId) {
        return ApiResponse.success(nodeService.listNodesByDocument(documentId));
    }
}
