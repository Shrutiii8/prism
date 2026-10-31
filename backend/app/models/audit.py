import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String(255), nullable=True, index=True)
    user_role = Column(String(100), nullable=True)
    
    action = Column(String(100), nullable=False, index=True) 
    # AUTH_LOGIN, AUTH_LOGOUT, CREATE_COMPLAINT, UPDATE_STAGE, ASSIGN_OFFICER, 
    # VERIFY_AI_MATCH, REJECT_AI_MATCH, CREATE_INSTITUTION, UPLOAD_EVIDENCE, EXPORT_REPORT, etc.
    
    resource_type = Column(String(100), nullable=False, index=True) # COMPLAINT, INSTITUTION, USER, WORKFLOW, etc.
    resource_id = Column(String(100), nullable=True, index=True)
    
    change_details_json = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    correlation_id = Column(String(100), nullable=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    user = relationship("User")

