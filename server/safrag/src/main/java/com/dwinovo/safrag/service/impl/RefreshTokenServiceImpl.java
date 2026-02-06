package com.dwinovo.safrag.service.impl;

import com.dwinovo.safrag.mapper.RefreshTokenMapper;
import com.dwinovo.safrag.pojo.RefreshToken;
import com.dwinovo.safrag.service.RefreshTokenService;
import com.dwinovo.safrag.utils.TokenHashUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Autowired
    private RefreshTokenMapper refreshTokenMapper;

    @Override
    public void storeRefreshToken(long userId, String refreshToken, long expireMinutes) {
        String hash = TokenHashUtil.sha256(refreshToken);
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + expireMinutes * 60 * 1000);

        RefreshToken record = new RefreshToken();
        record.setUserId(userId);
        record.setRefreshToken(hash);
        record.setExpiresAt(expiresAt);
        record.setCreatedAt(now);
        record.setRevoked(Boolean.FALSE);
        refreshTokenMapper.insert(record);
    }

    @Override
    public boolean validateRefreshToken(String refreshToken) {
        String hash = TokenHashUtil.sha256(refreshToken);
        RefreshToken record = refreshTokenMapper.findByTokenHash(hash);
        if (record == null) {
            return false;
        }
        if (Boolean.TRUE.equals(record.getRevoked())) {
            return false;
        }
        return record.getExpiresAt().after(new Date());
    }

    @Override
    public void invalidateRefreshToken(String refreshToken) {
        String hash = TokenHashUtil.sha256(refreshToken);
        refreshTokenMapper.deleteByTokenHash(hash);
    }
}


