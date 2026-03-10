'use client';


import { useEffect, useState, useCallback } from 'react';
import { useRolesStore } from '@/domains/roles/roles.store';
import type { CreateRolePayload } from '@/domains/roles/roles.types';

export function useRolesPage() {
    const {
        roles,
        permissions,
        isLoading,
        error,
        fetchRoles,
        fetchPermissions,
        createRole
    } = useRolesStore();

    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form state for add role drawer
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [selectedFormPermissions, setSelectedFormPermissions] = useState<string[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Fetch roles and permissions on mount
    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, [fetchRoles, fetchPermissions]);

    // Calculate pagination
    const totalPages = Math.ceil(roles.length / ITEMS_PER_PAGE);
    const paginatedRoles = roles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Select first role by default when roles load
    useEffect(() => {
        if (roles.length > 0 && !selectedRoleId) {
            setSelectedRoleId(roles[0].id);
        }
    }, [roles, selectedRoleId]);

    const selectedRole = roles.find(r => r.id === selectedRoleId) || null;

    const openDrawer = useCallback(() => {
        // Reset form when opening
        setNewRoleName('');
        setNewRoleDescription('');
        setSelectedFormPermissions([]);
        setIsDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const handlePermissionToggle = useCallback((permName: string) => {
        setSelectedFormPermissions(prev =>
            prev.includes(permName)
                ? prev.filter(p => p !== permName)
                : [...prev, permName]
        );
    }, []);

    const handleCreateRole = useCallback(async () => {
        if (!newRoleName.trim()) return;

        setIsCreating(true);
        try {
            const payload: CreateRolePayload = {
                name: newRoleName.trim(),
                description: newRoleDescription.trim() || undefined,
                permissions: selectedFormPermissions,
            };
            await createRole(payload);
            closeDrawer();
        } finally {
            setIsCreating(false);
        }
    }, [newRoleName, newRoleDescription, selectedFormPermissions, createRole, closeDrawer]);

    return {
        roles,
        permissions,
        isLoading,
        error,
        selectedRoleId,
        selectedRole,
        setSelectedRoleId,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        handleCreateRole,
        isCreating,
        // Form state
        newRoleName,
        setNewRoleName,
        newRoleDescription,
        setNewRoleDescription,
        selectedFormPermissions,
        handlePermissionToggle,
        // Pagination
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedRoles,
    };
}
