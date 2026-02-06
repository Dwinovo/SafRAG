package com.dwinovo.safrag.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.dwinovo.safrag.mapper")
public class MybatisConfig {
}


