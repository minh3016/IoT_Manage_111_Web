import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { getSocketService } from '@/services/socketService';
import { DeviceStatus } from '@/types';

export class SensorDataService {
  private simulationInterval: NodeJS.Timeout | null = null;
  private isSimulating = false;

  constructor() {
    // Start sensor data simulation in development mode
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_SENSOR_SIMULATION === 'true') {
      this.startSensorDataSimulation();
    }
  }

  // Create new sensor data entry
  async createSensorData(deviceId: number, data: {
    tempColdStorage?: number;
    tempEnvironment?: number;
    tempSolution?: number;
    pressureSuction?: number;
    pressureDischarge?: number;
    superheatCurrent?: number;
    voltageA?: number;
    currentA?: number;
  }) {
    try {
      // Verify device exists
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
        select: { id: true, deviceName: true, status: true },
      });

      if (!device) {
        throw new Error(`Device with ID ${deviceId} not found`);
      }

      // Create sensor data entry
      const sensorData = await prisma.sensorData.create({
        data: {
          deviceId,
          ...data,
        },
      });

      // Check for alerts based on sensor data
      await this.checkForAlerts(deviceId, sensorData);

      // Emit real-time update via Socket.IO
      try {
        const socketService = getSocketService();
        socketService.emitDeviceDataUpdate(deviceId, sensorData);
      } catch (error) {
        logger.warn('Failed to emit sensor data update', { error: (error as Error).message });
      }

      logger.debug('Sensor data created', {
        deviceId,
        sensorDataId: sensorData.id,
        timestamp: sensorData.timestamp,
      });

      return sensorData;
    } catch (error) {
      logger.error('Failed to create sensor data', { deviceId, error });
      throw error;
    }
  }

  // Get latest sensor data for a device
  async getLatestSensorData(deviceId: number) {
    return await prisma.sensorData.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });
  }

  // Get sensor data history for a device
  async getSensorDataHistory(deviceId: number, options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}) {
    const { startDate, endDate, limit = 100 } = options;

    const where: any = { deviceId };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return await prisma.sensorData.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  // Check for alerts based on sensor data
  private async checkForAlerts(deviceId: number, sensorData: any) {
    try {
      const alerts = [];

      // Temperature alerts
      if (sensorData.tempColdStorage !== null && sensorData.tempColdStorage > 5.0) {
        alerts.push({
          deviceId,
          severity: 'ERROR' as const,
          message: `High cold storage temperature: ${sensorData.tempColdStorage}°C`,
          status: 'ACTIVE' as const,
        });
      }

      if (sensorData.tempEnvironment !== null && sensorData.tempEnvironment > 35.0) {
        alerts.push({
          deviceId,
          severity: 'WARNING' as const,
          message: `High environment temperature: ${sensorData.tempEnvironment}°C`,
          status: 'ACTIVE' as const,
        });
      }

      // Pressure alerts
      if (sensorData.pressureSuction !== null && sensorData.pressureSuction < 1.0) {
        alerts.push({
          deviceId,
          severity: 'WARNING' as const,
          message: `Low suction pressure: ${sensorData.pressureSuction} bar`,
          status: 'ACTIVE' as const,
        });
      }

      if (sensorData.pressureDischarge !== null && sensorData.pressureDischarge > 12.0) {
        alerts.push({
          deviceId,
          severity: 'ERROR' as const,
          message: `High discharge pressure: ${sensorData.pressureDischarge} bar`,
          status: 'ACTIVE' as const,
        });
      }

      // Electrical alerts
      if (sensorData.voltageA !== null && (sensorData.voltageA < 200 || sensorData.voltageA > 240)) {
        alerts.push({
          deviceId,
          severity: 'WARNING' as const,
          message: `Voltage out of range: ${sensorData.voltageA}V`,
          status: 'ACTIVE' as const,
        });
      }

      if (sensorData.currentA !== null && sensorData.currentA > 20.0) {
        alerts.push({
          deviceId,
          severity: 'ERROR' as const,
          message: `High current draw: ${sensorData.currentA}A`,
          status: 'ACTIVE' as const,
        });
      }

      // Create alerts in database
      for (const alertData of alerts) {
        // Check if similar alert already exists and is active
        const existingAlert = await prisma.alert.findFirst({
          where: {
            deviceId,
            message: alertData.message,
            status: 'ACTIVE',
          },
        });

        if (!existingAlert) {
          const alert = await prisma.alert.create({
            data: alertData,
          });

          // Log activity
          await prisma.activity.create({
            data: {
              deviceId,
              action: 'Alert generated',
              type: 'ALERT',
              severity: alertData.severity,
              details: alertData.message,
            },
          });

          // Emit alert via Socket.IO
          try {
            const socketService = getSocketService();
            socketService.emitNewAlert(deviceId, alert);
          } catch (error) {
            logger.warn('Failed to emit alert', { error: (error as Error).message });
          }

          logger.info('Alert created', {
            deviceId,
            alertId: alert.id,
            severity: alert.severity,
            message: alert.message,
          });
        }
      }

      // Update device status based on alerts
      if (alerts.some(alert => alert.severity === 'ERROR')) {
        await this.updateDeviceStatus(deviceId, DeviceStatus.ERROR);
      } else if (alerts.some(alert => alert.severity === 'WARNING')) {
        // Only update to maintenance if not already in error state
        const device = await prisma.device.findUnique({
          where: { id: deviceId },
          select: { status: true },
        });
        
        if (device && device.status !== DeviceStatus.ERROR) {
          await this.updateDeviceStatus(deviceId, DeviceStatus.MAINTENANCE);
        }
      }

    } catch (error) {
      logger.error('Failed to check for alerts', { deviceId, error });
    }
  }

  // Update device status
  private async updateDeviceStatus(deviceId: number, status: DeviceStatus) {
    try {
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
        select: { status: true },
      });

      if (device && device.status !== status) {
        await prisma.device.update({
          where: { id: deviceId },
          data: { status },
        });

        // Log activity
        await prisma.activity.create({
          data: {
            deviceId,
            action: 'Device status changed',
            type: 'SYSTEM',
            severity: status === DeviceStatus.ERROR ? 'ERROR' : 'WARNING',
            details: `Device status changed to ${status}`,
          },
        });

        // Emit status change via Socket.IO
        try {
          const socketService = getSocketService();
          socketService.emitDeviceStatusChange(deviceId, status);
        } catch (error) {
          logger.warn('Failed to emit device status change', { error: (error as Error).message });
        }

        logger.info('Device status updated', { deviceId, status });
      }
    } catch (error) {
      logger.error('Failed to update device status', { deviceId, status, error });
    }
  }

  // Start sensor data simulation (for development/demo)
  startSensorDataSimulation() {
    if (this.isSimulating) {
      logger.warn('Sensor data simulation is already running');
      return;
    }

    this.isSimulating = true;
    logger.info('Starting sensor data simulation');

    this.simulationInterval = setInterval(async () => {
      try {
        // Get all active devices
        const devices = await prisma.device.findMany({
          where: {
            status: {
              in: [DeviceStatus.ACTIVE, DeviceStatus.MAINTENANCE],
            },
          },
          select: { id: true, deviceName: true, status: true },
        });

        // Generate sensor data for each device
        for (const device of devices) {
          const sensorData = this.generateRandomSensorData(device.status as any);
          await this.createSensorData(device.id, sensorData);
        }

      } catch (error) {
        logger.error('Sensor data simulation error', error);
      }
    }, 30000); // Every 30 seconds
  }

  // Stop sensor data simulation
  stopSensorDataSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      this.isSimulating = false;
      logger.info('Sensor data simulation stopped');
    }
  }

  // Generate random sensor data for simulation
  private generateRandomSensorData(deviceStatus: DeviceStatus) {
    const baseTemp = deviceStatus === DeviceStatus.ERROR ? 6.0 : 2.0; // Higher temp for error devices
    const tempVariation = deviceStatus === DeviceStatus.ERROR ? 2.0 : 0.5;

    return {
      tempColdStorage: baseTemp + (Math.random() * tempVariation * 2 - tempVariation),
      tempEnvironment: 25.0 + (Math.random() * 10 - 5),
      tempSolution: 15.0 + (Math.random() * 5 - 2.5),
      pressureSuction: 2.0 + (Math.random() * 1 - 0.5),
      pressureDischarge: 8.0 + (Math.random() * 2 - 1),
      superheatCurrent: 5.0 + (Math.random() * 2 - 1),
      voltageA: 220.0 + (Math.random() * 10 - 5),
      currentA: 12.0 + (Math.random() * 2 - 1),
    };
  }

  // Clean up old sensor data
  async cleanupOldSensorData(retentionDays: number = 90) {
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
      logger.error('Failed to cleanup old sensor data', error);
      throw error;
    }
  }
}

// Singleton instance
let sensorDataService: SensorDataService | null = null;

export const getSensorDataService = (): SensorDataService => {
  if (!sensorDataService) {
    sensorDataService = new SensorDataService();
  }
  return sensorDataService;
};

export const initializeSensorDataService = (): SensorDataService => {
  return getSensorDataService();
};
