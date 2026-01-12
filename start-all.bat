@echo off
REM Windows batch file to start all services automatically

echo 🚀 Stock Verify - Auto Startup (Windows)
echo ========================================
echo.

cd /d "%~dp0"

REM Start backend and ngrok
call backend\auto-start.bat

pause
