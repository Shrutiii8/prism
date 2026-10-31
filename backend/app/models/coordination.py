import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base

class CoordinationRequest(Base):
    __tablename__ = "coordination_requests"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    target_complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="SET NULL"), nullable=True, index=True)
    
    requesting_bureau_id = Column(String(36), ForeignKey("bureaus.id", ondelete="RESTRICT"), nullable=False, index=True)
    target_bureau_id = Column(String(36), ForeignKey("bureaus.id", ondelete="RESTRICT"), nullable=False, index=True)
    requested_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    
    title = Column(String(250), nullable=False)
    request_details = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False, index=True) # PENDING, ACCEPTED, DECLINED, COMPLETED
    deadline = Column(DateTime(timezone=True), nullable=True)
    resolution_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    source_complaint = relationship("Complaint", foreign_keys=[source_complaint_id])
    target_complaint = relationship("Complaint", foreign_keys=[target_complaint_id])
    requesting_bureau = relationship("Bureau", foreign_keys=[requesting_bureau_id])
    target_bureau = relationship("Bureau", foreign_keys=[target_bureau_id])
    requested_by = relationship("User", foreign_keys=[requested_by_id])
    messages = relationship("CoordinationMessage", back_populates="coordination_request", cascade="all, delete-orphan", order_by="CoordinationMessage.created_at")

class CoordinationMessage(Base):
    __tablename__ = "coordination_messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coordination_request_id = Column(String(36), ForeignKey("coordination_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    bureau_id = Column(String(36), ForeignKey("bureaus.id", ondelete="RESTRICT"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    coordination_request = relationship("CoordinationRequest", back_populates="messages")
    sender = relationship("User")
    bureau = relationship("Bureau")

