import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base

class WorkflowDefinition(Base):
    __tablename__ = "workflow_definitions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    stages = relationship("WorkflowStage", back_populates="workflow", order_by="WorkflowStage.stage_order", cascade="all, delete-orphan")
    transitions = relationship("WorkflowTransition", back_populates="workflow", cascade="all, delete-orphan")

class WorkflowStage(Base):
    __tablename__ = "workflow_stages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(36), ForeignKey("workflow_definitions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False, index=True)
    stage_order = Column(Integer, nullable=False)
    is_initial = Column(Boolean, default=False)
    is_final = Column(Boolean, default=False)
    requires_approval = Column(Boolean, default=False)
    sla_days = Column(Integer, default=7)
    color = Column(String(20), default="blue")
    
    workflow = relationship("WorkflowDefinition", back_populates="stages")

class WorkflowTransition(Base):
    __tablename__ = "workflow_transitions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(36), ForeignKey("workflow_definitions.id", ondelete="CASCADE"), nullable=False)
    from_stage_id = Column(String(36), ForeignKey("workflow_stages.id", ondelete="CASCADE"), nullable=False)
    to_stage_id = Column(String(36), ForeignKey("workflow_stages.id", ondelete="CASCADE"), nullable=False)
    allowed_roles = Column(JSON, default=list) # e.g. ["SUPER_ADMIN", "BUREAU_HEAD", "CASE_OFFICER"]
    description = Column(Text, nullable=True)
    
    workflow = relationship("WorkflowDefinition", back_populates="transitions")
    from_stage = relationship("WorkflowStage", foreign_keys=[from_stage_id])
    to_stage = relationship("WorkflowStage", foreign_keys=[to_stage_id])

