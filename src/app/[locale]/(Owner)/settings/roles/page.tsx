'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TabNavigator, Drawer, ConfirmationModal } from '@/ui/components';
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

    const isEditMode = controller.editingRole !== null;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.push(`/${locale}/settings`)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors w-fit"
            >
                <img src="/shered/arrwo.svg" alt="back" width={12} height={12} className={locale === 'ar' ? 'rotate-180' : ''} />
                <span className="text-sm font-medium">{t('backToSettings') || 'الرجوع للإعدادات'}</span>
            </button>

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
                        onEdit={controller.openEditDrawer}
                        onDelete={controller.handleDeleteRole}
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
                        allPermissions={controller.platformPermissionsList}
                        locale={locale}
                    />
                </div>
            </div>

            {/* Add/Edit Role Drawer */}
            <Drawer
                isOpen={controller.isDrawerOpen}
                onClose={controller.closeDrawer}
                title={isEditMode
                    ? (t('drawer.editRole') || 'تعديل الدور')
                    : (t('drawer.addRole') || 'اضافة دور')
                }
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
                            disabled={isEditMode}
                        />
                    </div>

                    {/* Role Description Input (shown in edit mode) */}
                    {isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('form.roleDescription') || 'وصف الدور'}
                            </label>
                            <GeneralInput
                                type="text"
                                value={controller.newRoleDescription}
                                onChange={controller.setNewRoleDescription}
                                placeholder={t('form.roleDescriptionPlaceholder') || 'وصف مختصر للدور'}
                            />
                        </div>
                    )}

                    {/* Permissions Selection using PermissionsView (editable mode) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {t('form.selectPermissions') || 'الصلاحيات'}
                        </label>
                        <div className="max-h-[400px] overflow-y-auto">
                            <PermissionsView
                                allPermissions={controller.platformPermissionsList}
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
                        isLoading={controller.isSubmitting}
                        disabled={controller.isSubmitting || (!isEditMode && !controller.newRoleName.trim())}
                        onClick={controller.handleSubmit}
                    >
                        {isEditMode
                            ? (t('updateRole') || 'تحديث الدور')
                            : (t('addRole') || 'اضافة دور')
                        }
                    </Button>
                </div>
            </Drawer>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={controller.deleteModalOpen}
                onClose={controller.closeDeleteModal}
                onConfirm={controller.confirmDelete}
                title={t('deleteRole') || 'حذف الدور'}
                confirmText={t('confirmDelete') || 'حذف'}
                cancelText={t('cancel') || 'إلغاء'}
                isLoading={controller.isDeleting}
                variant="danger"
                status={controller.deleteStatus}
                successMessage={t('deleteSuccess') || 'تم حذف الدور بنجاح'}
                errorMessage={t('deleteError') || 'حدث خطأ أثناء حذف الدور'}
            >
                <p className="text-gray-600">
                    {t('deleteConfirmMessage') || 'هل أنت متأكد من حذف الدور'}
                    {' '}
                    <strong>{controller.roleToDelete?.name}</strong>؟
                </p>
                {(controller.roleToDelete?.userCount ?? 0) > 0 && (
                    <p className="text-red-500 text-sm mt-2">
                        {t('deleteWarningUsers') || `هذا الدور مرتبط بـ ${controller.roleToDelete?.userCount} مستخدم`}
                    </p>
                )}
            </ConfirmationModal>
        </div>
    );
}
