import { apiClient } from '@/services/api-client';
import { 
    CreateUserPayload, 
    UpdateUserPayload, 
    PlatformUsersResponse, 
    UserResponse 
} from '@/domains/users/users.types';

export const usersService = {
    /**
     * Get all platform users
     */
    getAll: async () => {
        const response = await apiClient.get<PlatformUsersResponse>('/api/admin/platform-users');
        return response.data.data;
    },

    /**
     * Create a new platform user
     */
    create: async (data: CreateUserPayload) => {
        const response = await apiClient.post<UserResponse>('/api/admin/platform-users', data);
        return response.data.data;
    },

    /**
     * Update an existing user
     */
    update: async (id: string, data: UpdateUserPayload) => {
        const response = await apiClient.put<UserResponse>(`/api/admin/platform-users/${id}`, data);
        return response.data.data;
    },

    /**
     * Change user role
     */
    changeRole: async (id: string, roleId: string) => {
        const response = await apiClient.put<UserResponse>(`/api/admin/platform-users/${id}/role`, { roleId });
        return response.data.data;
    },

    /**
     * Delete/Deactivate a user
     */
    delete: async (id: string) => {
        await apiClient.delete(`/api/admin/platform-users/${id}`);
    }
};
