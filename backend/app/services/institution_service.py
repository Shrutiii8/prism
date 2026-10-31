import io
import csv
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from backend.app.models.institution import Institution, InstitutionIdentifier, InstitutionContact
from backend.app.models.complaint import Complaint
from backend.app.schemas.institution import InstitutionCreate, InstitutionUpdate
from backend.app.ml.matching_engine import normalize_text
from backend.app.services.audit_service import record_audit_event
from backend.app.models.user import User

async def list_institutions(
    db: AsyncSession,
    search: Optional[str] = None,
    state: Optional[str] = None,
    institution_type: Optional[str] = None,
    approval_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Tuple[List[Institution], int]:
    query = select(Institution).where(Institution.is_active == True)
    
    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(Institution.name).like(search_term),
                func.lower(Institution.aicte_id).like(search_term),
                func.lower(Institution.city).like(search_term),
                func.lower(Institution.affiliated_university).like(search_term)
            )
        )
    if state:
        query = query.where(Institution.state == state)
    if institution_type:
        query = query.where(Institution.institution_type == institution_type)
    if approval_status:
        query = query.where(Institution.approval_status == approval_status)
        
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()
    
    query = query.order_by(Institution.name.asc()).offset(skip).limit(limit)
    result = await db.execute(query)
    institutions = result.scalars().all()
    
    return institutions, total

async def get_institution_360(db: AsyncSession, institution_id: str) -> Dict[str, Any]:
    query = (
        select(Institution)
        .options(
            selectinload(Institution.identifiers),
            selectinload(Institution.contacts),
        )
        .where(Institution.id == institution_id)
    )
    result = await db.execute(query)
    inst = result.scalar_one_or_none()
    if not inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")
        
    # Query complaints summary for this institution
    comp_query = (
        select(Complaint)
        .options(
            selectinload(Complaint.bureau),
            selectinload(Complaint.current_stage),
            selectinload(Complaint.category)
        )
        .where(Complaint.institution_id == institution_id)
        .order_by(desc(Complaint.received_date))
    )
    comp_res = await db.execute(comp_query)
    complaints = comp_res.scalars().all()
    
    total = len(complaints)
    open_count = sum(1 for c in complaints if not c.is_closed)
    resolved_count = sum(1 for c in complaints if c.is_closed)
    overdue_count = sum(1 for c in complaints if c.is_overdue)
    
    severity_breakdown = {}
    bureau_breakdown = {}
    for c in complaints:
        severity_breakdown[c.severity] = severity_breakdown.get(c.severity, 0) + 1
        b_name = c.bureau.name if c.bureau else "Unassigned Bureau"
        bureau_breakdown[b_name] = bureau_breakdown.get(b_name, 0) + 1
        
    activity_timeline = []
    for c in complaints:
        activity_timeline.append({
            "type": "COMPLAINT_REGISTERED",
            "date": c.received_date.isoformat() if c.received_date else None,
            "title": f"Complaint {c.case_id} Registered",
            "description": c.subject,
            "bureau": c.bureau.code if c.bureau else None,
            "stage": c.current_stage.name if c.current_stage else None,
            "severity": c.severity,
            "case_id": c.case_id,
            "complaint_id": c.id
        })
        if c.is_closed and c.closed_at:
            activity_timeline.append({
                "type": "COMPLAINT_RESOLVED",
                "date": c.closed_at.isoformat(),
                "title": f"Complaint {c.case_id} Resolved",
                "description": c.resolution_summary or "Case closed following regulatory review.",
                "bureau": c.bureau.code if c.bureau else None,
                "case_id": c.case_id,
                "complaint_id": c.id
            })
            
    activity_timeline.sort(key=lambda x: x["date"] or "", reverse=True)
    
    recent_comp_list = []
    for c in complaints[:10]:
        recent_comp_list.append({
            "id": c.id,
            "case_id": c.case_id,
            "subject": c.subject,
            "bureau": c.bureau.code if c.bureau else None,
            "category": c.category.name if c.category else None,
            "stage": c.current_stage.name if c.current_stage else None,
            "severity": c.severity,
            "priority": c.priority,
            "received_date": c.received_date.isoformat() if c.received_date else None,
            "is_overdue": c.is_overdue
        })

    return {
        "institution": inst,
        "total_complaints": total,
        "open_complaints": open_count,
        "resolved_complaints": resolved_count,
        "overdue_complaints": overdue_count,
        "severity_breakdown": severity_breakdown,
        "bureau_breakdown": bureau_breakdown,
        "recent_complaints": recent_comp_list,
        "activity_timeline": activity_timeline
    }

async def check_duplicate_institution(
    db: AsyncSession,
    aicte_id: str,
    name: str,
    state: str,
    exclude_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    duplicates = []
    norm_name = normalize_text(name)
    
    # 1. Exact AICTE Permanent ID match
    query_id = select(Institution).where(func.lower(Institution.aicte_id) == aicte_id.strip().lower())
    if exclude_id:
        query_id = query_id.where(Institution.id != exclude_id)
    id_match = (await db.execute(query_id)).scalar_one_or_none()
    if id_match:
        duplicates.append({
            "type": "EXACT_IDENTIFIER_MATCH",
            "institution_id": id_match.id,
            "name": id_match.name,
            "aicte_id": id_match.aicte_id,
            "state": id_match.state,
            "reason": f"Exact match on AICTE Permanent ID: {id_match.aicte_id}"
        })

    # 2. Name similarity within state
    query_state = select(Institution).where(
        and_(
            Institution.state == state,
            Institution.is_active == True
        )
    )
    if exclude_id:
        query_state = query_state.where(Institution.id != exclude_id)
    state_insts = (await db.execute(query_state)).scalars().all()
    
    for other in state_insts:
        if id_match and other.id == id_match.id:
            continue
        other_norm = other.normalized_name
        tokens_a = set(norm_name.split())
        tokens_b = set(other_norm.split())
        if tokens_a and tokens_b:
            jaccard = len(tokens_a.intersection(tokens_b)) / len(tokens_a.union(tokens_b))
            if jaccard >= 0.70:
                duplicates.append({
                    "type": "HIGH_NAME_SIMILARITY",
                    "institution_id": other.id,
                    "name": other.name,
                    "aicte_id": other.aicte_id,
                    "state": other.state,
                    "reason": f"High name similarity in {state} ({round(jaccard*100, 1)}% token match)"
                })
                
    return duplicates

async def create_institution(
    db: AsyncSession,
    data: InstitutionCreate,
    current_user: User
) -> Institution:
    # Check duplicate
    dups = await check_duplicate_institution(db, data.aicte_id, data.name, data.state)
    exact_dup = [d for d in dups if d["type"] == "EXACT_IDENTIFIER_MATCH"]
    if exact_dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An institution with AICTE Permanent ID '{data.aicte_id}' already exists ({exact_dup[0]['name']})."
        )
        
    norm_name = normalize_text(data.name)
    inst = Institution(
        aicte_id=data.aicte_id.strip().upper(),
        name=data.name.strip(),
        normalized_name=norm_name,
        institution_type=data.institution_type,
        address=data.address,
        state=data.state,
        district=data.district,
        city=data.city,
        pincode=data.pincode,
        affiliated_university=data.affiliated_university,
        approval_status=data.approval_status,
        approval_details=data.approval_details,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        website=data.website,
        is_active=data.is_active,
    )
    db.add(inst)
    await db.flush()
    
    # Add primary identifier
    id_rec = InstitutionIdentifier(
        institution_id=inst.id,
        identifier_type="AICTE_ID",
        identifier_value=inst.aicte_id,
        is_verified=True
    )
    db.add(id_rec)
    
    if data.contacts:
        for c in data.contacts:
            contact = InstitutionContact(
                institution_id=inst.id,
                name=c.name,
                designation=c.designation,
                email=c.email,
                phone=c.phone,
                is_primary=c.is_primary
            )
            db.add(contact)
            
    await record_audit_event(
        db,
        action="CREATE_INSTITUTION",
        resource_type="INSTITUTION",
        resource_id=inst.id,
        user=current_user,
        change_details={"aicte_id": inst.aicte_id, "name": inst.name, "state": inst.state}
    )
    
    await db.commit()
    return inst

async def export_institutions_csv(db: AsyncSession) -> str:
    query = select(Institution).where(Institution.is_active == True).order_by(Institution.name.asc())
    insts = (await db.execute(query)).scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Institution ID", "AICTE Permanent ID", "Institution Name", "Type",
        "State", "District", "City", "Pincode", "Affiliated University",
        "Approval Status", "Contact Email", "Contact Phone"
    ])
    for inst in insts:
        writer.writerow([
            inst.id, inst.aicte_id, inst.name, inst.institution_type,
            inst.state, inst.district, inst.city, inst.pincode,
            inst.affiliated_university or "", inst.approval_status,
            inst.contact_email or "", inst.contact_phone or ""
        ])
    return output.getvalue()

