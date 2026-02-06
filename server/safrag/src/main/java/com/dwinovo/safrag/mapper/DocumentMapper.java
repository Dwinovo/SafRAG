package com.dwinovo.safrag.mapper;

import com.dwinovo.safrag.pojo.Document;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DocumentMapper {

    int insert(Document document);

    Document findById(@Param("id") Long id);

    List<Document> listByKnowledgeBaseId(@Param("knowledgeBaseId") Long knowledgeBaseId);

    int update(Document document);

    int deleteById(@Param("id") Long id);
}

