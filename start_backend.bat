@echo off
title PRISM - Backend Server
cd /d "%~dp0"
echo ======================================================================
echo   PRISM Backend Server (FastAPI / Uvicorn)
echo ======================================================================
if exist "backend\.venv\Scripts\python.exe" (
    backend\.venv\Scripts\python.exe run_backend.py
) else (
    python run_backend.py
)
pause

