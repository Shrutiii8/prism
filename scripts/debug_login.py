import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
import traceback
from backend.app.core.database import AsyncSessionLocal
from backend.app.schemas.auth import LoginRequest
from backend.app.api.v1.auth import login
from fastapi import Response, Request

class MockClient:
    host = "127.0.0.1"

class MockReq:
    client = MockClient()

async def main():
    print("Testing DB connection and login...")
    try:
        async with AsyncSessionLocal() as db:
            req_data = LoginRequest(email="admin@prism.gov.in", password="Prism@2026!")
            res = Response()
            r = await login(req_data, res, MockReq(), db)
            print("LOGIN SUCCESSFUL!")
            print("Token:", r.access_token[:20], "...")
            print("User:", r.user)
    except Exception as e:
        print("LOGIN EXCEPTION:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
