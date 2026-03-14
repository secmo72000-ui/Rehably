import { create } from 'zustand';
import { rolesService } from './roles.service';
import { Role, Permission, PlatformPermissionMatrix, CreateRolePayload, UpdateRolePayload } from './roles.types';

interface RolesState {
    roles: Role[];
    permissions: Permission[];
    platformPermissions: PlatformPermissionMatrix | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchRoles: () => Promise<void>;
    fetchPermissions: () => Promise<void>;
    fetchPlatformPermissions: () => Promise<void>;
    createRole: (data: CreateRolePayload) => Promise<void>;
    updateRole: (id: string, data: UpdateRolePayload) => Promise<void>;
    deleteRole: (id: string) => Promise<void>;
}

export const useRolesStore = create<RolesState>((set, get) => ({
    roles: [],
    permissions: [],
    platformPermissions: null,
    isLoading: false,
    error: null,

    fetchRoles: async () => {
        set({ isLoading: true, error: null });
        try {
            const roles = await rolesService.getAll();
            set({ roles, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch roles' });
        }
    },

    fetchPermissions: async () => {
        // Don't refetch if already loaded
        if (get().permissions.length > 0) return;

        set({ isLoading: true, error: null });
        try {
            const permissions = await rolesService.getPermissions();
            set({ permissions, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch permissions' });
        }
    },

    fetchPlatformPermissions: async () => {
        if (get().platformPermissions) return;

        set({ isLoading: true, error: null });
        try {
            const matrix = await rolesService.getPlatformPermissions();
            set({ platformPermissions: matrix, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch platform permissions' });
        }
    },

    createRole: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await rolesService.create(data);
            await get().fetchRoles(); // Refresh list
            set({ isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to create role' });
            throw error;
        }
    },

    updateRole: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await rolesService.update(id, data);
            await get().fetchRoles();
            set({ isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to update role' });
            throw error;
        }
    },

    deleteRole: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await rolesService.delete(id);
            set(state => ({
                roles: state.roles.filter(r => r.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to delete role' });
            throw error;
        }
    }
}));
