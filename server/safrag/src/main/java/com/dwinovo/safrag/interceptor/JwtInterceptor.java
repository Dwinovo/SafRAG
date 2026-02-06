package com.dwinovo.safrag.interceptor;

import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.utils.JwtUtil;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.header}")
    private String authHeader;

    @Value("${jwt.token.prefix}")
    private String tokenPrefix;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行预检请求，避免 CORS 预检无令牌被拦截
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String headerVal = request.getHeader(authHeader);
        String token = null;
        if (headerVal != null && headerVal.startsWith(tokenPrefix)) {
            token = headerVal.substring(tokenPrefix.length());
        } else {
            // 兼容 SSE 的 EventSource 无法设置自定义请求头的情况，支持通过查询参数传递 access_token
            String tokenParam = request.getParameter("access_token");
            if (tokenParam != null && !tokenParam.isBlank()) {
                if (tokenParam.startsWith(tokenPrefix)) {
                    token = tokenParam.substring(tokenPrefix.length());
                } else {
                    token = tokenParam;
                }
            } else {
                throw new BusinessException(StatusEnum.UNAUTHORIZED);
            }
        }
        try {
            Claims claims = jwtUtil.parse(token);
            request.setAttribute("jwtClaims", claims);
            return true;
        } catch (Exception e) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
    }
}


