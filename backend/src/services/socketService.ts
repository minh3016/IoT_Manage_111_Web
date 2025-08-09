import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { logger, logSecurityEvent } from '@/config/logger';
import { prisma } from '@/config/database';
import { JwtPayload, SocketEvents } from '@/types';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<number, Set<string>> = new Map(); // userId -> Set of socketIds
  private deviceSubscriptions: Map<number, Set<string>> = new Map(); // deviceId -> Set of socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.socketIO.corsOrigin,
        credentials: true,
      },
      pingTimeout: config.socketIO.pingTimeout,
      pingInterval: config.socketIO.pingInterval,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        
        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, username: true, role: true, isActive: true },
        });

        if (!user || !user.isActive) {
          logSecurityEvent('Socket authentication failed - User not found or inactive', decoded.userId, socket.handshake.address);
          return next(new Error('Invalid token or user account is inactive'));
        }

        // Attach user info to socket
        socket.data.user = {
          userId: user.id,
          username: user.username,
          role: user.role,
        };

        next();
      } catch (error) {
        logSecurityEvent('Socket authentication failed - Invalid token', undefined, socket.handshake.address);
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user as JwtPayload;
      
      logger.info('Socket connected', {
        socketId: socket.id,
        userId: user.userId,
        username: user.username,
      });

      // Add user to connected users map
      if (!this.connectedUsers.has(user.userId)) {
        this.connectedUsers.set(user.userId, new Set());
      }
      this.connectedUsers.get(user.userId)!.add(socket.id);

      // Join user to their personal room
      socket.join(`user:${user.userId}`);

      // Handle device subscription
      socket.on('join-device', (deviceId: string) => {
        const deviceIdNum = parseInt(deviceId, 10);
        if (isNaN(deviceIdNum)) return;

        socket.join(`device:${deviceId}`);
        
        // Add to device subscriptions
        if (!this.deviceSubscriptions.has(deviceIdNum)) {
          this.deviceSubscriptions.set(deviceIdNum, new Set());
        }
        this.deviceSubscriptions.get(deviceIdNum)!.add(socket.id);

        logger.debug('User subscribed to device', {
          userId: user.userId,
          deviceId: deviceIdNum,
          socketId: socket.id,
        });
      });

      socket.on('leave-device', (deviceId: string) => {
        const deviceIdNum = parseInt(deviceId, 10);
        if (isNaN(deviceIdNum)) return;

        socket.leave(`device:${deviceId}`);
        
        // Remove from device subscriptions
        const subscribers = this.deviceSubscriptions.get(deviceIdNum);
        if (subscribers) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.deviceSubscriptions.delete(deviceIdNum);
          }
        }

        logger.debug('User unsubscribed from device', {
          userId: user.userId,
          deviceId: deviceIdNum,
          socketId: socket.id,
        });
      });

      // Handle user room subscription
      socket.on('join-user', (userId: string) => {
        const userIdNum = parseInt(userId, 10);
        if (isNaN(userIdNum) || userIdNum !== user.userId) return;

        socket.join(`user:${userId}`);
      });

      socket.on('leave-user', (userId: string) => {
        socket.leave(`user:${userId}`);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info('Socket disconnected', {
          socketId: socket.id,
          userId: user.userId,
          username: user.username,
          reason,
        });

        // Remove from connected users
        const userSockets = this.connectedUsers.get(user.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(user.userId);
          }
        }

        // Remove from all device subscriptions
        for (const [deviceId, subscribers] of this.deviceSubscriptions.entries()) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.deviceSubscriptions.delete(deviceId);
          }
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error('Socket error', {
          socketId: socket.id,
          userId: user.userId,
          error: error.message,
        });
      });
    });
  }

  // Emit device data update to subscribers
  public emitDeviceDataUpdate(deviceId: number, sensorData: any) {
    this.io.to(`device:${deviceId}`).emit('device-data-updated', {
      deviceId,
      sensorData,
    });

    logger.debug('Device data update emitted', {
      deviceId,
      subscriberCount: this.deviceSubscriptions.get(deviceId)?.size || 0,
    });
  }

  // Emit device status change to subscribers
  public emitDeviceStatusChange(deviceId: number, status: string) {
    this.io.to(`device:${deviceId}`).emit('device-status-changed', {
      deviceId,
      status,
    });

    logger.debug('Device status change emitted', {
      deviceId,
      status,
      subscriberCount: this.deviceSubscriptions.get(deviceId)?.size || 0,
    });
  }

  // Emit new alert to device subscribers
  public emitNewAlert(deviceId: number, alert: any) {
    this.io.to(`device:${deviceId}`).emit('new-alert', {
      deviceId,
      alert,
    });

    logger.debug('New alert emitted', {
      deviceId,
      alertId: alert.id,
      subscriberCount: this.deviceSubscriptions.get(deviceId)?.size || 0,
    });
  }

  // Emit activity log to all connected users
  public emitActivityLogged(activity: any) {
    this.io.emit('activity-logged', activity);

    logger.debug('Activity logged emitted', {
      activityId: activity.id,
      connectedUsers: this.connectedUsers.size,
    });
  }

  // Send notification to specific user
  public emitUserNotification(userId: number, message: string, type: string = 'info') {
    this.io.to(`user:${userId}`).emit('user-notification', {
      userId,
      message,
      type,
      timestamp: new Date().toISOString(),
    });

    logger.debug('User notification emitted', {
      userId,
      message,
      type,
    });
  }

  // Broadcast system-wide notification
  public emitSystemNotification(message: string, type: string = 'info') {
    this.io.emit('system-notification', {
      message,
      type,
      timestamp: new Date().toISOString(),
    });

    logger.info('System notification broadcasted', {
      message,
      type,
      connectedUsers: this.connectedUsers.size,
    });
  }

  // Get connection statistics
  public getConnectionStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalConnections: this.io.sockets.sockets.size,
      deviceSubscriptions: Array.from(this.deviceSubscriptions.entries()).map(([deviceId, subscribers]) => ({
        deviceId,
        subscriberCount: subscribers.size,
      })),
    };
  }

  // Get connected users
  public getConnectedUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is connected
  public isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get device subscribers count
  public getDeviceSubscriberCount(deviceId: number): number {
    return this.deviceSubscriptions.get(deviceId)?.size || 0;
  }

  // Disconnect user (admin function)
  public disconnectUser(userId: number, reason: string = 'Disconnected by admin') {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
      
      logSecurityEvent('User disconnected by admin', userId, 'system', { reason });
    }
  }

  // Get Socket.IO instance for external use
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let socketService: SocketService | null = null;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(server);
    logger.info('Socket.IO service initialized');
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call initializeSocketService first.');
  }
  return socketService;
};
