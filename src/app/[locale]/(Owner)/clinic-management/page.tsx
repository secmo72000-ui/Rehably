'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Table, Drawer, ConfirmationModal } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { ClinicDetails, ClinicWizard } from './components';
import { Clinic } from '@/domains/clinics/clinics.types';
import { calculateActiveClinics } from '@/domains/clinics/clinics.utils';
import { getClinicsTableColumns } from './configs/table.config';
import { sortByDate } from '@/shared/utils';
import { useClinicManagement } from './hooks/useClinicManagement';

// ========== Page Component ==========
export default function ClinicManagementPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const t = (key: string) => getTranslation(locale, `clinicManagement.${key}`);

  // All logic is inside the hook
  const {
    clinics,
    isLoading,
    isCreating,
    isUpdating,
    error,
    totalCount,
    totalPages,
    pageView,
    editingClinic,
    packages,
    packagesLoading,
    features,
    categories,
    featuresLoading,
    selectedClinic,
    createdClinicInfo,
    setCreatedClinicInfo,
    isDeleteModalOpen,
    clinicToDelete,
    deleteStatus,
    deleteErrorMessage,
    currentPage,
    sortDirection,
    setCurrentPage,
    setSortDirection,
    fetchClinics,
    openAddWizard,
    openEditWizard,
    closeWizard,
    openViewDrawer,
    closeViewDrawer,
    openDeleteModal,
    setIsDeleteModalOpen,
    setClinicToDelete,
    setDeleteStatus,
    handleConfirmDelete,
    handleWizardSubmit,
    refreshClinicDetail,
  } = useClinicManagement(t);

  // Fetch clinics on mount
  useEffect(() => {
    fetchClinics(currentPage, 20);
  }, [fetchClinics, currentPage]);

  // Toggle sort direction
  const handleSortToggle = () => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // Sort clinics - use Array.isArray protection in case of API issues
  const sortedClinics = useMemo(() => {
    const clinicsArray = Array.isArray(clinics) ? clinics : [];
    return sortByDate(clinicsArray, 'createdAt', sortDirection);
  }, [clinics, sortDirection]);

  // Calculate active clinics count using helper - with array protection
  const clinicsArray = Array.isArray(clinics) ? clinics : [];
  const activeClinicsCount = calculateActiveClinics(clinicsArray);

  // Get table columns from config
  const columns = useMemo(
    () =>
      getClinicsTableColumns({
        t,
        onView: openViewDrawer,
        onEdit: openEditWizard,
        onDelete: openDeleteModal,
      }),
    [t, openViewDrawer, openEditWizard, openDeleteModal]
  );

  // Render Delete Modal shared across views
  const renderDeleteModal = () => (
    <ConfirmationModal
      isOpen={isDeleteModalOpen}
      onClose={() => {
        setIsDeleteModalOpen(false);
        // Small delay to clear state after modal closes
        setTimeout(() => {
          setClinicToDelete(null);
          setDeleteStatus('idle');
        }, 300);
      }}
      onConfirm={handleConfirmDelete}
      title={t('deleteClinicTitle') || "حذف العيادة"}
      confirmText={t('confirmationModal.confirm')}
      cancelText={t('confirmationModal.cancel')}
      variant="danger"
      isLoading={isLoading}
      status={deleteStatus}
      errorMessage={deleteErrorMessage}
      successMessage={`${t('confirmationModal.successTitle')} ${clinicToDelete?.name}`}
      successButtonText={t('confirmationModal.successButton')}
      retryButtonText={t('confirmationModal.retryButton')}
    >
      <p className="text-gray-600 text-lg">
        {t('deleteClinicConfirmationMessage') || "هل تريد حقا القيام بحذف عيادة"}
        <br />
        <span className="font-bold text-gray-900">
          &quot;{clinicToDelete?.name}&quot;
        </span>
        ؟
      </p>
    </ConfirmationModal>
  );

  // If wizard is active, show it instead of the table
  if (pageView === 'wizard') {
    return (
      <>
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <ClinicWizard
          clinic={editingClinic}
          packages={packages}
          packagesLoading={packagesLoading}
          features={features}
          categories={categories}
          featuresLoading={featuresLoading}
          t={t}
          isRtl={locale === 'ar'}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleWizardSubmit}
          onClose={closeWizard}
        />
        {renderDeleteModal()}
      </>
    );
  }

  // If details view is active, show the details directly
  if (pageView === 'details' && selectedClinic) {
    const clinicPackage = packages.find(p => String(p.id) === String(selectedClinic.subscriptionPlanId));

    return (
      <>
        <ClinicDetails
          clinic={selectedClinic}
          packageDetails={clinicPackage}
          features={features}
          categories={categories}
          featuresLoading={featuresLoading}
          onClose={closeViewDrawer}
          onEdit={() => openEditWizard(selectedClinic)}
          onDelete={() => openDeleteModal(selectedClinic)}
          onRefresh={refreshClinicDetail}
        />
        {renderDeleteModal()}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">{t('pageTitle')}</h1>
        <Button onClick={openAddWizard} variant="primary">
          {t('addClinic')}
        </Button>
      </div>

      {/* Clinic Created — Temp Password Banner */}
      {createdClinicInfo && (
        <div className="p-4 bg-green-50 border border-green-300 rounded-lg text-green-800 text-sm space-y-2">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-base">✅ تم إنشاء العيادة بنجاح — {createdClinicInfo.name}</p>
            <button
              onClick={() => setCreatedClinicInfo(null)}
              className="text-green-600 hover:text-green-900 text-lg leading-none ml-4"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
          <p>
            البريد الإلكتروني للمالك:{' '}
            <span className="font-mono font-bold" dir="ltr">{createdClinicInfo.email}</span>
          </p>
          <p>
            كلمة المرور المؤقتة:{' '}
            <span className="font-mono font-bold bg-green-100 px-2 py-0.5 rounded select-all" dir="ltr">
              {createdClinicInfo.tempPassword}
            </span>
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(`Email: ${createdClinicInfo.email}\nPassword: ${createdClinicInfo.tempPassword}`)}
            className="text-xs text-green-700 underline hover:no-underline"
          >
            نسخ البريد الإلكتروني + كلمة المرور
          </button>
          <p className="text-xs text-green-600">احتفظ بهذه البيانات — لن تظهر مرة أخرى. سيُطلب من المالك تغيير كلمة المرور عند أول تسجيل دخول.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <Table<Clinic>
        columns={columns}
        data={sortedClinics}
        rowKey="id"
        loading={isLoading}
        sorting={{
          active: true,
          direction: sortDirection,
          onToggle: handleSortToggle,
        }}
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          onPageChange: setCurrentPage,
        }}
        footerContent={
          <div className="w-full flex justify-between items-center text-sm-medium">
            <span className="text-grey-600">
              {t('totalClinics')}: {totalCount}
            </span>
            <span className="text-Primary-600">
              {t('activePackages')}: {activeClinicsCount}
            </span>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      {renderDeleteModal()}
    </div>
  );
}
