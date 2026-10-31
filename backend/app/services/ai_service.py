from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from backend.app.models.ai_match import AIMatchResult, AIMatchReview
from backend.app.models.complaint import Complaint, ComplaintRelationship, RelatedCaseGroup, RelatedCaseGroupMember
from backend.app.models.institution import Institution
from backend.app.models.user import User
from backend.app.schemas.ai_match import AIMatchReviewRequest, RelatedCaseGroupCreate
from backend.app.services.audit_service import record_audit_event
from backend.app.services.notification_service import create_notification
from backend.app.ml.matching_engine import matching_engine

async def list_ai_matches(
    db: AsyncSession,
    classification: Optional[str] = None,
    match_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Tuple[List[Dict[str, Any]], int]:
    query = (
        select(AIMatchResult)
        .options(
            selectinload(AIMatchResult.source_complaint).selectinload(Complaint.institution),
            selectinload(AIMatchResult.source_complaint).selectinload(Complaint.bureau),
            selectinload(AIMatchResult.source_complaint).selectinload(Complaint.current_stage),
            selectinload(AIMatchResult.target_complaint).selectinload(Complaint.institution),
            selectinload(AIMatchResult.target_complaint).selectinload(Complaint.bureau),
            selectinload(AIMatchResult.target_complaint).selectinload(Complaint.current_stage),
        )
    )
    if classification:
        query = query.where(AIMatchResult.classification == classification)
    if match_status:
        query = query.where(AIMatchResult.status == match_status)
        
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()
    
    query = query.order_by(desc(AIMatchResult.overall_score), desc(AIMatchResult.created_at)).offset(skip).limit(limit)
    results = (await db.execute(query)).scalars().all()
    
    matches_out = []
    for m in results:
        src = m.source_complaint
        tgt = m.target_complaint
        matches_out.append({
            "id": m.id,
            "source_complaint_id": m.source_complaint_id,
            "target_complaint_id": m.target_complaint_id,
            "source_case_id": src.case_id if src else None,
            "target_case_id": tgt.case_id if tgt else None,
            "source_subject": src.subject if src else None,
            "target_subject": tgt.subject if tgt else None,
            "source_institution_name": src.institution.name if (src and src.institution) else None,
            "target_institution_name": tgt.institution.name if (tgt and tgt.institution) else None,
            "source_bureau_code": src.bureau.code if (src and src.bureau) else None,
            "target_bureau_code": tgt.bureau.code if (tgt and tgt.bureau) else None,
            "source_status": src.current_stage.name if (src and src.current_stage) else None,
            "target_status": tgt.current_stage.name if (tgt and tgt.current_stage) else None,
            "source_received_date": src.received_date if src else None,
            "target_received_date": tgt.received_date if tgt else None,
            "overall_score": m.overall_score,
            "institution_score": m.institution_score,
            "semantic_score": m.semantic_score,
            "category_score": m.category_score,
            "context_score": m.context_score,
            "classification": m.classification,
            "explanation_json": m.explanation_json,
            "status": m.status,
            "created_at": m.created_at
        })
        
    return matches_out, total

async def review_ai_match(
    db: AsyncSession,
    match_id: str,
    req: AIMatchReviewRequest,
    current_user: User
) -> AIMatchResult:
    match = (
        await db.execute(
            select(AIMatchResult)
            .options(
                selectinload(AIMatchResult.source_complaint),
                selectinload(AIMatchResult.target_complaint),
            )
            .where(AIMatchResult.id == match_id)
        )
    ).scalar_one_or_none()
    
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match record not found")

    action = req.action.upper() # CONFIRM, REJECT, DISMISS
    if action not in ["CONFIRM", "REJECT", "DISMISS"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be CONFIRM, REJECT, or DISMISS")

    now = datetime.now(timezone.utc)
    match.status = "CONFIRMED" if action == "CONFIRM" else ("REJECTED" if action == "REJECT" else "DISMISSED")

    review = AIMatchReview(
        match_result_id=match.id,
        reviewed_by_id=current_user.id,
        review_action=action,
        review_comments=req.comments,
        reviewed_at=now
    )
    db.add(review)

    # If CONFIRMED, create or update persistent ComplaintRelationship
    if action == "CONFIRM":
        existing_rel = (
            await db.execute(
                select(ComplaintRelationship).where(
                    or_(
                        and_(ComplaintRelationship.source_complaint_id == match.source_complaint_id, ComplaintRelationship.target_complaint_id == match.target_complaint_id),
                        and_(ComplaintRelationship.source_complaint_id == match.target_complaint_id, ComplaintRelationship.target_complaint_id == match.source_complaint_id),
                    )
                )
            )
        ).scalar_one_or_none()

        explanation_text = req.comments or (
            match.explanation_json.get("summary_explanation") if match.explanation_json else "Officer-confirmed case relationship."
        )

        if existing_rel:
            existing_rel.verification_status = "CONFIRMED"
            existing_rel.verified_by_id = current_user.id
            existing_rel.verification_notes = req.comments
            existing_rel.verified_at = now
            existing_rel.relationship_type = req.relationship_type or existing_rel.relationship_type
        else:
            new_rel = ComplaintRelationship(
                source_complaint_id=match.source_complaint_id,
                target_complaint_id=match.target_complaint_id,
                relationship_type=req.relationship_type or "SIMILAR_SUBJECT",
                confidence_score=match.overall_score,
                explanation=explanation_text,
                verification_status="CONFIRMED",
                verified_by_id=current_user.id,
                verification_notes=req.comments,
                verified_at=now
            )
            db.add(new_rel)

    await record_audit_event(
        db,
        action=f"AI_MATCH_{action}",
        resource_type="AI_MATCH",
        resource_id=match.id,
        user=current_user,
        change_details={
            "source_complaint_id": match.source_complaint_id,
            "target_complaint_id": match.target_complaint_id,
            "action": action,
            "comments": req.comments,
            "score": match.overall_score
        }
    )

    await db.commit()
    return match

async def create_related_group(
    db: AsyncSession,
    data: RelatedCaseGroupCreate,
    current_user: User
) -> RelatedCaseGroup:
    # Generate group code like GRP-2026-0001
    year = datetime.now(timezone.utc).year
    prefix = f"GRP-{year}-"
    cnt = (await db.execute(select(func.count(RelatedCaseGroup.id)).where(RelatedCaseGroup.group_code.like(f"{prefix}%")))).scalar_one() or 0
    group_code = f"{prefix}{str(cnt + 1).zfill(4)}"

    group = RelatedCaseGroup(
        group_code=group_code,
        institution_id=data.institution_id,
        common_issue_description=data.common_issue_description.strip(),
        verification_status="CONFIRMED",
        created_by_id=current_user.id
    )
    db.add(group)
    await db.flush()

    for cid in set(data.complaint_ids):
        mem = RelatedCaseGroupMember(
            group_id=group.id,
            complaint_id=cid,
            added_by_id=current_user.id
        )
        db.add(mem)

    await record_audit_event(
        db,
        action="CREATE_RELATED_CASE_GROUP",
        resource_type="RELATED_CASE_GROUP",
        resource_id=group.id,
        user=current_user,
        change_details={
            "group_code": group.group_code,
            "institution_id": group.institution_id,
            "complaint_ids": data.complaint_ids
        }
    )

    await db.commit()
    return group

async def list_related_groups(
    db: AsyncSession,
    institution_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    query = (
        select(RelatedCaseGroup)
        .options(
            selectinload(RelatedCaseGroup.institution),
            selectinload(RelatedCaseGroup.members).selectinload(RelatedCaseGroupMember.complaint).selectinload(Complaint.bureau)
        )
    )
    if institution_id:
        query = query.where(RelatedCaseGroup.institution_id == institution_id)
        
    query = query.order_by(desc(RelatedCaseGroup.created_at))
    groups = (await db.execute(query)).scalars().all()

    res = []
    for g in groups:
        bureaus = set()
        cases = []
        for m in g.members:
            if m.complaint:
                c = m.complaint
                if c.bureau:
                    bureaus.add(c.bureau.code)
                cases.append({
                    "id": c.id,
                    "case_id": c.case_id,
                    "subject": c.subject,
                    "bureau": c.bureau.code if c.bureau else None,
                    "severity": c.severity,
                    "priority": c.priority,
                    "is_closed": c.is_closed
                })
        res.append({
            "id": g.id,
            "group_code": g.group_code,
            "institution_id": g.institution_id,
            "institution_name": g.institution.name if g.institution else None,
            "common_issue_description": g.common_issue_description,
            "verification_status": g.verification_status,
            "created_at": g.created_at,
            "members_count": len(g.members),
            "participating_bureaus": sorted(list(bureaus)),
            "cases": cases
        })
    return res

