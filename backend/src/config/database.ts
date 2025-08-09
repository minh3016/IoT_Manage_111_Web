import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with logging configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
  });
};

// Use global instance in development to prevent multiple connections
const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Set up Prisma event listeners for logging (simplified for compatibility)
// Note: Event listeners removed due to TypeScript compatibility issues

// Database connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error });
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database', { error });
  }
};

// Database transaction helper
export const withTransaction = async <T>(
  callback: (prisma: any) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback);
};

// Database health metrics
export const getDatabaseMetrics = async () => {
  try {
    const [
      userCount,
      deviceCount,
      sensorDataCount,
      activityCount,
      alertCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.device.count(),
      prisma.sensorData.count(),
      prisma.activity.count(),
      prisma.alert.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      users: userCount,
      devices: deviceCount,
      sensorDataPoints: sensorDataCount,
      activities: activityCount,
      activeAlerts: alertCount,
    };
  } catch (error) {
    logger.error('Error fetching database metrics', { error });
    throw error;
  }
};

// Clean up old sensor data (for maintenance)
export const cleanupOldSensorData = async (retentionDays: number = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.sensorData.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    logger.info(`Cleaned up ${result.count} old sensor data records`);
    return result.count;
  } catch (error) {
    logger.error('Error cleaning up old sensor data', { error });
    throw error;
  }
};

export { prisma };
export default prisma;
