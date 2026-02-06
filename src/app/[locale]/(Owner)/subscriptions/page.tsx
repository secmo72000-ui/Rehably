'use client';

import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import {
    TabNavigator,
    Drawer,
    DynamicForm,
    ConfirmationModal,
} from '@/ui/components';
import { useFeaturesStore } from '@/stores/features.store';
import { SubscriptionsTab, CustomCategoriesTab, FinancialPlansTab } from './_components/tabs';
import { useSubscriptionsPage } from './useSubscriptionsPage';

// ========== Page Component ==========
export default function SubscriptionsPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `subscriptions.${key}`);
    const { isLoading: isFeaturesLoading } = useFeaturesStore();

    const controller = useSubscriptionsPage();

    return (
        <div className="space-y-6">
            {/* Tab Navigator */}
            <TabNavigator
                tabs={controller.tabs}
                activeTab={controller.activeTab}
                onTabChange={controller.setActiveTab}
            />

            {/* Subscriptions Tab Content */}
            {controller.activeTab === 'subscriptions' && (
                <SubscriptionsTab
                    packages={controller.packages}
                    isLoading={controller.isLoading}
                    error={controller.error}
                    onAddClick={controller.openAddDrawer}
                    onEdit={controller.openEditDrawer}
                    onDelete={controller.handleDelete}
                />
            )}

            {/* Financial Plans Tab Content */}
            {controller.activeTab === 'financial-plans' && (
                <FinancialPlansTab
                    features={controller.features}
                    isLoading={isFeaturesLoading}
                    onAddClick={controller.openAddDrawer}
                    onEdit={controller.handleFeatureEdit}
                    onDelete={controller.handleFeatureDelete}
                />
            )}

            {/* Custom Categories Tab Content */}
            {controller.activeTab === 'custom-categories' && (
                <CustomCategoriesTab
                    customPackages={controller.customPackages}
                    clinics={controller.clinics}
                    isLoading={controller.isLoadingCustom}
                    onAddClick={controller.openAddDrawer}
                    onEdit={controller.openEditDrawer}
                    onDelete={controller.handleDelete}
                    onActivate={controller.activatePackage}
                />
            )}

            {/* Drawer */}
            <Drawer
                isOpen={!!controller.drawerType}
                onClose={controller.closeDrawer}
                title={controller.getDrawerTitle()}
                size="lg"
            >
                <DynamicForm
                    config={{
                        ...controller.getFormConfig(),
                        submitLabel: controller.getFormSubmitLabel()
                    }}
                    onSubmit={controller.handleFormSubmit}
                    onCancel={controller.closeDrawer}
                    isLoading={controller.isCreating || controller.isUpdating}
                    defaultValues={controller.getDefaultValues()}
                    key={`${controller.drawerType}-${controller.selectedPackage?.id || 'new'}-${controller.activeTab}`}
                />
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
