# 🚀 START HERE - Stock Verify

## One-Click Auto-Start

### Just run this:

```bash
bash start-all.sh
```

**That's it!** Everything starts automatically:
- ✅ Backend server
- ✅ Ngrok tunnel  
- ✅ App configuration updated

Then start your Expo app:
```bash
npm start
```

## What You Get

After running `start-all.sh`:

1. **Backend running** → http://localhost:3000
2. **Ngrok tunnel active** → https://xxxxx.ngrok.io
3. **app.json updated** → Automatically configured
4. **Ready to use!** → Just start Expo

## Stop Everything

```bash
bash backend/auto-stop.sh
```

## Need Help?

- **Auto-start details:** See [README_AUTO_START.md](README_AUTO_START.md)
- **Backend setup:** See [backend/QUICK_START.md](backend/QUICK_START.md)
- **Full documentation:** See [README.md](README.md)

## Quick Commands

```bash
# Start everything
npm run start:all

# Start backend only
npm run start:backend

# Stop everything
npm run stop:backend

# Start Expo app
npm start
```

That's all you need! 🎉
