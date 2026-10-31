from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class CoordinationRequestCreate(BaseModel):
    source_complaint_id: str
    target_complaint_id: Optional[str] = None
    target_bureau_id: str
    title: str
    request_details: str
    deadline: Optional[datetime] = None

class CoordinationRequestUpdate(BaseModel):
    status: Optional[str] = None # PENDING, ACCEPTED, DECLINED, COMPLETED
    resolution_summary: Optional[str] = None

class CoordinationMessageCreate(BaseModel):
    message: str

class CoordinationMessageOut(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    bureau_id: str
    bureau_name: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class CoordinationRequestOut(BaseModel):
    id: str
    source_complaint_id: str
    source_case_id: Optional[str] = None
    target_complaint_id: Optional[str] = None
    target_case_id: Optional[str] = None
    requesting_bureau_id: str
    requesting_bureau_name: Optional[str] = None
    target_bureau_id: str
    target_bureau_name: Optional[str] = None
    requested_by_id: str
    requested_by_name: Optional[str] = None
    title: str
    request_details: str
    status: str
    deadline: Optional[datetime] = None
    resolution_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[CoordinationMessageOut] = []

    class Config:
        from_attributes = True

