package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.ApiResponse;
import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.pojo.Level;
import com.dwinovo.safrag.pojo.RegisterRequest;
import com.dwinovo.safrag.pojo.User;
import com.dwinovo.safrag.service.LevelService;
import com.dwinovo.safrag.service.UserService;
import com.dwinovo.safrag.service.RefreshTokenService;

import com.dwinovo.safrag.utils.JwtUtil;
import com.dwinovo.safrag.utils.OSSUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private LevelService levelService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RefreshTokenService refreshTokenService;
    @Autowired
    private OSSUtils ossUtils;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${jwt.token.prefix}")
    private String tokenPrefix;

    @Value("${jwt.refresh.expire.minutes}")
    private long refreshExpireMinutes;

    // 统一使用 pojo.User 作为请求体载体

    @PostMapping("/login")

    public ApiResponse<Map<String, Object>> login(@RequestBody @Validated User req, HttpServletRequest request, HttpServletResponse response) {
        User user = userService.findByUsername(req.getUsername());
        if (user == null) {
            throw new BusinessException(StatusEnum.USER_NOT_FOUND);
        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BusinessException(StatusEnum.USER_OR_PASSWORD_ERROR);
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", user.getUsername());
        String access_token = jwtUtil.generateAccessToken(String.valueOf(user.getId()), claims);
        String refresh_token = jwtUtil.generateRefreshToken(String.valueOf(user.getId()), claims);
        refreshTokenService.storeRefreshToken(user.getId(), refresh_token, refreshExpireMinutes);

        ResponseCookie refreshCookie = buildRefreshCookie(request, refresh_token, Duration.ofMinutes(refreshExpireMinutes));
        response.addHeader("Set-Cookie", refreshCookie.toString());

        Map<String, Object> resp = new HashMap<>();
        resp.put("username", user.getUsername());
        resp.put("level_id", user.getLevelId());
        resp.put("access_token", tokenPrefix + access_token);
        return ApiResponse.success(resp);
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<User> register(HttpServletRequest request, @Validated @ModelAttribute RegisterRequest registerRequest) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null || claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        Long operatorId = Long.valueOf(claims.getSubject());
        User operator = userService.findById(operatorId);
        if (operator == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        if (operator.getPriority() != 0) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }

        String username = registerRequest.getUsername();
        String password = registerRequest.getPassword();
        String levelName = registerRequest.getLevelName();

        if (!StringUtils.hasText(username)) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "用户名不能为空");
        }
        if (!StringUtils.hasText(password)) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "密码不能为空");
        }
        if (!StringUtils.hasText(levelName)) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "等级名称不能为空");
        }

        String trimmedUsername = username.trim();
        String trimmedLevelName = levelName.trim();

        Level level = levelService.findByName(trimmedLevelName);
        if (level == null) {
            throw new BusinessException(StatusEnum.LEVEL_NOT_FOUND);
        }

        String avatarUrl = null;
        if (registerRequest.getAvatar() != null && !registerRequest.getAvatar().isEmpty()) {
            avatarUrl = ossUtils.uploadImage(registerRequest.getAvatar());
        }
        if (!StringUtils.hasText(avatarUrl)) {
            avatarUrl = "/default_avatar.png";
        }

        User created = userService.createUser(trimmedUsername, password, level.getId(), avatarUrl);
        if (created == null) {
            throw new BusinessException(StatusEnum.USERNAME_EXISTS);
        }
        return ApiResponse.success(created, "注册成功");
    }

    @PostMapping("/refresh")
    public ApiResponse<Map<String, Object>> refresh(HttpServletRequest request, HttpServletResponse response, @CookieValue(value = "refresh_token", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        try {
            io.jsonwebtoken.Claims claims = jwtUtil.parse(refreshToken);
            String subject = claims.getSubject();
            String username = claims.get("username", String.class);

            if (!refreshTokenService.validateRefreshToken(refreshToken)) {
                throw new BusinessException(StatusEnum.UNAUTHORIZED);
            }
            Map<String, Object> newClaims = new HashMap<>();
            newClaims.put("username", username);
            String access_token = jwtUtil.generateAccessToken(subject, newClaims);

            Map<String, Object> resp = new HashMap<>();
            resp.put("access_token", tokenPrefix + access_token);
            return ApiResponse.success(resp);
        } catch (Exception e) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request, HttpServletResponse response, @CookieValue(value = "refresh_token", required = false) String refreshToken) {
        if (refreshToken != null && !refreshToken.isEmpty()) {
            try {
                refreshTokenService.invalidateRefreshToken(refreshToken);
            } catch (Exception ignored) {
            }
        }

        ResponseCookie expiredCookie = buildRefreshCookie(request, "", Duration.ZERO);
        response.addHeader("Set-Cookie", expiredCookie.toString());
        return ApiResponse.success(null);
    }

    private ResponseCookie buildRefreshCookie(HttpServletRequest request, String value, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("refresh_token", value)
                .httpOnly(true)
                .path("/");

        // PERMISSIVE DEFAULT: No domain enforcement, HTTP allowed (Lax)
        builder.domain(null);
        builder.secure(false);
        builder.sameSite("Lax");

        if (maxAge != null) {
            builder.maxAge(maxAge);
        }
        return builder.build();
    }
}
