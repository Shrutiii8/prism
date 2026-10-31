from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.core.security import verify_password, hash_password, create_access_token, create_refresh_token, decode_token
from backend.app.models.user import User, Role
from backend.app.schemas.auth import LoginRequest, TokenResponse, RefreshTokenRequest, ChangePasswordRequest, UserProfileOut
from backend.app.core.dependencies import get_current_user
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(User)
        .options(
            selectinload(User.role).selectinload(Role.permissions),
            selectinload(User.bureau),
            selectinload(User.regional_office)
        )
        .where(User.email == login_data.email.strip().lower())
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.hashed_password):
        # Record failed login attempt
        await record_audit_event(
            db,
            action="AUTH_LOGIN_FAILED",
            resource_type="USER",
            user_email=login_data.email,
            ip_address=request.client.host if request.client else None,
            change_details={"reason": "Invalid credentials"}
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been deactivated."
        )

    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.name if user.role else None,
        "bureau_id": user.bureau_id
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Set httpOnly cookie for web security
    response.set_cookie(
        key="prism_access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False # set True in HTTPS production
    )

    # Record successful login
    await record_audit_event(
        db,
        action="AUTH_LOGIN_SUCCESS",
        resource_type="USER",
        resource_id=user.id,
        user=user,
        ip_address=request.client.host if request.client else None
    )
    await db.commit()

    permissions = [p.code for p in user.role.permissions] if (user.role and user.role.permissions) else []
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=7200,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.name if user.role else "",
            "role_display": user.role.display_name if user.role else "",
            "bureau": user.bureau.name if user.bureau else None,
            "bureau_code": user.bureau.code if user.bureau else None,
            "regional_office": user.regional_office.name if user.regional_office else None,
            "permissions": permissions
        }
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(
    req: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user_id = payload.get("sub")
    query = (
        select(User)
        .options(
            selectinload(User.role).selectinload(Role.permissions),
            selectinload(User.bureau),
            selectinload(User.regional_office)
        )
        .where(User.id == user_id)
    )
    user = (await db.execute(query)).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not active.")

    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.name if user.role else None,
        "bureau_id": user.bureau_id
    }
    new_access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    permissions = [p.code for p in user.role.permissions] if (user.role and user.role.permissions) else []
    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        expires_in=7200,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.name if user.role else "",
            "role_display": user.role.display_name if user.role else "",
            "bureau": user.bureau.name if user.bureau else None,
            "bureau_code": user.bureau.code if user.bureau else None,
            "regional_office": user.regional_office.name if user.regional_office else None,
            "permissions": permissions
        }
    )

@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    response.delete_cookie("prism_access_token")
    await record_audit_event(
        db,
        action="AUTH_LOGOUT",
        resource_type="USER",
        resource_id=current_user.id,
        user=current_user
    )
    await db.commit()
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserProfileOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    permissions = [p.code for p in current_user.role.permissions] if (current_user.role and current_user.role.permissions) else []
    return UserProfileOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role.name if current_user.role else "",
        role_display=current_user.role.display_name if current_user.role else "",
        bureau=current_user.bureau.name if current_user.bureau else None,
        bureau_code=current_user.bureau.code if current_user.bureau else None,
        regional_office=current_user.regional_office.name if current_user.regional_office else None,
        permissions=permissions,
        is_active=current_user.is_active
    )

@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(req.old_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 8 characters")
        
    current_user.hashed_password = hash_password(req.new_password)
    await record_audit_event(
        db,
        action="AUTH_PASSWORD_CHANGE",
        resource_type="USER",
        resource_id=current_user.id,
        user=current_user
    )
    await db.commit()
    return {"message": "Password updated successfully"}

