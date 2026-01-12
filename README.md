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

## Getting Started
The app runs automatically on port 8081. Log in with any credentials to access the dashboard.
