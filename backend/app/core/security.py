import os
import hmac
import hashlib
import json
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from backend.app.core.config import settings
try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError
    _ph = PasswordHasher()
    def hash_password(password: str) -> str:
        """Hashes a password securely using Argon2id."""
        return _ph.hash(password)

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifies a plain password against the stored Argon2 hash or pbkdf2."""
        try:
            return _ph.verify(hashed_password, plain_password)
        except Exception:
            if hashed_password.startswith("pbkdf2$"):
                parts = hashed_password.split("$")
                if len(parts) == 3:
                    _, salt, dk = parts
                    test_dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode(), salt.encode(), 100000).hex()
                    return hmac.compare_digest(dk, test_dk)
            return False
except ImportError:
    def hash_password(password: str) -> str:
        """Fallback PBKDF2 hash if argon2-cffi is not yet loaded."""
        salt = os.urandom(16).hex()
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
        return f"pbkdf2${salt}${dk}"

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        if hashed_password.startswith("pbkdf2$"):
            parts = hashed_password.split("$")
            if len(parts) == 3:
                _, salt, dk = parts
                test_dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode(), salt.encode(), 100000).hex()
                return hmac.compare_digest(dk, test_dk)
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT refresh token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": now, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def compute_hmac_sha256(data: str) -> str:
    """Computes HMAC-SHA-256 digest for message integrity."""
    return hmac.new(settings.SECRET_KEY.encode('utf-8'), data.encode('utf-8'), hashlib.sha256).hexdigest()

def compute_sha256_file(file_bytes: bytes) -> str:
    """Computes SHA-256 checksum of uploaded file content."""
    return hashlib.sha256(file_bytes).hexdigest()

