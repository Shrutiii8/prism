import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base

class AIMatchResult(Base):
    __tablename__ = "ai_match_results"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    target_complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    
    overall_score = Column(Float, nullable=False, default=0.0, index=True)
    institution_score = Column(Float, nullable=False, default=0.0)
    semantic_score = Column(Float, nullable=False, default=0.0)
    category_score = Column(Float, nullable=False, default=0.0)
    context_score = Column(Float, nullable=False, default=0.0)
    
    classification = Column(String(50), nullable=False, index=True) # HIGH, MEDIUM, LOW
    explanation_json = Column(JSON, nullable=True) # JSON containing reasons, common terms, breakdown
    status = Column(String(50), default="UNREVIEWED", nullable=False, index=True) # UNREVIEWED, CONFIRMED, REJECTED, DISMISSED
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    source_complaint = relationship("Complaint", foreign_keys=[source_complaint_id])
    target_complaint = relationship("Complaint", foreign_keys=[target_complaint_id])
    reviews = relationship("AIMatchReview", back_populates="match_result", cascade="all, delete-orphan")

class AIMatchReview(Base):
    __tablename__ = "ai_match_reviews"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_result_id = Column(String(36), ForeignKey("ai_match_results.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewed_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    review_action = Column(String(50), nullable=False) # CONFIRM, REJECT, DISMISS
    review_comments = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    match_result = relationship("AIMatchResult", back_populates="reviews")
    reviewed_by = relationship("User")

