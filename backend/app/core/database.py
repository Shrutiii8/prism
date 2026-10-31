import uuid
import re
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from backend.app.core.config import settings

def _get_async_url(url: str) -> str:
    if url.startswith("sqlite"):
        if not url.startswith("sqlite+aiosqlite"):
            return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return url
    
    res = url
    if res.startswith("postgresql://"):
        res = "postgresql+asyncpg://" + res[len("postgresql://"):]
    elif res.startswith("postgres://"):
        res = "postgresql+asyncpg://" + res[len("postgres://"):]
    
    # asyncpg requires ssl=require instead of sslmode=require and rejects channel_binding
    res = re.sub(r'sslmode=[^&]+', 'ssl=require', res)
    res = re.sub(r'&?channel_binding=[^&]+', '', res)
    if ("neon.tech" in res or "sslmode" in url) and "ssl=" not in res:
        res += ("&" if "?" in res else "?") + "ssl=require"
    return res

def _get_sync_url(url: str, sync_url_override: str = None) -> str:
    target = sync_url_override if sync_url_override and not sync_url_override.startswith("sqlite") else url
    if target.startswith("sqlite"):
        if target.startswith("sqlite+aiosqlite"):
            return target.replace("sqlite+aiosqlite://", "sqlite://", 1)
        return target
    
    res = target
    # In SQLAlchemy 2.0, psycopg2 is used via postgresql+psycopg2://
    if res.startswith("postgresql://"):
        res = "postgresql+psycopg2://" + res[len("postgresql://"):]
    elif res.startswith("postgres://"):
        res = "postgresql+psycopg2://" + res[len("postgres://"):]
    return res

async_db_url = _get_async_url(settings.DATABASE_URL)
sync_db_url = _get_sync_url(settings.DATABASE_URL, settings.SYNC_DATABASE_URL)
is_sqlite = async_db_url.startswith("sqlite")

async_engine = create_async_engine(
    async_db_url,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if is_sqlite else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

sync_engine = create_engine(
    sync_db_url,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if sync_db_url.startswith("sqlite") else {}
)
SyncSessionLocal = sessionmaker(bind=sync_engine, autocommit=False, autoflush=False)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

