from typing import Any, Dict, List
from pydantic import BaseModel, Field

class RetrieveRequest(BaseModel):
    query_text: str
    allowed_knowledge_base_ids: List[int]
    top_k: int = Field(default=5, gt=0)


class ApiResponse(BaseModel):
    code: int
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)


class IngestRequest(BaseModel):
    knowledge_base_id: int
    document_url: str
    document_id: int
