import { apiClient } from '@/services/api-client';
import type { PlatformUser, CreatePlatformUserPayload } from './admin-users.types';
import type { ApiResponse } from '@/shared/types/common.types';

export const adminUsersService = {
  getAll: async (): Promise<PlatformUser[]> => {
    const response = await apiClient.get<ApiResponse<PlatformUser[]>>('/api/admin/platform-users');
    return response.data.data;
  },

  create: async (payload: CreatePlatformUserPayload): Promise<PlatformUser> => {
    const response = await apiClient.post<ApiResponse<PlatformUser>>('/api/admin/platform-users', payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/platform-users/${id}`);
  },

  update: async (id: string, payload: { firstName?: string; lastName?: string; isActive?: boolean }): Promise<PlatformUser> => {
    const response = await apiClient.put<ApiResponse<PlatformUser>>(`/api/admin/platform-users/${id}`, payload);
    return response.data.data;
  },

  updateRole: async (id: string, roleId: string): Promise<void> => {
    await apiClient.put(`/api/admin/platform-users/${id}/role`, { roleId });
  }
};
