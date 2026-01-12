# 🌍 Accessing Your App Over the Internet with Ngrok

## Overview

To access your Stock Verification app from anywhere on the internet, you need to set up ngrok. Ngrok creates a secure tunnel from the internet to your local server.

## Current Status

Your app is currently accessible only locally at:
- `http://localhost:3000`

With ngrok, it will be accessible at:
- `https://xxxx-xxx-xxx-xxx.ngrok-free.app` (from anywhere!)

## 🚀 Setup Steps (Takes 2 minutes)

### Step 1: Get Your Free Ngrok Account

1. **Sign up** (free, no credit card): https://dashboard.ngrok.com/signup
2. **Verify email** (check your inbox)
3. **Get authtoken**: https://dashboard.ngrok.com/get-started/your-authtoken
4. **Copy the token** (looks like: `2abc123def456ghi789jkl...`)

### Step 2: Configure Ngrok

**Option A: Interactive Setup (Easiest)**
```bash
cd backend
bash setup-ngrok-auth.sh
```

The script will:
- Ask for your token
- Save it securely
- Configure ngrok automatically

**Option B: Manual Setup**
```bash
# Edit .env.production
nano backend/.env.production

# Add this line (replace with your actual token):
NGROK_AUTH_TOKEN=your_actual_token_here

# Save and exit (Ctrl+X, then Y, then Enter)
```

### Step 3: Restart Services

```bash
# Stop current services
bash backend/auto-stop.sh

# Start with ngrok enabled
bash start-all.sh
```

### Step 4: Get Your Public URL

After starting, you'll see:
```
📊 Services:
  • Backend:  http://localhost:3000
  • Ngrok:    https://abcd-1234-5678-90ab.ngrok-free.app
  • Dashboard: http://localhost:4040
```

The ngrok URL is your **public internet address**! 🎉

## 📱 Updating Your Mobile App

Once ngrok is running, update your app configuration:

**Edit `app.json`:**
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-ngrok-url.ngrok-free.app"
    }
  }
}
```

Or the auto-start script will update it automatically!

## 🔍 Verify It's Working

### Check Ngrok Dashboard
```bash
# Visit in browser:
http://localhost:4040
```

You'll see:
- Your public URL
- Request history
- Traffic details

### Test from Another Device

From any device with internet:
```bash
curl https://your-ngrok-url.ngrok-free.app/health
```

Should return:
```json
{"status":"ok","message":"Stock Verify Backend API"}
```

## 🌐 How to Access

### From Your Phone/Tablet

1. Make sure your app is configured with the ngrok URL (see above)
2. Connect to **any network** (WiFi, mobile data, anywhere!)
3. Open the app - it will connect via ngrok

### Share with Team

Give your team the ngrok URL:
```
https://your-ngrok-url.ngrok-free.app
```

They can access from:
- Their phones
- Their computers
- Anywhere in the world!

## ⚙️ Important Notes

### Free Plan Limitations

- ✅ Perfect for development and testing
- ✅ Unlimited requests
- ⚠️  URL changes when you restart ngrok
- ⚠️  Sessions expire after ~2 hours (just restart)

### Keeping URL Permanent

For a permanent URL, upgrade to ngrok paid plan:
- Static domain: `your-app.ngrok.app`
- No session limits
- More simultaneous tunnels

## 🔒 Security

### Ngrok is Secure

- ✅ HTTPS encryption automatically
- ✅ Ngrok dashboard shows all requests
- ✅ Can add authentication
- ✅ IP restrictions available (paid plans)

### Best Practices

1. **Don't commit tokens** - `.env.production` is in `.gitignore`
2. **Monitor requests** - Check dashboard at `http://localhost:4040`
3. **Use authentication** - Add login to your app (already implemented!)

## 🛠️ Troubleshooting

### "Authentication failed"
```bash
cd backend
bash setup-ngrok-auth.sh
# Enter your token again
```

### URL not updating in app.json
```bash
# Manually update:
nano app.json
# Change apiUrl to your ngrok URL
```

### Can't access from phone
1. Check ngrok is running: `curl http://localhost:4040`
2. Check URL is correct in `app.json`
3. Rebuild your app: `npx expo start -c`

### Tunnel closed unexpectedly
```bash
# Restart services:
bash backend/auto-stop.sh
bash start-all.sh
```

## 📊 Quick Status Check

```bash
# Check if everything is configured
grep NGROK_AUTH_TOKEN backend/.env.production

# Check if ngrok is running
curl http://localhost:4040/api/tunnels

# Check public access
curl https://your-ngrok-url.ngrok-free.app/health
```

## 🎯 Quick Reference

### Setup
```bash
cd backend && bash setup-ngrok-auth.sh
```

### Start
```bash
bash start-all.sh
```

### Stop
```bash
bash backend/auto-stop.sh
```

### Check URL
```bash
curl http://localhost:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"
```

### View Dashboard
```
http://localhost:4040
```

## 🚀 You're All Set!

Once configured:
1. Services auto-start with ngrok
2. Public URL generated automatically
3. `app.json` updated automatically
4. Access from anywhere! 🌍

Need help? Check:
- `SETUP_NGROK.md` - Detailed guide
- `QUICK_NGROK_SETUP.md` - Quick reference
- `backend/NGROK_SETUP.md` - Technical details
