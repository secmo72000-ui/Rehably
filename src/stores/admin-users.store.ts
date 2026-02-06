import { create } from 'zustand';
import { adminUsersService } from '@/services/admin-users.service';
import type { PlatformUser } from '@/domains/users/admin-users.types';
import { rolesService } from '@/services/roles.service';
import type { Role } from '@/domains/roles/roles.types';

interface AdminUsersState {
  users: PlatformUser[];
  roles: Role[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  createUser: (payload: { email: string; firstName: string; lastName: string; roleId: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useAdminUsersStore = create<AdminUsersState>((set, get) => ({
  users: [],
  roles: [],
  isLoading: false,
  isCreating: false,
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
  }
}));
