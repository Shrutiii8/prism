import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base

class EscalationPolicy(Base):
    __tablename__ = "escalation_policies"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False)
    bureau_id = Column(String(36), ForeignKey("bureaus.id", ondelete="SET NULL"), nullable=True)
    reminder_days_before_due = Column(Integer, default=3)
    overdue_supervisor_days = Column(Integer, default=3)
    overdue_bureau_head_days = Column(Integer, default=7)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    bureau = relationship("Bureau")

class EscalationEvent(Base):
    __tablename__ = "escalation_events"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_id = Column(String(36), ForeignKey("escalation_policies.id", ondelete="SET NULL"), nullable=True)
    escalation_level = Column(String(50), nullable=False, index=True)
    # LEVEL_1_REMINDER, LEVEL_2_SUPERVISOR, LEVEL_3_BUREAU_HEAD, LEVEL_4_CENTRAL_ADMIN
    
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    remarks = Column(Text, nullable=True)
    
    complaint = relationship("Complaint")
    policy = relationship("EscalationPolicy")

