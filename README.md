# StockVerify - Inventory Audit System

A professional stock verification and inventory audit mobile app built with Expo SDK 53 and React Native for Lavanya Emart.

## Role-Based Access

### Staff Role
- Create and manage stock counting sessions
- Scan barcodes and search items
- Enter counted quantities with variance tracking
- Add serial numbers, conditions, dates
- Submit sessions for supervisor verification

### Supervisor Role
- Review pending verification sessions
- Approve or reject individual entries
- Request re-counts with reason and reassignment
- View staff productivity metrics
- Access reports and analytics

### Admin Role
- Full system access
- User management (add, edit, activate/deactivate)
- Audit log viewer with filtering
- System-wide reports and analytics
- All supervisor capabilities

## Features

### Authentication
- Role-based login (Staff, Supervisor, Admin)
- PIN-based quick login
- User session management
- Automatic role-based routing

### Dashboard (Role-Aware)
- Role-specific summary cards
- Quick actions based on user role
- Overview stats with variance analysis
- Active sessions (Staff) / Pending verifications (Supervisor/Admin)
- Recent activity feed
- Offline sync status banner

### Item Scanning & Search
- Barcode scanner with camera
- **Prefix-based routing:**
  - 51/52/53 prefix → Barcode search only
  - Other prefixes → Name search
- Visual search mode indicator
- Quick item lookup

### Item Details Page
- Basic Info: Name, Code, Barcode, Category, Brand
- Pricing: MRP, Sale Price, Tax Classification, HSN
- Stock Info: System Stock, UOM, Variants
- Serial Number Support: Active, Damaged, Missing status
- Damage tracking with categories and remarks
- Last verified date and user

### Stock Entry
- Quantity counter with +/- buttons
- Real-time variance calculation (Short/Matched/Over)
- Item condition: New, Aged, Issue
- MRP editing option
- Manufacturing/Expiry date tracking (flexible formats)
- Serial number capture
- Bundle item support
- Remarks/notes

### Verification Workflow (Supervisor/Admin)
- Session-level review with all entries
- Entry-by-entry approval/rejection
- Rejection modal with:
  - Reason selection
  - Reassignment to staff member
  - Supervisor remarks
- Batch approve/reject all entries
- Re-count notification to assigned staff

### Offline Support
- Offline banner on dashboard
- Local data storage with Zustand + AsyncStorage
- Offline queue for entries
- Sync when connection restored
- Visual sync status indicators

### Admin Features
- User Management screen
- Add new users with role assignment
- Activate/Deactivate users
- Audit Log viewer
- Filter by action type
- Full activity history

### Reports & Analytics
- Summary Report: Overall performance
- Variance Report: Short, over & matched items
- Sessions Report: All session details
- Time-based filtering (7 Days, 30 Days, All Time)
- Accuracy metrics
- Location-based statistics

## Tech Stack
- Expo SDK 53
- React Native 0.76.7
- NativeWind (TailwindCSS)
- Zustand for state management
- React Query for async operations
- expo-camera for barcode scanning
- react-native-reanimated for animations
- @react-native-community/netinfo for network status
- lucide-react-native for icons
- date-fns for date formatting

## Project Structure
```
src/
├── app/
│   ├── _layout.tsx              # Root layout with all routes
│   ├── index.tsx                # Welcome screen
│   ├── login.tsx                # Login/Register (role-based)
│   ├── dashboard.tsx            # Role-aware dashboard
│   ├── analytics.tsx            # Analytics & insights
│   ├── reports.tsx              # Reports & export
│   ├── create-session.tsx       # New session wizard
│   ├── sessions.tsx             # Session list
│   ├── scan.tsx                 # Item search with prefix routing
│   ├── item-detail.tsx          # Comprehensive item details
│   ├── entry-form.tsx           # Stock entry form
│   ├── confirm-entry.tsx        # Confirmation with offline support
│   ├── supervisor/
│   │   └── verifications.tsx    # Verification workflow
│   └── admin/
│       ├── users.tsx            # User management
│       └── audit-logs.tsx       # Audit log viewer
├── components/
│   ├── OfflineBanner.tsx        # Offline sync indicator
│   └── Themed.tsx               # Theme components
└── lib/
    ├── cn.ts                    # className utility
    ├── store.ts                 # Zustand stores (Auth, Session, Users)
    └── types.ts                 # TypeScript types
```

## Demo Users
- **Staff:** rahul/priya - Stock counting operations
- **Supervisor:** amit - Verification and approval
- **Admin:** admin - Full system access

## Search Prefix Rules
| Prefix | Search Mode | Example |
|--------|-------------|---------|
| 51     | Barcode     | 5101234567890 |
| 52     | Barcode     | 5201234567890 |
| 53     | Barcode     | 5301234567890 |
| Other  | Name        | Samsung, iPhone |

## Mock Items
- Samsung Galaxy S24 Ultra (serialized, 51 prefix)
- Apple iPhone 15 Pro Max (serialized, 52 prefix)
- Sony WH-1000XM5 Headphones (serialized, 53 prefix)
- LG 55" OLED TV (bundle enabled)
- Duracell AA Batteries
- Philips LED Bulb
- Bosch Power Drill Kit (bundle enabled)
- Prestige Pressure Cooker

## Getting Started
The app runs automatically on port 8081. Log in with any demo user credentials to access role-specific features.
