from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_roles
from backend.app.core.security import hash_password
from backend.app.models.user import User, Role, Permission, Bureau, RegionalOffice
from backend.app.models.complaint import Complaint
from backend.app.schemas.user import UserCreate, UserUpdate, UserOut, RoleOut, PermissionOut, BureauOut, RegionalOfficeOut
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/users", tags=["User & Access Management"])

@router.get("", response_model=List[UserOut])
async def get_users(
    bureau_id: Optional[str] = None,
    role_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(User)
        .options(
            selectinload(User.role),
            selectinload(User.bureau),
            selectinload(User.regional_office)
        )
    )
    if bureau_id:
        query = query.where(User.bureau_id == bureau_id)
    if role_id:
        query = query.where(User.role_id == role_id)
        
    users = (await db.execute(query)).scalars().all()
    
    # Calculate active cases count for each user
    counts_query = (
        select(Complaint.assigned_officer_id, func.count(Complaint.id))
        .where(Complaint.is_closed == False)
        .group_by(Complaint.assigned_officer_id)
    )
    counts = dict((await db.execute(counts_query)).all())
    
    out = []
    for u in users:
        out.append(UserOut(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            phone=u.phone,
            is_active=u.is_active,
            role_id=u.role_id,
            role_name=u.role.name if u.role else None,
            role_display=u.role.display_name if u.role else None,
            bureau_id=u.bureau_id,
            bureau_name=u.bureau.name if u.bureau else None,
            bureau_code=u.bureau.code if u.bureau else None,
            regional_office_id=u.regional_office_id,
            regional_office_name=u.regional_office.name if u.regional_office else None,
            created_at=u.created_at,
            active_cases_count=counts.get(u.id, 0)
        ))
    return out

@router.post("", response_model=UserOut)
async def create_user(
    data: UserCreate,
    current_user: User = Depends(require_roles(["SUPER_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    existing = (await db.execute(select(User).where(User.email == data.email.strip().lower()))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists.")

    new_user = User(
        email=data.email.strip().lower(),
        hashed_password=hash_password(data.password),
        full_name=data.full_name.strip(),
        phone=data.phone,
        role_id=data.role_id,
        bureau_id=data.bureau_id,
        regional_office_id=data.regional_office_id,
        is_active=data.is_active
    )
    db.add(new_user)
    await db.flush()

    await record_audit_event(
        db,
        action="CREATE_USER",
        resource_type="USER",
        resource_id=new_user.id,
        user=current_user,
        change_details={"email": new_user.email, "role_id": new_user.role_id}
    )
    await db.commit()

    u = (await db.execute(select(User).options(selectinload(User.role), selectinload(User.bureau), selectinload(User.regional_office)).where(User.id == new_user.id))).scalar_one()
    return UserOut(
        id=u.id,
        email=u.email,
        full_name=u.full_name,
        phone=u.phone,
        is_active=u.is_active,
        role_id=u.role_id,
        role_name=u.role.name if u.role else None,
        role_display=u.role.display_name if u.role else None,
        bureau_id=u.bureau_id,
        bureau_name=u.bureau.name if u.bureau else None,
        bureau_code=u.bureau.code if u.bureau else None,
        regional_office_id=u.regional_office_id,
        regional_office_name=u.regional_office.name if u.regional_office else None,
        created_at=u.created_at,
        active_cases_count=0
    )

@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    data: UserUpdate,
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "CENTRAL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    user = (await db.execute(select(User).options(selectinload(User.role), selectinload(User.bureau), selectinload(User.regional_office)).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    changes = {}
    if data.full_name is not None:
        user.full_name = data.full_name
        changes["full_name"] = data.full_name
    if data.phone is not None:
        user.phone = data.phone
    if data.role_id is not None:
        user.role_id = data.role_id
        changes["role_id"] = data.role_id
    if data.bureau_id is not None:
        user.bureau_id = data.bureau_id
        changes["bureau_id"] = data.bureau_id
    if data.regional_office_id is not None:
        user.regional_office_id = data.regional_office_id
    if data.is_active is not None:
        user.is_active = data.is_active
        changes["is_active"] = data.is_active

    await record_audit_event(
        db,
        action="UPDATE_USER",
        resource_type="USER",
        resource_id=user.id,
        user=current_user,
        change_details=changes
    )
    await db.commit()
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        is_active=user.is_active,
        role_id=user.role_id,
        role_name=user.role.name if user.role else None,
        role_display=user.role.display_name if user.role else None,
        bureau_id=user.bureau_id,
        bureau_name=user.bureau.name if user.bureau else None,
        bureau_code=user.bureau.code if user.bureau else None,
        regional_office_id=user.regional_office_id,
        regional_office_name=user.regional_office.name if user.regional_office else None,
        created_at=user.created_at,
        active_cases_count=0
    )

@router.get("/roles/all", response_model=List[RoleOut])
async def get_roles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Role).options(selectinload(Role.permissions)).order_by(Role.name.asc())
    roles = (await db.execute(query)).scalars().all()
    return roles

@router.get("/bureaus/all", response_model=List[BureauOut])
async def get_bureaus(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Bureau).where(Bureau.is_active == True).order_by(Bureau.code.asc())
    bureaus = (await db.execute(query)).scalars().all()
    return bureaus

@router.get("/regional-offices/all", response_model=List[RegionalOfficeOut])
async def get_regional_offices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(RegionalOffice).where(RegionalOffice.is_active == True).order_by(RegionalOffice.name.asc())
    offices = (await db.execute(query)).scalars().all()
    return offices

@router.get("/officers/workload")
async def get_officer_workload_matrix(
    bureau_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns workload statistics per officer for dynamic assignment optimization."""
    query = (
        select(User)
        .join(Role, User.role_id == Role.id)
        .options(selectinload(User.bureau), selectinload(User.role))
        .where(
            and_(
                User.is_active == True,
                Role.name.in_(["CASE_OFFICER", "BUREAU_HEAD", "REGIONAL_OFFICER"])
            )
        )
    )
    if bureau_id:
        query = query.where(User.bureau_id == bureau_id)
        
    officers = (await db.execute(query)).scalars().all()
    
    workload_data = []
    for off in officers:
        # Assigned count
        assigned_query = select(func.count(Complaint.id)).where(Complaint.assigned_officer_id == off.id)
        total_assigned = (await db.execute(assigned_query)).scalar_one() or 0
        
        # Currently open
        open_query = select(func.count(Complaint.id)).where(and_(Complaint.assigned_officer_id == off.id, Complaint.is_closed == False))
        currently_open = (await db.execute(open_query)).scalar_one() or 0
        
        # Overdue
        overdue_query = select(func.count(Complaint.id)).where(and_(Complaint.assigned_officer_id == off.id, Complaint.is_overdue == True, Complaint.is_closed == False))
        overdue = (await db.execute(overdue_query)).scalar_one() or 0
        
        # Max capacity benchmark (e.g. 15 active cases)
        capacity_pct = min(100, int((currently_open / 15.0) * 100))
        
        workload_data.append({
            "officer_id": off.id,
            "name": off.full_name,
            "email": off.email,
            "role": off.role.display_name if off.role else "",
            "bureau_code": off.bureau.code if off.bureau else "",
            "total_assigned": total_assigned,
            "currently_open": currently_open,
            "overdue": overdue,
            "capacity_percent": capacity_pct,
            "availability_status": "HIGH_LOAD" if currently_open >= 12 else ("OPTIMAL" if currently_open >= 6 else "AVAILABLE")
        })
        
    workload_data.sort(key=lambda x: x["currently_open"])
    return workload_data

