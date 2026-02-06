package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.ApiResponse;
import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.service.ConversationService;
import com.dwinovo.safrag.service.MessageService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/conversation")
@Validated
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private MessageService messageService;

    public static class CreateConversationReq {
        @NotBlank(message = "标题不能为空")
        public String title;
    }

    public static class UpdateConversationReq {
        @NotBlank(message = "标题不能为空")
        public String title;
    }

    @PostMapping("/create")
    public ApiResponse<Map<String, Object>> create(@RequestBody CreateConversationReq req, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        Long id = conversationService.createConversation(userId, req.title);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        data.put("title", req.title);
        return ApiResponse.success(data);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        boolean ok = conversationService.deleteConversation(userId, id);
        if (!ok) {
            return ApiResponse.error(StatusEnum.FORBIDDEN);
        }
        return ApiResponse.success(null);
    }

    @GetMapping("/list")
    public ApiResponse<List<com.dwinovo.safrag.pojo.Conversation>> list(HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        return ApiResponse.success(conversationService.listUserConversations(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<List<com.dwinovo.safrag.pojo.Message>> listMessages(@PathVariable("id") Long id, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        return ApiResponse.success(messageService.listConversationMessages(userId, id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id, @RequestBody UpdateConversationReq req, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        boolean ok = conversationService.updateConversationTitle(userId, id, req.title);
        if (!ok) {
            return ApiResponse.error(StatusEnum.FORBIDDEN);
        }
        return ApiResponse.success(null);
    }
}



