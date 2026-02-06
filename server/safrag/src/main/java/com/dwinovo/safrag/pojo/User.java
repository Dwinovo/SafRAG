package com.dwinovo.safrag.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class User {

    private Long id;
    @NotBlank(message = "用户名不能为空")
    private String username;
    @NotBlank(message = "密码不能为空")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private int levelId;
    private String avatarUrl;

    // Levels表信息
    private String levelName;
    int priority;
}
