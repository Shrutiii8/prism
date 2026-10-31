from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_roles
from backend.app.models.user import User
from backend.app.models.complaint import ComplaintCategory
from backend.app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    AssignmentRequest,
    StageTransitionRequest,
    CommentCreateRequest,
    ComplaintCategoryOut,
)
from backend.app.services.complaint_service import (
    list_complaints,
    get_complaint_detail,
    create_complaint,
    transition_complaint_stage,
    assign_complaint_officer,
    add_complaint_comment,
)

router = APIRouter(prefix="/complaints", tags=["Complaint Management"])

@router.get("/categories", response_model=List[ComplaintCategoryOut])
async def get_complaint_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(ComplaintCategory).where(ComplaintCategory.is_active == True).order_by(ComplaintCategory.name.asc())
    categories = (await db.execute(query)).scalars().all()
    return categories

@router.get("", response_model=dict)
async def get_complaints_endpoint(
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
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    complaints, total = await list_complaints(
        db,
        current_user=current_user,
        search=search,
        bureau_id=bureau_id,
        regional_office_id=regional_office_id,
        category_id=category_id,
        stage_id=stage_id,
        severity=severity,
        priority=priority,
        institution_id=institution_id,
        is_overdue=is_overdue,
        is_closed=is_closed,
        assigned_to_me=assigned_to_me,
        skip=skip,
        limit=limit
    )
    items = []
    for c in complaints:
        items.append({
            "id": c.id,
            "case_id": c.case_id,
            "subject": c.subject,
            "description": c.description,
            "institution_id": c.institution_id,
            "institution_name": c.institution.name if c.institution else None,
            "aicte_id": c.institution.aicte_id if c.institution else None,
            "receiving_bureau_id": c.receiving_bureau_id,
            "bureau_name": c.bureau.name if c.bureau else None,
            "bureau_code": c.bureau.code if c.bureau else None,
            "regional_office_id": c.regional_office_id,
            "regional_office_name": c.regional_office.name if c.regional_office else None,
            "category_id": c.category_id,
            "category_name": c.category.name if c.category else None,
            "subcategory": c.subcategory,
            "severity": c.severity,
            "priority": c.priority,
            "current_stage_id": c.current_stage_id,
            "stage_name": c.current_stage.name if c.current_stage else None,
            "stage_color": c.current_stage.color if c.current_stage else None,
            "assigned_officer_id": c.assigned_officer_id,
            "assigned_officer_name": c.assigned_officer.full_name if c.assigned_officer else "Unassigned",
            "received_date": c.received_date,
            "due_date": c.due_date,
            "reference_number": c.reference_number,
            "is_overdue": c.is_overdue,
            "is_closed": c.is_closed,
            "resolution_summary": c.resolution_summary,
            "created_at": c.created_at,
            "updated_at": c.updated_at
        })
    return {"items": items, "total": total, "skip": skip, "limit": limit}

@router.post("", response_model=dict)
async def create_complaint_endpoint(
    data: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    complaint = await create_complaint(db, data, current_user)
    return {
        "id": complaint.id,
        "case_id": complaint.case_id,
        "subject": complaint.subject,
        "severity": complaint.severity,
        "priority": complaint.priority,
        "due_date": complaint.due_date
    }

@router.get("/{complaint_id}", response_model=dict)
async def get_complaint_detail_endpoint(
    complaint_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    data = await get_complaint_detail(db, complaint_id, current_user)
    c = data["complaint"]
    
    # Assignments history list
    assignments = []
    for a in c.assignments:
        assignments.append({
            "id": a.id,
            "assigned_to": a.assigned_to.full_name if a.assigned_to else None,
            "assigned_by": a.assigned_by.full_name if a.assigned_by else None,
            "reason": a.assignment_reason,
            "assigned_at": a.assigned_at
        })
        
    # Status history list
    status_hist = []
    for s in c.status_history:
        status_hist.append({
            "id": s.id,
            "from_stage": s.from_stage.name if s.from_stage else None,
            "to_stage": s.to_stage.name if s.to_stage else None,
            "changed_by": s.changed_by.full_name if s.changed_by else None,
            "remarks": s.remarks,
            "created_at": s.created_at
        })

    # Comments list
    comments = []
    for comm in c.comments:
        comments.append({
            "id": comm.id,
            "user_name": comm.user.full_name if comm.user else None,
            "user_role": comm.user.role.display_name if (comm.user and comm.user.role) else None,
            "comment_text": comm.comment_text,
            "is_internal": comm.is_internal,
            "created_at": comm.created_at
        })

    # Evidence files list
    evidence_files = []
    for ev in c.evidence:
        evidence_files.append({
            "id": ev.id,
            "original_file_name": ev.original_file_name,
            "file_size_bytes": ev.file_size_bytes,
            "mime_type": ev.mime_type,
            "sha256_hash": ev.sha256_hash,
            "document_category": ev.document_category,
            "uploaded_by": ev.uploaded_by.full_name if ev.uploaded_by else None,
            "created_at": ev.created_at
        })

    return {
        "id": c.id,
        "case_id": c.case_id,
        "subject": c.subject,
        "description": c.description,
        "institution_id": c.institution_id,
        "institution_name": c.institution.name if c.institution else None,
        "aicte_id": c.institution.aicte_id if c.institution else None,
        "receiving_bureau_id": c.receiving_bureau_id,
        "bureau_name": c.bureau.name if c.bureau else None,
        "bureau_code": c.bureau.code if c.bureau else None,
        "regional_office_id": c.regional_office_id,
        "regional_office_name": c.regional_office.name if c.regional_office else None,
        "category_id": c.category_id,
        "category_name": c.category.name if c.category else None,
        "subcategory": c.subcategory,
        "severity": c.severity,
        "priority": c.priority,
        "current_stage_id": c.current_stage_id,
        "stage_name": c.current_stage.name if c.current_stage else None,
        "stage_code": c.current_stage.code if c.current_stage else None,
        "stage_color": c.current_stage.color if c.current_stage else None,
        "assigned_officer_id": c.assigned_officer_id,
        "assigned_officer_name": c.assigned_officer.full_name if c.assigned_officer else "Unassigned",
        "complainant_name": data["complainant_name"],
        "complainant_email": data["complainant_email"],
        "complainant_phone": data["complainant_phone"],
        "is_anonymous": data["is_anonymous"],
        "received_date": c.received_date,
        "due_date": c.due_date,
        "reference_number": c.reference_number,
        "is_overdue": c.is_overdue,
        "is_closed": c.is_closed,
        "resolution_summary": c.resolution_summary,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
        "assignments_history": assignments,
        "status_history": status_hist,
        "comments": comments,
        "evidence_files": evidence_files,
        "related_cases": data["related_cases"],
        "permitted_transitions": data["permitted_transitions"]
    }

@router.post("/{complaint_id}/transition", response_model=dict)
async def transition_stage_endpoint(
    complaint_id: str,
    req: StageTransitionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    c = await transition_complaint_stage(db, complaint_id, req, current_user)
    return {"message": "Stage updated successfully", "current_stage_id": c.current_stage_id}

@router.post("/{complaint_id}/assign", response_model=dict)
async def assign_officer_endpoint(
    complaint_id: str,
    req: AssignmentRequest,
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "CENTRAL_ADMIN", "BUREAU_HEAD"])),
    db: AsyncSession = Depends(get_db)
):
    c = await assign_complaint_officer(db, complaint_id, req, current_user)
    return {"message": "Officer assigned successfully", "assigned_officer_id": c.assigned_officer_id}

@router.post("/{complaint_id}/comments", response_model=dict)
async def post_comment_endpoint(
    complaint_id: str,
    req: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    comm = await add_complaint_comment(db, complaint_id, req, current_user)
    return {"id": comm.id, "created_at": comm.created_at}

