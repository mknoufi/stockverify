# Ngrok Setup Guide

## Issue Detected

Ngrok requires authentication to work. The logs show:
```
authentication failed: Usage of ngrok requires a verified account and authtoken.
```

## 🚀 Quick Setup (Easiest Method)

### Automated Setup Script:

```bash
cd backend
bash setup-ngrok-auth.sh
```

This interactive script will:
1. Guide you through getting your token
2. Ask for your token
3. Save it to `.env.production`
4. Configure ngrok automatically

## 📝 Manual Setup

### Step 1: Get Your Ngrok Auth Token

1. **Sign up for a free account:**
   - Visit: https://dashboard.ngrok.com/signup
   - Create a free account (takes 1 minute)

2. **Get your authtoken:**
   - Visit: https://dashboard.ngrok.com/get-started/your-authtoken
   - Copy your token (looks like: `2abc123def456ghi789jkl012mno345pq_6R7S8T9U0V1W2X3Y4Z5`)

### Step 2: Add Token to Configuration

**Option A: Edit manually**
Edit `backend/.env.production` and add/update:

```bash
NGROK_AUTH_TOKEN=your_token_here
```

**Option B: Use setup script**
```bash
cd backend
bash setup-ngrok-auth.sh
```

### Step 3: Configure Ngrok

```bash
export PATH="/home/user/.bun/bin:$PATH"
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Step 4: Restart Services

```bash
bash backend/auto-stop.sh
bash start-all.sh
```

## Alternative: Use Without Ngrok

If you don't want to use ngrok, the system works fine with localhost:

- Backend: `http://localhost:3000`
- App will use: `http://localhost:3000` (configured in `app.json`)

This works for:
- Local development
- LAN-only deployment
- Testing on same machine

## Verify Ngrok is Working

After adding the token and restarting:

```bash
# Check ngrok dashboard
curl http://localhost:4040/api/tunnels

# Or visit in browser
http://localhost:4040
```

You should see your ngrok public URL.

## Notes

- Free ngrok accounts have session limits
- For production, consider ngrok paid plans
- For LAN-only deployment, ngrok is not needed
