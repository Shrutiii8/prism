import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Institution(Base):
    __tablename__ = "institutions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    aicte_id = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(300), nullable=False, index=True)
    normalized_name = Column(String(300), nullable=False, index=True)
    institution_type = Column(String(100), nullable=False, default="Technical Institute") # Engineering, Management, Polytechnic, Pharmacy, etc.
    
    address = Column(Text, nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)
    
    affiliated_university = Column(String(250), nullable=True)
    approval_status = Column(String(50), nullable=False, default="Approved") # Approved, Suspended, Withdrawn, Under Scrutiny, Deficient
    approval_details = Column(Text, nullable=True)
    
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    identifiers = relationship("InstitutionIdentifier", back_populates="institution", cascade="all, delete-orphan")
    contacts = relationship("InstitutionContact", back_populates="institution", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="institution")
    related_groups = relationship("RelatedCaseGroup", back_populates="institution")

class InstitutionIdentifier(Base):
    __tablename__ = "institution_identifiers"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    identifier_type = Column(String(50), nullable=False) # AICTE_ID, AISHE_CODE, UGC_REG_NO, PAN, STATE_ID
    identifier_value = Column(String(150), nullable=False, index=True)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    institution = relationship("Institution", back_populates="identifiers")

class InstitutionContact(Base):
    __tablename__ = "institution_contacts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    designation = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    institution = relationship("Institution", back_populates="contacts")

