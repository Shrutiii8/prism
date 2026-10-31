from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from backend.app.models.complaint import (
    Complaint,
    ComplaintCategory,
    ComplaintAssignment,
    ComplaintStatusHistory,
    ComplaintComment,
    ComplaintRelationship,
    RelatedCaseGroup,
    RelatedCaseGroupMember,
)
from backend.app.models.institution import Institution
from backend.app.models.workflow import WorkflowDefinition, WorkflowStage, WorkflowTransition
from backend.app.models.user import User, Role, Bureau
from backend.app.models.ai_match import AIMatchResult
from backend.app.models.evidence import ComplaintEvidence
from backend.app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    AssignmentRequest,
    StageTransitionRequest,
    CommentCreateRequest,
)
from backend.app.ml.matching_engine import normalize_text, matching_engine
from backend.app.services.audit_service import record_audit_event
from backend.app.services.notification_service import create_notification

async def generate_case_id(db: AsyncSession) -> str:
    """Generates the next unique Case ID formatted like PRISM-2026-000001."""
    year = datetime.now(timezone.utc).year
    prefix = f"PRISM-{year}-"
    
    # Query count of complaints created in the current year
    query = select(func.count(Complaint.id)).where(Complaint.case_id.like(f"{prefix}%"))
    count = (await db.execute(query)).scalar_one() or 0
    next_num = count + 1
    return f"{prefix}{str(next_num).zfill(6)}"

async def list_complaints(
    db: AsyncSession,
    current_user: User,
    search: Optional[str] = None,
    bureau_id: Optional[str] = None,
    regional_office_id: Optional[str] = None,
    category_id: Optional[str] = None,
    stage_id: Optional[str] = None,
    severity: Optional[str] = None,
    priority: Optional[str] = None,
    institution_id: Optional[str] = None,
    is_overdue: Optional[bool] = None,
    is_closed: Optional[bool] = None,
    assigned_to_me: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50
) -> Tuple[List[Complaint], int]:
    query = (
        select(Complaint)
        .options(
            selectinload(Complaint.institution),
            selectinload(Complaint.bureau),
            selectinload(Complaint.regional_office),
            selectinload(Complaint.category),
            selectinload(Complaint.current_stage),
            selectinload(Complaint.assigned_officer),
        )
    )
    
    # Bureau / Regional Scoping Rules
    user_role = current_user.role.name.upper() if current_user.role else ""
    if user_role in ["BUREAU_HEAD", "CASE_OFFICER"] and current_user.bureau_id:
        # Bureau heads and officers default to their bureau, or cross-bureau when requested
        if not bureau_id:
            query = query.where(Complaint.receiving_bureau_id == current_user.bureau_id)
    elif user_role == "REGIONAL_OFFICER" and current_user.regional_office_id:
        if not regional_office_id:
            query = query.where(Complaint.regional_office_id == current_user.regional_office_id)
            
    if assigned_to_me and current_user:
        query = query.where(Complaint.assigned_officer_id == current_user.id)
        
    if bureau_id:
        query = query.where(Complaint.receiving_bureau_id == bureau_id)
    if regional_office_id:
        query = query.where(Complaint.regional_office_id == regional_office_id)
    if category_id:
        query = query.where(Complaint.category_id == category_id)
    if stage_id:
        query = query.where(Complaint.current_stage_id == stage_id)
    if severity:
        query = query.where(Complaint.severity == severity)
    if priority:
        query = query.where(Complaint.priority == priority)
    if institution_id:
        query = query.where(Complaint.institution_id == institution_id)
    if is_overdue is not None:
        query = query.where(Complaint.is_overdue == is_overdue)
    if is_closed is not None:
        query = query.where(Complaint.is_closed == is_closed)
        
    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.join(Complaint.institution).where(
            or_(
                func.lower(Complaint.case_id).like(search_term),
                func.lower(Complaint.subject).like(search_term),
                func.lower(Complaint.reference_number).like(search_term),
                func.lower(Institution.name).like(search_term),
                func.lower(Institution.aicte_id).like(search_term),
            )
        )
        
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()
    
    query = query.order_by(desc(Complaint.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    complaints = result.scalars().all()
    
    return complaints, total

async def get_complaint_detail(
    db: AsyncSession,
    complaint_id: str,
    current_user: User
) -> Dict[str, Any]:
    query = (
        select(Complaint)
        .options(
            selectinload(Complaint.institution),
            selectinload(Complaint.bureau),
            selectinload(Complaint.regional_office),
            selectinload(Complaint.category),
            selectinload(Complaint.current_stage),
            selectinload(Complaint.assigned_officer),
            selectinload(Complaint.assignments).selectinload(ComplaintAssignment.assigned_to),
            selectinload(Complaint.assignments).selectinload(ComplaintAssignment.assigned_by),
            selectinload(Complaint.status_history).selectinload(ComplaintStatusHistory.from_stage),
            selectinload(Complaint.status_history).selectinload(ComplaintStatusHistory.to_stage),
            selectinload(Complaint.status_history).selectinload(ComplaintStatusHistory.changed_by),
            selectinload(Complaint.comments).selectinload(ComplaintComment.user),
            selectinload(Complaint.evidence).selectinload(ComplaintEvidence.uploaded_by),
        )
        .where(Complaint.id == complaint_id)
    )
    result = await db.execute(query)
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
        
    # Check permissions & privacy
    user_role = current_user.role.name.upper() if current_user.role else ""
    # Mask complainant details for Auditor or if anonymous
    mask_complainant = c.is_anonymous or (user_role == "AUDITOR")
    complainant_name = "[REDACTED - ANONYMOUS/CONFIDENTIAL]" if mask_complainant else c.complainant_name
    complainant_email = "[REDACTED]" if mask_complainant else c.complainant_email
    complainant_phone = "[REDACTED]" if mask_complainant else c.complainant_phone

    # Permitted stage transitions for current user role
    allowed_transitions_query = (
        select(WorkflowTransition)
        .options(selectinload(WorkflowTransition.to_stage))
        .where(WorkflowTransition.from_stage_id == c.current_stage_id)
    )
    trans_results = (await db.execute(allowed_transitions_query)).scalars().all()
    permitted_transitions = []
    for t in trans_results:
        roles_allowed = [r.upper() for r in (t.allowed_roles or [])]
        if user_role == "SUPER_ADMIN" or not roles_allowed or user_role in roles_allowed:
            permitted_transitions.append({
                "to_stage_id": t.to_stage.id,
                "to_stage_name": t.to_stage.name,
                "to_stage_code": t.to_stage.code,
                "color": t.to_stage.color,
                "description": t.description
            })
            
    # Related cases (both relationships and AI match reviews)
    rel_query = (
        select(ComplaintRelationship)
        .options(
            selectinload(ComplaintRelationship.source_complaint).selectinload(Complaint.institution),
            selectinload(ComplaintRelationship.target_complaint).selectinload(Complaint.institution),
            selectinload(ComplaintRelationship.verified_by)
        )
        .where(
            or_(
                ComplaintRelationship.source_complaint_id == c.id,
                ComplaintRelationship.target_complaint_id == c.id
            )
        )
    )
    rels = (await db.execute(rel_query)).scalars().all()
    related_cases = []
    for r in rels:
        other = r.target_complaint if r.source_complaint_id == c.id else r.source_complaint
        related_cases.append({
            "relationship_id": r.id,
            "case_id": other.case_id,
            "complaint_id": other.id,
            "subject": other.subject,
            "institution_name": other.institution.name if other.institution else "",
            "relationship_type": r.relationship_type,
            "confidence_score": r.confidence_score,
            "verification_status": r.verification_status,
            "explanation": r.explanation,
            "verified_by": r.verified_by.full_name if r.verified_by else None
        })

    return {
        "complaint": c,
        "complainant_name": complainant_name,
        "complainant_email": complainant_email,
        "complainant_phone": complainant_phone,
        "is_anonymous": c.is_anonymous,
        "permitted_transitions": permitted_transitions,
        "related_cases": related_cases,
    }

async def create_complaint(
    db: AsyncSession,
    data: ComplaintCreate,
    current_user: User
) -> Complaint:
    # Verify institution
    inst = await db.get(Institution, data.institution_id)
    if not inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")
        
    # Verify bureau
    bureau = await db.get(Bureau, data.receiving_bureau_id)
    if not bureau:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bureau not found")

    # Get initial workflow stage
    stage_query = select(WorkflowStage).where(WorkflowStage.is_initial == True).limit(1)
    initial_stage = (await db.execute(stage_query)).scalar_one_or_none()
    if not initial_stage:
        # Fallback to order 1
        initial_stage = (await db.execute(select(WorkflowStage).order_by(WorkflowStage.stage_order.asc()).limit(1))).scalar_one()

    # Get Category for SLA days
    cat = await db.get(ComplaintCategory, data.category_id)
    sla_days = cat.default_sla_days if cat else 15
    received_now = datetime.now(timezone.utc)
    due_date = received_now + timedelta(days=sla_days)

    case_id = await generate_case_id(db)
    norm_desc = normalize_text(f"{data.subject} {data.description}")

    complaint = Complaint(
        case_id=case_id,
        subject=data.subject.strip(),
        description=data.description.strip(),
        normalized_description=norm_desc,
        institution_id=data.institution_id,
        receiving_bureau_id=data.receiving_bureau_id,
        regional_office_id=data.regional_office_id,
        category_id=data.category_id,
        subcategory=data.subcategory,
        severity=data.severity,
        priority=data.priority,
        current_stage_id=initial_stage.id,
        assigned_officer_id=data.assigned_officer_id,
        complainant_name=data.complainant_name if not data.is_anonymous else None,
        complainant_email=data.complainant_email if not data.is_anonymous else None,
        complainant_phone=data.complainant_phone if not data.is_anonymous else None,
        is_anonymous=data.is_anonymous,
        reference_number=data.reference_number,
        received_date=received_now,
        due_date=due_date,
        is_overdue=False,
        is_closed=False,
        created_by_id=current_user.id
    )
    db.add(complaint)
    await db.flush()

    # Record initial status in history
    history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        from_stage_id=None,
        to_stage_id=initial_stage.id,
        changed_by_id=current_user.id,
        remarks="Complaint received and registered in PRISM platform."
    )
    db.add(history)

    # If assigned to officer immediately
    if data.assigned_officer_id:
        assignment = ComplaintAssignment(
            complaint_id=complaint.id,
            assigned_to_id=data.assigned_officer_id,
            assigned_by_id=current_user.id,
            assignment_reason="Initial case assignment upon registration."
        )
        db.add(assignment)
        # Notify officer
        await create_notification(
            db,
            user_id=data.assigned_officer_id,
            title="New Complaint Assigned",
            message=f"You have been assigned Case {case_id}: '{complaint.subject}'",
            notification_type="ASSIGNMENT",
            reference_id=complaint.id,
            reference_type="COMPLAINT"
        )

    await record_audit_event(
        db,
        action="CREATE_COMPLAINT",
        resource_type="COMPLAINT",
        resource_id=complaint.id,
        user=current_user,
        change_details={
            "case_id": complaint.case_id,
            "institution_id": complaint.institution_id,
            "bureau_id": complaint.receiving_bureau_id,
            "severity": complaint.severity,
            "priority": complaint.priority
        }
    )

    await db.commit()

    # Trigger async/background AI overlap scan for this complaint against other cases
    await trigger_ai_matching_for_complaint(db, complaint.id)

    return complaint

async def transition_complaint_stage(
    db: AsyncSession,
    complaint_id: str,
    req: StageTransitionRequest,
    current_user: User
) -> Complaint:
    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
        
    target_stage = await db.get(WorkflowStage, req.to_stage_id)
    if not target_stage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target workflow stage not found")

    user_role = current_user.role.name.upper() if current_user.role else ""
    
    # Verify transition validity
    if user_role != "SUPER_ADMIN":
        query = select(WorkflowTransition).where(
            and_(
                WorkflowTransition.from_stage_id == complaint.current_stage_id,
                WorkflowTransition.to_stage_id == req.to_stage_id
            )
        )
        transition = (await db.execute(query)).scalar_one_or_none()
        if not transition:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid transition from current stage to '{target_stage.name}'."
            )
        allowed = [r.upper() for r in (transition.allowed_roles or [])]
        if allowed and user_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' is not authorized to transition case to '{target_stage.name}'."
            )

    old_stage_id = complaint.current_stage_id
    complaint.current_stage_id = target_stage.id
    
    # If final stage, mark closed
    if target_stage.is_final:
        complaint.is_closed = True
        complaint.closed_at = datetime.now(timezone.utc)
        if req.remarks:
            complaint.resolution_summary = req.remarks
            
    # Add history
    history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        from_stage_id=old_stage_id,
        to_stage_id=target_stage.id,
        changed_by_id=current_user.id,
        remarks=req.remarks
    )
    db.add(history)

    await record_audit_event(
        db,
        action="UPDATE_STAGE",
        resource_type="COMPLAINT",
        resource_id=complaint.id,
        user=current_user,
        change_details={
            "case_id": complaint.case_id,
            "from_stage_id": old_stage_id,
            "to_stage_id": target_stage.id,
            "to_stage_name": target_stage.name,
            "remarks": req.remarks
        }
    )

    # Notify assigned officer if changed by someone else
    if complaint.assigned_officer_id and complaint.assigned_officer_id != current_user.id:
        await create_notification(
            db,
            user_id=complaint.assigned_officer_id,
            title=f"Workflow Update: {complaint.case_id}",
            message=f"Case status changed to '{target_stage.name}' by {current_user.full_name}.",
            notification_type="STATUS_CHANGE",
            reference_id=complaint.id,
            reference_type="COMPLAINT"
        )

    await db.commit()
    return complaint

async def assign_complaint_officer(
    db: AsyncSession,
    complaint_id: str,
    req: AssignmentRequest,
    current_user: User
) -> Complaint:
    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
        
    officer = await db.get(User, req.assigned_to_id)
    if not officer or not officer.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected officer is invalid or inactive")

    prev_officer_id = complaint.assigned_officer_id
    complaint.assigned_officer_id = officer.id

    assignment = ComplaintAssignment(
        complaint_id=complaint.id,
        assigned_to_id=officer.id,
        assigned_by_id=current_user.id,
        previous_officer_id=prev_officer_id,
        assignment_reason=req.assignment_reason or "Case assignment."
    )
    db.add(assignment)

    await record_audit_event(
        db,
        action="ASSIGN_OFFICER",
        resource_type="COMPLAINT",
        resource_id=complaint.id,
        user=current_user,
        change_details={
            "case_id": complaint.case_id,
            "assigned_to_id": officer.id,
            "assigned_to_name": officer.full_name,
            "previous_officer_id": prev_officer_id,
            "reason": req.assignment_reason
        }
    )

    await create_notification(
        db,
        user_id=officer.id,
        title="Case Assigned to You",
        message=f"Case {complaint.case_id} has been assigned to you by {current_user.full_name}.",
        notification_type="ASSIGNMENT",
        reference_id=complaint.id,
        reference_type="COMPLAINT"
    )

    await db.commit()
    return complaint

async def add_complaint_comment(
    db: AsyncSession,
    complaint_id: str,
    req: CommentCreateRequest,
    current_user: User
) -> ComplaintComment:
    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    comment = ComplaintComment(
        complaint_id=complaint.id,
        user_id=current_user.id,
        comment_text=req.comment_text.strip(),
        is_internal=req.is_internal
    )
    db.add(comment)
    await record_audit_event(
        db,
        action="ADD_COMMENT",
        resource_type="COMPLAINT",
        resource_id=complaint.id,
        user=current_user,
        change_details={"case_id": complaint.case_id, "is_internal": req.is_internal}
    )
    await db.commit()
    return comment

async def trigger_ai_matching_for_complaint(db: AsyncSession, complaint_id: str):
    """Scans and computes similarity between this complaint and all other open or recent complaints."""
    target = (
        await db.execute(
            select(Complaint)
            .options(
                selectinload(Complaint.institution),
                selectinload(Complaint.bureau)
            )
            .where(Complaint.id == complaint_id)
        )
    ).scalar_one_or_none()
    
    if not target:
        return

    # Look for candidate complaints: complaints belonging to same institution or same category or same state
    query = (
        select(Complaint)
        .options(
            selectinload(Complaint.institution),
            selectinload(Complaint.bureau)
        )
        .where(Complaint.id != complaint_id)
        .order_by(desc(Complaint.created_at))
        .limit(100) # Efficient candidate window
    )
    candidates = (await db.execute(query)).scalars().all()
    
    dict_target = {
        "id": target.id,
        "case_id": target.case_id,
        "institution_id": target.institution_id,
        "institution_name": target.institution.name if target.institution else "",
        "aicte_id": target.institution.aicte_id if target.institution else "",
        "subject": target.subject,
        "description": target.description,
        "category_id": target.category_id,
        "subcategory": target.subcategory,
        "reference_number": target.reference_number,
        "regional_office_id": target.regional_office_id,
        "bureau_code": target.bureau.code if target.bureau else "",
    }
    
    for cand in candidates:
        dict_cand = {
            "id": cand.id,
            "case_id": cand.case_id,
            "institution_id": cand.institution_id,
            "institution_name": cand.institution.name if cand.institution else "",
            "aicte_id": cand.institution.aicte_id if cand.institution else "",
            "subject": cand.subject,
            "description": cand.description,
            "category_id": cand.category_id,
            "subcategory": cand.subcategory,
            "reference_number": cand.reference_number,
            "regional_office_id": cand.regional_office_id,
            "bureau_code": cand.bureau.code if cand.bureau else "",
        }
        res = matching_engine.evaluate_pair(dict_target, dict_cand)
        
        # Only persist matches with meaningful similarity
        if res["overall_score"] >= 0.35:
            # Check if match already recorded
            existing = (
                await db.execute(
                    select(AIMatchResult).where(
                        or_(
                            and_(AIMatchResult.source_complaint_id == target.id, AIMatchResult.target_complaint_id == cand.id),
                            and_(AIMatchResult.source_complaint_id == cand.id, AIMatchResult.target_complaint_id == target.id),
                        )
                    )
                )
            ).scalar_one_or_none()
            
            if not existing:
                match_rec = AIMatchResult(
                    source_complaint_id=target.id,
                    target_complaint_id=cand.id,
                    overall_score=res["overall_score"],
                    institution_score=res["institution_score"],
                    semantic_score=res["semantic_score"],
                    category_score=res["category_score"],
                    context_score=res["context_score"],
                    classification=res["classification"],
                    explanation_json=res,
                    status="UNREVIEWED"
                )
                db.add(match_rec)
                
    await db.commit()
