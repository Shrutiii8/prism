import os
import uuid
import hashlib
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from fastapi import HTTPException, status, UploadFile
from backend.app.core.config import settings
from backend.app.models.evidence import ComplaintEvidence
from backend.app.models.complaint import Complaint
from backend.app.models.user import User
from backend.app.services.audit_service import record_audit_event

async def upload_evidence_file(
    db: AsyncSession,
    complaint_id: str,
    file: UploadFile,
    document_category: str,
    current_user: User
) -> ComplaintEvidence:
    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    content = await file.read()
    file_size = len(content)

    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
        )

    # Validate mime type
    mime_type = file.content_type or "application/octet-stream"
    if mime_type not in settings.ALLOWED_MIME_TYPES and not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg', '.csv', '.docx', '.xlsx')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File format not permitted. Allowed formats: PDF, PNG, JPG, CSV, DOCX, XLSX."
        )

    # Compute SHA-256 integrity checksum
    sha256_hash = hashlib.sha256(content).hexdigest()

    # Sanitize and create storage directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{ext}"
    stored_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(stored_path, "wb") as f:
        f.write(content)

    evidence = ComplaintEvidence(
        complaint_id=complaint.id,
        institution_id=complaint.institution_id,
        file_name=unique_filename,
        original_file_name=file.filename,
        file_path=stored_path,
        file_size_bytes=file_size,
        mime_type=mime_type,
        sha256_hash=sha256_hash,
        document_category=document_category or "SUPPORTING_EVIDENCE",
        uploaded_by_id=current_user.id,
        is_verified=True
    )
    db.add(evidence)

    await record_audit_event(
        db,
        action="UPLOAD_EVIDENCE",
        resource_type="EVIDENCE",
        resource_id=evidence.id,
        user=current_user,
        change_details={
            "complaint_id": complaint.id,
            "file_name": file.filename,
            "size_bytes": file_size,
            "sha256": sha256_hash,
            "category": document_category
        }
    )

    await db.commit()
    return evidence

async def list_evidence_for_complaint(db: AsyncSession, complaint_id: str) -> List[ComplaintEvidence]:
    query = (
        select(ComplaintEvidence)
        .where(ComplaintEvidence.complaint_id == complaint_id)
        .order_by(desc(ComplaintEvidence.created_at))
    )
    return (await db.execute(query)).scalars().all()

