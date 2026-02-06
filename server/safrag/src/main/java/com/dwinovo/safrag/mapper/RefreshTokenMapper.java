package com.dwinovo.safrag.mapper;

import com.dwinovo.safrag.pojo.RefreshToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;

@Mapper
public interface RefreshTokenMapper {

    int insert(RefreshToken token);

    RefreshToken findByTokenHash(@Param("tokenHash") String tokenHash);

    int revokeByTokenHash(@Param("tokenHash") String tokenHash);

    int deleteExpired(@Param("now") Date now);

    int deleteByTokenHash(@Param("tokenHash") String tokenHash);
}


