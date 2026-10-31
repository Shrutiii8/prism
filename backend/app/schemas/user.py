from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class PermissionOut(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str]
    category: str

    class Config:
        from_attributes = True

class RoleOut(BaseModel):
    id: str
    name: str
    display_name: str
    description: Optional[str]
    is_system: bool
    permissions: List[PermissionOut] = []

    class Config:
        from_attributes = True

class BureauOut(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

class RegionalOfficeOut(BaseModel):
    id: str
    code: str
    name: str
    state: str
    jurisdiction: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role_id: str
    bureau_id: Optional[str] = None
    regional_office_id: Optional[str] = None
    is_active: bool = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role_id: Optional[str] = None
    bureau_id: Optional[str] = None
    regional_office_id: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    is_active: bool
    role_id: str
    role_name: Optional[str] = None
    role_display: Optional[str] = None
    bureau_id: Optional[str] = None
    bureau_name: Optional[str] = None
    bureau_code: Optional[str] = None
    regional_office_id: Optional[str] = None
    regional_office_name: Optional[str] = None
    created_at: datetime
    active_cases_count: Optional[int] = 0

    class Config:
        from_attributes = True

