package com.dwinovo.safrag.pojo;

import java.util.Date;

import lombok.Data;

@Data
public class Level {
    int id;
    String name;
    int priority;
    String description;
    Date createdAt;
    Date updatedAt;

}
