from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_roles
from backend.app.models.user import User
from backend.app.models.settings import SystemSetting
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("", response_model=List[dict])
async def get_system_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(SystemSetting).order_by(SystemSetting.setting_key.asc())
    settings = (await db.execute(query)).scalars().all()
    return [
        {
            "id": s.id,
            "setting_key": s.setting_key,
            "setting_value": s.setting_value,
            "description": s.description,
            "updated_at": s.updated_at
        }
        for s in settings
    ]

@router.patch("/{setting_key}", response_model=dict)
async def update_system_setting(
    setting_key: str,
    payload: Dict[str, Any],
    current_user: User = Depends(require_roles(["SUPER_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    setting = (await db.execute(select(SystemSetting).where(SystemSetting.setting_key == setting_key))).scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setting not found")

    old_val = setting.setting_value
    setting.setting_value = payload.get("setting_value", setting.setting_value)
    setting.updated_by_id = current_user.id

    await record_audit_event(
        db,
        action="UPDATE_SYSTEM_SETTING",
        resource_type="SYSTEM_SETTING",
        resource_id=setting.id,
        user=current_user,
        change_details={"key": setting_key, "old_value": old_val, "new_value": setting.setting_value}
    )
    await db.commit()
    return {"message": "Setting updated", "setting_key": setting.setting_key, "setting_value": setting.setting_value}

