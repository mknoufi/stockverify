# 🚀 Auto-Start Guide - One Click Startup

## Quick Start (One Command!)

### Linux/Mac:
```bash
bash start-all.sh
```

### Windows:
```batch
start-all.bat
```

### Or use npm:
```bash
npm run start:all
```

## What It Does Automatically

✅ **Checks and installs ngrok** if needed  
✅ **Loads environment** from `.env.production`  
✅ **Creates necessary directories** (logs, uploads, reports)  
✅ **Cleans up** existing processes on ports 3000 and 4040  
✅ **Starts backend server** on port 3000  
✅ **Starts ngrok tunnel** automatically  
✅ **Gets ngrok public URL** from API  
✅ **Updates app.json** with ngrok URL automatically  
✅ **Saves PIDs** for easy stopping  

## Manual Commands

### Start Everything:
```bash
bash start-all.sh          # Linux/Mac
start-all.bat              # Windows
npm run start:all          # Any platform
```

### Start Backend Only:
```bash
bash backend/auto-start.sh
npm run start:backend
```

### Stop Everything:
```bash
bash backend/auto-stop.sh
npm run stop:backend
```

## What Gets Started

1. **Backend Server** → `http://localhost:3000`
2. **Ngrok Tunnel** → `https://xxxxx.ngrok.io`
3. **Ngrok Dashboard** → `http://localhost:4040`

## Logs

All logs are saved to:
- `backend/logs/backend.log` - Backend server logs
- `backend/logs/ngrok.log` - Ngrok tunnel logs

## Configuration

The script automatically:
- Loads `.env.production` if it exists
- Creates it if it doesn't exist (via `setup-env.sh`)
- Updates `app.json` with the ngrok URL

## Troubleshooting

### Port Already in Use
The script automatically kills processes on ports 3000 and 4040. If issues persist:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:4040 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Ngrok Not Found
The script tries to install ngrok automatically. If it fails:
```bash
# Install manually
bun add -g ngrok
# or
npm install -g ngrok
```

### Can't Get Ngrok URL
If automatic URL detection fails:
1. Check ngrok dashboard: http://localhost:4040
2. Run: `bash backend/get-ngrok-url.sh`
3. Manually update `app.json` with the URL

## Background Mode

To run in background (Linux/Mac):
```bash
nohup bash start-all.sh > startup.log 2>&1 &
```

## Stop Services

```bash
bash backend/auto-stop.sh
```

Or manually:
```bash
# Kill by PID files
kill $(cat backend/.backend.pid)
kill $(cat backend/.ngrok.pid)

# Or kill by port
lsof -ti:3000 | xargs kill -9
lsof -ti:4040 | xargs kill -9
```

## Next Steps After Auto-Start

1. ✅ Backend is running
2. ✅ Ngrok tunnel is active
3. ✅ `app.json` is updated with ngrok URL
4. 🚀 **Start your Expo app:**
   ```bash
   npm start
   # or
   expo start
   ```

Your app will automatically use the ngrok backend URL!

## Files Created

- `backend/.backend.pid` - Backend process ID
- `backend/.ngrok.pid` - Ngrok process ID  
- `backend/.ngrok.url` - Ngrok public URL
- `backend/logs/backend.log` - Backend logs
- `backend/logs/ngrok.log` - Ngrok logs

## Tips

- The script waits for services to be ready before proceeding
- All errors are logged to the log files
- You can run the script multiple times (it cleans up first)
- The script is idempotent - safe to run repeatedly

Enjoy your automated setup! 🎉
