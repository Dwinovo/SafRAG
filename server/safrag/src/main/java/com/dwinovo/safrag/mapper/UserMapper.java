package com.dwinovo.safrag.mapper;

import com.dwinovo.safrag.pojo.User;
import org.apache.ibatis.annotations.Param;

public interface UserMapper {

    User findByUsername(@Param("username") String username);

    User findById(@Param("id") Long id);

    int insert(User user);

    int updateUser(@Param("id") Long id,
                   @Param("username") String username,
                   @Param("avatarUrl") String avatarUrl,
                   @Param("levelId") Integer levelId);

    java.util.List<User> findAll();

    java.util.List<User> findByConditions(@Param("username") String username,
                                          @Param("levelName") String levelName);

    long countByConditions(@Param("username") String username,
                           @Param("levelName") String levelName);
}
