package com.dwinovo.safrag.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum StatusEnum {

    // 通用
    SUCCESS(200, "success"),
    SERVER_ERROR(500, "服务器异常"),

    // 认证鉴权
    UNAUTHORIZED(401, "未登录或令牌缺失"),
    FORBIDDEN(403, "无权限"),

    // 用户相关
    USER_NOT_FOUND(40001, "用户不存在"),
    USER_OR_PASSWORD_ERROR(40002, "用户名或密码错误"),
    USERNAME_EXISTS(40003, "用户名已存在"),

    // 等级相关
    LEVEL_NOT_FOUND(41001, "指定的等级不存在");

    private final int code;
    private final String message;
}

