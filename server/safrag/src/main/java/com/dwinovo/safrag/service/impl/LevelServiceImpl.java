package com.dwinovo.safrag.service.impl;

import com.dwinovo.safrag.mapper.LevelMapper;
import com.dwinovo.safrag.pojo.Level;
import com.dwinovo.safrag.service.LevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LevelServiceImpl implements LevelService {

    @Autowired
    private LevelMapper levelMapper;

    @Override
    public List<Level> listAllLevels() {
        return levelMapper.findAll();
    }

    @Override
    public Level findByName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        return levelMapper.findByName(name.trim());
    }
}
