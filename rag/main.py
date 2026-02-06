import logging
import uvicorn
from fastapi import FastAPI
from app.api.routes import router
from app.services.rag import initialize_rag

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag")

app = FastAPI(title="RAG", version="1.0.0")

@app.on_event("startup")
async def on_startup() -> None:
    initialize_rag(app)

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
