import { apiClient } from '@/services/api-client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';
import {
    CreateRolePayload,
    UpdateRolePayload,
    Role,
    Permission,
    PlatformPermissionMatrix
} from './roles.types';

export const rolesService = {
    /**
     * Get all platform roles
     */
    getAll: async (): Promise<Role[]> => {
        const response = await apiClient.get<ApiResponse<Role[]>>('/api/admin/roles');
        return response.data.data;
    },

    /**
     * Get all available permissions (generic endpoint)
     */
    getPermissions: async (): Promise<Permission[]> => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Permission>>>('/api/admin/permissions?page=1&pageSize=1000');
        return response.data.data.items || [];
    },

    /**
     * Get platform permission matrix (structured with localized names)
     */
    getPlatformPermissions: async (): Promise<PlatformPermissionMatrix> => {
        const response = await apiClient.get<ApiResponse<PlatformPermissionMatrix>>('/api/admin/permissions/platform');
        return response.data.data;
    },

    /**
     * Create a new platform role
     */
    create: async (data: CreateRolePayload) => {
        const response = await apiClient.post<ApiResponse<Role>>('/api/admin/roles', data);
        return response.data.data;
    },

    /**
     * Update an existing role
     */
    update: async (id: string, data: UpdateRolePayload) => {
        const response = await apiClient.put<ApiResponse<Role>>(`/api/admin/roles/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete a role
     */
    delete: async (id: string) => {
        await apiClient.delete(`/api/admin/roles/${id}`);
    }
};
