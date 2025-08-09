import { apiSlice, transformApiResponse } from './apiSlice';
import type { Device, DeviceStatistics, PaginatedResponse } from '@/types';

interface DeviceFilters {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  fields?: string;
}

export const devicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDevices: builder.query<PaginatedResponse<Device>, DeviceFilters>({
      queryFn: async (filters = {}) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const mockDevices: Device[] = [
          {
            id: 1,
            deviceId: 'CM001',
            deviceName: 'Cooling Unit Alpha',
            deviceType: 'Industrial Cooler',
            status: 'active',
            ownerName: 'Nguyen Van A',
            phoneNumber: '0901234567',
            installationDate: '2023-01-15',
            installationAddress: '123 Le Loi St, District 1, Ho Chi Minh City',
            warrantyMonths: 24,
            locationLat: 10.7769,
            locationLng: 106.7009,
            createdAt: '2023-01-15T08:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
          {
            id: 2,
            deviceId: 'CM002',
            deviceName: 'Cooling Unit Beta',
            deviceType: 'Commercial Cooler',
            status: 'maintenance',
            ownerName: 'Tran Thi B',
            phoneNumber: '0907654321',
            installationDate: '2023-03-20',
            installationAddress: '456 Nguyen Hue Blvd, District 1, Ho Chi Minh City',
            warrantyMonths: 12,
            locationLat: 10.7740,
            locationLng: 106.7021,
            createdAt: '2023-03-20T09:15:00Z',
            updatedAt: '2024-01-10T14:20:00Z',
          },
          {
            id: 3,
            deviceId: 'CM003',
            deviceName: 'Cooling Unit Gamma',
            deviceType: 'Residential Cooler',
            status: 'error',
            ownerName: 'Le Van C',
            phoneNumber: '0912345678',
            installationDate: '2023-06-10',
            installationAddress: '789 Dong Khoi St, District 1, Ho Chi Minh City',
            warrantyMonths: 18,
            locationLat: 10.7700,
            locationLng: 106.7050,
            createdAt: '2023-06-10T11:30:00Z',
            updatedAt: '2024-01-12T16:45:00Z',
          },
          {
            id: 4,
            deviceId: 'CM004',
            deviceName: 'Cooling Unit Delta',
            deviceType: 'Industrial Cooler',
            status: 'active',
            ownerName: 'Pham Thi D',
            phoneNumber: '0923456789',
            installationDate: '2023-08-05',
            installationAddress: '321 Hai Ba Trung St, District 3, Ho Chi Minh City',
            warrantyMonths: 36,
            locationLat: 10.7850,
            locationLng: 106.6950,
            createdAt: '2023-08-05T13:45:00Z',
            updatedAt: '2024-01-08T09:10:00Z',
          },
          {
            id: 5,
            deviceId: 'CM005',
            deviceName: 'Cooling Unit Epsilon',
            deviceType: 'Commercial Cooler',
            status: 'inactive',
            ownerName: 'Hoang Van E',
            phoneNumber: '0934567890',
            installationDate: '2023-10-12',
            installationAddress: '654 Vo Van Tan St, District 3, Ho Chi Minh City',
            warrantyMonths: 24,
            locationLat: 10.7800,
            locationLng: 106.6900,
            createdAt: '2023-10-12T15:20:00Z',
            updatedAt: '2024-01-05T12:30:00Z',
          },
        ];

        // Apply filters
        let filteredDevices = mockDevices;

        if (filters.search) {
          const search = filters.search.toLowerCase();
          filteredDevices = filteredDevices.filter(device =>
            device.deviceName.toLowerCase().includes(search) ||
            device.deviceId.toLowerCase().includes(search) ||
            device.ownerName.toLowerCase().includes(search)
          );
        }

        if (filters.status) {
          filteredDevices = filteredDevices.filter(device => device.status === filters.status);
        }

        const page = filters.page || 1;
        const pageSize = filters.pageSize || 25;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        return {
          data: {
            data: filteredDevices.slice(start, end),
            total: filteredDevices.length,
            page,
            pageSize,
          }
        };
      },
      providesTags: ['Device'],
    }),
    
    getDevice: builder.query<Device, { id: number; fields?: string }>({
      queryFn: async ({ id }) => {
        await new Promise(resolve => setTimeout(resolve, 200));

        const mockDevice: Device = {
          id,
          deviceId: `CM00${id}`,
          deviceName: `Cooling Unit ${String.fromCharCode(64 + id)}`,
          deviceType: 'Industrial Cooler',
          status: id === 3 ? 'error' : id === 2 ? 'maintenance' : 'active',
          ownerName: `Owner ${id}`,
          phoneNumber: `090123456${id}`,
          installationDate: '2023-01-15',
          installationAddress: `${100 + id * 100} Test Street, District ${id}, Ho Chi Minh City`,
          warrantyMonths: 24,
          locationLat: 10.7769 + (id * 0.01),
          locationLng: 106.7009 + (id * 0.01),
          createdAt: '2023-01-15T08:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        };

        return { data: mockDevice };
      },
      providesTags: (_result, _error, { id }) => [{ type: 'Device', id }],
    }),
    
    createDevice: builder.mutation<Device, Partial<Device>>({
      query: (device) => ({
        url: '/devices',
        method: 'POST',
        body: device,
      }),
      transformResponse: transformApiResponse<Device>,
      invalidatesTags: ['Device'],
    }),
    
    updateDevice: builder.mutation<Device, { id: number; device: Partial<Device> }>({
      query: ({ id, device }) => ({
        url: `/devices/${id}`,
        method: 'PUT',
        body: device,
      }),
      transformResponse: transformApiResponse<Device>,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Device', id }, 'Device'],
    }),
    
    deleteDevice: builder.mutation<void, number>({
      query: (id) => ({
        url: `/devices/${id}`,
        method: 'DELETE',
      }),
      transformResponse: transformApiResponse<void>,
      invalidatesTags: ['Device'],
    }),
    
    getDeviceStatistics: builder.query<DeviceStatistics, void>({
      queryFn: async () => {
        // Mock device statistics with fast response
        await new Promise(resolve => setTimeout(resolve, 200));

        const mockStats: DeviceStatistics = {
          totalDevices: 12,
          active: 8,
          inactive: 2,
          maintenance: 1,
          error: 1,
          warrantyActive: 10
        };

        return { data: mockStats };
      },
      providesTags: ['Device'],
    }),
    
    deviceHeartbeat: builder.mutation<void, number>({
      query: (id) => ({
        url: `/devices/${id}/heartbeat`,
        method: 'POST',
      }),
      transformResponse: transformApiResponse<void>,
    }),
  }),
});

export const {
  useGetDevicesQuery,
  useGetDeviceQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
  useGetDeviceStatisticsQuery,
  useDeviceHeartbeatMutation,
} = devicesApi;
