# 📦 StockVerify

<div align="center">

**Professional Inventory Audit & Stock Verification System**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.6-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive mobile application for inventory auditing, stock verification, and variance tracking with role-based access control, offline support, and real-time analytics.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🔐 Authentication & Security
- Multiple login methods (Username/Password, PIN, Biometric)
- Role-based access control (Staff, Supervisor, Admin)
- Secure PIN storage and device tracking
- Session management with timeout

### 📊 Dashboard & Analytics
- Real-time dashboard with accuracy metrics
- Time-based analytics (7 days, 30 days, all time)
- Variance analysis with visual indicators
- Location-based statistics (Showroom vs Godown)
- Weekly activity charts

### 📱 Session Management
- Create and manage inventory audit sessions
- Search and filter by rack, location, status
- Live status indicators
- Quick resume and completion actions

### 🔍 Item Scanning
- Barcode scanner with camera integration
- Smart search with prefix-based routing
- Item name and barcode lookup
- Variant support for same items

### 📝 Stock Entry
- Real-time variance calculation
- Color-coded variance indicators (Red/Green/Yellow)
- Serial number tracking
- Weight entry with photo proof
- Split counting method
- Batch tracking with expiry dates
- Damage tracking and categorization
- Bundle item support

### ✅ Verification Workflow
- Supervisor approval/rejection system
- Re-count request functionality
- Entry verification with remarks
- Audit trail for all actions

### 📈 Reports & Export
- Summary reports
- Variance reports
- Session reports
- Detailed item-level reports
- Native share functionality

### 👥 Admin Features
- Live user monitoring
- Real-time scan tracking
- System health monitoring
- Application logs and error tracking
- Audit logs

### 🔄 Offline Support
- Local data storage
- Batch sync when online
- Offline queue management
- Sync status tracking

## 🛠️ Tech Stack

### Frontend
- **React Native** 0.79.6 with **Expo SDK 53**
- **TypeScript** for type safety
- **NativeWind** (TailwindCSS) for styling
- **Zustand** for state management
- **React Query** for data fetching
- **React Native Reanimated** for animations
- **Expo Camera** for barcode scanning

### Backend
- **Node.js Express** - Development server
- **Python FastAPI** - Production server with database integration
- **SQL Server** - ERP data integration
- **MongoDB** - Session and entry storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Expo CLI (`npm install -g expo-cli`)
- Python 3.8+ (for FastAPI backend)
- MongoDB (optional, for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stockverify.git
cd stockverify

# Install frontend dependencies
npm install
# or
bun install

# Install backend dependencies
cd backend
npm install
# or
bun install

# Install Python dependencies (for FastAPI)
pip install -r requirements.txt
```

### Running the App

```bash
# Start the frontend
npm start

# Start the backend (in another terminal)
cd backend
npm start

# Or use the auto-start script
npm run start:all
```

### Environment Setup

1. Copy environment example:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Configure your `.env` file with:
   - Database connections
   - API URLs
   - Security secrets

3. Update `app.json` with your backend URL

See [GITHUB_SETUP.md](GITHUB_SETUP.md) for detailed setup instructions.

## 📖 Documentation

- **[App Analysis](APP_ANALYSIS.md)** - Complete application analysis
- **[Backend Setup](backend/README.md)** - Backend configuration guide
- **[Quick Start Guide](START_HERE.md)** - Getting started quickly
- **[Ngrok Setup](NGROK_SETUP.md)** - Mobile device access setup
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines

## 🏗️ Project Structure

```
stockverify/
├── src/                    # React Native source code
│   ├── app/               # Expo Router screens
│   ├── components/        # Reusable components
│   └── lib/               # Core utilities
├── backend/               # Backend servers
│   ├── server.js         # Node.js Express
│   ├── main.py           # Python FastAPI
│   └── ...
├── assets/                # Images and icons
├── patches/               # Package patches
└── docs/                  # Documentation
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run typecheck

# Backend syntax check
cd backend && node -c server.js
```

## 📱 Demo Credentials

- **Staff 1:** `staff1` / PIN: `1234`
- **Staff 2:** `staff2` / PIN: `5678`
- **Supervisor:** `supervisor1` / PIN: `1111`
- **Admin:** `admin1` / PIN: `0000`

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Native community
- All contributors and users

## 📞 Support

- 📧 Open an [Issue](https://github.com/your-username/stockverify/issues)
- 📖 Check the [Documentation](README.md)
- 💬 Discussions coming soon

---

<div align="center">

**Made with ❤️ for inventory management**

⭐ Star this repo if you find it helpful!

</div>
