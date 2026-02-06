package com.dwinovo.safrag.mapper;

import com.dwinovo.safrag.pojo.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface MessageMapper {

    int insert(Message m);

    int deleteByConversationId(@Param("conversationId") Long conversationId);

    List<Message> listByConversationId(@Param("conversationId") Long conversationId);
}


