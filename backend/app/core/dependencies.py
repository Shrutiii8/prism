from typing import List, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.core.security import decode_token
from backend.app.models.user import User, Role, Permission

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        # Check Cookie fallback if provided
        token = request.cookies.get("prism_access_token")
    
    if not token:
        raise credentials_exception
    
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception
        
    query = (
        select(User)
        .options(
            selectinload(User.role).selectinload(Role.permissions),
            selectinload(User.bureau),
            selectinload(User.regional_office)
        )
        .where(User.id == user_id)
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact the system administrator."
        )
        
    return user

def require_roles(allowed_roles: List[str]):
    """Enforces that the authenticated user possesses one of the specified roles."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: No role assigned."
            )
        user_role = current_user.role.name.upper()
        # SUPER_ADMIN always has full access
        if user_role == "SUPER_ADMIN":
            return current_user
            
        allowed_normalized = [r.upper() for r in allowed_roles]
        if user_role not in allowed_normalized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{current_user.role.display_name}' does not have permission."
            )
        return current_user
    return role_checker

def require_permissions(required_permission_codes: List[str]):
    """Enforces fine-grained permission-based access control."""
    async def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role and current_user.role.name.upper() == "SUPER_ADMIN":
            return current_user
            
        user_permission_codes = {p.code for p in current_user.role.permissions} if current_user.role else set()
        for code in required_permission_codes:
            if code not in user_permission_codes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied: Missing required permission '{code}'."
                )
        return current_user
    return permission_checker

