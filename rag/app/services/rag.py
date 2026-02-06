import logging
import torch
import chromadb
from pathlib import Path
from fastapi import FastAPI
from llama_index.core import Settings, StorageContext, VectorStoreIndex
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore

from app.core.config import EMBEDDING_MODEL_PATH

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

    if not EMBEDDING_MODEL_PATH:
        raise RuntimeError(
            "Environment variable EMBEDDING_MODEL_PATH is not set. "
            "Please point it to the local embedding model directory."
        )

    # Logic to handle both local paths and HuggingFace IDs
    model_path = Path(EMBEDDING_MODEL_PATH)
    model_name_or_path = EMBEDDING_MODEL_PATH
    
    # Check if it's a valid local path, if so use the path, otherwise treat as Hub ID
    if model_path.exists():
        logger.info("Found local embedding model at %s", model_path)
        model_name_or_path = str(model_path)
    else:
        logger.info("Local path not found, falling back to HuggingFace Hub download: %s", EMBEDDING_MODEL_PATH)

    embed_model = HuggingFaceEmbedding(
        model_name=model_name_or_path,
        device="cuda" if torch.cuda.is_available() else "cpu",
        embed_batch_size=32
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
