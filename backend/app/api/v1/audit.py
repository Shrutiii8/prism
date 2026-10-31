from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_roles
from backend.app.models.user import User
from backend.app.models.audit import AuditLog
from backend.app.schemas.audit import AuditLogOut

router = APIRouter(prefix="/audit", tags=["Audit & Compliance"])

@router.get("", response_model=dict)
async def get_audit_logs(
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    user_email: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "CENTRAL_ADMIN", "AUDITOR"])),
    db: AsyncSession = Depends(get_db)
):
    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    if user_email:
        query = query.where(AuditLog.user_email.ilike(f"%{user_email}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    query = query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit)
    logs = (await db.execute(query)).scalars().all()

    items = [
        {
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user_email,
            "user_role": l.user_role,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "change_details_json": l.change_details_json,
            "ip_address": l.ip_address,
            "correlation_id": l.correlation_id,
            "timestamp": l.timestamp
        }
        for l in logs
    ]

    return {"items": items, "total": total, "skip": skip, "limit": limit}

