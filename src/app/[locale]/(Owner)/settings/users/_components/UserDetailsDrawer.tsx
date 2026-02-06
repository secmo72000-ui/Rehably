'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Drawer } from '@/ui/components';
import { UserProfile } from '@/ui/components/UserProfile/UserProfile';
import { InfoCard } from '@/app/[locale]/(Owner)/clinic-management/components/InfoCard';
import { PermissionsView } from '@/app/[locale]/(Owner)/settings/roles/_components/PermissionsView';
import { Button } from '@/ui/primitives';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import type { PlatformUser } from '@/domains/users/admin-users.types';
import type { Role, Permission } from '@/domains/roles/roles.types';

interface UserDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: PlatformUser | null;
    roles: Role[];
    allPermissions: Permission[];
    locale: Locale;
    isUpdating: boolean;
    onUpdateRole: (userId: string, roleId: string) => Promise<void>;
}

export function UserDetailsDrawer({
    isOpen,
    onClose,
    user,
    roles,
    allPermissions,
    locale,
    isUpdating,
    onUpdateRole
}: UserDetailsDrawerProps) {
    const t = (key: string) => getTranslation(locale, `usersPage.detailsDrawer.${key}`);
    const tRoles = (key: string) => getTranslation(locale, `roles.permissions.${key}`);

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState('');

    // Reset state when drawer opens/closes or user changes
    useEffect(() => {
        if (isOpen && user) {
            setIsEditMode(false);
            setSelectedRoleId(user.role?.id || '');
        }
    }, [isOpen, user]);

    // Find the currently selected role for permissions display
    const displayRole = useMemo(() => {
        if (isEditMode) {
            return roles.find(r => r.id === selectedRoleId) || user?.role;
        }
        return user?.role;
    }, [isEditMode, selectedRoleId, roles, user]);

    // Info cards data
    const infoCards = useMemo(() => {
        if (!user) return [];
        return [
            {
                iconSrc: '/shered/phone-icon.svg',
                label: '01000000000',
                iconAlt: t('phone')
            },
            {
                iconSrc: '/shered/user-icon.svg',
                label: user.role?.name || '-',
                iconAlt: t('role')
            }
        ];
    }, [user, t]);

    const handleSave = async () => {
        if (!user || !selectedRoleId || selectedRoleId === user.role?.id) {
            setIsEditMode(false);
            return;
        }

        try {
            await onUpdateRole(user.id, selectedRoleId);
            setIsEditMode(false);
        } catch (error) {
            // Error is handled by the store
        }
    };

    const handleCancel = () => {
        setSelectedRoleId(user?.role?.id || '');
        setIsEditMode(false);
    };

    if (!user) return null;

    const userName = `${user.firstName} ${user.lastName}`;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={t('title')}
            size="lg"
        >
            <div className="space-y-6">
                {/* Header with UserProfile */}
                <div className="pb-4 flex justify-start items-center">
                    <UserProfile
                        name={userName}
                        email={user.email || ""}
                        size="md"
                    />
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {infoCards.map((card, index) => (
                        <InfoCard
                            key={index}
                            iconSrc={card.iconSrc}
                            label={card.label}
                            iconAlt={card.iconAlt}
                        />
                    ))}
                </div>

                {/* Permissions Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {t('permissionsTitle')}
                    </h3>

                    {/* Role Select in Edit Mode */}
                    {isEditMode && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('changeRole')}
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedRoleId}
                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                                >
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 left-auto rtl:right-auto rtl:left-0 flex items-center px-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Permissions View (read-only) */}
                    <PermissionsView
                        role={displayRole as Role}
                        allPermissions={allPermissions}
                        locale={locale}
                        editable={false}
                    />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    {isEditMode ? (
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCancel}
                                disabled={isUpdating}
                                className="flex-1"
                            >
                                {t('cancelButton')}
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleSave}
                                isLoading={isUpdating}
                                disabled={isUpdating}
                                className="flex-1"
                            >
                                {t('saveButton')}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="primary"
                            fullWidth
                            onClick={() => setIsEditMode(true)}
                        >
                            {t('editButton')}
                        </Button>
                    )}
                </div>
            </div>
        </Drawer>
    );
}
