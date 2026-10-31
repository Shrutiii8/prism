import sys
import os
from pathlib import Path

# Automatically add project root and backend directory to Python sys.path
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import uvicorn
    print("=" * 70)
    print("  PRISM: Integrated Institution Complaint Monitoring & Coordination")
    print("  Launching FastAPI Gateway at http://127.0.0.1:8000")
    print("  Interactive OpenAPI Documentation: http://127.0.0.1:8000/docs")
    print("  ReDoc Documentation: http://127.0.0.1:8000/redoc")
    print("=" * 70)
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir / "app")]
    )

