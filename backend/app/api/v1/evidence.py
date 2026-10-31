import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.evidence import ComplaintEvidence
from backend.app.services.evidence_service import upload_evidence_file, list_evidence_for_complaint
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/evidence", tags=["Evidence & Documents"])

@router.post("/upload", response_model=dict)
async def upload_document(
    complaint_id: str = Form(...),
    document_category: str = Form("SUPPORTING_EVIDENCE"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ev = await upload_evidence_file(db, complaint_id, file, document_category, current_user)
    return {
        "id": ev.id,
        "original_file_name": ev.original_file_name,
        "file_size_bytes": ev.file_size_bytes,
        "sha256_hash": ev.sha256_hash,
        "document_category": ev.document_category,
        "created_at": ev.created_at
    }

@router.get("/complaint/{complaint_id}", response_model=List[dict])
async def get_complaint_evidence(
    complaint_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    evidence_list = await list_evidence_for_complaint(db, complaint_id)
    return [
        {
            "id": e.id,
            "original_file_name": e.original_file_name,
            "file_size_bytes": e.file_size_bytes,
            "mime_type": e.mime_type,
            "sha256_hash": e.sha256_hash,
            "document_category": e.document_category,
            "created_at": e.created_at
        }
        for e in evidence_list
    ]

@router.get("/download/{evidence_id}")
async def download_evidence_file(
    evidence_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ev = await db.get(ComplaintEvidence, evidence_id)
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    if not os.path.exists(ev.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file not found on server")

    await record_audit_event(
        db,
        action="DOWNLOAD_EVIDENCE",
        resource_type="EVIDENCE",
        resource_id=ev.id,
        user=current_user,
        change_details={"file_name": ev.original_file_name, "sha256": ev.sha256_hash}
    )
    await db.commit()

    return FileResponse(
        path=ev.file_path,
        media_type=ev.mime_type,
        filename=ev.original_file_name
    )

