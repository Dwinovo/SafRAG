package com.dwinovo.safrag.service;

import java.util.List;

import com.dwinovo.safrag.pojo.User;
import com.github.pagehelper.PageInfo;

public interface UserService {
    User findByUsername(String username);

    User findById(Long id);

    User createUser(String username, String rawPassword, int levelId, String avatarUrl);

    boolean updateUser(Long id, String username, String avatarUrl, Integer levelId);

    List<User> findAll();
    
    PageInfo<User> findUsers(String username, Integer page, Integer pageSize, String levelName);

    long countUsers(String username, String levelName);
}
