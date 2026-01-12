# Production Environment Configuration

This document describes the environment variables for the Stock Verification System production deployment.

## Quick Setup

1. Create a `.env.production` file in the project root
2. Copy the variables below and update with your values
3. The app will automatically read these via `src/lib/config.ts`

## Environment Variables

### API Configuration

```bash
# Backend API URL (ngrok tunnel or production server)
EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok.io

# Backend API Base Path (if using a subpath)
EXPO_PUBLIC_API_BASE_PATH=/api

# API Timeout (milliseconds)
EXPO_PUBLIC_API_TIMEOUT=30000
```

### Application Configuration

```bash
# App Name
EXPO_PUBLIC_APP_NAME=Stock Verify

# App Version
EXPO_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=production
EXPO_PUBLIC_ENV=production
```

### Authentication & Security

```bash
# Enable PIN-based authentication
EXPO_PUBLIC_ENABLE_PIN_AUTH=true

# Enable biometric authentication
EXPO_PUBLIC_ENABLE_BIOMETRIC=true

# Session timeout (minutes)
EXPO_PUBLIC_SESSION_TIMEOUT=480

# Maximum login attempts
EXPO_PUBLIC_MAX_LOGIN_ATTEMPTS=5
```

### Network Configuration

```bash
# LAN-only enforcement (on-premise deployment)
EXPO_PUBLIC_LAN_ONLY=true

# Offline-first mode
EXPO_PUBLIC_OFFLINE_MODE=true

# Sync interval (seconds) when online
EXPO_PUBLIC_SYNC_INTERVAL=30
```

### Device Management

```bash
# Single active device per user enforcement
EXPO_PUBLIC_SINGLE_DEVICE_ENFORCE=true

# Device registration required
EXPO_PUBLIC_DEVICE_REGISTRATION=true
```

### Stock Verification Settings

```bash
# Minimum search characters
EXPO_PUBLIC_MIN_SEARCH_CHARS=3

# Barcode prefix routing (51/52/53 → barcode only)
EXPO_PUBLIC_BARCODE_PREFIXES=51,52,53

# Variance threshold for alerts (percentage)
EXPO_PUBLIC_VARIANCE_THRESHOLD=10

# Enable serial number tracking
EXPO_PUBLIC_ENABLE_SERIAL_TRACKING=true

# Enable damage tracking
EXPO_PUBLIC_ENABLE_DAMAGE_TRACKING=true
```

### Role-Based Access Control

```bash
# Default roles: staff, supervisor, admin
EXPO_PUBLIC_ENABLE_RBAC=true

# Supervisor verification required
EXPO_PUBLIC_REQUIRE_VERIFICATION=true

# Re-count workflow enabled
EXPO_PUBLIC_ENABLE_RECOUNT=true
```

### Reporting & Analytics

```bash
# Enable analytics
EXPO_PUBLIC_ENABLE_ANALYTICS=true

# Report retention days
EXPO_PUBLIC_REPORT_RETENTION_DAYS=365

# Enable PDF export
EXPO_PUBLIC_ENABLE_PDF_EXPORT=true

# Enable Excel export
EXPO_PUBLIC_ENABLE_EXCEL_EXPORT=true
```

### Audit & Logging

```bash
# Enable audit trail
EXPO_PUBLIC_ENABLE_AUDIT_TRAIL=true

# Log level: debug, info, warn, error
EXPO_PUBLIC_LOG_LEVEL=info

# Enable remote logging
EXPO_PUBLIC_ENABLE_REMOTE_LOGGING=false
```

### Feature Flags

```bash
# Enable bundle items
EXPO_PUBLIC_ENABLE_BUNDLE_ITEMS=true

# Enable MRP editing
EXPO_PUBLIC_ENABLE_MRP_EDIT=true

# Enable manufacturing date tracking
EXPO_PUBLIC_ENABLE_MFG_DATE=true

# Enable expiry date tracking
EXPO_PUBLIC_ENABLE_EXPIRY_DATE=true

# Enable location/rack tracking
EXPO_PUBLIC_ENABLE_LOCATION_TRACKING=true
```

### UI/UX Configuration

```bash
# Enable haptic feedback
EXPO_PUBLIC_ENABLE_HAPTICS=true

# Enable animations
EXPO_PUBLIC_ENABLE_ANIMATIONS=true

# Theme (light, dark, auto)
EXPO_PUBLIC_THEME=auto
```

### Performance

```bash
# Cache duration (seconds)
EXPO_PUBLIC_CACHE_DURATION=300

# Max concurrent requests
EXPO_PUBLIC_MAX_CONCURRENT_REQUESTS=5

# Request retry attempts
EXPO_PUBLIC_REQUEST_RETRY_ATTEMPTS=3
```

### Company Information

```bash
# Company Name
EXPO_PUBLIC_COMPANY_NAME=Lavanya Emart

# Showroom Locations
EXPO_PUBLIC_SHOWROOM_LOCATIONS=Ground Floor,First Floor,Second Floor

# Godown Locations
EXPO_PUBLIC_GODOWN_LOCATIONS=Main Area,Top Area,Damage Area
```

### Support & Contact

```bash
# Support Email
EXPO_PUBLIC_SUPPORT_EMAIL=support@lavanyaemart.com

# Support Phone
EXPO_PUBLIC_SUPPORT_PHONE=+91-XXXXXXXXXX
```

## Using with Expo

Expo reads environment variables prefixed with `EXPO_PUBLIC_` automatically. You can:

1. **Set in app.json** (for build-time configuration):
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "https://your-ngrok-url.ngrok.io"
       }
     }
   }
   ```

2. **Set as environment variables** (for runtime configuration):
   ```bash
   export EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok.io
   ```

3. **Use .env files** (if using a tool like `dotenv`):
   Create `.env.production` with your variables

## Configuration Access

All configuration is accessible via `src/lib/config.ts`:

```typescript
import { config } from '@/lib/config';

console.log(config.apiUrl);
console.log(config.enablePinAuth);
// etc.
```

## Notes

1. Replace `EXPO_PUBLIC_API_URL` with your actual ngrok URL or production server
2. For SQL Server connection, configure database variables separately (not in Expo env)
3. Set `NGROK_AUTH_TOKEN` if using authenticated ngrok account
4. Adjust thresholds and timeouts based on your network conditions
5. Enable/disable features based on your requirements
