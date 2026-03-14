import { apiClient } from '@/services/api-client';
import type { ApiResponse } from '@/shared/types/common.types';
import {
    CreateUserPayload,
    UpdateUserPayload,
    PlatformUser
} from './users.types';

export const usersService = {
    /**
     * Get all platform users
     */
    getAll: async (): Promise<PlatformUser[]> => {
        const response = await apiClient.get<ApiResponse<PlatformUser[]>>('/api/admin/platform-users');
        return response.data.data;
    },

    /**
     * Create a new platform user
     */
    create: async (data: CreateUserPayload): Promise<PlatformUser> => {
        const response = await apiClient.post<ApiResponse<PlatformUser>>('/api/admin/platform-users', data);
        return response.data.data;
    },

    /**
     * Update an existing user
     */
    update: async (id: string, data: UpdateUserPayload): Promise<PlatformUser> => {
        const response = await apiClient.put<ApiResponse<PlatformUser>>(`/api/admin/platform-users/${id}`, data);
        return response.data.data;
    },

    /**
     * Change user role
     */
    changeRole: async (id: string, roleId: string): Promise<PlatformUser> => {
        const response = await apiClient.put<ApiResponse<PlatformUser>>(`/api/admin/platform-users/${id}/role`, { roleId });
        return response.data.data;
    },

    /**
     * Delete/Deactivate a user
     */
    delete: async (id: string) => {
        await apiClient.delete(`/api/admin/platform-users/${id}`);
    }
};
