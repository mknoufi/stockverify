#!/bin/bash
# Auto-start script - Starts backend, ngrok, and updates app config automatically

set -e

echo "🚀 Stock Verify - Auto Startup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$SCRIPT_DIR"

# Check if ngrok is available
export PATH="/home/user/.bun/bin:$PATH"
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok not found. Installing...${NC}"
    cd "$PROJECT_ROOT"
    bun add -g ngrok 2>/dev/null || {
        echo -e "${RED}Failed to install ngrok. Please install manually.${NC}"
        exit 1
    }
    export PATH="/home/user/.bun/bin:$PATH"
fi

# Load environment variables if .env.production exists
load_env() {
    if [ -f "$1" ]; then
        # Use a more robust method that handles commas and spaces
        while IFS= read -r line || [ -n "$line" ]; do
            # Skip comments and empty lines
            [[ "$line" =~ ^[[:space:]]*# ]] && continue
            [[ -z "${line// }" ]] && continue
            
            # Split on first = only
            if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
                key="${BASH_REMATCH[1]}"
                value="${BASH_REMATCH[2]}"
                
                # Remove leading/trailing whitespace from key
                key="${key#"${key%%[![:space:]]*}"}"
                key="${key%"${key##*[![:space:]]}"}"
                
                # Remove leading/trailing whitespace from value
                value="${value#"${value%%[![:space:]]*}"}"
                value="${value%"${value##*[![:space:]]}"}"
                
                # Remove quotes if present (handles both single and double)
                if [[ "$value" =~ ^\".*\"$ ]] || [[ "$value" =~ ^\'.*\'$ ]]; then
                    value="${value:1:-1}"
                fi
                
                # Only export if key is valid (alphanumeric and underscore)
                if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
                    export "$key=$value"
                fi
            fi
        done < "$1"
    fi
}

if [ -f "$BACKEND_DIR/.env.production" ]; then
    echo -e "${GREEN}📋 Loading environment from .env.production${NC}"
    load_env "$BACKEND_DIR/.env.production"
else
    echo -e "${YELLOW}⚠️  .env.production not found. Creating it...${NC}"
    cd "$BACKEND_DIR"
    bash setup-env.sh
    load_env "$BACKEND_DIR/.env.production"
fi

# Create necessary directories
mkdir -p "$BACKEND_DIR/logs"
mkdir -p "$BACKEND_DIR/uploads"
mkdir -p "$BACKEND_DIR/reports"

# Kill existing processes on port 3000 and 4040
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"

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
    fi
}

kill_port 3000
kill_port 4040
sleep 1

# Start backend server in background
echo -e "${GREEN}🚀 Starting backend server on port ${PORT:-3000}...${NC}"
cd "$BACKEND_DIR"
bun run start > "$BACKEND_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:${PORT:-3000}/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Start ngrok
echo -e "${GREEN}📡 Starting ngrok tunnel...${NC}"

# Check if ngrok auth token is set
if [ -z "$NGROK_AUTH_TOKEN" ] || [ "$NGROK_AUTH_TOKEN" = "your_token_here" ] || [ "$NGROK_AUTH_TOKEN" = "" ]; then
    echo -e "${YELLOW}   ⚠️  NGROK_AUTH_TOKEN not set in .env.production${NC}"
    echo -e "${YELLOW}   Ngrok requires authentication to work${NC}"
    echo ""
    echo -e "${YELLOW}   📝 Quick setup:${NC}"
    echo -e "${YELLOW}      cd backend && bash setup-ngrok-auth.sh${NC}"
    echo ""
    echo -e "${YELLOW}   📖 Or see: backend/NGROK_SETUP.md${NC}"
    echo -e "${YELLOW}   🔗 Get token: https://dashboard.ngrok.com/get-started/your-authtoken${NC}"
    echo ""
    echo -e "${YELLOW}   ℹ️  Skipping ngrok for now (using localhost)${NC}"
    NGROK_PID=""
    NGROK_URL="http://localhost:3000"
    SKIP_NGROK=true
else
    SKIP_NGROK=false
    # Set ngrok auth token
    echo -e "${YELLOW}   Setting ngrok authentication...${NC}"
    ngrok config add-authtoken "$NGROK_AUTH_TOKEN" 2>/dev/null || {
        echo -e "${RED}   ❌ Failed to set ngrok auth token${NC}"
        echo -e "${YELLOW}   Skipping ngrok...${NC}"
        NGROK_PID=""
        NGROK_URL="http://localhost:3000"
    }
    
    if [ ! -z "$NGROK_PID" ] || [ "$NGROK_PID" != "" ]; then
        # Start ngrok in background
        ngrok http ${PORT:-3000} --log=stdout > "$BACKEND_DIR/logs/ngrok.log" 2>&1 &
        NGROK_PID=$!
        echo "Ngrok PID: $NGROK_PID"
    fi
fi

# Wait for ngrok to start (only if we started it)
if [ "$SKIP_NGROK" != "true" ] && [ ! -z "$NGROK_PID" ] && [ "$NGROK_PID" != "" ]; then
    echo -e "${YELLOW}⏳ Waiting for ngrok to start...${NC}"
    sleep 5
    
    # Check if ngrok process is still running
    if ! kill -0 "$NGROK_PID" 2>/dev/null; then
        echo -e "${RED}   ❌ Ngrok process died (check logs for authentication errors)${NC}"
        NGROK_PID=""
        NGROK_URL="http://localhost:3000"
    fi
else
    echo -e "${YELLOW}   ℹ️  Ngrok skipped (no auth token configured)${NC}"
fi

# Get ngrok URL with better retry logic and progress feedback
if [ "$SKIP_NGROK" = "true" ]; then
    # Ngrok was skipped, use localhost
    NGROK_URL="http://localhost:3000"
elif [ ! -z "$NGROK_PID" ] && [ "$NGROK_PID" != "" ]; then
    echo -e "${YELLOW}⏳ Getting ngrok URL...${NC}"
    
    # First check if ngrok API is accessible
    NGROK_READY=false
    for i in {1..10}; do
        if curl -s http://localhost:4040 > /dev/null 2>&1; then
            NGROK_READY=true
            break
        fi
        sleep 1
    done
    
    if [ "$NGROK_READY" = false ]; then
        echo -e "${YELLOW}   ⚠️  Ngrok API not accessible after 10 seconds${NC}"
        echo -e "${YELLOW}   Check logs: backend/logs/ngrok.log${NC}"
        NGROK_URL="http://localhost:3000"
    else
    # Try to get URL with progress updates
    for i in {1..20}; do
        # Try multiple methods to get ngrok URL
        if command -v curl &> /dev/null; then
            # Method 1: Direct API call with grep
            NGROK_URL=$(curl -s --max-time 2 http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
            
            # Method 2: Try JSON parsing if method 1 fails
            if [ -z "$NGROK_URL" ] && command -v python3 &> /dev/null; then
                NGROK_URL=$(curl -s --max-time 2 http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') and len(data.get('tunnels', [])) > 0 else '')" 2>/dev/null)
            fi
            
            # Method 3: Try jq if available
            if [ -z "$NGROK_URL" ] && command -v jq &> /dev/null; then
                NGROK_URL=$(curl -s --max-time 2 http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url // empty' 2>/dev/null)
            fi
        fi
        
        if [ ! -z "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ] && [ "$NGROK_URL" != "" ]; then
            break
        fi
        
        # Show progress every 5 attempts
        if [ $((i % 5)) -eq 0 ]; then
            echo -e "${YELLOW}   Still waiting... (attempt $i/20)${NC}"
        fi
        
            sleep 1
        done
    fi
else
    NGROK_URL="http://localhost:3000"
fi

if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" == "null" ]; then
    echo -e "${YELLOW}⚠️  Could not get ngrok URL automatically${NC}"
    echo -e "${YELLOW}   Check ngrok dashboard at http://localhost:4040${NC}"
    echo -e "${YELLOW}   Or run: bash $BACKEND_DIR/get-ngrok-url.sh${NC}"
    echo -e "${YELLOW}   Using localhost for now...${NC}"
    NGROK_URL="http://localhost:3000"
else
    echo -e "${GREEN}✅ Ngrok tunnel active: $NGROK_URL${NC}"
fi

# Update app.json with ngrok URL
APP_JSON="$PROJECT_ROOT/app.json"
if [ -f "$APP_JSON" ]; then
    echo -e "${GREEN}📝 Updating app.json with ngrok URL...${NC}"
    
    # Use node to update JSON (more reliable than sed)
    if command -v node &> /dev/null; then
        node -e "
        const fs = require('fs');
        try {
            const appJson = JSON.parse(fs.readFileSync('$APP_JSON', 'utf8'));
            if (!appJson.expo) appJson.expo = {};
            if (!appJson.expo.extra) appJson.expo.extra = {};
            appJson.expo.extra.apiUrl = '$NGROK_URL';
            fs.writeFileSync('$APP_JSON', JSON.stringify(appJson, null, 2));
            console.log('✅ app.json updated successfully');
        } catch (e) {
            console.error('⚠️  Could not update app.json:', e.message);
            process.exit(1);
        }
        " 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ app.json updated successfully${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not auto-update app.json${NC}"
            echo -e "${YELLOW}   Please manually update app.json:${NC}"
            echo -e "${YELLOW}   \"extra\": { \"apiUrl\": \"$NGROK_URL\" }${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Node.js not found, cannot auto-update app.json${NC}"
        echo -e "${YELLOW}   Please manually update app.json:${NC}"
        echo -e "${YELLOW}   \"extra\": { \"apiUrl\": \"$NGROK_URL\" }${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  app.json not found at $APP_JSON${NC}"
fi

# Save PIDs and URLs to file for easy access
echo "$BACKEND_PID" > "$BACKEND_DIR/.backend.pid"
if [ ! -z "$NGROK_PID" ] && [ "$NGROK_PID" != "" ]; then
    echo "$NGROK_PID" > "$BACKEND_DIR/.ngrok.pid"
else
    echo "" > "$BACKEND_DIR/.ngrok.pid"
fi
echo "$NGROK_URL" > "$BACKEND_DIR/.ngrok.url"

# Display summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ All services started!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📊 Services:"
echo "  • Backend:  http://localhost:${PORT:-3000}"
echo "  • Ngrok:    $NGROK_URL"
echo "  • Dashboard: http://localhost:4040"
echo ""
echo "📁 Logs:"
echo "  • Backend:  $BACKEND_DIR/logs/backend.log"
echo "  • Ngrok:    $BACKEND_DIR/logs/ngrok.log"
echo ""
echo "🛑 To stop all services:"
echo "  bash $BACKEND_DIR/auto-stop.sh"
echo ""
echo "🔄 To restart:"
echo "  bash $BACKEND_DIR/auto-start.sh"
echo ""

# Save summary to file
cat > "$BACKEND_DIR/.startup-summary.txt" << EOF
Backend PID: $BACKEND_PID
Ngrok PID: $NGROK_PID
Ngrok URL: $NGROK_URL
Backend URL: http://localhost:${PORT:-3000}
Ngrok Dashboard: http://localhost:4040
Started: $(date)
EOF

# Display final summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ All services started!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📊 Services:"
echo "  • Backend:  http://localhost:${PORT:-3000}"
if [ "$SKIP_NGROK" = "true" ]; then
    echo "  • Ngrok:    Not configured (see: backend/setup-ngrok-auth.sh)"
elif [ "$NGROK_URL" != "http://localhost:3000" ] && [ ! -z "$NGROK_URL" ]; then
    echo "  • Ngrok:    $NGROK_URL"
else
    echo "  • Ngrok:    Starting... (check http://localhost:4040)"
fi
echo "  • Dashboard: http://localhost:4040"
echo ""
echo "📁 Logs:"
echo "  • Backend:  $BACKEND_DIR/logs/backend.log"
echo "  • Ngrok:    $BACKEND_DIR/logs/ngrok.log"
echo ""
echo "🛑 To stop all services:"
echo "  bash $BACKEND_DIR/auto-stop.sh"
echo ""
echo "💡 Tip: Run in background with:"
echo "  RUN_IN_BACKGROUND=true bash start-all.sh"
echo ""

# Option to run in background or foreground
if [ "${RUN_IN_BACKGROUND:-false}" = "true" ]; then
    echo -e "${GREEN}✅ Services started in background${NC}"
    echo -e "${YELLOW}   Use 'bash backend/auto-stop.sh' to stop${NC}"
    exit 0
else
    echo -e "${YELLOW}Services are running. Press Ctrl+C to stop...${NC}"
    echo -e "${YELLOW}(Or close this terminal - services will continue running)${NC}"
    
    # Trap Ctrl+C to cleanup
    trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $NGROK_PID 2>/dev/null; rm -f $BACKEND_DIR/.backend.pid $BACKEND_DIR/.ngrok.pid $BACKEND_DIR/.ngrok.url; exit" INT TERM
    
    # Wait for processes (non-blocking, allows Ctrl+C)
    wait $BACKEND_PID $NGROK_PID 2>/dev/null || true
fi
