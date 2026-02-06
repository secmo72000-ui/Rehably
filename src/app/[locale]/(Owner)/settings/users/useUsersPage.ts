'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminUsersStore } from '@/stores/admin-users.store';

export function useUsersPage() {
    const {
        users,
        roles,
        isLoading,
        isCreating,
        error,
        fetchUsers,
        fetchRoles,
        createUser,
        deleteUser
    } = useAdminUsersStore();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [fetchUsers, fetchRoles]);

    // Filter active users only
    const activeUsers = users.filter(user => user.isActive !== false);

    // Calculate pagination
    const totalPages = Math.ceil(activeUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = activeUsers.slice(
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

    const handleCreateUser = useCallback(async (data: any) => {
        await createUser(data);
        closeDrawer();
    }, [createUser, closeDrawer]);

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
        deleteErrorMessage
    };
}
