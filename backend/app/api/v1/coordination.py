from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_roles
from backend.app.models.user import User
from backend.app.models.coordination import CoordinationRequest
from backend.app.schemas.coordination import (
    CoordinationRequestCreate,
    CoordinationRequestUpdate,
    CoordinationMessageCreate,
)
from backend.app.services.coordination_service import (
    list_coordination_requests,
    create_coordination_request,
    add_coordination_message,
)
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/coordination", tags=["Cross-Bureau Coordination"])

@router.get("", response_model=dict)
async def get_coordination_requests(
    bureau_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    results, total = await list_coordination_requests(
        db, current_user=current_user, bureau_id=bureau_id, req_status=status, skip=skip, limit=limit
    )
    items = []
    for r in results:
        items.append({
            "id": r.id,
            "source_complaint_id": r.source_complaint_id,
            "source_case_id": r.source_complaint.case_id if r.source_complaint else None,
            "source_subject": r.source_complaint.subject if r.source_complaint else None,
            "target_complaint_id": r.target_complaint_id,
            "target_case_id": r.target_complaint.case_id if r.target_complaint else None,
            "requesting_bureau_id": r.requesting_bureau_id,
            "requesting_bureau_code": r.requesting_bureau.code if r.requesting_bureau else None,
            "target_bureau_id": r.target_bureau_id,
            "target_bureau_code": r.target_bureau.code if r.target_bureau else None,
            "requested_by_name": r.requested_by.full_name if r.requested_by else None,
            "title": r.title,
            "request_details": r.request_details,
            "status": r.status,
            "deadline": r.deadline,
            "resolution_summary": r.resolution_summary,
            "created_at": r.created_at,
            "messages_count": len(r.messages),
            "messages": [
                {
                    "id": m.id,
                    "sender_name": m.sender.full_name if m.sender else None,
                    "bureau_code": m.bureau.code if m.bureau else None,
                    "message": m.message,
                    "created_at": m.created_at
                }
                for m in r.messages
            ]
        })
    return {"items": items, "total": total, "skip": skip, "limit": limit}

@router.post("", response_model=dict)
async def create_coordination(
    data: CoordinationRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    req = await create_coordination_request(db, data, current_user)
    return {
        "id": req.id,
        "title": req.title,
        "status": req.status,
        "message": "Coordination request submitted successfully."
    }

@router.post("/{request_id}/messages", response_model=dict)
async def post_coordination_message(
    request_id: str,
    data: CoordinationMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    msg = await add_coordination_message(db, request_id, data, current_user)
    return {"id": msg.id, "created_at": msg.created_at}

@router.patch("/{request_id}/status", response_model=dict)
async def update_coordination_status(
    request_id: str,
    data: CoordinationRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    req = await db.get(CoordinationRequest, request_id)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if data.status:
        req.status = data.status.upper()
    if data.resolution_summary:
        req.resolution_summary = data.resolution_summary

    await record_audit_event(
        db,
        action="UPDATE_COORDINATION_STATUS",
        resource_type="COORDINATION_REQUEST",
        resource_id=req.id,
        user=current_user,
        change_details={"status": req.status, "resolution": req.resolution_summary}
    )
    await db.commit()
    return {"id": req.id, "status": req.status}

