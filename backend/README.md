# Stock Verify Backend API

Backend server for the Stock Verification System with ngrok tunnel support.

## Quick Setup

See `QUICK_START.md` for the fastest setup guide.

## Detailed Setup

1. **Install dependencies:**
   ```bash
   cd backend
   bun install
   ```

2. **Setup environment:**
   ```bash
   bun run setup
   ```
   This creates `.env.production` with all configuration.

3. **Configure (Optional):**
   Edit `.env.production` and update:
   - Database credentials (if using SQL Server)
   - Security secrets (JWT_SECRET, PIN_ENCRYPTION_KEY, SESSION_SECRET)
   - Ngrok auth token (if using authenticated ngrok)

4. **Start the backend server:**
   ```bash
   # With environment variables
   bun run start:env
   
   # Or without (uses defaults)
   bun run start
   ```
   Server will run on `http://localhost:3000`

5. **Start with ngrok tunnel:**
   ```bash
   bun run tunnel
   ```
   This will:
   - Start the backend server on port 3000
   - Start ngrok tunnel
   - Display the ngrok public URL

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Authentication
- `POST /api/auth/login` - Login with username/password or PIN

### Items
- `GET /api/items` - Get all items
- `GET /api/items/search?q=query` - Search items (prefix-based routing)
- `GET /api/items/barcode/:barcode` - Get item by barcode
- `GET /api/items/:id` - Get item by ID

### Sessions
- `GET /api/sessions` - Get sessions (with optional userId, status filters)
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `POST /api/sessions/:id/submit` - Submit session for verification

### Entries
- `GET /api/entries` - Get entries (with optional sessionId, verificationStatus filters)
- `POST /api/entries` - Create new entry
- `PUT /api/entries/:id` - Update entry
- `POST /api/entries/:id/approve` - Approve entry (Supervisor)
- `POST /api/entries/:id/reject` - Reject entry (Supervisor)
- `POST /api/entries/:id/recount` - Request re-count (Supervisor)

### Dashboard
- `GET /api/dashboard/stats?userId=:id&userRole=:role` - Get dashboard statistics

### Verifications
- `GET /api/verifications/pending` - Get pending verifications (Supervisor/Admin)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

## Ngrok Setup

1. **Get ngrok URL:**
   After starting the tunnel, check the ngrok dashboard at `http://localhost:4040` or use:
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

2. **Update app configuration:**
   Update `app.json` with your ngrok URL:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "https://your-ngrok-url.ngrok.io"
       }
     }
   }
   ```

   Or set environment variable:
   ```bash
   export EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok.io
   ```

## Environment Configuration

All configuration is managed through `.env.production`. Run `bun run setup` to create it.

Key configuration areas:
- **Server:** PORT, NODE_ENV, HOST
- **Database:** DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- **Security:** JWT_SECRET, PIN_ENCRYPTION_KEY, SESSION_SECRET
- **Ngrok:** NGROK_AUTH_TOKEN, NGROK_REGION, NGROK_DOMAIN
- **Features:** Enable/disable various features via flags

See `.env.production` for complete configuration options.

## Configuration System

The backend uses `config.js` to load all environment variables with sensible defaults. Configuration is organized into logical sections:
- Server, API, Database
- Authentication & Security
- Device Management
- Stock Verification
- RBAC, Logging, Caching
- And more...

## Notes

- The backend uses in-memory storage (sessions, entries, items)
- In production, replace with SQL Server database connection
- Ngrok free tier has session limits - consider paid plan for production
- For LAN-only deployment, use local IP instead of ngrok
- Always change default secrets in production
- See `QUICK_START.md` for fastest setup