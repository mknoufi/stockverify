#!/bin/bash
# Stock Verify Backend - Linux/Mac Setup Script

echo "========================================"
echo "Stock Verify Backend Setup (Linux/Mac)"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed!"
    echo "Please install Python 3.9+ first"
    exit 1
fi

echo "[1/5] Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "[2/5] Installing dependencies..."
pip install -r requirements.txt

echo "[3/5] Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - Please edit it with your SQL Server credentials!"
else
    echo ".env file already exists"
fi

echo "[4/5] Installing system dependencies..."
echo ""
echo "For SQL Server connection, you may need:"
echo "  Ubuntu/Debian: sudo apt install unixodbc-dev"
echo "  Mac: brew install unixodbc freetds"
echo ""

echo "[5/5] Setup complete!"
echo ""
echo "========================================"
echo "NEXT STEPS:"
echo "========================================"
echo "1. Edit .env file with your SQL Server credentials"
echo "2. Run: source venv/bin/activate"
echo "3. Run: python main.py"
echo "4. Server will start at http://localhost:8001"
echo ""
echo "For ngrok tunnel:"
echo "  ngrok http 8001"
echo "========================================"
