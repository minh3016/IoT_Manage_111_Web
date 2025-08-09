import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { AppError, catchAsync, createSuccessResponse } from '@/middleware/errorHandler';
import { DeviceFilters, DeviceStatus, CreateDeviceRequest, UpdateDeviceRequest } from '@/types';

// Get all devices with filtering and pagination
export const getDevices = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    status,
    page = 1,
    pageSize = 25,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }: DeviceFilters = req.query;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { deviceId: { contains: search, mode: 'insensitive' } },
      { deviceName: { contains: search, mode: 'insensitive' } },
      { ownerName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  // Build order by clause
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Get devices with pagination
  const [devices, total] = await Promise.all([
    prisma.device.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        deviceType: true,
        status: true,
        ownerName: true,
        phoneNumber: true,
        installationDate: true,
        installationAddress: true,
        warrantyMonths: true,
        locationLat: true,
        locationLng: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.device.count({ where }),
  ]);

  // Format response
  const formattedDevices = devices.map(device => ({
    ...device,
    installationDate: device.installationDate.toISOString().split('T')[0],
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
  }));

  res.json(createSuccessResponse({
    data: formattedDevices,
    total,
    page,
    pageSize,
  }));
});

// Get device statistics for dashboard
export const getDeviceStatistics = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const [
    totalDevices,
    activeDevices,
    maintenanceDevices,
    errorDevices,
    warrantyActiveDevices,
  ] = await Promise.all([
    prisma.device.count(),
    prisma.device.count({ where: { status: DeviceStatus.ACTIVE } }),
    prisma.device.count({ where: { status: DeviceStatus.MAINTENANCE } }),
    prisma.device.count({ where: { status: DeviceStatus.ERROR } }),
    prisma.device.count({
      where: {
        installationDate: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        },
      },
    }),
  ]);

  res.json(createSuccessResponse({
    totalDevices,
    active: activeDevices,
    maintenance: maintenanceDevices,
    error: errorDevices,
    warrantyActive: warrantyActiveDevices,
  }));
});

// Get single device by ID
export const getDevice = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deviceId = parseInt(id!, 10);

  if (isNaN(deviceId)) {
    throw new AppError('Invalid device ID', 400);
  }

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      sensorData: {
        orderBy: { timestamp: 'desc' },
        take: 1, // Get latest sensor data
      },
      parameters: true,
      activities: {
        orderBy: { timestamp: 'desc' },
        take: 10, // Get latest 10 activities
        include: {
          user: {
            select: { username: true },
          },
        },
      },
      alerts: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!device) {
    throw new AppError('Device not found', 404);
  }

  // Format response
  const formattedDevice = {
    ...device,
    installationDate: device.installationDate.toISOString().split('T')[0],
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
    sensorData: device.sensorData.map(data => ({
      ...data,
      timestamp: data.timestamp.toISOString(),
    })),
    activities: device.activities.map(activity => ({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
      user: activity.user?.username || 'System',
    })),
    alerts: device.alerts.map(alert => ({
      ...alert,
      createdAt: alert.createdAt.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
    })),
  };

  res.json(createSuccessResponse(formattedDevice));
});

// Create new device
export const createDevice = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const deviceData: CreateDeviceRequest = req.body;
  const userId = req.user!.userId;

  // Check if device ID already exists
  const existingDevice = await prisma.device.findUnique({
    where: { deviceId: deviceData.deviceId },
  });

  if (existingDevice) {
    throw new AppError('Device ID already exists', 409);
  }

  // Create device
  const device = await prisma.device.create({
    data: {
      ...deviceData,
      installationDate: new Date(deviceData.installationDate),
      status: DeviceStatus.INACTIVE, // Default status
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId,
      deviceId: device.id,
      action: 'Device created',
      type: 'USER',
      severity: 'INFO',
      details: `Device ${device.deviceName} (${device.deviceId}) was created`,
    },
  });

  logger.info('Device created', { deviceId: device.id, userId });

  // Format response
  const formattedDevice = {
    ...device,
    installationDate: device.installationDate.toISOString().split('T')[0],
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
  };

  res.status(201).json(createSuccessResponse(formattedDevice, 'Device created successfully'));
});

// Update device
export const updateDevice = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deviceId = parseInt(id!, 10);
  const updateData: UpdateDeviceRequest = req.body;
  const userId = req.user!.userId;

  if (isNaN(deviceId)) {
    throw new AppError('Invalid device ID', 400);
  }

  // Check if device exists
  const existingDevice = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!existingDevice) {
    throw new AppError('Device not found', 404);
  }

  // Check if new device ID already exists (if being updated)
  if (updateData.deviceId && updateData.deviceId !== existingDevice.deviceId) {
    const deviceWithSameId = await prisma.device.findUnique({
      where: { deviceId: updateData.deviceId },
    });

    if (deviceWithSameId) {
      throw new AppError('Device ID already exists', 409);
    }
  }

  // Prepare update data
  const updatePayload: any = { ...updateData };
  if (updateData.installationDate) {
    updatePayload.installationDate = new Date(updateData.installationDate);
  }

  // Update device
  const device = await prisma.device.update({
    where: { id: deviceId },
    data: updatePayload,
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId,
      deviceId: device.id,
      action: 'Device updated',
      type: 'USER',
      severity: 'INFO',
      details: `Device ${device.deviceName} (${device.deviceId}) was updated`,
    },
  });

  logger.info('Device updated', { deviceId: device.id, userId });

  // Format response
  const formattedDevice = {
    ...device,
    installationDate: device.installationDate.toISOString().split('T')[0],
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
  };

  res.json(createSuccessResponse(formattedDevice, 'Device updated successfully'));
});

// Delete device
export const deleteDevice = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deviceId = parseInt(id!, 10);
  const userId = req.user!.userId;

  if (isNaN(deviceId)) {
    throw new AppError('Invalid device ID', 400);
  }

  // Check if device exists
  const existingDevice = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!existingDevice) {
    throw new AppError('Device not found', 404);
  }

  // Delete device (cascade will handle related records)
  await prisma.device.delete({
    where: { id: deviceId },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId,
      action: 'Device deleted',
      type: 'USER',
      severity: 'WARNING',
      details: `Device ${existingDevice.deviceName} (${existingDevice.deviceId}) was deleted`,
    },
  });

  logger.info('Device deleted', { deviceId, userId });

  res.json(createSuccessResponse(null, 'Device deleted successfully'));
});

// Get device sensor data
export const getDeviceSensorData = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deviceId = parseInt(id!, 10);
  const { limit = 100, startDate, endDate } = req.query;

  if (isNaN(deviceId)) {
    throw new AppError('Invalid device ID', 400);
  }

  // Check if device exists
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { id: true },
  });

  if (!device) {
    throw new AppError('Device not found', 404);
  }

  // Build where clause for date filtering
  const where: any = { deviceId };
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate as string);
    if (endDate) where.timestamp.lte = new Date(endDate as string);
  }

  // Get sensor data
  const sensorData = await prisma.sensorData.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: parseInt(limit as string, 10),
  });

  // Format response
  const formattedData = sensorData.map(data => ({
    ...data,
    timestamp: data.timestamp.toISOString(),
  }));

  res.json(createSuccessResponse(formattedData));
});
