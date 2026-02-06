package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.ApiResponse;
import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.service.MessageService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/message")
@Validated
public class MessageController {

    @Autowired
    private MessageService messageService;

    public static class AddMessageReq {
        @NotNull(message = "conversationId 不能为空")
        public Long conversationId;
        @NotBlank(message = "role 不能为空")
        public String role;
        @NotBlank(message = "content 不能为空")
        public String content;
    }

    @PostMapping("/add")
    public ApiResponse<Map<String, Object>> add(@RequestBody AddMessageReq req, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        Long id = messageService.addMessage(userId, req.conversationId, req.role, req.content);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        return ApiResponse.success(data);
    }

    @DeleteMapping("/clear/{conversationId}")
    public ApiResponse<Map<String, Object>> clear(@PathVariable("conversationId") Long conversationId, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        int n = messageService.clearConversationMessages(userId, conversationId);
        Map<String, Object> data = new HashMap<>();
        data.put("deleted", n);
        return ApiResponse.success(data);
    }

    @GetMapping("/list/{conversationId}")
    public ApiResponse<List<com.dwinovo.safrag.pojo.Message>> list(@PathVariable("conversationId") Long conversationId, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        return ApiResponse.success(messageService.listConversationMessages(userId, conversationId));
    }
}


