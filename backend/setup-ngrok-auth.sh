#!/bin/bash
# Interactive script to set up ngrok authentication

echo "🔐 Ngrok Authentication Setup"
echo "=============================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found. Creating it first..."
    bash setup-env.sh
fi

# Check if token already exists
if grep -q "^NGROK_AUTH_TOKEN=" .env.production 2>/dev/null; then
    CURRENT_TOKEN=$(grep "^NGROK_AUTH_TOKEN=" .env.production | cut -d'=' -f2)
    if [ ! -z "$CURRENT_TOKEN" ] && [ "$CURRENT_TOKEN" != "your_token_here" ]; then
        echo "✅ Ngrok token already configured in .env.production"
        echo ""
        read -p "Do you want to update it? (y/n): " update
        if [ "$update" != "y" ] && [ "$update" != "Y" ]; then
            echo "Keeping existing token."
            exit 0
        fi
    fi
fi

echo "📝 To get your ngrok authtoken:"
echo ""
echo "1. Sign up for a free account:"
echo "   https://dashboard.ngrok.com/signup"
echo ""
echo "2. Get your authtoken:"
echo "   https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
echo "3. Copy your token (it looks like: 2abc123def456ghi789jkl...)"
echo ""

read -p "Enter your ngrok authtoken: " authtoken

if [ -z "$authtoken" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

# Update .env.production
if grep -q "^NGROK_AUTH_TOKEN=" .env.production 2>/dev/null; then
    # Update existing token
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^NGROK_AUTH_TOKEN=.*|NGROK_AUTH_TOKEN=$authtoken|" .env.production
    else
        # Linux
        sed -i "s|^NGROK_AUTH_TOKEN=.*|NGROK_AUTH_TOKEN=$authtoken|" .env.production
    fi
else
    # Add new token
    echo "" >> .env.production
    echo "# Ngrok Authentication Token" >> .env.production
    echo "NGROK_AUTH_TOKEN=$authtoken" >> .env.production
fi

echo ""
echo "✅ Ngrok authtoken saved to .env.production"
echo ""
echo "🔧 Configuring ngrok..."
export PATH="/home/user/.bun/bin:$PATH"
ngrok config add-authtoken "$authtoken" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Ngrok authentication configured successfully!"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Restart services: bash ../start-all.sh"
    echo "   2. Or stop and restart:"
    echo "      bash auto-stop.sh"
    echo "      bash ../start-all.sh"
else
    echo ""
    echo "⚠️  Could not configure ngrok automatically"
    echo "   You can configure it manually:"
    echo "   export PATH=\"/home/user/.bun/bin:\$PATH\""
    echo "   ngrok config add-authtoken $authtoken"
fi
