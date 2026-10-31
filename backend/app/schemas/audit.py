from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    change_details_json: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    correlation_id: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

