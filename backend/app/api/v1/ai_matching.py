from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_roles
from backend.app.models.user import User
from backend.app.models.complaint import Complaint
from backend.app.schemas.ai_match import AIMatchReviewRequest, RelatedCaseGroupCreate
from backend.app.services.ai_service import (
    list_ai_matches,
    review_ai_match,
    create_related_group,
    list_related_groups,
)
from backend.app.services.complaint_service import trigger_ai_matching_for_complaint

router = APIRouter(prefix="/ai", tags=["AI Overlap Intelligence"])

@router.get("/matches", response_model=dict)
async def get_ai_matches_endpoint(
    classification: Optional[str] = None, # HIGH, MEDIUM, LOW
    status: Optional[str] = None, # UNREVIEWED, CONFIRMED, REJECTED, DISMISSED
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    matches, total = await list_ai_matches(
        db, classification=classification, match_status=status, skip=skip, limit=limit
    )
    return {"items": matches, "total": total, "skip": skip, "limit": limit}

@router.post("/matches/{match_id}/review", response_model=dict)
async def review_ai_match_endpoint(
    match_id: str,
    req: AIMatchReviewRequest,
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "CENTRAL_ADMIN", "BUREAU_HEAD", "CASE_OFFICER"])),
    db: AsyncSession = Depends(get_db)
):
    match = await review_ai_match(db, match_id, req, current_user)
    return {
        "id": match.id,
        "status": match.status,
        "action": req.action,
        "message": f"Match successfully marked as {match.status}."
    }

@router.post("/scan-all", response_model=dict)
async def trigger_full_ai_scan(
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "CENTRAL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Triggers an AI overlap scan across all active complaints."""
    complaints = (await db.execute(select(Complaint.id).where(Complaint.is_closed == False))).scalars().all()
    count = 0
    for cid in complaints:
        await trigger_ai_matching_for_complaint(db, cid)
        count += 1
    return {"message": f"AI scan completed across {count} active complaints."}

@router.get("/related-groups", response_model=List[dict])
async def get_related_groups_endpoint(
    institution_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    groups = await list_related_groups(db, institution_id=institution_id)
    return groups

@router.post("/related-groups", response_model=dict)
async def create_related_group_endpoint(
    data: RelatedCaseGroupCreate,
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "CENTRAL_ADMIN", "BUREAU_HEAD", "CASE_OFFICER"])),
    db: AsyncSession = Depends(get_db)
):
    grp = await create_related_group(db, data, current_user)
    return {
        "id": grp.id,
        "group_code": grp.group_code,
        "message": f"Related Case Group {grp.group_code} created successfully."
    }

