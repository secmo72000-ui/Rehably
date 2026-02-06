import { apiClient } from '@/services/api-client';
import type { PlatformUsersResponse, CreatePlatformUserPayload, CreatePlatformUserResponse } from '@/domains/users/admin-users.types';

export const adminUsersService = {
  getAll: async (): Promise<PlatformUsersResponse> => {
    const response = await apiClient.get<PlatformUsersResponse>('/api/admin/platform-users');
    return response.data;
  },

  create: async (payload: CreatePlatformUserPayload): Promise<CreatePlatformUserResponse> => {
    const response = await apiClient.post<CreatePlatformUserResponse>('/api/admin/platform-users', payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    // Assuming DELETE endpoint follows standard REST convention as it wasn't explicitly provided but "delete" permission exists
    await apiClient.delete(`/api/admin/platform-users/${id}`);
  },

  update: async (id: string, payload: { firstName?: string; lastName?: string; isActive?: boolean }): Promise<CreatePlatformUserResponse> => {
    const response = await apiClient.put<CreatePlatformUserResponse>(`/api/admin/platform-users/${id}`, payload);
    return response.data;
  },

  updateRole: async (id: string, roleId: string): Promise<{ isSuccess: boolean; isFailure: boolean; error: string }> => {
    const response = await apiClient.put<{ isSuccess: boolean; isFailure: boolean; error: string }>(`/api/admin/platform-users/${id}/role`, { roleId });
    return response.data;
  }
};
