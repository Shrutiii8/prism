from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from backend.app.models.coordination import CoordinationRequest, CoordinationMessage
from backend.app.models.complaint import Complaint
from backend.app.models.user import User, Bureau
from backend.app.schemas.coordination import CoordinationRequestCreate, CoordinationRequestUpdate, CoordinationMessageCreate
from backend.app.services.audit_service import record_audit_event
from backend.app.services.notification_service import create_notification

async def list_coordination_requests(
    db: AsyncSession,
    current_user: User,
    bureau_id: Optional[str] = None,
    req_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Tuple[List[CoordinationRequest], int]:
    query = (
        select(CoordinationRequest)
        .options(
            selectinload(CoordinationRequest.source_complaint),
            selectinload(CoordinationRequest.target_complaint),
            selectinload(CoordinationRequest.requesting_bureau),
            selectinload(CoordinationRequest.target_bureau),
            selectinload(CoordinationRequest.requested_by),
            selectinload(CoordinationRequest.messages).selectinload(CoordinationMessage.sender),
            selectinload(CoordinationRequest.messages).selectinload(CoordinationMessage.bureau),
        )
    )
    user_role = current_user.role.name.upper() if current_user.role else ""
    if user_role in ["BUREAU_HEAD", "CASE_OFFICER"] and current_user.bureau_id and not bureau_id:
        query = query.where(
            or_(
                CoordinationRequest.requesting_bureau_id == current_user.bureau_id,
                CoordinationRequest.target_bureau_id == current_user.bureau_id
            )
        )
    elif bureau_id:
        query = query.where(
            or_(
                CoordinationRequest.requesting_bureau_id == bureau_id,
                CoordinationRequest.target_bureau_id == bureau_id
            )
        )
        
    if req_status:
        query = query.where(CoordinationRequest.status == req_status)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    query = query.order_by(desc(CoordinationRequest.created_at)).offset(skip).limit(limit)
    results = (await db.execute(query)).scalars().all()
    return results, total

async def create_coordination_request(
    db: AsyncSession,
    data: CoordinationRequestCreate,
    current_user: User
) -> CoordinationRequest:
    source_c = await db.get(Complaint, data.source_complaint_id)
    if not source_c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source complaint not found")
        
    target_b = await db.get(Bureau, data.target_bureau_id)
    if not target_b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target bureau not found")

    req = CoordinationRequest(
        source_complaint_id=data.source_complaint_id,
        target_complaint_id=data.target_complaint_id,
        requesting_bureau_id=source_c.receiving_bureau_id,
        target_bureau_id=data.target_bureau_id,
        requested_by_id=current_user.id,
        title=data.title.strip(),
        request_details=data.request_details.strip(),
        status="PENDING",
        deadline=data.deadline
    )
    db.add(req)
    await db.flush()

    # Initial message
    msg = CoordinationMessage(
        coordination_request_id=req.id,
        sender_id=current_user.id,
        bureau_id=source_c.receiving_bureau_id,
        message=f"Coordination initiated: {req.request_details}"
    )
    db.add(msg)

    await record_audit_event(
        db,
        action="CREATE_COORDINATION_REQUEST",
        resource_type="COORDINATION_REQUEST",
        resource_id=req.id,
        user=current_user,
        change_details={
            "source_complaint_id": req.source_complaint_id,
            "target_bureau_id": req.target_bureau_id,
            "title": req.title
        }
    )

    await db.commit()
    return req

async def add_coordination_message(
    db: AsyncSession,
    request_id: str,
    data: CoordinationMessageCreate,
    current_user: User
) -> CoordinationMessage:
    req = await db.get(CoordinationRequest, request_id)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coordination request not found")

    user_bureau_id = current_user.bureau_id or req.requesting_bureau_id
    msg = CoordinationMessage(
        coordination_request_id=req.id,
        sender_id=current_user.id,
        bureau_id=user_bureau_id,
        message=data.message.strip()
    )
    db.add(msg)
    await db.commit()
    return msg

