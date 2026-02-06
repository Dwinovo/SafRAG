package com.dwinovo.safrag.mapper;

import com.dwinovo.safrag.pojo.KnowledgeBase;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface KnowledgeBaseMapper {

    int insert(KnowledgeBase kb);

    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    List<KnowledgeBase> listByUserId(@Param("userId") Long userId);

    KnowledgeBase findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    KnowledgeBase findById(@Param("id") Long id);

    int updateByIdAndUserId(@Param("id") Long id,
                             @Param("userId") Long userId,
                             @Param("name") String name,
                             @Param("description") String description);

    List<KnowledgeBase> listAvailableByPriority(@Param("userId") Long userId,
                                                @Param("priority") Integer priority);
}
