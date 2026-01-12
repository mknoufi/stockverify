#!/bin/bash
# Quick setup script - automatically configures ngrok with a free account

echo "🚀 Quick Ngrok Setup"
echo "===================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")"

echo "This script will help you set up ngrok in 2 minutes!"
echo ""
echo -e "${YELLOW}Step 1: Get your free ngrok account${NC}"
echo "Visit: https://dashboard.ngrok.com/signup"
echo ""
echo "Quick steps:"
echo "  1. Click 'Sign up' (use Google/GitHub for instant signup)"
echo "  2. Verify your email"
echo "  3. You'll see your authtoken on the dashboard"
echo ""

read -p "Press Enter when you have your authtoken ready..."
echo ""

echo -e "${YELLOW}Step 2: Enter your authtoken${NC}"
echo "Get it from: https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""

read -p "Paste your authtoken here: " authtoken

if [ -z "$authtoken" ]; then
    echo -e "${RED}❌ No token provided${NC}"
    exit 1
fi

# Validate token format (basic check)
if [ ${#authtoken} -lt 20 ]; then
    echo -e "${RED}❌ Token seems too short. Make sure you copied the full token.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Token received!${NC}"
echo ""
echo -e "${YELLOW}Step 3: Saving configuration...${NC}"

# Update .env.production
if grep -q "^NGROK_AUTH_TOKEN=" .env.production 2>/dev/null; then
    # Update existing
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^NGROK_AUTH_TOKEN=.*|NGROK_AUTH_TOKEN=$authtoken|" .env.production
    else
        sed -i "s|^NGROK_AUTH_TOKEN=.*|NGROK_AUTH_TOKEN=$authtoken|" .env.production
    fi
else
    # Add new
    echo "" >> .env.production
    echo "# Ngrok Authentication" >> .env.production
    echo "NGROK_AUTH_TOKEN=$authtoken" >> .env.production
fi

echo -e "${GREEN}✅ Saved to .env.production${NC}"
echo ""
echo -e "${YELLOW}Step 4: Configuring ngrok...${NC}"

# Configure ngrok
export PATH="/home/user/.bun/bin:$PATH"
ngrok config add-authtoken "$authtoken" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Ngrok configured successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Ngrok command had issues, but config is saved${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo ""
echo "🚀 Starting services now..."
echo ""

# Stop existing services
cd ..
bash backend/auto-stop.sh 2>/dev/null

# Start with ngrok
bash start-all.sh

echo ""
echo -e "${GREEN}✅ All done!${NC}"
echo ""
echo "Your app is now accessible over the internet!"
echo "Check the output above for your public ngrok URL."
