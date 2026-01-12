# ✅ Complete Setup Guide - Port 8080

## Current Configuration

Your app is now configured to use **port 8080** instead of the commonly used port 3000.

### Services:
- **Backend:** `http://localhost:8080`
- **Ngrok:** Ready to tunnel port 8080
- **Mobile App:** Configured to use port 8080

## 🚀 One-Command Setup

To enable internet access with ngrok:

```bash
cd backend
bash quick-setup.sh
```

This script will:
1. Guide you to get a free ngrok account (30 seconds)
2. Ask for your token
3. Configure everything automatically
4. Start services with internet access

## 📱 What Changed

### Port Configuration:
```
Old: Port 3000 (commonly used, might conflict)
New: Port 8080 (alternative port, less conflicts)
```

### Files Updated:
- ✅ `backend/.env.production` → PORT=8080
- ✅ `app.json` → apiUrl: http://localhost:8080
- ✅ All scripts updated to use port 8080

## 🌍 Internet Access Options

### Option 1: Quick Setup (Recommended)
```bash
cd backend
bash quick-setup.sh
```
Fully automated - just paste your token!

### Option 2: Manual Setup
```bash
cd backend
bash setup-ngrok-auth.sh
```
Interactive with more control

### Option 3: I'll Configure It Later
System works fine locally on port 8080
```bash
bash start-all.sh
# Access at: http://localhost:8080
```

## ✅ Verify Everything Works

### Test Backend:
```bash
curl http://localhost:8080/health
```

Should return:
```json
{"status":"ok","message":"Stock Verify Backend API"}
```

### Test API:
```bash
curl http://localhost:8080/api/items
```

Should return list of items.

## 🔧 Starting/Stopping Services

### Start Everything:
```bash
bash start-all.sh
```

### Stop Everything:
```bash
bash backend/auto-stop.sh
```

### Start in Background:
```bash
bash start-background.sh
```

## 🌐 After Ngrok Setup

Once you run `quick-setup.sh`, you'll get:

```
📊 Services:
  • Backend:  http://localhost:8080
  • Ngrok:    https://xxxx-xxxx-xxx.ngrok-free.app
  • Dashboard: http://localhost:4040
```

### Access from Anywhere:
- **Local:** `http://localhost:8080`
- **Internet:** `https://xxxx.ngrok-free.app`
- **Dashboard:** `http://localhost:4040`

## 📱 Mobile App Configuration

Your app is already configured!

`app.json` contains:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:8080"
    }
  }
}
```

After ngrok setup, this will automatically update to your ngrok URL.

## 🎯 Quick Commands

```bash
# Setup ngrok (first time only)
cd backend && bash quick-setup.sh

# Start services
bash start-all.sh

# Stop services
bash backend/auto-stop.sh

# Check status
curl http://localhost:8080/health

# View ngrok dashboard
# Visit: http://localhost:4040
```

## 🔍 Troubleshooting

### Port 8080 in use?
```bash
# Find what's using it
sudo lsof -i :8080
# Or
sudo netstat -tulpn | grep 8080

# Kill the process
sudo kill -9 <PID>
```

### Backend not starting?
```bash
# Check logs
tail -f backend/logs/backend.log
```

### Need different port?
Edit `backend/.env.production`:
```bash
PORT=5000  # Or any available port
```

Then restart services.

## 📚 Documentation

- **Quick Setup:** `backend/quick-setup.sh` (run this!)
- **Internet Access:** `INTERNET_ACCESS_GUIDE.md`
- **Ngrok Setup:** `SETUP_NGROK.md`
- **Quick Reference:** `QUICK_NGROK_SETUP.md`

## ✅ Ready to Go!

1. **Test locally:** Backend running on port 8080
2. **Enable internet:** Run `cd backend && bash quick-setup.sh`
3. **Access anywhere:** Use your ngrok URL

That's it! 🎉
