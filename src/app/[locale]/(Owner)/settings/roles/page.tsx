'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TabNavigator, Drawer } from '@/ui/components';
import { Button, GeneralInput } from '@/ui/primitives';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { RolesList, PermissionsView } from './_components';
import { useRolesPage } from './useRolesPage';

export default function RolesPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `roles.${key}`);

    const controller = useRolesPage();

    const tabs = [
        { id: 'roles', label: t('tabs.roles') },
        { id: 'users', label: t('tabs.users') },
    ];

    const handleTabChange = (id: string) => {
        if (id === 'users') {
            router.push(`/${locale}/settings/users`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Navigator */}
            <div className="flex justify-between items-center bg-transparent">
                <div className="w-full max-w-md">
                    <TabNavigator
                        tabs={tabs}
                        activeTab="roles"
                        onTabChange={handleTabChange}
                        className="bg-transparent shadow-none p-0"
                    />
                </div>
            </div>

            {/* Add Role Button */}
            <div className="flex justify-end">
                <Button
                    variant="primary"
                    startIcon={<span className="text-xl font-bold">+</span>}
                    className="px-6"
                    onClick={controller.openDrawer}
                >
                    {t('addRole')}
                </Button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Right Side: Roles List */}
                <div className="md:col-span-3">
                    <RolesList
                        roles={controller.paginatedRoles}
                        selectedRoleId={controller.selectedRoleId}
                        onSelectRole={controller.setSelectedRoleId}
                        locale={locale}
                        pagination={{
                            currentPage: controller.currentPage,
                            totalPages: controller.totalPages,
                            onPageChange: controller.setCurrentPage
                        }}
                    />
                </div>

                {/* Left Side: Permissions View (read-only) */}
                <div className="md:col-span-9">
                    <PermissionsView
                        role={controller.selectedRole}
                        allPermissions={controller.permissions}
                        locale={locale}
                    />
                </div>
            </div>

            {/* Add Role Drawer */}
            <Drawer
                isOpen={controller.isDrawerOpen}
                onClose={controller.closeDrawer}
                title={t('drawer.addRole') || 'اضافة دور'}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Role Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('form.roleName') || 'اسم الدور'}
                        </label>
                        <GeneralInput
                            type="text"
                            value={controller.newRoleName}
                            onChange={controller.setNewRoleName}
                            placeholder={t('form.roleNamePlaceholder') || 'مثال : مساعد ادمن'}
                        />
                    </div>

                    {/* Permissions Selection using PermissionsView (editable mode) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {t('form.selectPermissions') || 'الصلاحيات'}
                        </label>
                        <div className="max-h-[400px] overflow-y-auto">
                            <PermissionsView
                                allPermissions={controller.permissions.filter(p =>
                                    ['dashboard', 'clinics', 'subscriptions', 'invoices', 'audit_logs', 'settings', 'roles', 'packages', 'features', 'platform_users'].includes(p.resource)
                                )}
                                locale={locale}
                                editable={true}
                                selectedPermissions={controller.selectedFormPermissions}
                                onPermissionToggle={controller.handlePermissionToggle}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="button"
                        fullWidth
                        isLoading={controller.isCreating}
                        disabled={controller.isCreating || !controller.newRoleName.trim()}
                        onClick={controller.handleCreateRole}
                    >
                        {t('addRole') || 'اضافة دور'}
                    </Button>
                </div>
            </Drawer>
        </div>
    );
}
