// Backend Configuration
// Reads from environment variables with defaults

export const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',

  // API Configuration
  apiBasePath: process.env.API_BASE_PATH || '/api',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Ngrok Configuration
  ngrok: {
    authToken: process.env.NGROK_AUTH_TOKEN || '',
    region: process.env.NGROK_REGION || 'us',
    domain: process.env.NGROK_DOMAIN || '',
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    name: process.env.DB_NAME || 'lavanya_emart_erp',
    user: process.env.DB_USER || 'stock_verify_readonly',
    password: process.env.DB_PASSWORD || '',
    encrypt: process.env.DB_ENCRYPT !== 'false',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '30000', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
  },

  // Authentication & Security
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    pinEncryptionKey: process.env.PIN_ENCRYPTION_KEY || 'change-this-in-production',
    sessionSecret: process.env.SESSION_SECRET || 'change-this-in-production',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '28800000', 10),
    minPinLength: parseInt(process.env.MIN_PIN_LENGTH || '4', 10),
    maxPinLength: parseInt(process.env.MAX_PIN_LENGTH || '6', 10),
    pinRequireNumbers: process.env.PIN_REQUIRE_NUMBERS !== 'false',
  },

  // Device Management
  device: {
    enableSingleDevice: process.env.ENABLE_SINGLE_DEVICE !== 'false',
    requireDeviceRegistration: process.env.REQUIRE_DEVICE_REGISTRATION !== 'false',
    sessionTimeout: parseInt(process.env.DEVICE_SESSION_TIMEOUT || '28800000', 10),
  },

  // Stock Verification
  stock: {
    minSearchChars: parseInt(process.env.MIN_SEARCH_CHARS || '3', 10),
    barcodePrefixes: (process.env.BARCODE_PREFIXES || '51,52,53').split(','),
    varianceThreshold: parseFloat(process.env.VARIANCE_THRESHOLD || '10'),
    enableSerialTracking: process.env.ENABLE_SERIAL_TRACKING !== 'false',
    enableDamageTracking: process.env.ENABLE_DAMAGE_TRACKING !== 'false',
  },

  // Role-Based Access Control
  rbac: {
    enabled: process.env.ENABLE_RBAC !== 'false',
    requireVerification: process.env.REQUIRE_VERIFICATION !== 'false',
    enableRecount: process.env.ENABLE_RECOUNT !== 'false',
  },

  // Audit & Logging
  logging: {
    enableAuditTrail: process.env.ENABLE_AUDIT_TRAIL !== 'false',
    logLevel: (process.env.LOG_LEVEL || 'info').toLowerCase(),
    logFilePath: process.env.LOG_FILE_PATH || './logs/backend.log',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
    enableErrorLogging: process.env.ENABLE_ERROR_LOGGING !== 'false',
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.ENABLE_RATE_LIMITING !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Caching
  cache: {
    enabled: process.env.ENABLE_CACHE !== 'false',
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    type: process.env.CACHE_TYPE || 'memory',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf').split(','),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  // Offline & Sync
  sync: {
    enableOfflineMode: process.env.ENABLE_OFFLINE_MODE !== 'false',
    queueSize: parseInt(process.env.SYNC_QUEUE_SIZE || '1000', 10),
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '50', 10),
    interval: parseInt(process.env.SYNC_INTERVAL || '30000', 10),
  },

  // Reporting
  reports: {
    enabled: process.env.ENABLE_REPORTS !== 'false',
    retentionDays: parseInt(process.env.REPORT_RETENTION_DAYS || '365', 10),
    storagePath: process.env.REPORT_STORAGE_PATH || './reports',
    enablePdfExport: process.env.ENABLE_PDF_EXPORT !== 'false',
    enableExcelExport: process.env.ENABLE_EXCEL_EXPORT !== 'false',
  },

  // Email
  email: {
    enabled: process.env.ENABLE_EMAIL === 'true',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      from: process.env.SMTP_FROM || 'noreply@lavanyaemart.com',
    },
  },

  // Company Information
  company: {
    name: process.env.COMPANY_NAME || 'Lavanya Emart',
    address: process.env.COMPANY_ADDRESS || '',
    phone: process.env.COMPANY_PHONE || '',
    email: process.env.COMPANY_EMAIL || 'support@lavanyaemart.com',
    showroomLocations: (process.env.SHOWROOM_LOCATIONS || 'Ground Floor,First Floor,Second Floor').split(','),
    godownLocations: (process.env.GODOWN_LOCATIONS || 'Main Area,Top Area,Damage Area').split(','),
  },

  // Feature Flags
  features: {
    enableBundleItems: process.env.ENABLE_BUNDLE_ITEMS !== 'false',
    enableMrpEdit: process.env.ENABLE_MRP_EDIT !== 'false',
    enableMfgDate: process.env.ENABLE_MFG_DATE !== 'false',
    enableExpiryDate: process.env.ENABLE_EXPIRY_DATE !== 'false',
    enableLocationTracking: process.env.ENABLE_LOCATION_TRACKING !== 'false',
  },

  // Performance
  performance: {
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100', 10),
    requestRetryAttempts: parseInt(process.env.REQUEST_RETRY_ATTEMPTS || '3', 10),
  },

  // Monitoring
  monitoring: {
    enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000', 10),
  },
};

export default config;
