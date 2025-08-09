import { apiSlice, transformApiResponse } from './apiSlice';
import type { SensorData, SensorStats, PaginatedResponse } from '@/types';

interface SensorDataFilters {
  start?: string;
  end?: string;
  page?: number;
  pageSize?: number;
}

export const sensorsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceSensorData: builder.query<PaginatedResponse<SensorData>, { deviceId: number } & SensorDataFilters>({
      query: ({ deviceId, ...filters }) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
        return `/devices/${deviceId}/data?${params.toString()}`;
      },
      transformResponse: transformApiResponse<PaginatedResponse<SensorData>>,
      providesTags: (_result, _error, { deviceId }) => [
        { type: 'SensorData', id: deviceId },
        'SensorData',
      ],
    }),
    
    getLatestSensorData: builder.query<SensorData, number>({
      query: (deviceId) => `/devices/${deviceId}/data/latest`,
      transformResponse: transformApiResponse<SensorData>,
      providesTags: (_result, _error, deviceId) => [
        { type: 'SensorData', id: `${deviceId}-latest` },
      ],
    }),
    
    createSensorData: builder.mutation<SensorData, { deviceId: number; data: Partial<SensorData> }>({
      query: ({ deviceId, data }) => ({
        url: `/devices/${deviceId}/data`,
        method: 'POST',
        body: data,
      }),
      transformResponse: transformApiResponse<SensorData>,
      invalidatesTags: (_result, _error, { deviceId }) => [
        { type: 'SensorData', id: deviceId },
        { type: 'SensorData', id: `${deviceId}-latest` },
        'SensorData',
      ],
    }),
    
    getSensorDataStats: builder.query<SensorStats, { deviceId: number; start?: string; end?: string }>({
      query: ({ deviceId, start, end }) => {
        const params = new URLSearchParams();
        if (start) params.append('start', start);
        if (end) params.append('end', end);
        return `/devices/${deviceId}/data/stats?${params.toString()}`;
      },
      transformResponse: transformApiResponse<SensorStats>,
      providesTags: (_result, _error, { deviceId }) => [
        { type: 'SensorData', id: `${deviceId}-stats` },
      ],
    }),
  }),
});

export const {
  useGetDeviceSensorDataQuery,
  useGetLatestSensorDataQuery,
  useCreateSensorDataMutation,
  useGetSensorDataStatsQuery,
} = sensorsApi;
