# StockVerify - Inventory Audit System

A professional stock verification and inventory audit mobile app built with Expo SDK 53 and React Native.

## Features

### Authentication
- Welcome screen with app introduction
- Login with username/password
- PIN-based quick login
- Biometric authentication support (simulated)
- User registration with PIN setup

### Dashboard (Upgraded)
- Today's summary card with date and accuracy rate
- Quick actions grid: New Session, Sessions, Reports, Analytics
- Overview stats: Total Scanned, Verified, Racks Done
- Variance analysis with visual progress bar
- Active sessions with live status indicators
- Recent activity feed showing latest entries
- Modern gradient design with animations

### Analytics Screen (New)
- Time filter: 7 Days, 30 Days, All Time
- Accuracy score card with percentage
- Weekly activity bar chart
- Key metrics: Total Scanned, Sessions Done, Avg/Day
- Variance breakdown with progress bars
- Location statistics: Showroom vs Godown

### Admin Dashboard (New)
- **Live Users Tab:** Real-time user monitoring with online status, active sessions, and last activity
- **Live Scans Tab:** Real-time scan updates table showing time, item, quantity, variance, and staff
- **System Monitoring Tab:** Backend connection status, CPU/Memory/Storage/API latency metrics, quick actions
- **Logs Tab:** Application logs with level filtering (all, error, warn, info, debug), timestamp, source tracking
- **Error Tracking Tab:** Error list with type, message, stack trace, resolution status, mark as resolved

### Reports Screen (New)
- Summary Report: Overall performance overview
- Variance Report: Short, over & matched items
- Sessions Report: All session details
- Detailed Report: Complete item-level data
- Share reports via native share sheet
- Quick stats overview
- Recent variances list

### Session Management (Upgraded)
- Search by rack number or location
- Filter by status: All, Active, Completed
- Filter by location: All, Showroom, Godown
- Animated session cards with gradient icons
- Live status indicators for active sessions
- Quick resume and complete actions
- Empty state with contextual actions

### Item Scanning & Search
- Barcode scanner with camera
- Search by item name (min 3 characters)
- Search by barcode number
- View item details and system stock

### Stock Entry
- Quantity counter with +/- buttons
- Real-time variance calculation
- Variance color coding:
  - Red: Short (negative variance)
  - Green: Matched (zero variance)
  - Yellow/Amber: Over (positive variance)
- Item condition selection: New, Aged, Issue
- Issue details entry
- MRP editing option
- Manufacturing date (Year only, Month/Year, Full date)
- Expiry date tracking
- Serial number entry for serialized items
- Bundle item support
- Remarks/notes

### Confirmation Flow
- Review all entered data before submission
- Visual variance indicator
- Edit or confirm entry
- Data stored in backend (Zustand + AsyncStorage)

## Tech Stack
- Expo SDK 53
- React Native 0.76.7
- NativeWind (TailwindCSS)
- Zustand for state management
- React Query for async operations
- expo-camera for barcode scanning
- react-native-reanimated for animations
- lucide-react-native for icons
- date-fns for date formatting

## Project Structure
```
src/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Welcome screen
│   ├── login.tsx           # Login/Register
│   ├── dashboard.tsx       # Main dashboard (upgraded)
│   ├── analytics.tsx       # Analytics & insights (new)
│   ├── reports.tsx         # Reports & export (new)
│   ├── create-session.tsx  # New session wizard
│   ├── sessions.tsx        # Session list (upgraded)
│   ├── scan.tsx            # Item search & scan
│   ├── item-detail.tsx     # Item details
│   ├── entry-form.tsx      # Stock entry form
│   └── confirm-entry.tsx   # Confirmation modal
├── components/             # Reusable components
└── lib/
    ├── cn.ts               # className utility
    ├── store.ts            # Zustand stores
    └── types.ts            # TypeScript types
```

## Mock Data
The app includes sample items for testing:
- Samsung Galaxy S24 Ultra (serialized)
- Apple iPhone 15 Pro Max (serialized)
- Sony WH-1000XM5 Headphones (serialized)
- LG 55" OLED TV (bundle enabled)
- Duracell AA Batteries
- Philips LED Bulb
- Bosch Power Drill Kit (bundle enabled)
- Prestige Pressure Cooker

## Backend Setup with Ngrok

### 1. Start Backend Server

```bash
cd backend
bun install
bun run start
```

The backend will run on `http://localhost:3000`

### 2. Start Ngrok Tunnel

In a new terminal:

```bash
export PATH="/home/user/.bun/bin:$PATH"
ngrok http 3000
```

Or use the automated script:

```bash
cd backend
bun run tunnel
```

### 3. Get Ngrok URL

After ngrok starts, get the public URL:

```bash
bash backend/get-ngrok-url.sh
```

Or check the ngrok dashboard at `http://localhost:4040`

### 4. Update App Configuration

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

### 5. Restart Expo App

After updating the API URL, restart the Expo app to use the backend.

## 🚀 Quick Start (Auto-Start Everything!)

### One Command to Start Everything:
```bash
# Linux/Mac
bash start-all.sh

# Windows
start-all.bat

# Or use npm
npm run start:all
```

This automatically:
- ✅ Starts backend server
- ✅ Starts ngrok tunnel
- ✅ Gets ngrok URL
- ✅ Updates app.json with ngrok URL
- ✅ Ready to use!

**See [README_AUTO_START.md](README_AUTO_START.md) for details.**

## Manual Setup (Alternative)

1. **Start Backend:**
   ```bash
   cd backend && bun run start:env
   ```

2. **Start Ngrok (in another terminal):**
   ```bash
   export PATH="/home/user/.bun/bin:$PATH"
   ngrok http 3000
   ```

3. **Get Ngrok URL:**
   ```bash
   bash backend/get-ngrok-url.sh
   ```

4. **Update API URL** in `app.json` with your ngrok URL

5. **Start Expo App:**
   ```bash
   bun start
   ```

## Login Credentials

- **Staff 1:** `staff1` / PIN: `1234`
- **Staff 2:** `staff2` / PIN: `5678`
- **Supervisor:** `supervisor1` / PIN: `1111`
- **Admin:** `admin1` / PIN: `0000`

## API Client

The app includes an API client at `src/lib/api.ts` that automatically uses the configured backend URL. All API calls go through this client.
