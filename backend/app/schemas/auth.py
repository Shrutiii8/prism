from typing import Optional, List
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UserProfileOut(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    role: str
    role_display: str
    bureau: Optional[str]
    bureau_code: Optional[str]
    regional_office: Optional[str]
    permissions: List[str]
    is_active: bool

