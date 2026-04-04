'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TabNavigator, ConfirmationModal } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { UsersList } from './_components/UsersList';
import { UserDrawer } from './_components/UserDrawer';
import { UserDetailsDrawer } from './_components/UserDetailsDrawer';
import { useUsersPage } from './useUsersPage';

export default function UsersPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `usersPage.${key}`);
    const tRoles = (key: string) => getTranslation(locale, `roles.${key}`);

    const controller = useUsersPage();

    // Reusing the same tabs design but navigating between pages
    const tabs = [
        { id: 'roles', label: tRoles('tabs.roles') },
        { id: 'users', label: tRoles('tabs.users') },
    ];

    const handleTabChange = (id: string) => {
        if (id === 'roles') {
            router.push(`/${locale}/settings/roles`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-[#111827] text-xl font-bold">
                {/* Back Button */}
                <button
                    onClick={() => router.push(`/${locale}/settings`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors w-fit"
                >
                    <img src="/shered/arrwo.svg" alt="back" width={12} height={12} className={locale === 'ar' ? 'rotate-180' : ''} />
                    <span className="text-sm font-medium">{tRoles('backToSettings') || 'الرجوع للإعدادات'}</span>
                </button>
            </div>

            {/* Top Navigator */}
            <div className="flex justify-between items-center bg-transparent">
                <div className="w-full max-w-md">
                    <TabNavigator
                        tabs={tabs}
                        activeTab="users"
                        onTabChange={handleTabChange}
                        className="bg-transparent shadow-none p-0"
                    />
                </div>
            </div>

            {/* Add User Button */}
            <div className="flex justify-end">
                <Button
                    variant="primary"
                    startIcon={<span className="text-xl font-bold">+</span>}
                    className="px-6"
                    onClick={controller.openDrawer}
                >
                    {t('addUser')}
                </Button>
            </div>

            {/* Users List */}
            <UsersList
                users={controller.paginatedUsers}
                locale={locale}
                pagination={{
                    currentPage: controller.currentPage,
                    totalPages: controller.totalPages,
                    onPageChange: controller.setCurrentPage
                }}
                onDelete={controller.handleDeleteUser}
                onView={controller.openDetailsDrawer}
            />

            {/* Add User Drawer */}
            <UserDrawer
                isOpen={controller.isDrawerOpen}
                onClose={controller.closeDrawer}
                locale={locale}
                roles={controller.roles}
                isLoading={controller.isCreating}
                onSubmit={controller.handleCreateUser}
            />

            {/* User Details Drawer */}
            <UserDetailsDrawer
                isOpen={controller.isDetailsDrawerOpen}
                onClose={controller.closeDetailsDrawer}
                user={controller.selectedUser}
                roles={controller.roles}
                allPermissions={controller.allPermissions}
                locale={locale}
                isUpdating={controller.isUpdating}
                onUpdateRole={controller.handleUpdateUserRole}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={controller.deleteModalOpen}
                onClose={controller.closeDeleteModal}
                onConfirm={controller.confirmDelete}
                title={t('deleteModal.title')}
                confirmText={t('deleteModal.confirmText')}
                cancelText={t('deleteModal.cancelText')}
                variant="primary"
                isLoading={controller.isArchiving}
                status={controller.deleteStatus}
                errorMessage={controller.deleteErrorMessage || undefined}
                successMessage={t('deleteModal.successMessage')}
                successButtonText={t('deleteModal.successButton')}
                retryButtonText={t('deleteModal.retryButton')}
            >
                <p className="text-gray-600 text-lg">
                    {t('deleteModal.message')}
                </p>
            </ConfirmationModal>
        </div>
    );
}
