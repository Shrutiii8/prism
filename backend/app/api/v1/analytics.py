from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.services.analytics_service import (
    get_executive_dashboard_data,
    generate_report_data,
    export_report_csv,
)
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/analytics", tags=["Executive Analytics & Reports"])

@router.get("/dashboard", response_model=dict)
async def get_dashboard(
    bureau_id: Optional[str] = None,
    regional_office_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # If Bureau Head or Officer, scope to their bureau by default if not set
    user_role = current_user.role.name.upper() if current_user.role else ""
    if user_role in ["BUREAU_HEAD", "CASE_OFFICER"] and not bureau_id:
        bureau_id = current_user.bureau_id

    data = await get_executive_dashboard_data(db, bureau_id=bureau_id, regional_office_id=regional_office_id)
    return data

@router.get("/reports/{report_type}", response_model=dict)
async def get_report(
    report_type: str,
    bureau_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    valid_types = [
        "institution_wise", "bureau_wise", "regional", "category", "severity",
        "officer_performance", "workload", "resolution_time", "overdue",
        "coordination", "related_cases", "trends"
    ]
    if report_type not in valid_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid report type. Allowed: {valid_types}")

    data = await generate_report_data(db, report_type=report_type, bureau_id=bureau_id)
    return data

@router.get("/reports/{report_type}/export-csv")
async def export_report(
    report_type: str,
    bureau_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    data = await generate_report_data(db, report_type=report_type, bureau_id=bureau_id)
    csv_str = export_report_csv(data)

    await record_audit_event(
        db,
        action="EXPORT_REPORT",
        resource_type="REPORT",
        resource_id=report_type,
        user=current_user,
        change_details={"report_type": report_type}
    )
    await db.commit()

    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=prism_report_{report_type}.csv"}
    )

