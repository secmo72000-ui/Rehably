import { apiClient } from '@/services/api-client';
import { 
    CreateRolePayload, 
    UpdateRolePayload, 
    RolesResponse, 
    PermissionResponse 
} from '@/domains/roles/roles.types';

export const rolesService = {
    /**
     * Get all platform roles
     */
    getAll: async () => {
        const response = await apiClient.get<RolesResponse>('/api/admin/roles');
        return response.data.value;
    },

    /**
     * Get all available permissions
     * Uses /api/admin/permissions with high pageSize to get all permissions
     */
    getPermissions: async () => {
        const response = await apiClient.get<PermissionResponse>('/api/admin/permissions?page=1&pageSize=1000');
        return response.data.items || [];
    },

    /**
     * Create a new platform role
     */
    create: async (data: CreateRolePayload) => {
        const response = await apiClient.post('/api/admin/roles', data);
        return response.data;
    },

    /**
     * Update an existing role
     */
    update: async (id: string, data: UpdateRolePayload) => {
        const response = await apiClient.put(`/api/admin/roles/${id}`, data);
        return response.data;
    },

    /**
     * Delete a role
     */
    delete: async (id: string) => {
        const response = await apiClient.delete(`/api/admin/roles/${id}`);
        return response.data;
    }
};
