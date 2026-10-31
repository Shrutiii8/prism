from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.audit import AuditLog
from backend.app.models.user import User

async def record_audit_event(
    db: AsyncSession,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    user: Optional[User] = None,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None,
    user_role: Optional[str] = None,
    change_details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    correlation_id: Optional[str] = None,
) -> AuditLog:
    """Creates an immutable audit log entry."""
    uid = user.id if user else user_id
    uemail = user.email if user else user_email
    urole = user.role.name if (user and user.role) else user_role

    audit_entry = AuditLog(
        user_id=uid,
        user_email=uemail,
        user_role=urole,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        change_details_json=change_details or {},
        ip_address=ip_address,
        correlation_id=correlation_id,
    )
    db.add(audit_entry)
    await db.flush()
    return audit_entry

