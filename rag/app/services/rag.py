import logging

import chromadb
from pathlib import Path
from fastapi import FastAPI
from llama_index.core import Settings, StorageContext, VectorStoreIndex
from llama_index.core.node_parser import SimpleNodeParser
# from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore

from app.core.config import OPENAI_API_KEY, OPENAI_BASE_URL, RAG_EMBEDDING_MODEL_NAME

logger = logging.getLogger("rag")

def get_index(app: FastAPI) -> VectorStoreIndex:
    index = getattr(app.state, "index", None)
    if index is None:
        raise RuntimeError("Vector index is not initialized")
    return index

def get_node_parser(app: FastAPI) -> SimpleNodeParser:
    node_parser = getattr(app.state, "node_parser", None)
    if node_parser is None:
        raise RuntimeError("Node parser is not initialized")
    return node_parser

def get_chroma_collection(app: FastAPI):
    chroma_collection = getattr(app.state, "chroma_collection", None)
    if chroma_collection is None:
        raise RuntimeError("Chroma collection is not initialized")
    return chroma_collection

def initialize_rag(app: FastAPI) -> None:
    logger.info("Initializing embeddings and vector store")

    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set for remote embedding model.")

    logger.info(f"Initializing OpenAI Embedding model: {RAG_EMBEDDING_MODEL_NAME}")

    # Ensure api_base ends with /v1 for LlamaIndex/OpenAI compatibility
    api_base = OPENAI_BASE_URL
    if api_base and not api_base.endswith("/v1"):
        api_base = f"{api_base.rstrip('/')}/v1"
    
    embed_model = OpenAIEmbedding(
        model=RAG_EMBEDDING_MODEL_NAME,
        api_key=OPENAI_API_KEY,
        api_base=api_base,
    )
    Settings.embed_model = embed_model

    node_parser = SimpleNodeParser.from_defaults(chunk_size=1024, chunk_overlap=200)
    Settings.node_parser = node_parser

    # ChromaDB setup
    db_path = Path("data")
    db_path.mkdir(parents=True, exist_ok=True)
    chroma_client = chromadb.PersistentClient(path=str(db_path))
    chroma_collection = chroma_client.get_or_create_collection(name="rag")
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection, collection_name="rag")

    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store,
        storage_context=storage_context,
    )

    app.state.embed_model = embed_model
    app.state.node_parser = node_parser
    app.state.chroma_client = chroma_client
    app.state.chroma_collection = chroma_collection
    app.state.vector_store = vector_store
    app.state.storage_context = storage_context
    app.state.index = index

    logger.info("Initialization complete")
