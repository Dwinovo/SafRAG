package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.ApiResponse;
import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.pojo.Level;
import com.dwinovo.safrag.service.LevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
public class LevelController {

    @Autowired
    private LevelService levelService;

    @GetMapping
    public ApiResponse<List<Level>> listLevels() {
        List<Level> levels = levelService.listAllLevels();
        return ApiResponse.success(levels);
    }

    @GetMapping("/by-name")
    public ApiResponse<Level> getLevelByName(@RequestParam("name") String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessException(StatusEnum.SERVER_ERROR.getCode(), "等级名称不能为空");
        }
        Level level = levelService.findByName(name);
        if (level == null) {
            throw new BusinessException(StatusEnum.LEVEL_NOT_FOUND);
        }
        return ApiResponse.success(level);
    }
}
