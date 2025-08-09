import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    apiPrefix: process.env.API_PREFIX || '/api',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000', 10),
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'cooling-manager-api',
    audience: process.env.JWT_AUDIENCE || 'cooling-manager-app',
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10),
  },

  // Socket.IO configuration
  socketIO: {
    corsOrigin: process.env.SOCKET_IO_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || '60000', 10),
    pingInterval: parseInt(process.env.SOCKET_IO_PING_INTERVAL || '25000', 10),
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  },

  // Email configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@coolingmanager.com',
    templates: {
      path: path.join(__dirname, '../templates/email'),
    },
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'cooling-manager:',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 hour
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret',
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    },
  },

  // Monitoring and health check configuration
  monitoring: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
  },

  // Data retention configuration
  dataRetention: {
    sensorDataDays: parseInt(process.env.SENSOR_DATA_RETENTION_DAYS || '90', 10),
    activityLogDays: parseInt(process.env.ACTIVITY_LOG_RETENTION_DAYS || '365', 10),
    auditLogDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555', 10), // 7 years
  },

  // Feature flags
  features: {
    enableRealTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES !== 'false',
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    enableFileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
  },

  // API versioning
  api: {
    version: process.env.API_VERSION || 'v1',
    deprecationWarnings: process.env.API_DEPRECATION_WARNINGS === 'true',
  },

  // Development configuration
  development: {
    enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
    seedDatabase: process.env.SEED_DATABASE === 'true',
    enableDebugRoutes: process.env.ENABLE_DEBUG_ROUTES === 'true',
  },
};

// Validate configuration
export const validateConfig = () => {
  const errors: string[] = [];

  // Validate port
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push('Invalid port number');
  }

  // Validate JWT secret length
  if (config.jwt.secret.length < 32) {
    errors.push('JWT secret must be at least 32 characters long');
  }

  // Validate database URL format
  if (!config.database.url.startsWith('postgresql://') && !config.database.url.startsWith('file:')) {
    errors.push('Database URL must be a valid PostgreSQL or SQLite connection string');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
};

// Export individual config sections for convenience
export const {
  server,
  database,
  jwt,
  cors,
  rateLimit,
  logging,
  socketIO,
  upload,
  email,
  redis,
  security,
  monitoring,
  dataRetention,
  features,
  api,
  development,
} = config;

export default config;
