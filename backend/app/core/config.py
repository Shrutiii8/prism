import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

_BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
_DB_FILE = _BASE_DIR / "prism.db"

class Settings(BaseSettings):
    APP_NAME: str = "PRISM - Integrated Institution Complaint Monitoring and Coordination Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "prism-super-secret-enterprise-key-2026-production-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{_DB_FILE.as_posix()}")
    SYNC_DATABASE_URL: str = os.getenv("SYNC_DATABASE_URL", f"sqlite:///{_DB_FILE.as_posix()}")
    
    # Redis / Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v
    
    # Evidence & Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./storage/uploads")
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "text/csv",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ]
    
    # AI Matching Thresholds
    AI_HIGH_SIMILARITY_THRESHOLD: float = 0.75
    AI_MEDIUM_SIMILARITY_THRESHOLD: float = 0.45
    
    # Matching Weights
    WEIGHT_INSTITUTION: float = 0.40
    WEIGHT_SEMANTIC: float = 0.35
    WEIGHT_CATEGORY: float = 0.15
    WEIGHT_CONTEXT: float = 0.10

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()

