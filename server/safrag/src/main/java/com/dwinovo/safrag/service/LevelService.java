package com.dwinovo.safrag.service;

import java.util.List;

import com.dwinovo.safrag.pojo.Level;

public interface LevelService {

    List<Level> listAllLevels();

    Level findByName(String name);
}
