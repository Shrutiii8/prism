from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.workflow import WorkflowDefinition, WorkflowStage, WorkflowTransition

router = APIRouter(prefix="/workflows", tags=["Workflow Configuration"])

@router.get("/stages", response_model=List[dict])
async def get_stages(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(WorkflowStage).order_by(WorkflowStage.stage_order.asc())
    stages = (await db.execute(query)).scalars().all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "code": s.code,
            "stage_order": s.stage_order,
            "is_initial": s.is_initial,
            "is_final": s.is_final,
            "requires_approval": s.requires_approval,
            "sla_days": s.sla_days,
            "color": s.color
        }
        for s in stages
    ]

@router.get("/transitions", response_model=List[dict])
async def get_transitions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(WorkflowTransition)
        .options(
            selectinload(WorkflowTransition.from_stage),
            selectinload(WorkflowTransition.to_stage)
        )
    )
    transitions = (await db.execute(query)).scalars().all()
    return [
        {
            "id": t.id,
            "from_stage_id": t.from_stage_id,
            "from_stage_name": t.from_stage.name if t.from_stage else None,
            "to_stage_id": t.to_stage_id,
            "to_stage_name": t.to_stage.name if t.to_stage else None,
            "allowed_roles": t.allowed_roles,
            "description": t.description
        }
        for t in transitions
    ]

