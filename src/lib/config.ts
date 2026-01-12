// Configuration for Stock Verification System
import Constants from 'expo-constants';

// Get configuration from environment variables or defaults
export const config = {
  // API Configuration
  apiUrl:
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    'http://localhost:3000',
  
  apiBasePath: process.env.EXPO_PUBLIC_API_BASE_PATH || '/api',
  apiTimeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10),

  // Application
  appName: process.env.EXPO_PUBLIC_APP_NAME || 'Stock Verify',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || process.env.EXPO_PUBLIC_ENV || 'development',

  // Authentication
  enablePinAuth: process.env.EXPO_PUBLIC_ENABLE_PIN_AUTH !== 'false',
  enableBiometric: process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC !== 'false',
  sessionTimeout: parseInt(process.env.EXPO_PUBLIC_SESSION_TIMEOUT || '480', 10),
  maxLoginAttempts: parseInt(process.env.EXPO_PUBLIC_MAX_LOGIN_ATTEMPTS || '5', 10),

  // Network
  lanOnly: process.env.EXPO_PUBLIC_LAN_ONLY === 'true',
  offlineMode: process.env.EXPO_PUBLIC_OFFLINE_MODE !== 'false',
  syncInterval: parseInt(process.env.EXPO_PUBLIC_SYNC_INTERVAL || '30', 10),

  // Device Management
  singleDeviceEnforce: process.env.EXPO_PUBLIC_SINGLE_DEVICE_ENFORCE !== 'false',
  deviceRegistration: process.env.EXPO_PUBLIC_DEVICE_REGISTRATION !== 'false',

  // Stock Verification
  minSearchChars: parseInt(process.env.EXPO_PUBLIC_MIN_SEARCH_CHARS || '3', 10),
  barcodePrefixes: (process.env.EXPO_PUBLIC_BARCODE_PREFIXES || '51,52,53').split(','),
  varianceThreshold: parseFloat(process.env.EXPO_PUBLIC_VARIANCE_THRESHOLD || '10'),
  enableSerialTracking: process.env.EXPO_PUBLIC_ENABLE_SERIAL_TRACKING !== 'false',
  enableDamageTracking: process.env.EXPO_PUBLIC_ENABLE_DAMAGE_TRACKING !== 'false',

  // Role-Based Access Control
  enableRBAC: process.env.EXPO_PUBLIC_ENABLE_RBAC !== 'false',
  requireVerification: process.env.EXPO_PUBLIC_REQUIRE_VERIFICATION !== 'false',
  enableRecount: process.env.EXPO_PUBLIC_ENABLE_RECOUNT !== 'false',

  // Reporting & Analytics
  enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS !== 'false',
  reportRetentionDays: parseInt(process.env.EXPO_PUBLIC_REPORT_RETENTION_DAYS || '365', 10),
  enablePdfExport: process.env.EXPO_PUBLIC_ENABLE_PDF_EXPORT !== 'false',
  enableExcelExport: process.env.EXPO_PUBLIC_ENABLE_EXCEL_EXPORT !== 'false',

  // Audit & Logging
  enableAuditTrail: process.env.EXPO_PUBLIC_ENABLE_AUDIT_TRAIL !== 'false',
  logLevel: (process.env.EXPO_PUBLIC_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  enableRemoteLogging: process.env.EXPO_PUBLIC_ENABLE_REMOTE_LOGGING === 'true',

  // Feature Flags
  enableBundleItems: process.env.EXPO_PUBLIC_ENABLE_BUNDLE_ITEMS !== 'false',
  enableMrpEdit: process.env.EXPO_PUBLIC_ENABLE_MRP_EDIT !== 'false',
  enableMfgDate: process.env.EXPO_PUBLIC_ENABLE_MFG_DATE !== 'false',
  enableExpiryDate: process.env.EXPO_PUBLIC_ENABLE_EXPIRY_DATE !== 'false',
  enableLocationTracking: process.env.EXPO_PUBLIC_ENABLE_LOCATION_TRACKING !== 'false',

  // UI/UX
  enableHaptics: process.env.EXPO_PUBLIC_ENABLE_HAPTICS !== 'false',
  enableAnimations: process.env.EXPO_PUBLIC_ENABLE_ANIMATIONS !== 'false',
  theme: (process.env.EXPO_PUBLIC_THEME || 'auto') as 'light' | 'dark' | 'auto',

  // Performance
  cacheDuration: parseInt(process.env.EXPO_PUBLIC_CACHE_DURATION || '300', 10),
  maxConcurrentRequests: parseInt(process.env.EXPO_PUBLIC_MAX_CONCURRENT_REQUESTS || '5', 10),
  requestRetryAttempts: parseInt(process.env.EXPO_PUBLIC_REQUEST_RETRY_ATTEMPTS || '3', 10),

  // Company Information
  companyName: process.env.EXPO_PUBLIC_COMPANY_NAME || 'Lavanya Emart',
  showroomLocations: (process.env.EXPO_PUBLIC_SHOWROOM_LOCATIONS || 'Ground Floor,First Floor,Second Floor').split(','),
  godownLocations: (process.env.EXPO_PUBLIC_GODOWN_LOCATIONS || 'Main Area,Top Area,Damage Area').split(','),

  // Support
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@lavanyaemart.com',
  supportPhone: process.env.EXPO_PUBLIC_SUPPORT_PHONE || '+91-XXXXXXXXXX',
};

export default config;
