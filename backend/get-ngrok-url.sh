#!/bin/bash
# Get ngrok public URL with multiple fallback methods

export PATH="/home/user/.bun/bin:$PATH"

# Wait a bit for ngrok to be ready
sleep 2

NGROK_URL=""

# Method 1: Direct grep (fastest)
if command -v curl &> /dev/null; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
    
    # Method 2: Python JSON parsing (more reliable)
    if [ -z "$NGROK_URL" ] && command -v python3 &> /dev/null; then
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') and len(data['tunnels']) > 0 else '')" 2>/dev/null)
    fi
    
    # Method 3: jq (if available)
    if [ -z "$NGROK_URL" ] && command -v jq &> /dev/null; then
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url // empty' 2>/dev/null)
    fi
    
    # Method 4: Node.js (if available)
    if [ -z "$NGROK_URL" ] && command -v node &> /dev/null; then
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(data.tunnels?.[0]?.public_url || '')" 2>/dev/null)
    fi
fi

if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" == "null" ]; then
  echo "⚠️  Ngrok is not running or URL not available yet."
  echo "   Check ngrok dashboard at http://localhost:4040"
  echo ""
  echo "   To start ngrok manually:"
  echo "   export PATH=\"/home/user/.bun/bin:\$PATH\""
  echo "   ngrok http 3000"
  exit 1
else
  echo "✅ Ngrok URL: $NGROK_URL"
  echo ""
  echo "📝 Update app.json with:"
  echo "   \"extra\": {"
  echo "     \"apiUrl\": \"$NGROK_URL\""
  echo "   }"
  exit 0
fi
