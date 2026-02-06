import { create } from 'zustand';
import { usersService } from '@/services/users.service';
import { PlatformUser, CreateUserPayload, UpdateUserPayload } from '@/domains/users/users.types';

interface UsersState {
    users: PlatformUser[];
    isLoading: boolean;
    error: string | null;
    
    // Actions
    fetchUsers: () => Promise<void>;
    createUser: (data: CreateUserPayload) => Promise<void>;
    updateUser: (id: string, data: UpdateUserPayload) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,

    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const users = await usersService.getAll();
            set({ users, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch users' });
        }
    },

    createUser: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await usersService.create(data);
            await get().fetchUsers(); // Refresh list
            set({ isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to create user' });
            throw error;
        }
    },

    updateUser: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await usersService.update(id, data);
            await get().fetchUsers();
            set({ isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to update user' });
            throw error;
        }
    },

    deleteUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await usersService.delete(id);
            // Optimistic update
            set(state => ({ 
                users: state.users.filter(u => u.id !== id),
                isLoading: false 
            }));
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to delete user' });
            throw error;
        }
    }
}));
