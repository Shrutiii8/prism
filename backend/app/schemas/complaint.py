from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ComplaintCategoryOut(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str]
    default_sla_days: int
    is_active: bool

    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    institution_id: str
    subject: str
    description: str
    receiving_bureau_id: str
    regional_office_id: Optional[str] = None
    category_id: str
    subcategory: Optional[str] = None
    severity: str = "MEDIUM" # LOW, MEDIUM, HIGH, CRITICAL
    priority: str = "MEDIUM" # LOW, MEDIUM, HIGH, URGENT
    complainant_name: Optional[str] = None
    complainant_email: Optional[str] = None
    complainant_phone: Optional[str] = None
    is_anonymous: bool = False
    reference_number: Optional[str] = None
    assigned_officer_id: Optional[str] = None

class ComplaintUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    category_id: Optional[str] = None
    subcategory: Optional[str] = None
    reference_number: Optional[str] = None

class AssignmentRequest(BaseModel):
    assigned_to_id: str
    assignment_reason: Optional[str] = None

class StageTransitionRequest(BaseModel):
    to_stage_id: str
    remarks: Optional[str] = None

class CommentCreateRequest(BaseModel):
    comment_text: str
    is_internal: bool = True

class ComplaintOut(BaseModel):
    id: str
    case_id: str
    subject: str
    description: str
    institution_id: str
    institution_name: Optional[str] = None
    aicte_id: Optional[str] = None
    receiving_bureau_id: str
    bureau_name: Optional[str] = None
    bureau_code: Optional[str] = None
    regional_office_id: Optional[str] = None
    regional_office_name: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    subcategory: Optional[str] = None
    severity: str
    priority: str
    current_stage_id: str
    stage_name: Optional[str] = None
    stage_color: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    assigned_officer_name: Optional[str] = None
    received_date: datetime
    due_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    is_overdue: bool
    is_closed: bool
    resolution_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ComplaintDetailOut(ComplaintOut):
    complainant_name: Optional[str] = None
    complainant_email: Optional[str] = None
    complainant_phone: Optional[str] = None
    is_anonymous: bool
    assignments_history: List[dict] = []
    status_history: List[dict] = []
    comments: List[dict] = []
    evidence_files: List[dict] = []
    related_cases: List[dict] = []
    coordination_requests: List[dict] = []
    permitted_transitions: List[dict] = []

