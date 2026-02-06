package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.ApiResponse;
import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.pojo.KnowledgeBase;
import com.dwinovo.safrag.service.KnowledgeBaseService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/knowledge-base")
@Validated
public class KnowledgeBaseController {

    @Autowired
    private KnowledgeBaseService knowledgeBaseService;

    public static class CreateKBReq {
        @NotBlank(message = "名称不能为空")
        public String name;
        public String description;
    }

    @PostMapping("/create")
    public ApiResponse<Map<String, Object>> create(@RequestBody CreateKBReq req, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        Long id = knowledgeBaseService.createKnowledgeBase(userId, req.name, req.description);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        data.put("name", req.name);
        data.put("description", req.description);
        return ApiResponse.success(data);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        boolean ok = knowledgeBaseService.deleteKnowledgeBase(userId, id);
        if (!ok) {
            return ApiResponse.error(StatusEnum.FORBIDDEN);
        }
        return ApiResponse.success(null);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable("id") Long id,
                                    @RequestBody CreateKBReq req,
                                    HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        knowledgeBaseService.updateKnowledgeBase(userId, id, req.name, req.description);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}")
    public ApiResponse<KnowledgeBase> detail(@PathVariable("id") Long id, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        KnowledgeBase kb = knowledgeBaseService.getKnowledgeBase(userId, id);
        return ApiResponse.success(kb);
    }

    @GetMapping("/list")
    public ApiResponse<List<KnowledgeBase>> list(HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        return ApiResponse.success(knowledgeBaseService.listUserKnowledgeBases(userId));
    }

    @GetMapping("/available")
    public ApiResponse<List<KnowledgeBase>> listAvailable(HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());
        return ApiResponse.success(knowledgeBaseService.listAvailableKnowledgeBases(userId));
    }

}
