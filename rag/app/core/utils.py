from typing import Any, Dict, Mapping, Optional

def extract_text(node: Any) -> str:
    if hasattr(node, "get_content"):
        return node.get_content(metadata_mode="none")
    if hasattr(node, "text") and node.text is not None:
        return node.text
    return ""


def normalize_metadata(metadata: Optional[Mapping[str, Any]]) -> Dict[str, Any]:
    if not metadata:
        return {}
    if isinstance(metadata, dict):
        return metadata
    if hasattr(metadata, "to_dict"):
        return metadata.to_dict()
    return dict(metadata)


def serialize_node(
    node_id: str,
    context: str,
    metadata: Optional[Mapping[str, Any]],
    fallback_document_id: str = "",
) -> Dict[str, Any]:
    normalized_metadata = normalize_metadata(metadata)
    # Using str conversion for flexibility as per original code patterns potentially needing it
    document_id = normalized_metadata.get("document_id", fallback_document_id)
    return {
        "node_id": node_id,
        "document_id": document_id,
        "context": context,
    }
