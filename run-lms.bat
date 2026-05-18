@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  LMS - Frontend & Backend Runner
echo ========================================
echo.

cd /d "%~dp0"

REM Check if node_modules exists in backend
if not exist "lms-be\node_modules" (
    echo Installing backend dependencies...
    cd lms-be
    call npm install
    cd ..
    echo.
)

REM Check if node_modules exists in frontend
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

echo Starting services...
echo.
echo [1] Starting Backend (http://localhost:3000)...
start cmd /k "cd lms-be && npm.cmd run dev"

timeout /t 3

echo [2] Starting Frontend (http://localhost:5173)...
start cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ========================================
echo Backend & Frontend sudah berjalan!
echo.
echo Backend  : http://localhost:3000
echo Frontend : http://localhost:5173
echo API      : http://localhost:3000/api
echo.
echo Database: PostgreSQL (localhost:5432)
echo.
echo Credentials for testing:
echo   Mahasiswa:
echo     - NIM: 2026001
echo     - Password: password123
echo.
echo   Dosen:
echo     - NIP: D001
echo     - Password: password123
echo ========================================
pause
