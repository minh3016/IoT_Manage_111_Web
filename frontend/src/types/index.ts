// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// User & Auth Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'technician' | 'user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

// Device Types
export interface Device {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType?: string;
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

export type DeviceStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface DeviceStatistics {
  totalDevices: number;
  active: number;
  inactive: number;
  maintenance: number;
  error: number;
  warrantyActive: number;
}

// Sensor Data Types
export interface SensorData {
  id: number;
  deviceId: number;
  timestamp: string;
  tempColdStorage?: number;
  tempEnvironment?: number;
  tempSolution?: number;
  tempCompressorHead?: number;
  tempReturn?: number;
  tempSaturation?: number;
  pressureSuction?: number;
  pressureDischarge?: number;
  superheatCurrent?: number;
  superheatTarget?: number;
  expansionValveRatio?: number;
  eevState?: string;
  gpioStateSystem?: string;
  frzPsModeRun?: boolean;
  frzSystemState?: string;
  voltageA?: number;
  currentA?: number;
  voltageB?: number;
  currentB?: number;
  voltageC?: number;
  currentC?: number;
}

export interface SensorStats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

// GPIO Types
export interface GpioState {
  id: number;
  deviceId: number;
  timestamp: string;
  gpioStateRaw?: string;
  relay1?: boolean;
  relay2?: boolean;
  relay3?: boolean;
  relay4?: boolean;
  alarm1?: boolean;
  alarm2?: boolean;
  alarm3?: boolean;
  alarm4?: boolean;
  fan1?: boolean;
  fan2?: boolean;
  fan3?: boolean;
  fan4?: boolean;
  valve1?: boolean;
  valve2?: boolean;
  valve3?: boolean;
  valve4?: boolean;
}

export interface GpioControlRequest {
  component: 'relay' | 'fan' | 'valve';
  number: 1 | 2 | 3 | 4;
  action: 'on' | 'off' | 'open' | 'close';
}

// Parameter Types
export interface ParameterSetting {
  id: number;
  deviceId: number;
  parameterName: string;
  parameterValue: string;
  unit?: string;
  description?: string;
  updatedAt: string;
  updatedBy: number;
}

// Activity Log Types
export interface ActivityLog {
  id: number;
  userId: number;
  deviceId?: number;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardData {
  statistics: DeviceStatistics;
  recentActivities: ActivityLog[];
  alerts: Alert[];
  systemHealth: SystemHealth;
}

export interface Alert {
  id: number;
  deviceId: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  version: string;
  lastCheck: string;
}

// Export Types
export interface ExportRequest {
  dataType: 'devices' | 'sensors' | 'gpio' | 'activities';
  deviceFilter?: number[];
  range: {
    start: string;
    end: string;
  };
  format: 'csv' | 'excel' | 'json';
}

export interface ExportJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// UI State Types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'vi';
  refreshInterval: number;
  notifications: boolean;
}
