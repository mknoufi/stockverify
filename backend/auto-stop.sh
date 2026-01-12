#!/bin/bash
# Auto-stop script - Stops all backend and ngrok processes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛑 Stopping Stock Verify services..."

# Kill processes by PID files if they exist
if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
    BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo "  • Stopping backend (PID: $BACKEND_PID)"
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    rm -f "$SCRIPT_DIR/.backend.pid"
fi

if [ -f "$SCRIPT_DIR/.ngrok.pid" ]; then
    NGROK_PID=$(cat "$SCRIPT_DIR/.ngrok.pid")
    if kill -0 "$NGROK_PID" 2>/dev/null; then
        echo "  • Stopping ngrok (PID: $NGROK_PID)"
        kill "$NGROK_PID" 2>/dev/null || true
    fi
    rm -f "$SCRIPT_DIR/.ngrok.pid"
fi

# Also kill by port (in case PID files are missing)
echo "  • Cleaning up processes on ports 3000 and 4040..."

# Function to kill process on port (works with lsof, netstat, or ss)
kill_port() {
    local port=$1
    # Try lsof first
    if command -v lsof &> /dev/null; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    # Try netstat (Linux)
    elif command -v netstat &> /dev/null; then
        local pid=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | head -1)
        [ ! -z "$pid" ] && kill -9 "$pid" 2>/dev/null || true
    # Try ss (modern Linux)
    elif command -v ss &> /dev/null; then
        local pid=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -o 'pid=[0-9]*' | cut -d'=' -f2 | head -1)
        [ ! -z "$pid" ] && kill -9 "$pid" 2>/dev/null || true
    # Try fuser (alternative)
    elif command -v fuser &> /dev/null; then
        fuser -k $port/tcp 2>/dev/null || true
    fi
}

kill_port 3000
kill_port 4040

sleep 1

echo "✅ All services stopped"
