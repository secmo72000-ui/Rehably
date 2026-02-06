'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminUsersStore } from '@/stores/admin-users.store';
import { useRolesStore } from '@/stores/roles.store';
import type { PlatformUser } from '@/domains/users/admin-users.types';

export function useUsersPage() {
    const {
        users,
        roles,
        isLoading,
        isCreating,
        isUpdating,
        // error,
        fetchUsers,
        fetchRoles,
        createUser,
        updateUserRole,
        deleteUser
    } = useAdminUsersStore();

    const { permissions: allPermissions, fetchPermissions } = useRolesStore();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Details drawer state
    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchPermissions();
    }, [fetchUsers, fetchRoles, fetchPermissions]);

    // Calculate pagination
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const paginatedUsers = users.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isArchiving, setIsArchiving] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

    const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

    const openDetailsDrawer = useCallback((user: PlatformUser) => {
        setSelectedUser(user);
        setIsDetailsDrawerOpen(true);
    }, []);

    const closeDetailsDrawer = useCallback(() => {
        setIsDetailsDrawerOpen(false);
        setSelectedUser(null);
    }, []);

    const handleCreateUser = useCallback(async (data: any) => {
        await createUser(data);
        closeDrawer();
    }, [createUser, closeDrawer]);

    const handleUpdateUserRole = useCallback(async (userId: string, roleId: string) => {
        await updateUserRole(userId, roleId);
        // Note: We don't close the drawer here to allow viewing the changes, 
        // or we could close it. The page.tsx doesn't seem to force close it.
        // But usually we might want to update the local selectedUser object if the list updates.
        // Since fetchUsers() updates the store 'users', and selectedUser is a separate state reference... 
        // we might rely on the fact that if the list re-renders, the drawer still shows provided selectedUser.
        // However, if the store updates, selectedUser (which is local state) WON'T automatically update unless we sync it.
        // For now, let's keep it simple as requested by the missing property error.
    }, [updateUserRole]);
    
    // Sync selected user with store if active
    useEffect(() => {
        if (selectedUser) {
            const updatedUser = users.find(u => u.id === selectedUser.id);
            if (updatedUser) {
                setSelectedUser(updatedUser);
            }
        }
    }, [users, selectedUser?.id]);

    const openDeleteModal = useCallback((id: string, name: string) => {
        setUserToDelete({ id, name });
        setDeleteModalOpen(true);
        setDeleteStatus('idle');
        setDeleteErrorMessage(null);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteModalOpen(false);
        setUserToDelete(null);
        setDeleteStatus('idle');
        setDeleteErrorMessage(null);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!userToDelete) return;
        
        setIsArchiving(true);
        setDeleteErrorMessage(null);
        
        try {
            await deleteUser(userToDelete.id);
            setDeleteStatus('success');
            setTimeout(() => {
                closeDeleteModal();
            }, 1500);
        } catch (error: any) {
            setDeleteStatus('error');
            setDeleteErrorMessage(error.response?.data?.detail || error.message || "Failed to delete user");
        } finally {
            setIsArchiving(false);
        }
    }, [userToDelete, deleteUser, closeDeleteModal]);

    return {
        users,
        roles,
        isLoading,
        isCreating,
        isUpdating,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        handleCreateUser,
        handleDeleteUser: openDeleteModal, // expose as handleDeleteUser for the list
        paginatedUsers,
        currentPage,
        setCurrentPage,
        totalPages,
        // Delete Modal Props
        deleteModalOpen,
        closeDeleteModal,
        confirmDelete,
        isArchiving,
        deleteStatus,
        deleteErrorMessage,
        
        // Details Drawer Props
        isDetailsDrawerOpen,
        openDetailsDrawer,
        closeDetailsDrawer,
        selectedUser,
        allPermissions,
        handleUpdateUserRole
    };
}
