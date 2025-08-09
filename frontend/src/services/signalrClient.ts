import * as signalR from '@microsoft/signalr';
import type { SensorData, GpioState } from '@/types';

export interface SignalREvents {
  DeviceDataUpdated: (deviceId: number, data: SensorData) => void;
  GpioStateUpdated: (deviceId: number, state: GpioState) => void;
  DeviceStatusChanged: (deviceId: number, status: string) => void;
  AlertTriggered: (deviceId: number, alert: any) => void;
}

class SignalRClient {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;

  constructor(private getAccessToken: () => string | null) {}

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(import.meta.env.VITE_SIGNALR_URL || '/hubs/devices', {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
            return Math.min(30000, Math.pow(2, retryContext.previousRetryCount) * 1000);
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      this.connection.onreconnecting(() => {
        console.log('SignalR: Reconnecting...');
      });

      this.connection.onreconnected(() => {
        console.log('SignalR: Reconnected');
        this.reconnectAttempts = 0;
      });

      this.connection.onclose((error) => {
        console.log('SignalR: Connection closed', error);
        this.isConnecting = false;
        
        if (error && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), 5000);
        }
      });

      await this.connection.start();
      console.log('SignalR: Connected');
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('SignalR: Connection failed', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.connect(), 5000);
      }
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  on<K extends keyof SignalREvents>(event: K, handler: SignalREvents[K]): void {
    if (this.connection) {
      this.connection.on(event, handler);
    }
  }

  off<K extends keyof SignalREvents>(event: K, handler?: SignalREvents[K]): void {
    if (this.connection) {
      if (handler) {
        this.connection.off(event, handler);
      } else {
        this.connection.off(event);
      }
    }
  }

  async joinDeviceGroup(deviceId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinDeviceGroup', deviceId);
    }
  }

  async leaveDeviceGroup(deviceId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveDeviceGroup', deviceId);
    }
  }

  get connectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Singleton instance
let signalRClient: SignalRClient | null = null;

export const getSignalRClient = (getAccessToken: () => string | null): SignalRClient => {
  if (!signalRClient) {
    signalRClient = new SignalRClient(getAccessToken);
  }
  return signalRClient;
};

export default SignalRClient;
