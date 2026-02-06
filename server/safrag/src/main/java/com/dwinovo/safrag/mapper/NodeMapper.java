package com.dwinovo.safrag.mapper;

import com.dwinovo.safrag.pojo.Node;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface NodeMapper {

    int deleteByDocumentId(@Param("documentId") Long documentId);

    int insertBatch(@Param("nodes") List<Node> nodes);

    List<Node> listByDocumentId(@Param("documentId") Long documentId);
}
