'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Table, Drawer, DynamicForm, FormData, ConfirmationModal } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { ClinicDetails } from './components';
import { useClinicsStore } from '@/stores/clinics.store';
import { Clinic, CreateClinicRequest } from '@/domains/clinics/clinics.types';
import { packagesService, Package } from '@/services/packages.service';
import { calculateActiveClinics } from '@/domains/clinics/clinics.utils';
import { getAddClinicFormConfig } from './configs/form.config';
import { getClinicsTableColumns } from './configs/table.config';
import { sortByDate, getFriendlyErrorMessage } from '@/shared/utils';

// Drawer types
type DrawerType = 'add' | 'view' | null;

// Sort types
type SortDirection = 'asc' | 'desc';

// ========== Page Component ==========
export default function ClinicManagementPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const t = (key: string) => getTranslation(locale, `clinicManagement.${key}`);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Packages state
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // Zustand store
  const {
    clinics,
    isLoading,
    isCreating,
    error,
    fetchClinics,
    createClinic,
    deleteClinic,
    clearError,
  } = useClinicsStore();

  // Drawer state
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // Fetch clinics on mount
  useEffect(() => {
    fetchClinics(currentPage, 20);
  }, [fetchClinics, currentPage]);

  // Fetch packages when drawer opens
  const fetchPackages = async () => {
    if (packages.length > 0) return; // Already fetched
    setPackagesLoading(true);
    try {
      const data = await packagesService.getActive();
      setPackages(data);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    } finally {
      setPackagesLoading(false);
    }
  };

  // Open add drawer
  const openAddDrawer = () => {
    setDrawerType('add');
    setSelectedClinic(null);
    clearError();
    fetchPackages(); // Fetch packages when opening add drawer
  };

  // Open view drawer
  const openViewDrawer = (clinic: Clinic) => {
    setDrawerType('view');
    setSelectedClinic(clinic);
  };

  // Close drawer
  const closeDrawer = () => {
    setDrawerType(null);
    setSelectedClinic(null);
    clearError();
  };

  // Handle form submit
  const handleAddClinic = async (data: FormData) => {
    // Build the request object with all required fields
    const request: CreateClinicRequest = {
      clinicName: data.clinicName as string,
      clinicNameArabic: data.clinicNameArabic as string | undefined,
      phone: data.phone as string,
      email: data.email as string,
      address: data.address as string | undefined,
      city: data.city as string | undefined,
      country: data.country as string | undefined,
      logoUrl: data.logoUrl as string | undefined,
      packageId: Number(data.packageId),
      billingCycle: Number(data.billingCycle),
      ownerEmail: data.ownerEmail as string,
      ownerFirstName: data.ownerFirstName as string,
      ownerLastName: data.ownerLastName as string,
    };

    const result = await createClinic(request);
    if (result) {
      closeDrawer();
    }
  };

  // Open Delete Modal
  const openDeleteModal = (clinic: Clinic) => {
    setClinicToDelete(clinic);
    setDeleteStatus('idle');
    setDeleteErrorMessage('');
    setIsDeleteModalOpen(true);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (clinicToDelete) {
      if (deleteStatus === 'error') {
        // Retry scenario
        // setDeleteStatus('idle');
      }

      const success = await deleteClinic(clinicToDelete.id);

      if (success) {
        setDeleteStatus('success');
      } else {
        const currentError = useClinicsStore.getState().error;
        setDeleteErrorMessage(getFriendlyErrorMessage(currentError || '', t));
        setDeleteStatus('error');
      }
    }
  };

  // Toggle sort direction
  const handleSortToggle = () => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // Sort clinics
  const sortedClinics = useMemo(() => {
    return sortByDate(clinics, 'createdAt', sortDirection);
  }, [clinics, sortDirection]);

  // Calculate active clinics count using helper
  const activeClinicsCount = calculateActiveClinics(clinics);

  // Get table columns from config
  const columns = useMemo(
    () =>
      getClinicsTableColumns({
        t,
        onView: openViewDrawer,
        onDelete: openDeleteModal,
      }),
    [t]
  );

  // Get form config from config file
  const addClinicFormConfig = useMemo(
    () => getAddClinicFormConfig(packages, packagesLoading, t),
    [packages, packagesLoading, t]
  );

  // Drawer config based on type
  const getDrawerTitle = () => {
    switch (drawerType) {
      case 'add':
        return t('addClinic');
      case 'view':
        return t('clinicDetails');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">{t('pageTitle')}</h1>
        <Button onClick={openAddDrawer} variant="primary">
          {t('addClinic')}
        </Button>
      </div>

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
          totalPages: Math.ceil(clinics.length / 20) || 1, // Assumption: pageSize is 20
          onPageChange: setCurrentPage,
        }}
        footerContent={
          <div className="w-full flex justify-between items-center text-sm-medium">
            <span className="text-grey-600">
              {t('totalClinics')}: {clinics.length}
            </span>
            <span className="text-Primary-600">
              {t('activePackages')}: {activeClinicsCount}
            </span>
          </div>
        }
      />

      {/* Drawer */}
      <Drawer
        isOpen={!!drawerType}
        onClose={closeDrawer}
        title={getDrawerTitle()}
        size="lg"
      >
        {/* Add Clinic Form */}
        {drawerType === 'add' && (
          <DynamicForm
            config={addClinicFormConfig}
            onSubmit={handleAddClinic}
            isLoading={isCreating}
          />
        )}

        {/* View Clinic Details */}
        {drawerType === 'view' && selectedClinic && (
          <ClinicDetails
            clinic={selectedClinic}
            onSendNotification={() =>
              console.log('Send notification to:', selectedClinic?.id)
            }
          // No delete button in details view anymore
          />
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
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
    </div>
  );
}
