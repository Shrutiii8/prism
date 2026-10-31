import sys
import os
from pathlib import Path

# Automatically add project root and backend directory to Python sys.path
root_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "backend"))

# Auto-delegate to venv python if available and not already in venv
venv_python = root_dir / "backend" / ".venv" / "Scripts" / "python.exe"
if venv_python.exists() and Path(sys.executable).resolve() != venv_python.resolve():
    import subprocess
    sys.exit(subprocess.call([str(venv_python)] + sys.argv))

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
        reload_dirs=[str(root_dir / "backend" / "app")]
    )
