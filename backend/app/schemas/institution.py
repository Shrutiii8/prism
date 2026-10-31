from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class InstitutionIdentifierSchema(BaseModel):
    id: Optional[str] = None
    identifier_type: str
    identifier_value: str
    is_verified: bool = False
    verified_at: Optional[datetime] = None

class InstitutionContactSchema(BaseModel):
    id: Optional[str] = None
    name: str
    designation: str
    email: Optional[str] = None
    phone: Optional[str] = None
    is_primary: bool = False

class InstitutionBase(BaseModel):
    aicte_id: str
    name: str
    institution_type: str = "Technical Institute"
    address: str
    state: str
    district: str
    city: str
    pincode: str
    affiliated_university: Optional[str] = None
    approval_status: str = "Approved"
    approval_details: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    is_active: bool = True

class InstitutionCreate(InstitutionBase):
    identifiers: Optional[List[InstitutionIdentifierSchema]] = []
    contacts: Optional[List[InstitutionContactSchema]] = []

class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    institution_type: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    affiliated_university: Optional[str] = None
    approval_status: Optional[str] = None
    approval_details: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None

class InstitutionOut(InstitutionBase):
    id: str
    normalized_name: str
    created_at: datetime
    updated_at: datetime
    total_complaints: Optional[int] = 0
    open_complaints: Optional[int] = 0
    resolved_complaints: Optional[int] = 0
    overdue_complaints: Optional[int] = 0

    class Config:
        from_attributes = True

class InstitutionDetailOut(InstitutionOut):
    identifiers: List[InstitutionIdentifierSchema] = []
    contacts: List[InstitutionContactSchema] = []
    recent_complaints: List[dict] = []
    severity_breakdown: dict = {}
    bureau_breakdown: dict = {}
    activity_timeline: List[dict] = []

