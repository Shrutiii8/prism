import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_roles
from backend.app.models.user import User
from backend.app.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionOut,
    InstitutionDetailOut,
)
from backend.app.services.institution_service import (
    list_institutions,
    get_institution_360,
    create_institution,
    check_duplicate_institution,
    export_institutions_csv,
)

router = APIRouter(prefix="/institutions", tags=["Institution Registry"])

@router.get("", response_model=dict)
async def get_institutions_endpoint(
    search: Optional[str] = None,
    state: Optional[str] = None,
    institution_type: Optional[str] = None,
    approval_status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    insts, total = await list_institutions(
        db, search=search, state=state, institution_type=institution_type,
        approval_status=approval_status, skip=skip, limit=limit
    )
    items = []
    for inst in insts:
        items.append({
            "id": inst.id,
            "aicte_id": inst.aicte_id,
            "name": inst.name,
            "normalized_name": inst.normalized_name,
            "institution_type": inst.institution_type,
            "address": inst.address,
            "state": inst.state,
            "district": inst.district,
            "city": inst.city,
            "pincode": inst.pincode,
            "affiliated_university": inst.affiliated_university,
            "approval_status": inst.approval_status,
            "approval_details": inst.approval_details,
            "contact_email": inst.contact_email,
            "contact_phone": inst.contact_phone,
            "website": inst.website,
            "is_active": inst.is_active,
            "created_at": inst.created_at,
            "updated_at": inst.updated_at
        })
    return {"items": items, "total": total, "skip": skip, "limit": limit}

@router.get("/check-duplicate")
async def check_duplicate(
    aicte_id: str = Query(...),
    name: str = Query(...),
    state: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    duplicates = await check_duplicate_institution(db, aicte_id=aicte_id, name=name, state=state)
    return {"has_duplicate": len(duplicates) > 0, "matches": duplicates}

@router.get("/export/csv")
async def export_csv(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    csv_data = await export_institutions_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=prism_institutions_registry.csv"}
    )

@router.post("/import/csv")
async def import_institutions_from_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "CENTRAL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    try:
        decoded = content.decode('utf-8-sig')
    except Exception:
        decoded = content.decode('latin-1')
        
    reader = csv.DictReader(io.StringIO(decoded))
    imported = 0
    skipped = 0
    errors = []

    for row_idx, row in enumerate(reader, start=2):
        aicte_id = row.get("AICTE Permanent ID") or row.get("aicte_id") or row.get("AICTE ID")
        name = row.get("Institution Name") or row.get("name")
        state = row.get("State") or row.get("state")
        city = row.get("City") or row.get("city") or "City"
        district = row.get("District") or row.get("district") or city
        pincode = row.get("Pincode") or row.get("pincode") or "000000"
        address = row.get("Address") or row.get("address") or f"{city}, {state}"
        
        if not aicte_id or not name or not state:
            skipped += 1
            continue

        try:
            data = InstitutionCreate(
                aicte_id=aicte_id.strip(),
                name=name.strip(),
                institution_type=row.get("Type") or row.get("institution_type") or "Technical Institute",
                address=address,
                state=state.strip(),
                district=district.strip(),
                city=city.strip(),
                pincode=pincode.strip(),
                affiliated_university=row.get("Affiliated University") or row.get("affiliated_university"),
                approval_status=row.get("Approval Status") or row.get("approval_status") or "Approved",
                contact_email=row.get("Contact Email") or row.get("contact_email"),
                contact_phone=row.get("Contact Phone") or row.get("contact_phone")
            )
            await create_institution(db, data, current_user)
            imported += 1
        except HTTPException as e:
            skipped += 1
            errors.append(f"Row {row_idx} ({aicte_id}): {e.detail}")
        except Exception as e:
            skipped += 1
            errors.append(f"Row {row_idx}: {str(e)}")

    return {
        "status": "success",
        "imported_count": imported,
        "skipped_count": skipped,
        "errors": errors[:10]
    }

@router.get("/{institution_id}", response_model=dict)
async def get_institution_detail_endpoint(
    institution_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await get_institution_360(db, institution_id)
    inst = profile["institution"]
    return {
        "id": inst.id,
        "aicte_id": inst.aicte_id,
        "name": inst.name,
        "normalized_name": inst.normalized_name,
        "institution_type": inst.institution_type,
        "address": inst.address,
        "state": inst.state,
        "district": inst.district,
        "city": inst.city,
        "pincode": inst.pincode,
        "affiliated_university": inst.affiliated_university,
        "approval_status": inst.approval_status,
        "approval_details": inst.approval_details,
        "contact_email": inst.contact_email,
        "contact_phone": inst.contact_phone,
        "website": inst.website,
        "is_active": inst.is_active,
        "created_at": inst.created_at,
        "updated_at": inst.updated_at,
        "total_complaints": profile["total_complaints"],
        "open_complaints": profile["open_complaints"],
        "resolved_complaints": profile["resolved_complaints"],
        "overdue_complaints": profile["overdue_complaints"],
        "severity_breakdown": profile["severity_breakdown"],
        "bureau_breakdown": profile["bureau_breakdown"],
        "recent_complaints": profile["recent_complaints"],
        "activity_timeline": profile["activity_timeline"]
    }

@router.post("", response_model=dict)
async def create_institution_endpoint(
    data: InstitutionCreate,
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "CENTRAL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    inst = await create_institution(db, data, current_user)
    return {
        "id": inst.id,
        "aicte_id": inst.aicte_id,
        "name": inst.name,
        "institution_type": inst.institution_type,
        "state": inst.state,
        "approval_status": inst.approval_status
    }

