@echo off
REM Stock Verify Backend - Windows Setup Script

echo ========================================
echo Stock Verify Backend Setup (Windows)
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo [2/5] Installing dependencies...
pip install -r requirements.txt

echo [3/5] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo Created .env file - Please edit it with your SQL Server credentials!
) else (
    echo .env file already exists
)

echo [4/5] Installing SQL Server ODBC Driver...
echo.
echo If not installed, download from:
echo https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
echo.

echo [5/5] Setup complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Edit .env file with your SQL Server credentials
echo 2. Run: venv\Scripts\activate
echo 3. Run: python main.py
echo 4. Server will start at http://localhost:8001
echo.
echo For ngrok tunnel:
echo   ngrok http 8001
echo ========================================
pause
