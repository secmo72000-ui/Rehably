'use client';


import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRolesStore } from '@/domains/roles/roles.store';
import type { Role, Permission, CreateRolePayload, UpdateRolePayload } from '@/domains/roles/roles.types';

export function useRolesPage() {
    const {
        roles,
        permissions,
        platformPermissions,
        isLoading,
        error,
        fetchRoles,
        fetchPermissions,
        fetchPlatformPermissions,
        createRole,
        updateRole,
        deleteRole
    } = useRolesStore();

    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit mode: null = add, Role = editing that role
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Form state for add/edit role drawer
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [selectedFormPermissions, setSelectedFormPermissions] = useState<string[]>([]);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Fetch roles and permissions on mount
    useEffect(() => {
        fetchRoles();
        fetchPermissions();
        fetchPlatformPermissions();
    }, [fetchRoles, fetchPermissions, fetchPlatformPermissions]);

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

    // Flatten platform permissions matrix into Permission[] for PermissionsView
    const platformPermissionsList: Permission[] = useMemo(() => {
        if (!platformPermissions) return [];
        return platformPermissions.resources.flatMap(r =>
            r.actions.map(a => ({
                name: a.permission,
                resource: r.resource,
                action: a.action,
            }))
        );
    }, [platformPermissions]);

    // Open drawer in ADD mode
    const openDrawer = useCallback(() => {
        setEditingRole(null);
        setNewRoleName('');
        setNewRoleDescription('');
        setSelectedFormPermissions([]);
        setIsDrawerOpen(true);
    }, []);

    // Open drawer in EDIT mode (pre-fill with existing role data)
    const openEditDrawer = useCallback((role: Role) => {
        setEditingRole(role);
        setNewRoleName(role.name);
        setNewRoleDescription(role.description || '');
        setSelectedFormPermissions([...role.permissions]);
        setIsDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setEditingRole(null);
    }, []);

    const handlePermissionToggle = useCallback((permName: string) => {
        setSelectedFormPermissions(prev =>
            prev.includes(permName)
                ? prev.filter(p => p !== permName)
                : [...prev, permName]
        );
    }, []);

    // CREATE handler
    const handleCreateRole = useCallback(async () => {
        if (!newRoleName.trim()) return;

        setIsSubmitting(true);
        try {
            const payload: CreateRolePayload = {
                name: newRoleName.trim(),
                description: newRoleDescription.trim() || undefined,
                permissions: selectedFormPermissions,
            };
            await createRole(payload);
            closeDrawer();
        } finally {
            setIsSubmitting(false);
        }
    }, [newRoleName, newRoleDescription, selectedFormPermissions, createRole, closeDrawer]);

    // UPDATE handler
    const handleUpdateRole = useCallback(async () => {
        if (!editingRole) return;

        setIsSubmitting(true);
        try {
            const payload: UpdateRolePayload = {
                description: newRoleDescription.trim() || undefined,
                permissions: selectedFormPermissions,
            };
            await updateRole(editingRole.id, payload);
            closeDrawer();
        } finally {
            setIsSubmitting(false);
        }
    }, [editingRole, newRoleDescription, selectedFormPermissions, updateRole, closeDrawer]);

    // Combined submit — routes to create or update based on mode
    const handleSubmit = useCallback(async () => {
        if (editingRole) {
            await handleUpdateRole();
        } else {
            await handleCreateRole();
        }
    }, [editingRole, handleUpdateRole, handleCreateRole]);

    // DELETE flow
    const handleDeleteRole = useCallback((role: Role) => {
        setRoleToDelete(role);
        setDeleteStatus('idle');
        setDeleteModalOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!roleToDelete) return;

        setIsDeleting(true);
        try {
            await deleteRole(roleToDelete.id);
            setDeleteStatus('success');
            // If we deleted the selected role, clear selection
            if (selectedRoleId === roleToDelete.id) {
                setSelectedRoleId(null);
            }
            // Auto-close after success
            setTimeout(() => {
                setDeleteModalOpen(false);
                setRoleToDelete(null);
                setDeleteStatus('idle');
            }, 1500);
        } catch {
            setDeleteStatus('error');
        } finally {
            setIsDeleting(false);
        }
    }, [roleToDelete, deleteRole, selectedRoleId]);

    const closeDeleteModal = useCallback(() => {
        setDeleteModalOpen(false);
        setRoleToDelete(null);
        setDeleteStatus('idle');
    }, []);

    return {
        roles,
        permissions,
        platformPermissions,
        platformPermissionsList,
        isLoading,
        error,
        selectedRoleId,
        selectedRole,
        setSelectedRoleId,
        isDrawerOpen,
        openDrawer,
        openEditDrawer,
        closeDrawer,
        handleSubmit,
        isSubmitting,
        editingRole,
        // Form state
        newRoleName,
        setNewRoleName,
        newRoleDescription,
        setNewRoleDescription,
        selectedFormPermissions,
        handlePermissionToggle,
        // Delete
        deleteModalOpen,
        roleToDelete,
        deleteStatus,
        isDeleting,
        handleDeleteRole,
        confirmDelete,
        closeDeleteModal,
        // Pagination
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedRoles,
    };
}
