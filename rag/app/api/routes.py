import logging
import shutil
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from llama_index.core import SimpleDirectoryReader
from llama_index.core.vector_stores import ExactMatchFilter, FilterCondition, MetadataFilters

from app.core.utils import extract_text, normalize_metadata, serialize_node, sanitize_text
from app.dto.schemas import ApiResponse, IngestRequest, RetrieveRequest
from app.services.rag import get_chroma_collection, get_index, get_node_parser

logger = logging.getLogger("rag")
router = APIRouter()


@router.post("/ingest", response_model=ApiResponse)
async def ingest_document(request: Request) -> ApiResponse:
    temp_dir_path: Optional[Path] = None

    try:
        raw_body_bytes = await request.body()
        logger.info(f"Raw body received: {raw_body_bytes.decode('utf-8', errors='replace')}")
        
        json_body = await request.json()
        body = IngestRequest(**json_body)
        index = get_index(request.app)
        node_parser = get_node_parser(request.app)

        temp_dir_path = Path(tempfile.mkdtemp(prefix="ingest_"))

        async with httpx.AsyncClient(timeout=60.0) as client:
            parsed_url = urlparse(body.document_url)
            filename = Path(parsed_url.path).name or "document"
            temp_file_path = temp_dir_path / filename

            response = await client.get(body.document_url)
            response.raise_for_status()

            temp_file_path.write_bytes(response.content)

        reader = SimpleDirectoryReader(input_files=[str(temp_file_path)])
        documents = reader.load_data()

        cleaned_documents = []
        for doc in documents:
            # Sanitize text to remove surrogates
            original_text = doc.get_content() if hasattr(doc, "get_content") else (doc.text or "")
            cleaned_text = sanitize_text(original_text)
            
            # Recreate document/node with cleaned text
            # We modify the existing doc object using set_content if possible, 
            # otherwise we might need to rely on the fact that we can just pass the list to node_parser.
            # LlamaIndex Document usually has a setText or we just create a new one.
            
            # safest way: update the doc using provided methods if available, or just create new one
            # doc is likely a Pydantic model. 
            # In LlamaIndex 0.10+, doc.text is a property that wraps self.get_content()
            # self.set_content(value) should work if available.
            
            # Let's try doc.set_content(cleaned_text) first? 
            # But wait, looking at the error "can't set attribute 'text'", it confirms 'text' is a property without setter.
            # BaseComponent -> TextNode -> ... 
            
            # Let's just create a new list of documents to be safe.
            doc.set_content(cleaned_text)
            doc.metadata = {
                "knowledge_base_id": body.knowledge_base_id,
                "source": filename,
                "document_id": body.document_id,
            }
            cleaned_documents.append(doc)

        nodes = node_parser.get_nodes_from_documents(cleaned_documents)

        formatted_nodes: List[Dict[str, Any]] = []

        if nodes:
            index.insert_nodes(nodes)
            logger.info("Inserted %d nodes for url %s", len(nodes), body.document_url)
            formatted_nodes = [
                serialize_node(
                    node.node_id,
                    extract_text(node),
                    getattr(node, "metadata", {}),
                    fallback_document_id=body.document_id,
                )
                for node in nodes
            ]
        else:
            logger.info("No nodes generated for url %s", body.document_url)

        return ApiResponse(
            code=200,
            message="success",
            data={
                "document": {
                    "document_id": body.document_id,
                    "document_url": body.document_url,
                    "filename": filename,
                    "nodes": formatted_nodes,
                },
                "nodes_inserted": len(formatted_nodes),
            },
        )
    except Exception as exc:
        logger.exception("Failed to ingest documents from URLs")
        status_code = getattr(exc, "status_code", 500)
        message = str(exc) or exc.__class__.__name__
        return JSONResponse(
            status_code=status_code,
            content=ApiResponse(code=status_code, message=message, data={}).dict(),
        )
    finally:
        if temp_dir_path:
            shutil.rmtree(temp_dir_path, ignore_errors=True)


@router.get("/nodes", response_model=ApiResponse)
async def list_nodes(
    request: Request,
    document_id: int = Query(..., description="Document identifier"),
    limit: Optional[int] = Query(None, gt=0, description="Maximum number of nodes to return"),
    offset: int = Query(0, ge=0, description="Number of nodes to skip before collecting results"),
) -> ApiResponse:
    try:
        chroma_collection = get_chroma_collection(request.app)

        get_kwargs: Dict[str, Any] = {"where": {"document_id": document_id}}
        if limit is not None:
            get_kwargs["limit"] = limit
        if offset:
            get_kwargs["offset"] = offset

        results = chroma_collection.get(include=["metadatas", "documents"], **get_kwargs)
        if not results.get("ids"):
            fallback_kwargs = {**get_kwargs, "where": {"document_id": str(document_id)}}
            results = chroma_collection.get(include=["metadatas", "documents"], **fallback_kwargs)

        ids: Sequence[str] = results.get("ids", [])
        documents: Sequence[Optional[str]] = results.get("documents", [])
        metadatas: Sequence[Optional[Mapping[str, Any]]] = results.get("metadatas", [])

        nodes: List[Dict[str, Any]] = []
        for node_id, document, metadata in zip(ids, documents, metadatas):
            nodes.append(
                serialize_node(node_id, document or "", metadata, fallback_document_id=document_id)
            )

        return ApiResponse(
            code=200,
            message="success",
            data={"nodes": nodes, "count": len(nodes)},
        )
    except Exception as exc:
        logger.exception("Failed to list nodes for document_id %s", document_id)
        status_code = getattr(exc, "status_code", 500)
        message = str(exc) or exc.__class__.__name__
        return JSONResponse(
            status_code=status_code,
            content=ApiResponse(code=status_code, message=message, data={}).dict(),
        )


@router.delete("/nodes", response_model=ApiResponse)
async def delete_nodes(
    request: Request,
    knowledge_base_id: int = Query(..., description="Knowledge base identifier"),
    document_id: int = Query(..., description="Document identifier"),
) -> ApiResponse:
    try:
        chroma_collection = get_chroma_collection(request.app)

        results = chroma_collection.get(
            include=["metadatas"],
            where={
                "$and": [
                    {"knowledge_base_id": knowledge_base_id},
                    {"document_id": document_id},
                ]
            },
        )

        if not results.get("ids"):
            results = chroma_collection.get(
                include=["metadatas"],
                where={
                    "$and": [
                        {"knowledge_base_id": str(knowledge_base_id)},
                        {"document_id": str(document_id)},
                    ]
                },
            )

        ids: Sequence[str] = results.get("ids", [])

        if ids:
            chroma_collection.delete(ids=list(ids))
            logger.info(
                "Deleted %d nodes for knowledge_base_id=%s document_id=%s",
                len(ids),
                knowledge_base_id,
                document_id,
            )
            message = "success"
        else:
            logger.info(
                "No nodes found to delete for knowledge_base_id=%s document_id=%s",
                knowledge_base_id,
                document_id,
            )
            message = "No nodes matched the provided identifiers"

        return ApiResponse(
            code=200,
            message=message,
            data={"nodes_deleted": len(ids)},
        )
    except Exception as exc:
        logger.exception(
            "Failed to delete nodes for knowledge_base_id=%s document_id=%s",
            knowledge_base_id,
            document_id,
        )
        status_code = getattr(exc, "status_code", 500)
        message = str(exc) or exc.__class__.__name__
        return JSONResponse(
            status_code=status_code,
            content=ApiResponse(code=status_code, message=message, data={}).dict(),
        )


@router.post("/retrieve", response_model=ApiResponse)
async def retrieve_documents(request: Request, body: RetrieveRequest) -> ApiResponse:
    try:
        index = get_index(request.app)

        if not body.allowed_knowledge_base_ids:
            return ApiResponse(code=200, message="success", data={"nodes": []})

        filters_list = [
            ExactMatchFilter(key="knowledge_base_id", value=allowed_knowledge_base_id)
            for allowed_knowledge_base_id in body.allowed_knowledge_base_ids
        ]

        filters = MetadataFilters(filters=filters_list, condition=FilterCondition.OR)

        retriever = index.as_retriever(similarity_top_k=body.top_k, filters=filters)
        results = retriever.retrieve(body.query_text)

        serialized_nodes = [
            serialize_node(
                node_with_score.node.node_id,
                extract_text(node_with_score.node),
                normalize_metadata(node_with_score.node.metadata),
            )
            for node_with_score in results
        ]

        return ApiResponse(code=200, message="success", data={"nodes": serialized_nodes})
    except Exception as exc:
        logger.exception("Failed to retrieve documents")
        status_code = getattr(exc, "status_code", 500)
        message = str(exc) or exc.__class__.__name__
        return JSONResponse(
            status_code=status_code,
            content=ApiResponse(code=status_code, message=message, data={}).dict(),
        )
