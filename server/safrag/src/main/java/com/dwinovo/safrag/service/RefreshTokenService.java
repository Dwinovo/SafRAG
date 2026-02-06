package com.dwinovo.safrag.service;

public interface RefreshTokenService {

    void storeRefreshToken(long userId, String refreshToken, long expireMinutes);

    boolean validateRefreshToken(String refreshToken);

    void invalidateRefreshToken(String refreshToken);
}


