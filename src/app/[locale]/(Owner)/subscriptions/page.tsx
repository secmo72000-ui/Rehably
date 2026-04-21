'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Drawer, ConfirmationModal } from '@/ui/components';
import { SubscriptionsTab } from './_components/tabs';
import { FinancialPlanForm } from './_components/FinancialPlanForm';
import { FeaturesTab } from './_components/FeaturesTab';
import { useSubscriptionsPage } from './useSubscriptionsPage';

type TabId = 'packages' | 'features';

export default function SubscriptionsPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `subscriptions.${key}`);
    const controller = useSubscriptionsPage();
    const [activeTab, setActiveTab] = useState<TabId>('packages');

    const tabs: { id: TabId; label: string }[] = [
        { id: 'packages', label: 'الباقات' },
        { id: 'features', label: 'المميزات' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-gray-800">الباقات والمميزات</h1>
            </div>

            {/* Top-level tabs */}
            <div className="flex gap-1 border-b-2 border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2.5 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
                            activeTab === tab.id
                                ? 'text-[#29AAFE] border-[#29AAFE]'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Packages Tab */}
            {activeTab === 'packages' && (
                <>
                    <SubscriptionsTab
                        packages={controller.packages}
                        isLoading={controller.isLoading}
                        error={controller.error}
                        onAddClick={controller.openAddDrawer}
                        onEdit={controller.openEditDrawer}
                        onDelete={controller.handleDelete}
                    />

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
                                isRtl={locale === 'ar'}
                                key={controller.selectedPackage?.id || 'new'}
                            />
                        )}
                    </Drawer>

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
                        <p className="text-gray-600 text-lg">{t('deleteModal.message')}</p>
                    </ConfirmationModal>
                </>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && <FeaturesTab />}
        </div>
    );
}
