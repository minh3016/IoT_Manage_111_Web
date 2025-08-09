export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Device {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  status: DeviceStatus;
  ownerName: string;
  phoneNumber?: string;
  installationDate: string;
  installationAddress?: string;
  warrantyMonths: number;
  locationLat?: number;
  locationLng?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SensorData {
  id: number;
  deviceId: number;
  tempColdStorage?: number;
  tempEnvironment?: number;
  tempSolution?: number;
  pressureSuction?: number;
  pressureDischarge?: number;
  superheatCurrent?: number;
  voltageA?: number;
  currentA?: number;
  timestamp: Date;
}

export interface Activity {
  id: number;
  userId?: number;
  deviceId?: number;
  action: string;
  type: ActivityType;
  severity: ActivitySeverity;
  details?: string;
  timestamp: Date;
  user?: string;
  device?: string;
}

export interface DeviceStatistics {
  totalDevices: number;
  active: number;
  maintenance: number;
  error: number;
  warrantyActive: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface DeviceFilters {
  search?: string;
  status?: DeviceStatus;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityFilters {
  search?: string;
  severity?: ActivitySeverity;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Enums matching Prisma schema
export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  USER = 'USER'
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR'
}

export enum ActivityType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT',
  ERROR = 'ERROR'
}

export enum ActivitySeverity {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED'
}

// Socket.IO event types
export interface SocketEvents {
  // Client to server
  'join-device': (deviceId: string) => void;
  'leave-device': (deviceId: string) => void;
  'join-user': (userId: string) => void;
  'leave-user': (userId: string) => void;

  // Server to client
  'device-data-updated': (data: { deviceId: number; sensorData: SensorData }) => void;
  'device-status-changed': (data: { deviceId: number; status: DeviceStatus }) => void;
  'new-alert': (data: { deviceId: number; alert: any }) => void;
  'activity-logged': (data: Activity) => void;
  'user-notification': (data: { userId: number; message: string; type: string }) => void;
}

// JWT Payload
export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Request extensions
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface CreateDeviceRequest {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  ownerName: string;
  phoneNumber?: string;
  installationDate: string;
  installationAddress?: string;
  warrantyMonths: number;
  locationLat?: number;
  locationLng?: number;
}

export interface UpdateDeviceRequest extends Partial<CreateDeviceRequest> {
  status?: DeviceStatus;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'password'>> {
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Report types
export interface ReportFilters {
  startDate: string;
  endDate: string;
  deviceIds?: number[];
  reportType: 'temperature' | 'performance' | 'energy' | 'maintenance';
}

export interface ReportData {
  deviceId: number;
  deviceName: string;
  avgTemp?: number;
  minTemp?: number;
  maxTemp?: number;
  uptime?: string;
  alerts?: number;
  energyUsage?: number;
  maintenanceCount?: number;
}

// System health
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  version: string;
  lastBackup?: string;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  databaseStatus: 'connected' | 'disconnected' | 'error';
}
