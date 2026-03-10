'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { usePackagesStore } from '@/domains/packages/packages.store';
import { useFeaturesStore } from '@/domains/features/features.store';
import type { Package } from '@/domains/packages/packages.types';
import type { Feature, FeatureCategory } from '@/domains/features/features.types';
import type { DrawerType, FinancialPlanFormValues } from './types';
import { buildCreatePackageRequest, buildUpdatePackageRequest } from './mappers';

export interface UseSubscriptionsPageReturn {
    // Store data
    packages: Package[];
    features: Feature[];
    categories: FeatureCategory[];
    
    // Loading states
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isArchiving: boolean;
    error: string | null;
    
    // Drawer state
    drawerType: DrawerType;
    selectedPackage: Package | null;
    openAddDrawer: () => void;
    openEditDrawer: (pkg: Package) => void;
    closeDrawer: () => void;
    
    // Delete modal state
    deleteModalOpen: boolean;
    deleteStatus: 'idle' | 'success' | 'error';
    deleteErrorMessage: string;
    handleDelete: (pkgId: string) => void;
    confirmDelete: () => Promise<void>;
    closeDeleteModal: () => void;
    
    // Form handlers
    handleFormSubmit: (data: FinancialPlanFormValues) => void;
    
    // Form config helpers
    getDrawerTitle: () => string;
    getDefaultValues: () => Partial<FinancialPlanFormValues> | undefined;
    
    // Package actions
    activatePackage: (id: number | string) => Promise<boolean>;
}

export function useSubscriptionsPage(): UseSubscriptionsPageReturn {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = useCallback((key: string) => getTranslation(locale, `subscriptions.${key}`), [locale]);
    
    // ========== Store Access ==========
    const {
        packages,
        isLoading,
        isCreating,
        isUpdating,
        isArchiving,
        error,
        fetchPackages,
        archivePackage,
        activatePackage,
        createPackage,
        updatePackage
    } = usePackagesStore();
    
    const { features, categories, fetchFeatures } = useFeaturesStore();

    // ========== Data Fetching ==========
    useEffect(() => {
        fetchPackages();
        fetchFeatures();
    }, [fetchPackages, fetchFeatures]);

    // ========== Drawer State ==========
    const [drawerType, setDrawerType] = useState<DrawerType>(null);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

    const openAddDrawer = useCallback(() => {
        setDrawerType('add');
        setSelectedPackage(null);
    }, []);

    const openEditDrawer = useCallback((pkg: Package) => {
        setDrawerType('edit');
        setSelectedPackage(pkg);
    }, []);

    const closeDrawer = useCallback(() => {
        setDrawerType(null);
        setSelectedPackage(null);
    }, []);

    // ========== Delete Modal State ==========
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

    const handleDelete = useCallback((pkgId: string) => {
        setPackageToDelete(pkgId);
        setDeleteStatus('idle');
        setDeleteErrorMessage('');
        setDeleteModalOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (packageToDelete) {
            const success = await archivePackage(packageToDelete);
            if (success) {
                setDeleteStatus('success');
            } else {
                setDeleteStatus('error');
                setDeleteErrorMessage(error || t('deleteModal.errorMessage'));
            }
        }
    }, [packageToDelete, archivePackage, error, t]);

    const closeDeleteModal = useCallback(() => {
        setDeleteModalOpen(false);
        setTimeout(() => {
            setPackageToDelete(null);
            setDeleteStatus('idle');
        }, 300);
    }, []);

    // ========== Form Submission ==========
    const handleAddPackage = useCallback(async (data: FinancialPlanFormValues) => {
        const request = buildCreatePackageRequest(data);
        const success = await createPackage(request);
        if (success) {
            const newPkg = usePackagesStore.getState().packages.at(-1);
            if (newPkg?.id) {
                await activatePackage(newPkg.id);
            }
            closeDrawer();
        }
    }, [createPackage, activatePackage, closeDrawer]);

    const handleUpdatePackageSubmit = useCallback(async (data: FinancialPlanFormValues) => {
        if (!selectedPackage) return;
        const request = buildUpdatePackageRequest(selectedPackage, data);
        const success = await updatePackage(selectedPackage.id, request);
        if (success) {
            closeDrawer();
        }
    }, [selectedPackage, updatePackage, closeDrawer]);

    const handleFormSubmit = useCallback((data: FinancialPlanFormValues) => {
        if (drawerType === 'add') {
            handleAddPackage(data);
        } else if (drawerType === 'edit') {
            handleUpdatePackageSubmit(data);
        }
    }, [drawerType, handleAddPackage, handleUpdatePackageSubmit]);

    // ========== Form Config Helpers ==========
    const getDrawerTitle = useCallback((): string => {
        return drawerType === 'add' ? t('drawer.addFinancialPlan') : t('drawer.editFinancialPlan');
    }, [drawerType, t]);

    const getDefaultValues = useCallback((): Partial<FinancialPlanFormValues> | undefined => {
        if (!selectedPackage) return undefined;

        // Since we don't store selectedLibraries as a distinct list in the backend, 
        // they are likely all inside selectedPackage.features. 
        // We will just map all features to selectedFeatures for now, 
        // and the FinancialPlanForm component will split them back visually.
        const allFeatures = selectedPackage.features || [];

        return {
            planName: selectedPackage.name,
            planDetails: selectedPackage.description,
            price: String(selectedPackage.monthlyPrice),
            billingCycle: 'monthly', // default
            selectedFeatures: allFeatures.map(f => ({
                featureId: String(f.featureId),
                limit: f.quantity || 0
            })),
            selectedLibraries: [] // form should handle identifying which features are libraries
        };
    }, [selectedPackage]);

    // ========== Return ==========
    return {
        // Store data
        packages,
        features,
        categories,
        
        // Loading states
        isLoading,
        isCreating,
        isUpdating,
        isArchiving,
        error,
        
        // Drawer state
        drawerType,
        selectedPackage,
        openAddDrawer,
        openEditDrawer,
        closeDrawer,
        
        // Delete modal state
        deleteModalOpen,
        deleteStatus,
        deleteErrorMessage,
        handleDelete,
        confirmDelete,
        closeDeleteModal,
        
        // Form handlers
        handleFormSubmit,
        
        // Form config helpers
        getDrawerTitle,
        getDefaultValues,
        
        // Package actions
        activatePackage,
    };
}

