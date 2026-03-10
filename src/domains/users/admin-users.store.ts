import { create } from 'zustand';
import { adminUsersService } from './admin-users.service';
import type { PlatformUser } from './admin-users.types';
import { rolesService } from '@/domains/roles/roles.service';
import type { Role } from '@/domains/roles/roles.types';

interface AdminUsersState {
  users: PlatformUser[];
  roles: Role[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  createUser: (payload: { email: string; firstName: string; lastName: string; roleId: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, payload: { firstName?: string; lastName?: string; isActive?: boolean }) => Promise<void>;
  updateUserRole: (id: string, roleId: string) => Promise<void>;
}

export const useAdminUsersStore = create<AdminUsersState>((set, get) => ({
  users: [],
  roles: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminUsersService.getAll();
      set({ users: response.value || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch users', isLoading: false });
    }
  },

  fetchRoles: async () => {
      // We need roles for the dropdown in the Add User form
      try {
          const roles = await rolesService.getAll();
          set({ roles: roles || [] });
      } catch (error) {
          console.error("Failed to fetch roles for users page", error);
      }
  },

  createUser: async (payload) => {
    set({ isCreating: true, error: null });
    try {
      await adminUsersService.create(payload);
      await get().fetchUsers(); // Refresh list
    } catch (error: any) {
      set({ error: error.message || 'Failed to create user' });
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await adminUsersService.delete(id);
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete user', isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, payload) => {
    set({ isUpdating: true, error: null });
    try {
      await adminUsersService.update(id, payload);
      await get().fetchUsers(); // Refresh list to get updated user
    } catch (error: any) {
      set({ error: error.message || 'Failed to update user' });
      throw error;
    } finally {
      set({ isUpdating: false });
    }
  },

  updateUserRole: async (id, roleId) => {
    set({ isUpdating: true, error: null });
    try {
      await adminUsersService.updateRole(id, roleId);
      await get().fetchUsers(); // Refresh list to get updated role
    } catch (error: any) {
      set({ error: error.message || 'Failed to update user role' });
      throw error;
    } finally {
      set({ isUpdating: false });
    }
  }
}));
