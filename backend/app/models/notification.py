import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False, default="INFO") 
    # NEW_COMPLAINT, ASSIGNMENT, OVERDUE_WARNING, ESCALATION, COORDINATION_REQ, AI_MATCH_DETECTED
    
    reference_id = Column(String(100), nullable=True) # e.g. case_id or complaint_id or request_id
    reference_type = Column(String(50), nullable=True) # COMPLAINT, COORDINATION, AI_MATCH
    
    is_read = Column(Boolean, default=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    user = relationship("User")

