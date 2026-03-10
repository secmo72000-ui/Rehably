'use client';

import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Drawer, ConfirmationModal } from '@/ui/components';
import { SubscriptionsTab } from './_components/tabs';
import { FinancialPlanForm } from './_components/FinancialPlanForm';
import { useSubscriptionsPage } from './useSubscriptionsPage';

// ========== Page Component ==========
export default function SubscriptionsPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `subscriptions.${key}`);
    const controller = useSubscriptionsPage();

    return (
        <div className="space-y-6">
            {/* Subscriptions Tab Content */}
            <SubscriptionsTab
                packages={controller.packages}
                isLoading={controller.isLoading}
                error={controller.error}
                onAddClick={controller.openAddDrawer}
                onEdit={controller.openEditDrawer}
                onDelete={controller.handleDelete}
            />

            {/* Drawer */}
            <Drawer
                isOpen={!!controller.drawerType}
                onClose={controller.closeDrawer}
                title={controller.getDrawerTitle()}
                size="lg"
            >
                {!!controller.drawerType && (
                    <FinancialPlanForm
                        features={controller.features}
                        categories={controller.categories}
                        initialValues={controller.getDefaultValues()}
                        onSubmit={controller.handleFormSubmit}
                        onCancel={controller.closeDrawer}
                        isLoading={controller.isCreating || controller.isUpdating}
                        t={t}
                        key={controller.selectedPackage?.id || 'new'}
                    />
                )}
            </Drawer>

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
                errorMessage={controller.deleteErrorMessage}
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
