package com.dwinovo.safrag.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.dwinovo.safrag.pojo.Level;

import java.util.List;

@Mapper
public interface LevelMapper {

    List<Level> findAll();

    Level findByName(String name);
}
