package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.ApiResponse;
import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.pojo.User;
import com.dwinovo.safrag.service.UserService;
import com.dwinovo.safrag.service.UserService;
import com.dwinovo.safrag.utils.OSSUtils;
import com.github.pagehelper.PageInfo;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private OSSUtils ossUtils;

    @GetMapping("/{id}")
    public ApiResponse<User> getUser(@PathVariable("id") Long id, HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null || claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        Long userId = Long.valueOf(claims.getSubject());
        if (!userId.equals(id)) {
            throw new BusinessException(StatusEnum.FORBIDDEN);
        }
        User user = userService.findById(userId);
        if (user == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        return ApiResponse.success(user);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<User> updateUser(@PathVariable("id") Long id,
                                        @RequestParam("username") String username,
                                        @RequestParam(value = "levelId", required = false) Integer levelId,
                                        @RequestParam(value = "removeAvatar", required = false) Boolean removeAvatar,
                                        @RequestPart(value = "avatar", required = false) MultipartFile avatar,
                                        HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null || claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        if (!StringUtils.hasText(username)) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "用户名不能为空");
        }
        Long operatorId = Long.valueOf(claims.getSubject());
        User operator = userService.findById(operatorId);
        if (operator == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        User target = userService.findById(id);
        if (target == null) {
            throw new BusinessException(StatusEnum.USER_NOT_FOUND);
        }
        boolean canModifyLevel = false;
        if (!operatorId.equals(id)) {
            Integer operatorPriority = operator.getPriority();
            Integer targetPriority = target.getPriority();
            if (operatorPriority == null || targetPriority == null || operatorPriority >= targetPriority) {
                throw new BusinessException(StatusEnum.FORBIDDEN);
            }
            canModifyLevel = true;
        }
        if (!canModifyLevel) {
            levelId = null;
        }
        if (!username.equals(target.getUsername())) {
            User existed = userService.findByUsername(username);
            if (existed != null && !existed.getId().equals(id)) {
                throw new BusinessException(StatusEnum.USERNAME_EXISTS);
            }
        }

        String currentAvatarUrl = target.getAvatarUrl();
        String newAvatarUrl = currentAvatarUrl;
        boolean shouldRemoveAvatar = Boolean.TRUE.equals(removeAvatar);
        if (shouldRemoveAvatar && StringUtils.hasText(currentAvatarUrl)) {
            try {
                ossUtils.delete(currentAvatarUrl);
            } catch (IllegalArgumentException ignored) {
                // 非本 OSS 地址，忽略删除
            }
            newAvatarUrl = null;
        }
        if (avatar != null && !avatar.isEmpty()) {
            if (!shouldRemoveAvatar && StringUtils.hasText(currentAvatarUrl)) {
                try {
                    ossUtils.delete(currentAvatarUrl);
                } catch (IllegalArgumentException ignored) {
                    // 非本 OSS 地址，忽略删除
                }
            }
            newAvatarUrl = ossUtils.uploadImage(avatar);
        }



        boolean success = userService.updateUser(id, username, newAvatarUrl, levelId);
        if (!success) {
            throw new BusinessException(StatusEnum.SERVER_ERROR);
        }
        User updated = userService.findById(id);
        return ApiResponse.success(updated);
    }

    @GetMapping("/users")
    public ApiResponse<PageInfo<User>> listUsers(@RequestParam(value = "username", required = false) String username,
                                                 @RequestParam(value = "page", required = false) Integer page,
                                                 @RequestParam(value = "pagesize", required = false) Integer pageSize,
                                                 @RequestParam(value = "level_name", required = false) String levelName,
                                                 HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null || claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        Long operatorId = Long.valueOf(claims.getSubject());
        User operator = userService.findById(operatorId);
        if (operator == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }

        PageInfo<User> users = userService.findUsers(StringUtils.hasText(username) ? username.trim() : null,
                page,
                pageSize,
                StringUtils.hasText(levelName) ? levelName.trim() : null);

        return ApiResponse.success(users);
    }

    @GetMapping("/count")
    public ApiResponse<Long> countUsers(@RequestParam(value = "username", required = false) String username,
                                        @RequestParam(value = "level_name", required = false) String levelName,
                                        HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null || claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }
        Long operatorId = Long.valueOf(claims.getSubject());
        User operator = userService.findById(operatorId);
        if (operator == null) {
            throw new BusinessException(StatusEnum.UNAUTHORIZED);
        }

        String trimmedUsername = StringUtils.hasText(username) ? username.trim() : null;
        String trimmedLevelName = StringUtils.hasText(levelName) ? levelName.trim() : null;
        long total = userService.countUsers(trimmedUsername, trimmedLevelName);
        return ApiResponse.success(total);
    }
}
