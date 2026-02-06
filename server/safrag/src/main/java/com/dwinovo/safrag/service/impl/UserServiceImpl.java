package com.dwinovo.safrag.service.impl;

import com.dwinovo.safrag.mapper.UserMapper;
import com.dwinovo.safrag.pojo.User;
import com.dwinovo.safrag.service.UserService;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public User findByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    @Override
    public User findById(Long id) {
        if (id == null) {
            return null;
        }
        return userMapper.findById(id);
    }

    @Override
    public User createUser(String username, String rawPassword, int levelId, String avatarUrl) {
        User existed = userMapper.findByUsername(username);
        if (existed != null) {
            return null;
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setLevelId(levelId);
        user.setAvatarUrl(avatarUrl);
        userMapper.insert(user);
        return userMapper.findById(user.getId());
    }

    @Override
    public boolean updateUser(Long id, String username, String avatarUrl, Integer levelId) {
        if (id == null) {
            return false;
        }
        return userMapper.updateUser(id, username, avatarUrl, levelId) > 0;
    }

    @Override
    public java.util.List<User> findAll() {
        return userMapper.findAll();
    }

    @Override
    public PageInfo<User> findUsers(String username, Integer page, Integer pageSize, String levelName) {
        int pageNum = page == null || page < 1 ? 1 : page;
        int size = pageSize == null || pageSize < 1 ? 10 : pageSize;
        PageHelper.startPage(pageNum, size);
        java.util.List<User> users = userMapper.findByConditions(username, levelName);
        return new PageInfo<>(users);
    }

    @Override
    public long countUsers(String username, String levelName) {
        return userMapper.countByConditions(username, levelName);
    }
}
