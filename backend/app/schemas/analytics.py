from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ExecutiveKPIs(BaseModel):
    total_institutions: int
    total_complaints: int
    open_complaints: int
    pending_complaints: int
    resolved_complaints: int
    overdue_complaints: int
    high_priority_complaints: int
    potential_related_groups: int
    unassigned_complaints: int
    awaiting_approval: int
    cross_bureau_coordination_requests: int

class ChartPoint(BaseModel):
    name: str
    value: int
    extra: Optional[Dict[str, Any]] = None

class ExecutiveDashboardOut(BaseModel):
    kpis: ExecutiveKPIs
    complaints_over_time: List[ChartPoint]
    complaints_by_bureau: List[ChartPoint]
    complaints_by_status: List[ChartPoint]
    institution_distribution: List[ChartPoint]
    severity_distribution: List[ChartPoint]
    monthly_resolution_trends: List[ChartPoint]
    overdue_by_bureau: List[ChartPoint]
    workload_distribution: List[ChartPoint]

