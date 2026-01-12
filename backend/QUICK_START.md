# Quick Start Guide - Stock Verify Backend

## 🚀 Complete Setup in 3 Steps

### Step 1: Setup Environment
```bash
cd backend
bun run setup
```

This creates `.env.production` with all configuration.

### Step 2: Configure (Optional)
Edit `.env.production` and update:
- Database credentials (if using SQL Server)
- Security secrets (JWT_SECRET, PIN_ENCRYPTION_KEY, SESSION_SECRET)
- Ngrok auth token (if using authenticated ngrok)

### Step 3: Start Server
```bash
# Option A: Start with environment variables
bun run start:env

# Option B: Start normally (uses defaults)
bun run start
```

## 📡 Start with Ngrok

### Terminal 1: Start Backend
```bash
cd backend
bun run start:env
```

### Terminal 2: Start Ngrok
```bash
export PATH="/home/user/.bun/bin:$PATH"

# If you have NGROK_AUTH_TOKEN in .env.production
ngrok config add-authtoken $NGROK_AUTH_TOKEN

# Start tunnel
ngrok http 3000
```

### Get Ngrok URL
```bash
bash get-ngrok-url.sh
```

Or visit: http://localhost:4040

## 🔧 Update App Configuration

After getting ngrok URL, update `app.json` in project root:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-ngrok-url.ngrok.io"
    }
  }
}
```

## ✅ Verify Setup

1. **Check backend health:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check ngrok tunnel:**
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

3. **Test API through ngrok:**
   ```bash
   curl https://your-ngrok-url.ngrok.io/health
   ```

## 📋 Environment Variables

All configuration is in `.env.production`. Key variables:

- `PORT` - Server port (default: 3000)
- `DB_*` - Database configuration
- `NGROK_AUTH_TOKEN` - Ngrok authentication
- `JWT_SECRET` - JWT signing secret
- `PIN_ENCRYPTION_KEY` - PIN encryption key
- `SESSION_SECRET` - Session secret

See `.env.production` for complete list.

## 🎯 Default Login Credentials

- **Staff 1:** `staff1` / PIN: `1234`
- **Staff 2:** `staff2` / PIN: `5678`
- **Supervisor:** `supervisor1` / PIN: `1111`
- **Admin:** `admin1` / PIN: `0000`

## 📚 More Information

- See `README.md` for detailed API documentation
- See `SETUP_GUIDE.md` for advanced setup
- Configuration is loaded from `config.js`
