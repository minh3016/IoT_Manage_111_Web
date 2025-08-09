import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config, validateConfig } from '@/config';
import { logger, morganStream } from '@/config/logger';
import { checkDatabaseConnection, disconnectDatabase } from '@/config/database';
import { initializeSocketService } from '@/services/socketService';
import {
  globalErrorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
} from '@/middleware/errorHandler';

// Import routes
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/userRoutes';
import deviceRoutes from '@/routes/deviceRoutes';
import activityRoutes from '@/routes/activityRoutes';

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

// Validate configuration
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed', error);
  process.exit(1);
}

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const socketService = initializeSocketService(server);

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.security.helmet.contentSecurityPolicy,
  crossOriginEmbedderPolicy: false, // Disable for Socket.IO compatibility
}));

// CORS middleware
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: morganStream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: config.rateLimit.message,
  },
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await checkDatabaseConnection();
    const socketStats = socketService.getConnectionStats();
    
    const health = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.nodeEnv,
      database: dbConnected ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      socket: {
        connected: socketStats.connectedUsers,
        totalConnections: socketStats.totalConnections,
      },
    };

    res.status(dbConnected ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// API routes
app.use(`${config.server.apiPrefix}/auth`, authRoutes);
app.use(`${config.server.apiPrefix}/users`, userRoutes);
app.use(`${config.server.apiPrefix}/devices`, deviceRoutes);
app.use(`${config.server.apiPrefix}/activities`, activityRoutes);

// Socket.IO connection stats endpoint
app.get(`${config.server.apiPrefix}/socket/stats`, (req, res) => {
  const stats = socketService.getConnectionStats();
  res.json({
    success: true,
    data: stats,
  });
});

// API documentation (if enabled)
if (config.features.enableSwagger) {
  app.get(`${config.server.apiPrefix}/docs`, (req, res) => {
    res.json({
      message: 'API Documentation',
      version: '1.0.0',
      endpoints: {
        auth: `${config.server.apiPrefix}/auth`,
        users: `${config.server.apiPrefix}/users`,
        devices: `${config.server.apiPrefix}/devices`,
        activities: `${config.server.apiPrefix}/activities`,
      },
    });
  });
}

// Development routes (if enabled)
if (config.development.enableDebugRoutes && config.server.nodeEnv === 'development') {
  app.get(`${config.server.apiPrefix}/debug/config`, (req, res) => {
    res.json({
      success: true,
      data: {
        nodeEnv: config.server.nodeEnv,
        port: config.server.port,
        apiPrefix: config.server.apiPrefix,
        features: config.features,
      },
    });
  });

  app.get(`${config.server.apiPrefix}/debug/socket`, (req, res) => {
    const stats = socketService.getConnectionStats();
    res.json({
      success: true,
      data: {
        ...stats,
        connectedUserIds: socketService.getConnectedUsers(),
      },
    });
  });
}

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Start server
const startServer = async () => {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Start HTTP server
    server.listen(config.server.port, config.server.host, () => {
      logger.info(`Server started successfully`, {
        port: config.server.port,
        host: config.server.host,
        environment: config.server.nodeEnv,
        apiPrefix: config.server.apiPrefix,
        pid: process.pid,
      });

      logger.info('Available endpoints:', {
        health: '/health',
        auth: `${config.server.apiPrefix}/auth`,
        users: `${config.server.apiPrefix}/users`,
        devices: `${config.server.apiPrefix}/devices`,
        activities: `${config.server.apiPrefix}/activities`,
        socketStats: `${config.server.apiPrefix}/socket/stats`,
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await disconnectDatabase();
          logger.info('Database disconnected');
        } catch (error) {
          logger.error('Error disconnecting from database', error);
        }

        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export { app, server, socketService };
