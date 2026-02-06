package com.dwinovo.safrag.mapper;

import com.dwinovo.safrag.pojo.Conversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ConversationMapper {

    int insert(Conversation c);

    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    List<Conversation> listByUserId(@Param("userId") Long userId);

    int countByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    int updateTitleByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId, @Param("title") String title);
}



