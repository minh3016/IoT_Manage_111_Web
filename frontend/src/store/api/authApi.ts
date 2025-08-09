import { apiSlice } from './apiSlice';
import type { LoginRequest, LoginResponse, User } from '@/types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async (credentials) => {
        // Mock authentication for development
        await new Promise(resolve => setTimeout(resolve, 300)); // Fast response for development

        const validCredentials = [
          { username: 'admin', password: 'admin', role: 'admin' as const },
          { username: 'tech', password: 'tech', role: 'technician' as const },
          { username: 'user', password: 'user', role: 'user' as const },
        ];

        const user = validCredentials.find(
          cred => cred.username === credentials.username && cred.password === credentials.password
        );

        if (!user) {
          return {
            error: {
              status: 400,
              data: {
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid username or password'
              }
            }
          };
        }

        const mockResponse: LoginResponse = {
          token: `mock-jwt-token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          user: {
            id: 1,
            username: user.username,
            email: `${user.username}@coolingmanager.com`,
            role: user.role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        };

        return { data: mockResponse };
      },
    }),
    
    refresh: builder.mutation<LoginResponse, void>({
      queryFn: async () => {
        // Mock refresh token
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          error: {
            status: 401,
            data: { success: false, error: 'TOKEN_EXPIRED', message: 'Please login again' }
          }
        };
      },
    }),

    logout: builder.mutation<void, void>({
      queryFn: async () => {
        // Mock logout - fast response
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: undefined };
      },
      invalidatesTags: ['Device', 'SensorData', 'Dashboard'], // Clear all cached data on logout
    }),

    validateToken: builder.query<{ valid: boolean; user: User }, void>({
      queryFn: async () => {
        // Mock token validation - always return invalid for now
        return {
          data: {
            valid: false,
            user: {} as User
          }
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useValidateTokenQuery,
} = authApi;
