package com.dwinovo.safrag.pojo;

import lombok.Data;
import java.util.Date;

@Data
public class RefreshToken {

    private Long id;
    private Long userId;
    private String refreshToken; // 存储哈希后的令牌
    private Date expiresAt;
    private Date createdAt;
    private Boolean revoked;
}


