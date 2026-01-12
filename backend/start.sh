#!/bin/bash
# Start backend server and ngrok tunnel

echo "🚀 Starting Stock Verify Backend Server..."

# Start backend server in background
cd "$(dirname "$0")"
node server.js &
BACKEND_PID=$!

# Wait for server to start
sleep 2

# Start ngrok tunnel
echo "📡 Starting ngrok tunnel..."
export PATH="/home/user/.bun/bin:$PATH"
ngrok http 3000 --log=stdout &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
  echo "⚠️  Could not get ngrok URL. Check ngrok dashboard at http://localhost:4040"
else
  echo "✅ Backend running on http://localhost:3000"
  echo "✅ Ngrok tunnel: $NGROK_URL"
  echo ""
  echo "📝 Add this to your .env file:"
  echo "API_URL=$NGROK_URL"
fi

# Keep script running
wait $BACKEND_PID $NGROK_PID
