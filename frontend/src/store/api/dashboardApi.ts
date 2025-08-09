import { apiSlice, transformApiResponse } from './apiSlice';
import type { DashboardData } from '@/types';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<DashboardData, void>({
      query: () => '/dashboard',
      transformResponse: transformApiResponse<DashboardData>,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
} = dashboardApi;
