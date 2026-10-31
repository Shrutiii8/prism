import uuid
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base

class ComplaintCategory(Base):
    __tablename__ = "complaint_categories"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    default_sla_days = Column(Integer, default=15)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    complaints = relationship("Complaint", back_populates="category")

class Complaint(Base):
    __tablename__ = "complaints"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String(50), unique=True, nullable=False, index=True) # e.g. PRISM-2026-000001
    subject = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=False)
    normalized_description = Column(Text, nullable=True)
    
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    # Complainant details (privacy restricted)
    complainant_name = Column(String(200), nullable=True)
    complainant_email = Column(String(255), nullable=True)
    complainant_phone = Column(String(50), nullable=True)
    is_anonymous = Column(Boolean, default=False)
    
    # Ownership and Routing
    receiving_bureau_id = Column(String(36), ForeignKey("bureaus.id", ondelete="RESTRICT"), nullable=False, index=True)
    regional_office_id = Column(String(36), ForeignKey("regional_offices.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(String(36), ForeignKey("complaint_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    subcategory = Column(String(150), nullable=True)
    
    # Classification
    severity = Column(String(50), default="MEDIUM", nullable=False, index=True) # LOW, MEDIUM, HIGH, CRITICAL
    priority = Column(String(50), default="MEDIUM", nullable=False, index=True) # LOW, MEDIUM, HIGH, URGENT
    
    # Workflow & Assignment
    current_stage_id = Column(String(36), ForeignKey("workflow_stages.id", ondelete="RESTRICT"), nullable=False, index=True)
    assigned_officer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Timelines & SLA
    received_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    reference_number = Column(String(100), nullable=True, index=True) # external reference or memo number
    
    is_overdue = Column(Boolean, default=False, index=True)
    is_closed = Column(Boolean, default=False, index=True)
    resolution_summary = Column(Text, nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    institution = relationship("Institution", back_populates="complaints")
    bureau = relationship("Bureau", back_populates="complaints")
    regional_office = relationship("RegionalOffice", back_populates="complaints")
    category = relationship("ComplaintCategory", back_populates="complaints")
    current_stage = relationship("WorkflowStage")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], back_populates="assigned_complaints")
    created_by = relationship("User", foreign_keys=[created_by_id])
    
    assignments = relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan", order_by="desc(ComplaintAssignment.assigned_at)")
    status_history = relationship("ComplaintStatusHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="desc(ComplaintStatusHistory.created_at)")
    comments = relationship("ComplaintComment", back_populates="complaint", cascade="all, delete-orphan", order_by="desc(ComplaintComment.created_at)")
    evidence = relationship("ComplaintEvidence", back_populates="complaint", cascade="all, delete-orphan")
    group_memberships = relationship("RelatedCaseGroupMember", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintAssignment(Base):
    __tablename__ = "complaint_assignments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    assigned_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    previous_officer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assignment_reason = Column(Text, nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    complaint = relationship("Complaint", back_populates="assignments")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    assigned_by = relationship("User", foreign_keys=[assigned_by_id])
    previous_officer = relationship("User", foreign_keys=[previous_officer_id])

class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    from_stage_id = Column(String(36), ForeignKey("workflow_stages.id", ondelete="SET NULL"), nullable=True)
    to_stage_id = Column(String(36), ForeignKey("workflow_stages.id", ondelete="RESTRICT"), nullable=False)
    changed_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    complaint = relationship("Complaint", back_populates="status_history")
    from_stage = relationship("WorkflowStage", foreign_keys=[from_stage_id])
    to_stage = relationship("WorkflowStage", foreign_keys=[to_stage_id])
    changed_by = relationship("User")

class ComplaintComment(Base):
    __tablename__ = "complaint_comments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    comment_text = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=True) # internal officer note vs official correspondence
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    complaint = relationship("Complaint", back_populates="comments")
    user = relationship("User")

class ComplaintRelationship(Base):
    __tablename__ = "complaint_relationships"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    target_complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(100), default="SIMILAR_SUBJECT", nullable=False) # SAME_INSTITUTION, DUPLICATE_ALLEGATION, COMMON_SUBJECT, RELATED_INVESTIGATION
    confidence_score = Column(Float, nullable=False, default=0.0)
    explanation = Column(Text, nullable=True)
    
    verification_status = Column(String(50), default="PENDING", nullable=False, index=True) # PENDING, CONFIRMED, REJECTED
    verified_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verification_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    source_complaint = relationship("Complaint", foreign_keys=[source_complaint_id])
    target_complaint = relationship("Complaint", foreign_keys=[target_complaint_id])
    verified_by = relationship("User", foreign_keys=[verified_by_id])

class RelatedCaseGroup(Base):
    __tablename__ = "related_case_groups"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_code = Column(String(50), unique=True, nullable=False, index=True) # e.g. GRP-2026-0001
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    common_issue_description = Column(Text, nullable=False)
    verification_status = Column(String(50), default="CONFIRMED", nullable=False)
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    institution = relationship("Institution", back_populates="related_groups")
    created_by = relationship("User")
    members = relationship("RelatedCaseGroupMember", back_populates="group", cascade="all, delete-orphan")

class RelatedCaseGroupMember(Base):
    __tablename__ = "related_case_group_members"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String(36), ForeignKey("related_case_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    added_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    group = relationship("RelatedCaseGroup", back_populates="members")
    complaint = relationship("Complaint", back_populates="group_memberships")
    added_by = relationship("User")

