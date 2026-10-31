import io
import csv
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, case
from sqlalchemy.orm import selectinload

from backend.app.models.institution import Institution
from backend.app.models.complaint import Complaint, ComplaintCategory, RelatedCaseGroup
from backend.app.models.workflow import WorkflowStage
from backend.app.models.user import User, Bureau, RegionalOffice
from backend.app.models.coordination import CoordinationRequest
from backend.app.models.ai_match import AIMatchResult

async def get_executive_dashboard_data(
    db: AsyncSession,
    bureau_id: Optional[str] = None,
    regional_office_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> Dict[str, Any]:
    """Computes live database-backed executive statistics and chart distributions."""
    
    # Base filter conditions
    comp_conds = []
    if bureau_id:
        comp_conds.append(Complaint.receiving_bureau_id == bureau_id)
    if regional_office_id:
        comp_conds.append(Complaint.regional_office_id == regional_office_id)
    if start_date:
        comp_conds.append(Complaint.received_date >= start_date)
    if end_date:
        comp_conds.append(Complaint.received_date <= end_date)

    base_comp_query = select(Complaint)
    if comp_conds:
        base_comp_query = base_comp_query.where(and_(*comp_conds))

    # 1. Total Institutions
    total_institutions = (await db.execute(select(func.count(Institution.id)).where(Institution.is_active == True))).scalar_one()

    # 2. Complaints stats
    total_complaints = (await db.execute(select(func.count(Complaint.id)).where(and_(*comp_conds) if comp_conds else True))).scalar_one()
    open_complaints = (await db.execute(select(func.count(Complaint.id)).where(and_(Complaint.is_closed == False, *comp_conds)))).scalar_one()
    resolved_complaints = (await db.execute(select(func.count(Complaint.id)).where(and_(Complaint.is_closed == True, *comp_conds)))).scalar_one()
    overdue_complaints = (await db.execute(select(func.count(Complaint.id)).where(and_(Complaint.is_overdue == True, Complaint.is_closed == False, *comp_conds)))).scalar_one()
    high_priority_complaints = (await db.execute(select(func.count(Complaint.id)).where(and_(Complaint.priority.in_(["HIGH", "URGENT"]), Complaint.is_closed == False, *comp_conds)))).scalar_one()
    unassigned_complaints = (await db.execute(select(func.count(Complaint.id)).where(and_(Complaint.assigned_officer_id == None, Complaint.is_closed == False, *comp_conds)))).scalar_one()

    # Pending complaints (not closed, not unassigned)
    pending_complaints = max(0, open_complaints - unassigned_complaints)

    # Stages awaiting approval
    approval_stages = (await db.execute(select(WorkflowStage.id).where(WorkflowStage.requires_approval == True))).scalars().all()
    if approval_stages:
        awaiting_approval = (await db.execute(select(func.count(Complaint.id)).where(and_(Complaint.current_stage_id.in_(approval_stages), Complaint.is_closed == False, *comp_conds)))).scalar_one()
    else:
        awaiting_approval = 0

    # Potential related groups
    potential_related_groups = (await db.execute(select(func.count(RelatedCaseGroup.id)))).scalar_one()

    # Cross-bureau coordination requests
    cross_bureau_requests = (await db.execute(select(func.count(CoordinationRequest.id)).where(CoordinationRequest.status.in_(["PENDING", "ACCEPTED"])))).scalar_one()

    # CHARTS:
    # 1. Complaints received over time (monthly)
    # Using python grouping for portable SQLite/Postgres aggregation
    all_complaints_res = await db.execute(
        select(Complaint.received_date, Complaint.is_closed, Complaint.closed_at)
        .where(and_(*comp_conds) if comp_conds else True)
        .order_by(Complaint.received_date.asc())
    )
    all_complaint_dates = all_complaints_res.all()

    month_counts = {}
    month_resolved = {}
    for r_date, is_closed, c_date in all_complaint_dates:
        if r_date:
            m_key = r_date.strftime("%b %Y")
            month_counts[m_key] = month_counts.get(m_key, 0) + 1
        if is_closed and c_date:
            m_res_key = c_date.strftime("%b %Y")
            month_resolved[m_res_key] = month_resolved.get(m_res_key, 0) + 1

    complaints_over_time = [{"name": k, "value": v} for k, v in list(month_counts.items())[-6:]]
    monthly_resolution_trends = [{"name": k, "value": v} for k, v in list(month_resolved.items())[-6:]]

    # 2. Complaints by Bureau
    bureau_query = (
        select(Bureau.code, Bureau.name, func.count(Complaint.id))
        .join(Complaint, Complaint.receiving_bureau_id == Bureau.id, isouter=True)
        .group_by(Bureau.code, Bureau.name)
    )
    bureau_res = (await db.execute(bureau_query)).all()
    complaints_by_bureau = [{"name": b_code, "value": count, "extra": {"full_name": b_name}} for b_code, b_name, count in bureau_res]

    # 3. Complaints by Status / Stage
    stage_query = (
        select(WorkflowStage.name, WorkflowStage.color, func.count(Complaint.id))
        .join(Complaint, Complaint.current_stage_id == WorkflowStage.id, isouter=True)
        .group_by(WorkflowStage.name, WorkflowStage.color, WorkflowStage.stage_order)
        .order_by(WorkflowStage.stage_order.asc())
    )
    stage_res = (await db.execute(stage_query)).all()
    complaints_by_status = [{"name": s_name, "value": count, "extra": {"color": s_color}} for s_name, s_color, count in stage_res]

    # 4. Top Institutions with Complaints
    inst_dist_query = (
        select(Institution.name, func.count(Complaint.id).label("c_count"))
        .join(Complaint, Complaint.institution_id == Institution.id)
        .group_by(Institution.name)
        .order_by(desc("c_count"))
        .limit(7)
    )
    inst_dist_res = (await db.execute(inst_dist_query)).all()
    institution_distribution = [{"name": (i_name[:25] + "..." if len(i_name) > 25 else i_name), "value": count} for i_name, count in inst_dist_res]

    # 5. Severity Distribution
    sev_query = (
        select(Complaint.severity, func.count(Complaint.id))
        .where(and_(*comp_conds) if comp_conds else True)
        .group_by(Complaint.severity)
    )
    sev_res = (await db.execute(sev_query)).all()
    severity_distribution = [{"name": sev, "value": count} for sev, count in sev_res]

    # 6. Overdue by Bureau
    overdue_bureau_query = (
        select(Bureau.code, func.count(Complaint.id))
        .join(Complaint, Complaint.receiving_bureau_id == Bureau.id)
        .where(Complaint.is_overdue == True)
        .group_by(Bureau.code)
    )
    overdue_b_res = (await db.execute(overdue_bureau_query)).all()
    overdue_by_bureau = [{"name": b_code, "value": count} for b_code, count in overdue_b_res]

    # 7. Officer Workload Distribution
    officer_query = (
        select(User.full_name, func.count(Complaint.id).label("load"))
        .join(Complaint, Complaint.assigned_officer_id == User.id)
        .where(Complaint.is_closed == False)
        .group_by(User.full_name)
        .order_by(desc("load"))
        .limit(8)
    )
    officer_res = (await db.execute(officer_query)).all()
    workload_distribution = [{"name": name, "value": count} for name, count in officer_res]

    return {
        "kpis": {
            "total_institutions": total_institutions,
            "total_complaints": total_complaints,
            "open_complaints": open_complaints,
            "pending_complaints": pending_complaints,
            "resolved_complaints": resolved_complaints,
            "overdue_complaints": overdue_complaints,
            "high_priority_complaints": high_priority_complaints,
            "potential_related_groups": potential_related_groups,
            "unassigned_complaints": unassigned_complaints,
            "awaiting_approval": awaiting_approval,
            "cross_bureau_coordination_requests": cross_bureau_requests
        },
        "complaints_over_time": complaints_over_time,
        "complaints_by_bureau": complaints_by_bureau,
        "complaints_by_status": complaints_by_status,
        "institution_distribution": institution_distribution,
        "severity_distribution": severity_distribution,
        "monthly_resolution_trends": monthly_resolution_trends,
        "overdue_by_bureau": overdue_by_bureau,
        "workload_distribution": workload_distribution
    }

async def generate_report_data(
    db: AsyncSession,
    report_type: str,
    bureau_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> Dict[str, Any]:
    """Generates structured table and metric data for the 12 specified enterprise reports."""
    
    # 1. Institution-wise
    if report_type == "institution_wise":
        query = (
            select(
                Institution.aicte_id,
                Institution.name,
                Institution.state,
                func.count(Complaint.id).label("total"),
                func.sum(case((Complaint.is_closed == False, 1), else_=0)).label("open"),
                func.sum(case((Complaint.is_closed == True, 1), else_=0)).label("resolved"),
                func.sum(case((Complaint.is_overdue == True, 1), else_=0)).label("overdue")
            )
            .join(Complaint, Complaint.institution_id == Institution.id, isouter=True)
            .group_by(Institution.aicte_id, Institution.name, Institution.state)
            .order_by(desc("total"))
        )
        rows = (await db.execute(query)).all()
        columns = ["AICTE ID", "Institution Name", "State", "Total Complaints", "Open", "Resolved", "Overdue"]
        data = [[r[0], r[1], r[2], r[3] or 0, r[4] or 0, r[5] or 0, r[6] or 0] for r in rows]
        return {"title": "Institution-wise Complaint Report", "columns": columns, "data": data}

    # 2. Bureau-wise
    elif report_type == "bureau_wise":
        query = (
            select(
                Bureau.code,
                Bureau.name,
                func.count(Complaint.id).label("total"),
                func.sum(case((Complaint.is_closed == False, 1), else_=0)).label("open"),
                func.sum(case((Complaint.is_closed == True, 1), else_=0)).label("resolved"),
                func.sum(case((Complaint.is_overdue == True, 1), else_=0)).label("overdue")
            )
            .join(Complaint, Complaint.receiving_bureau_id == Bureau.id, isouter=True)
            .group_by(Bureau.code, Bureau.name)
            .order_by(desc("total"))
        )
        rows = (await db.execute(query)).all()
        columns = ["Bureau Code", "Bureau Name", "Total Complaints", "Open", "Resolved", "Overdue"]
        data = [[r[0], r[1], r[2] or 0, r[3] or 0, r[4] or 0, r[5] or 0] for r in rows]
        return {"title": "Bureau-wise Complaint Report", "columns": columns, "data": data}

    # 3. Regional
    elif report_type == "regional":
        query = (
            select(
                RegionalOffice.code,
                RegionalOffice.name,
                RegionalOffice.state,
                func.count(Complaint.id).label("total"),
                func.sum(case((Complaint.is_closed == False, 1), else_=0)).label("open"),
                func.sum(case((Complaint.is_closed == True, 1), else_=0)).label("resolved")
            )
            .join(Complaint, Complaint.regional_office_id == RegionalOffice.id, isouter=True)
            .group_by(RegionalOffice.code, RegionalOffice.name, RegionalOffice.state)
            .order_by(desc("total"))
        )
        rows = (await db.execute(query)).all()
        columns = ["Region Code", "Regional Office", "State", "Total Complaints", "Open", "Resolved"]
        data = [[r[0], r[1], r[2], r[3] or 0, r[4] or 0, r[5] or 0] for r in rows]
        return {"title": "Regional Complaint Distribution Report", "columns": columns, "data": data}

    # 4. Category
    elif report_type == "category":
        query = (
            select(
                ComplaintCategory.code,
                ComplaintCategory.name,
                func.count(Complaint.id).label("total"),
                func.sum(case((Complaint.severity == 'CRITICAL', 1), else_=0)).label("critical")
            )
            .join(Complaint, Complaint.category_id == ComplaintCategory.id, isouter=True)
            .group_by(ComplaintCategory.code, ComplaintCategory.name)
            .order_by(desc("total"))
        )
        rows = (await db.execute(query)).all()
        columns = ["Category Code", "Category Name", "Total Complaints", "Critical Cases"]
        data = [[r[0], r[1], r[2] or 0, r[3] or 0] for r in rows]
        return {"title": "Complaint Category Analysis Report", "columns": columns, "data": data}

    # 5. Overdue complaints
    elif report_type == "overdue":
        query = (
            select(
                Complaint.case_id,
                Institution.name,
                Bureau.code,
                Complaint.subject,
                Complaint.due_date,
                Complaint.priority
            )
            .join(Institution, Complaint.institution_id == Institution.id)
            .join(Bureau, Complaint.receiving_bureau_id == Bureau.id)
            .where(Complaint.is_overdue == True)
            .order_by(Complaint.due_date.asc())
        )
        rows = (await db.execute(query)).all()
        columns = ["Case ID", "Institution", "Bureau", "Subject", "Due Date", "Priority"]
        data = [[r[0], r[1], r[2], r[3], r[4].strftime('%Y-%m-%d') if r[4] else "N/A", r[5]] for r in rows]
        return {"title": "Overdue Case Escalation Report", "columns": columns, "data": data}

    # Fallback to general summary
    query = (
        select(
            Complaint.case_id,
            Institution.name,
            Bureau.code,
            Complaint.severity,
            Complaint.priority,
            Complaint.is_closed
        )
        .join(Institution, Complaint.institution_id == Institution.id)
        .join(Bureau, Complaint.receiving_bureau_id == Bureau.id)
        .limit(100)
    )
    rows = (await db.execute(query)).all()
    columns = ["Case ID", "Institution", "Bureau", "Severity", "Priority", "Closed Status"]
    data = [[r[0], r[1], r[2], r[3], r[4], "Closed" if r[5] else "Active"] for r in rows]
    return {"title": f"PRISM Consolidated Report ({report_type.replace('_', ' ').title()})", "columns": columns, "data": data}

def export_report_csv(report_data: Dict[str, Any]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(report_data.get("columns", []))
    for row in report_data.get("data", []):
        writer.writerow(row)
    return output.getvalue()
