# StockVerify - Inventory Audit System

A professional stock verification and inventory audit mobile app built with Expo SDK 53 and React Native.

## Features

### Authentication
- Welcome screen with app introduction
- Login with username/password
- PIN-based quick login
- Biometric authentication support (simulated)
- User registration with PIN setup

### Dashboard
- Overview stats: Total Scanned, Verified, Racks Finished
- Variance summary: Short, Matched, Over items
- Quick access to active sessions
- New session creation

### Session Management
- Create sessions for Showroom or Godown locations
- Showroom floors: Ground, First, Second
- Godown areas: Main, Top, Damage
- Rack number assignment
- Resume active sessions
- Complete/finish sessions

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
- React Native 0.79
- NativeWind (TailwindCSS)
- Zustand for state management
- React Query for async operations
- expo-camera for barcode scanning
- react-native-reanimated for animations
- lucide-react-native for icons

## Project Structure
```
src/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Welcome screen
│   ├── login.tsx           # Login/Register
│   ├── dashboard.tsx       # Main dashboard
│   ├── create-session.tsx  # New session wizard
│   ├── sessions.tsx        # Session list
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

## Getting Started
The app runs automatically on port 8081. Log in with any credentials to access the dashboard.
