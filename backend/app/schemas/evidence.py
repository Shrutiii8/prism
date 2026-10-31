from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ComplaintEvidenceOut(BaseModel):
    id: str
    complaint_id: str
    case_id: Optional[str] = None
    institution_id: str
    institution_name: Optional[str] = None
    original_file_name: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    document_category: str
    uploaded_by_id: Optional[str] = None
    uploaded_by_name: Optional[str] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

