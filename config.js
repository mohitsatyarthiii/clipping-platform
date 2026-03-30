/**
 * Application Configuration
 * Centralized config for all settings
 */

export const config = {
  // Server Config
  server: {
    port: process.env.PORT || 3000,
    host: 'localhost',
    env: process.env.NODE_ENV || 'development',
  },

  // Database Config
  database: {
    uri: process.env.MONGODB_URI,
    env: process.env.MONGODB_ENV || 'development',
    connectionTimeout: 5000,
    commandTimeout: 10000,
  },

  // JWT Config
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_key',
    expiration: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // Security Config
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockTimeDuration: '15m',
    passwordResetExpiry: 30 * 60 * 1000, // 30 minutes
  },

  // YouTube API Config
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    baseUrl: process.env.YOUTUBE_API_BASE || 'https://www.googleapis.com/youtube/v3',
    timeout: 10000,
  },

  // Worker Config
  worker: {
    interval: parseInt(process.env.WORKER_INTERVAL) || 5 * 60 * 1000, // 5 minutes
    timeout: parseInt(process.env.WORKER_TIMEOUT) || 60000, // 1 minute
    enabled: process.env.WORKER_ENABLED !== 'false',
  },

  // API Config
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    pagination: {
      defaultPage: 1,
      defaultLimit: 10,
      maxLimit: 100,
    },
  },

  // Earnings Config
  earnings: {
    minPayout: 0.01,
    maxPayout: 1000000,
    updateFrequency: 'hourly', // Can be: realtime, hourly, daily, manual
    recalculateOnApproval: true,
  },

  // Notifications Config
  notifications: {
    enabled: true,
    retainDays: 30,
    types: [
      'join_approved',
      'join_rejected',
      'submission_approved',
      'submission_rejected',
      'earnings_updated',
      'campaign_created',
      'new_submission',
      'new_join_request',
    ],
  },

  // Email Config (when implemented)
  email: {
    enabled: process.env.EMAIL_SERVICE !== undefined,
    service: process.env.EMAIL_SERVICE || 'gmail',
    from: process.env.EMAIL_FROM || 'noreply@clippingplatform.com',
    templatesDir: './templates/emails',
  },

  // Campaign Config
  campaign: {
    defaultDuration: 30, // days
    minPayout: 0.01,
    maxPayout: 100,
    minTitle: 3,
    maxTitle: 100,
    minDescription: 10,
    maxDescription: 2000,
  },

  // Submission Config
  submission: {
    statuses: ['pending', 'approved', 'rejected'],
    maxSize: 500 * 1024 * 1024, // 500MB
  },

  // User Config
  user: {
    minNameLength: 2,
    maxNameLength: 100,
    minBioLength: 0,
    maxBioLength: 500,
    roles: ['admin', 'creator', 'clipper'],
  },

  // Feature Flags
  features: {
    emailNotifications: false,
    smsNotifications: false,
    analyticsTracking: true,
    duplicateDetection: true,
    autoEarningsUpdate: true,
    youtubeIntegration: true,
  },

  // Logging Config
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    directory: './logs',
  },

  // CORS Config
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
};

export default config;
