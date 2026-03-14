import { useState, useCallback } from 'react';
import { useClinicsStore } from '@/domains/clinics/clinics.store';
import { Clinic, CreateClinicRequest, UpdateClinicRequest } from '@/domains/clinics/clinics.types';
import { packagesService } from '@/domains/packages/packages.service';
import { featuresService } from '@/domains/features/features.service';
import type { Package } from '@/domains/packages/packages.types';
import type { Feature, FeatureCategory } from '@/domains/features/features.types';
import { getFriendlyErrorMessage } from '@/shared/utils';
import { SelectedFeature } from '../components/wizard/Step3Subscription';

export type PageView = 'list' | 'wizard' | 'details';

export function useClinicManagement(t: (key: string) => string) {
    const {
        clinics,
        isLoading,
        isCreating,
        isUpdating,
        error,
        totalCount,
        totalPages,
        fetchClinics,
        createClinic,
        updateClinic,
        deleteClinic,
        clearError,
    } = useClinicsStore();

    // View state
    const [pageView, setPageView] = useState<PageView>('list');
    const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

    // Filter/Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Packages state
    const [packages, setPackages] = useState<Package[]>([]);
    const [packagesLoading, setPackagesLoading] = useState(false);

    // Features API State
    const [features, setFeatures] = useState<Feature[]>([]);
    const [categories, setCategories] = useState<FeatureCategory[]>([]);
    const [featuresLoading, setFeaturesLoading] = useState(false);

    // View Details State
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

    const fetchPackagesAndFeatures = useCallback(async () => {
        // Run fetches concurrently if they don't have data
        setPackagesLoading(true);
        setFeaturesLoading(true);

        try {
            const fetchPackagesTask = async () => {
                if (packages.length > 0) return;
                const data = await packagesService.getActive();
                setPackages(data);
            };

            const fetchFeaturesTask = async () => {
                if (features.length > 0 && categories.length > 0) return;
                const [feats, cats] = await Promise.all([
                    featuresService.getAll(),
                    featuresService.getCategories(),
                ]);
                setFeatures(feats.filter((f) => f.isActive));
                setCategories(cats);
            };

            await Promise.allSettled([fetchPackagesTask(), fetchFeaturesTask()]);
        } catch (err) {
            console.error('Failed to pre-fetch package data:', err);
        } finally {
            setPackagesLoading(false);
            setFeaturesLoading(false);
        }
    }, [packages.length, features.length, categories.length]);

    const openAddWizard = useCallback(() => {
        setEditingClinic(null);
        clearError();
        fetchPackagesAndFeatures();
        setPageView('wizard');
    }, [clearError, fetchPackagesAndFeatures]);

    const openEditWizard = useCallback(
        (clinic: Clinic) => {
            setEditingClinic(clinic);
            clearError();
            fetchPackagesAndFeatures();
            setPageView('wizard');
        },
        [clearError, fetchPackagesAndFeatures]
    );

    const closeWizard = useCallback(() => {
        setPageView('list');
        setEditingClinic(null);
        clearError();
    }, [clearError]);

    const openViewDrawer = useCallback((clinic: Clinic) => {
        fetchPackagesAndFeatures();
        setSelectedClinic(clinic);
        setPageView('details');
    }, [fetchPackagesAndFeatures]);

    const closeViewDrawer = useCallback(() => {
        setPageView('list');
        setSelectedClinic(null);
    }, []);

    const openDeleteModal = useCallback((clinic: Clinic) => {
        setClinicToDelete(clinic);
        setDeleteStatus('idle');
        setDeleteErrorMessage('');
        setIsDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!clinicToDelete) return;
        
        const success = await deleteClinic(clinicToDelete.id);
        if (success) {
            setDeleteStatus('success');
            setTimeout(() => {
                setIsDeleteModalOpen(false);
                setClinicToDelete(null);
                setDeleteStatus('idle');
            }, 1500);
        } else {
            const currentError = useClinicsStore.getState().error;
            setDeleteErrorMessage(getFriendlyErrorMessage(currentError || '', t));
            setDeleteStatus('error');
        }
    }, [clinicToDelete, deleteClinic, t]);

    const handleWizardSubmit = useCallback(
        async (
            data: CreateClinicRequest,
            documents: { idCard: File | null; syndicateCard: File | null },
            customPackage?: { features: SelectedFeature[]; price: number } | null
        ) => {
            if (editingClinic) {
                const updateData: UpdateClinicRequest = {
                    name: data.clinicName,
                    nameArabic: data.clinicNameArabic,
                    phone: data.phone,
                    email: editingClinic.email,
                    address: data.address,
                    city: data.city,
                    country: data.country,
                };
                const result = await updateClinic(editingClinic.id, updateData);
                if (result) closeWizard();
            } else {
                let clinicData = { ...data };

                // Attach document files for form-data upload
                if (documents.idCard) {
                    clinicData.ownerIdDocument = documents.idCard;
                }
                if (documents.syndicateCard) {
                    clinicData.medicalLicenseDocument = documents.syndicateCard;
                }

                if (customPackage && customPackage.features.length > 0) {
                    try {
                        const pkgCode = `custom-${data.clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
                        const customPkg = await packagesService.create({
                            name: `${data.clinicName} - Custom Package`,
                            code: pkgCode,
                            description: `Custom package for ${data.clinicName}`,
                            monthlyPrice: customPackage.price,
                            yearlyPrice: customPackage.price * 10,
                            trialDays: 0,
                            isCustom: true,
                            isPublic: false,
                            features: customPackage.features.map((f) => ({
                                featureId: f.featureId,
                                limit: f.quantity,
                                calculatedPrice: 0,
                                isIncluded: true,
                            })),
                        });

                        await packagesService.activate(customPkg.id);
                        clinicData.packageId = String(customPkg.id);
                    } catch (err) {
                        console.error('Failed to create custom package:', err);
                        return;
                    }
                }

                const result = await createClinic(clinicData);
                if (result) closeWizard();
            }
        },
        [editingClinic, updateClinic, closeWizard, createClinic]
    );

    return {
        // State
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
        isDeleteModalOpen,
        clinicToDelete,
        deleteStatus,
        deleteErrorMessage,
        currentPage,
        sortDirection,
        // Handlers
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
    };
}
