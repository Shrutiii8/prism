from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.notification import Notification

async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "INFO",
    reference_id: Optional[str] = None,
    reference_type: Optional[str] = None
) -> Notification:
    """Creates an in-app notification for a designated user."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        reference_id=reference_id,
        reference_type=reference_type,
        is_read=False,
    )
    db.add(notif)
    await db.flush()
    return notif

