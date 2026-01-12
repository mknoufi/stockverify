# 🔐 How to Set Up Ngrok Authentication

## Why Ngrok Needs Authentication?

Ngrok requires a free account and authtoken to create tunnels. This is a security measure by ngrok.

## ✅ Easiest Method: Automated Setup

```bash
cd backend
bash setup-ngrok-auth.sh
```

The script will:
- ✅ Guide you step-by-step
- ✅ Ask for your token
- ✅ Save it automatically
- ✅ Configure ngrok for you

## 📝 Manual Method

### Step 1: Get Your Token

1. **Sign up** (free): https://dashboard.ngrok.com/signup
2. **Get token**: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Copy** your token

### Step 2: Add to Configuration

Edit `backend/.env.production`:

```bash
NGROK_AUTH_TOKEN=your_actual_token_here
```

### Step 3: Configure Ngrok

```bash
export PATH="/home/user/.bun/bin:$PATH"
ngrok config add-authtoken your_actual_token_here
```

### Step 4: Restart

```bash
bash backend/auto-stop.sh
bash start-all.sh
```

## ✅ Verify It's Working

After setup, check:

```bash
# Check ngrok dashboard
curl http://localhost:4040/api/tunnels

# Or visit in browser
http://localhost:4040
```

You should see your public ngrok URL.

## 🔍 Check Current Status

```bash
# Check if token is set
grep NGROK_AUTH_TOKEN backend/.env.production

# Test ngrok
export PATH="/home/user/.bun/bin:$PATH"
ngrok http 3000
```

## ⚠️ Troubleshooting

### "authentication failed" error
- Make sure token is correct
- Run: `ngrok config add-authtoken YOUR_TOKEN` again
- Check token in `.env.production`

### Token not working
- Get a fresh token from dashboard
- Make sure no extra spaces in `.env.production`
- Restart services after updating

### Don't want to use ngrok?
- System works fine with `http://localhost:3000`
- Perfect for local development
- No setup needed

## 💡 Tips

- **Free account** is sufficient for development
- **Token is saved** in `.env.production` (don't commit this file!)
- **One token** works for all your ngrok tunnels
- **Token never expires** (unless you regenerate it)

## 🎯 Quick Reference

```bash
# Setup (interactive)
cd backend && bash setup-ngrok-auth.sh

# Check status
grep NGROK_AUTH_TOKEN backend/.env.production

# Restart with ngrok
bash backend/auto-stop.sh && bash start-all.sh
```

That's it! 🚀
