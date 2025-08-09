import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config';
import { logger } from '@/config/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin', config.security.bcryptRounds);
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@coolingmanager.com',
        password: adminPassword,
        role: 'ADMIN',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+84901234567',
        isActive: true,
      },
    });
    logger.info('Admin user created/updated', { userId: admin.id });

    // Create technician user
    const techPassword = await bcrypt.hash('tech123', config.security.bcryptRounds);
    const technician = await prisma.user.upsert({
      where: { username: 'tech1' },
      update: {},
      create: {
        username: 'tech1',
        email: 'tech1@coolingmanager.com',
        password: techPassword,
        role: 'TECHNICIAN',
        firstName: 'John',
        lastName: 'Technician',
        phone: '+84907654321',
        isActive: true,
      },
    });
    logger.info('Technician user created/updated', { userId: technician.id });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', config.security.bcryptRounds);
    const user = await prisma.user.upsert({
      where: { username: 'user1' },
      update: {},
      create: {
        username: 'user1',
        email: 'user1@coolingmanager.com',
        password: userPassword,
        role: 'USER',
        firstName: 'Jane',
        lastName: 'User',
        phone: '+84912345678',
        isActive: true,
      },
    });
    logger.info('Regular user created/updated', { userId: user.id });

    // Create sample devices
    const devices = [
      {
        deviceId: 'CM001',
        deviceName: 'Cooling Unit Alpha',
        deviceType: 'Industrial Cooler',
        status: 'ACTIVE' as any,
        ownerName: 'Nguyen Van A',
        phoneNumber: '+84901234567',
        installationDate: new Date('2023-01-15'),
        installationAddress: '123 Le Loi St, District 1, Ho Chi Minh City',
        warrantyMonths: 24,
        locationLat: 10.7769,
        locationLng: 106.7009,
      },
      {
        deviceId: 'CM002',
        deviceName: 'Cooling Unit Beta',
        deviceType: 'Commercial Cooler',
        status: 'MAINTENANCE' as any,
        ownerName: 'Tran Thi B',
        phoneNumber: '+84907654321',
        installationDate: new Date('2023-03-20'),
        installationAddress: '456 Nguyen Hue Blvd, District 1, Ho Chi Minh City',
        warrantyMonths: 12,
        locationLat: 10.7740,
        locationLng: 106.7021,
      },
      {
        deviceId: 'CM003',
        deviceName: 'Cooling Unit Gamma',
        deviceType: 'Residential Cooler',
        status: 'ERROR' as any,
        ownerName: 'Le Van C',
        phoneNumber: '+84912345678',
        installationDate: new Date('2023-06-10'),
        installationAddress: '789 Dong Khoi St, District 1, Ho Chi Minh City',
        warrantyMonths: 18,
        locationLat: 10.7700,
        locationLng: 106.7050,
      },
      {
        deviceId: 'CM004',
        deviceName: 'Cooling Unit Delta',
        deviceType: 'Industrial Cooler',
        status: 'ACTIVE' as any,
        ownerName: 'Pham Thi D',
        phoneNumber: '+84923456789',
        installationDate: new Date('2023-08-05'),
        installationAddress: '321 Hai Ba Trung St, District 3, Ho Chi Minh City',
        warrantyMonths: 36,
        locationLat: 10.7850,
        locationLng: 106.6950,
      },
      {
        deviceId: 'CM005',
        deviceName: 'Cooling Unit Epsilon',
        deviceType: 'Commercial Cooler',
        status: 'INACTIVE' as any,
        ownerName: 'Hoang Van E',
        phoneNumber: '+84934567890',
        installationDate: new Date('2023-10-12'),
        installationAddress: '654 Vo Van Tan St, District 3, Ho Chi Minh City',
        warrantyMonths: 24,
        locationLat: 10.7800,
        locationLng: 106.6900,
      },
    ];

    for (const deviceData of devices) {
      const device = await prisma.device.upsert({
        where: { deviceId: deviceData.deviceId },
        update: {},
        create: deviceData,
      });
      logger.info('Device created/updated', { deviceId: device.id, deviceName: device.deviceName });

      // Create sample sensor data for each device
      const sensorDataEntries = [];
      const now = new Date();
      
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Every hour for last 100 hours
        
        sensorDataEntries.push({
          deviceId: device.id,
          tempColdStorage: 2.0 + Math.random() * 2 - 1, // 1.0 to 3.0
          tempEnvironment: 25.0 + Math.random() * 10 - 5, // 20.0 to 30.0
          tempSolution: 15.0 + Math.random() * 5 - 2.5, // 12.5 to 17.5
          pressureSuction: 2.0 + Math.random() * 1 - 0.5, // 1.5 to 2.5
          pressureDischarge: 8.0 + Math.random() * 2 - 1, // 7.0 to 9.0
          superheatCurrent: 5.0 + Math.random() * 2 - 1, // 4.0 to 6.0
          voltageA: 220.0 + Math.random() * 10 - 5, // 215.0 to 225.0
          currentA: 12.0 + Math.random() * 2 - 1, // 11.0 to 13.0
          timestamp,
        });
      }

      await prisma.sensorData.createMany({
        data: sensorDataEntries,
        skipDuplicates: true,
      });

      // Create sample device parameters
      const parameters = [
        {
          deviceId: device.id,
          name: 'Target Temperature',
          value: '2.0',
          unit: '°C',
          description: 'Cold storage target temperature',
        },
        {
          deviceId: device.id,
          name: 'Compressor Delay',
          value: '300',
          unit: 'seconds',
          description: 'Delay before compressor restart',
        },
        {
          deviceId: device.id,
          name: 'Defrost Interval',
          value: '6',
          unit: 'hours',
          description: 'Time between defrost cycles',
        },
        {
          deviceId: device.id,
          name: 'Alarm Threshold',
          value: '5.0',
          unit: '°C',
          description: 'Temperature alarm threshold',
        },
      ];

      for (const paramData of parameters) {
        const existingParam = await prisma.deviceParameter.findFirst({
          where: {
            deviceId: device.id,
            name: paramData.name,
          },
        });

        if (!existingParam) {
          await prisma.deviceParameter.create({
            data: paramData,
          });
        }
      }

      // Create sample alerts for devices with issues
      if (device.status === 'ERROR' || device.status === 'MAINTENANCE') {
        await prisma.alert.create({
          data: {
            deviceId: device.id,
            severity: device.status === 'ERROR' ? 'ERROR' : 'WARNING',
            message: device.status === 'ERROR' 
              ? 'High temperature detected - system requires attention'
              : 'Scheduled maintenance required',
            status: 'ACTIVE',
          },
        });
      }
    }

    // Create sample activities
    const activities = [
      {
        userId: admin.id,
        action: 'System initialized',
        type: 'SYSTEM' as any,
        severity: 'INFO' as any,
        details: 'Cooling Manager system has been initialized with sample data',
      },
      {
        userId: technician.id,
        deviceId: 1,
        action: 'Device maintenance completed',
        type: 'USER' as any,
        severity: 'SUCCESS' as any,
        details: 'Routine maintenance completed successfully',
      },
      {
        userId: null,
        deviceId: 3,
        action: 'Temperature alarm triggered',
        type: 'ALERT' as any,
        severity: 'ERROR' as any,
        details: 'Cold storage temperature exceeded threshold (4.2°C)',
      },
      {
        userId: admin.id,
        action: 'User account created',
        type: 'USER' as any,
        severity: 'INFO' as any,
        details: 'New user account created for technician',
      },
      {
        userId: null,
        deviceId: 2,
        action: 'Defrost cycle completed',
        type: 'SYSTEM' as any,
        severity: 'INFO' as any,
        details: 'Automatic defrost cycle completed successfully',
      },
    ];

    for (const activityData of activities) {
      await prisma.activity.create({
        data: activityData,
      });
    }

    // Create system settings
    const systemSettings = [
      {
        key: 'system_name',
        value: 'Cooling Manager',
        category: 'general',
        description: 'System display name',
      },
      {
        key: 'default_language',
        value: 'en',
        category: 'localization',
        description: 'Default system language',
      },
      {
        key: 'sensor_data_retention_days',
        value: '90',
        category: 'data_retention',
        description: 'Number of days to retain sensor data',
      },
      {
        key: 'alert_email_enabled',
        value: 'true',
        category: 'notifications',
        description: 'Enable email notifications for alerts',
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        category: 'system',
        description: 'System maintenance mode status',
      },
    ];

    for (const settingData of systemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: settingData.key },
        update: {},
        create: settingData,
      });
    }

    logger.info('Database seeding completed successfully');

  } catch (error) {
    logger.error('Database seeding failed', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
