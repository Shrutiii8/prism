from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AIMatchReviewRequest(BaseModel):
    action: str # "CONFIRM", "REJECT", "DISMISS"
    comments: Optional[str] = None
    relationship_type: Optional[str] = "SIMILAR_SUBJECT"

class AIMatchResultOut(BaseModel):
    id: str
    source_complaint_id: str
    target_complaint_id: str
    source_case_id: Optional[str] = None
    target_case_id: Optional[str] = None
    source_subject: Optional[str] = None
    target_subject: Optional[str] = None
    source_institution_name: Optional[str] = None
    target_institution_name: Optional[str] = None
    source_bureau_code: Optional[str] = None
    target_bureau_code: Optional[str] = None
    source_status: Optional[str] = None
    target_status: Optional[str] = None
    source_received_date: Optional[datetime] = None
    target_received_date: Optional[datetime] = None
    
    overall_score: float
    institution_score: float
    semantic_score: float
    category_score: float
    context_score: float
    classification: str
    explanation_json: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RelatedCaseGroupCreate(BaseModel):
    institution_id: str
    common_issue_description: str
    complaint_ids: List[str]

class RelatedCaseGroupOut(BaseModel):
    id: str
    group_code: str
    institution_id: str
    institution_name: Optional[str] = None
    common_issue_description: str
    verification_status: str
    created_at: datetime
    members_count: int = 0
    participating_bureaus: List[str] = []
    cases: List[dict] = []

    class Config:
        from_attributes = True

