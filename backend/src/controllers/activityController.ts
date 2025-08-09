import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { AppError, catchAsync, createSuccessResponse } from '@/middleware/errorHandler';
import { ActivityFilters, ActivityType, ActivitySeverity } from '@/types';

// Get all activities with filtering and pagination
export const getActivities = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    severity,
    type,
    startDate,
    endDate,
    page = 1,
    pageSize = 25,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  }: ActivityFilters = req.query;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { action: { contains: search, mode: 'insensitive' } },
      { details: { contains: search, mode: 'insensitive' } },
      { user: { username: { contains: search, mode: 'insensitive' } } },
      { device: { deviceName: { contains: search, mode: 'insensitive' } } },
      { device: { deviceId: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (severity) {
    where.severity = severity;
  }

  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  // Build order by clause
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Get activities with pagination
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: { username: true },
        },
        device: {
          select: { deviceId: true, deviceName: true },
        },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  // Format response
  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    userId: activity.userId,
    deviceId: activity.deviceId,
    action: activity.action,
    type: activity.type,
    severity: activity.severity,
    details: activity.details,
    timestamp: activity.timestamp.toISOString(),
    user: activity.user?.username || 'System',
    device: activity.device ? `${activity.device.deviceName} (${activity.device.deviceId})` : undefined,
  }));

  res.json(createSuccessResponse({
    data: formattedActivities,
    total,
    page,
    pageSize,
  }));
});

// Get activity by ID
export const getActivity = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const activityId = parseInt(id!, 10);

  if (isNaN(activityId)) {
    throw new AppError('Invalid activity ID', 400);
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      user: {
        select: { id: true, username: true, email: true, role: true },
      },
      device: {
        select: { id: true, deviceId: true, deviceName: true, deviceType: true },
      },
    },
  });

  if (!activity) {
    throw new AppError('Activity not found', 404);
  }

  // Format response
  const formattedActivity = {
    ...activity,
    timestamp: activity.timestamp.toISOString(),
  };

  res.json(createSuccessResponse(formattedActivity));
});

// Create activity (internal use - typically called by other controllers)
export const createActivity = async (data: {
  userId?: number;
  deviceId?: number;
  action: string;
  type: ActivityType;
  severity: ActivitySeverity;
  details?: string;
}) => {
  return await prisma.activity.create({
    data,
  });
};

// Get activity statistics
export const getActivityStatistics = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { days = 7 } = req.query;
  const daysNumber = parseInt(days as string, 10);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNumber);

  const [
    totalActivities,
    userActivities,
    systemActivities,
    alertActivities,
    errorActivities,
    successActivities,
    infoActivities,
    warningActivities,
    errorSeverityActivities,
  ] = await Promise.all([
    prisma.activity.count({
      where: { timestamp: { gte: startDate } },
    }),
    prisma.activity.count({
      where: { 
        timestamp: { gte: startDate },
        type: ActivityType.USER,
      },
    }),
    prisma.activity.count({
      where: { 
        timestamp: { gte: startDate },
        type: ActivityType.SYSTEM,
      },
    }),
    prisma.activity.count({
      where: { 
        timestamp: { gte: startDate },
        type: ActivityType.ALERT,
      },
    }),
    prisma.activity.count({
      where: { 
        timestamp: { gte: startDate },
        type: ActivityType.ERROR,
      },
    }),
    prisma.activity.count({
      where: { 
        timestamp: { gte: startDate },
        severity: ActivitySeverity.SUCCESS,
      },
    }),
    prisma.activity.count({
      where: { 
        timestamp: { gte: startDate },
        severity: ActivitySeverity.INFO,
      },
    }),
    prisma.activity.count({
      where: { 
        timestamp: { gte: startDate },
        severity: ActivitySeverity.WARNING,
      },
    }),
    prisma.activity.count({
      where: { 
        timestamp: { gte: startDate },
        severity: ActivitySeverity.ERROR,
      },
    }),
  ]);

  res.json(createSuccessResponse({
    period: `${daysNumber} days`,
    total: totalActivities,
    byType: {
      user: userActivities,
      system: systemActivities,
      alert: alertActivities,
      error: errorActivities,
    },
    bySeverity: {
      success: successActivities,
      info: infoActivities,
      warning: warningActivities,
      error: errorSeverityActivities,
    },
  }));
});

// Get recent activities for dashboard
export const getRecentActivities = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { limit = 10 } = req.query;
  const limitNumber = parseInt(limit as string, 10);

  const activities = await prisma.activity.findMany({
    take: limitNumber,
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: { username: true },
      },
      device: {
        select: { deviceId: true, deviceName: true },
      },
    },
  });

  // Format response
  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    action: activity.action,
    type: activity.type,
    severity: activity.severity,
    details: activity.details,
    timestamp: activity.timestamp.toISOString(),
    user: activity.user?.username || 'System',
    device: activity.device ? `${activity.device.deviceName} (${activity.device.deviceId})` : undefined,
  }));

  res.json(createSuccessResponse(formattedActivities));
});

// Delete old activities (maintenance endpoint - admin only)
export const cleanupOldActivities = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { days = 365 } = req.body; // Default to 1 year
  const daysNumber = parseInt(days, 10);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysNumber);

  const result = await prisma.activity.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
    },
  });

  // Log the cleanup activity
  await prisma.activity.create({
    data: {
      userId: req.user!.userId,
      action: 'Activity cleanup performed',
      type: ActivityType.SYSTEM,
      severity: ActivitySeverity.INFO,
      details: `Cleaned up ${result.count} activities older than ${daysNumber} days`,
    },
  });

  res.json(createSuccessResponse({
    deletedCount: result.count,
    cutoffDate: cutoffDate.toISOString(),
  }, 'Activity cleanup completed successfully'));
});
