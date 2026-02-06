'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { usePackagesStore } from '@/stores/packages.store';
import { useFeaturesStore } from '@/stores/features.store';
import { useClinicsStore } from '@/stores/clinics.store';
import type { Package } from '@/services/packages.service';
import type { Feature } from '@/services/features.service';
import type { Clinic } from '@/domains/clinics/clinics.types';
import type { TabType, DrawerType, PublicPackageFormValues, CustomPackageFormValues } from './types';
import type { FormData as DynamicFormData, DynamicFormConfig } from '@/ui/components/DynamicForm/types';
import { 
    buildCreatePublicPackageRequest, 
    buildCreateCustomPackageRequest, 
    buildUpdatePackageRequest 
} from './mappers';
import { financialPlanFormConfig, featureFormConfig, getCustomCategoryFormConfig } from './configs';

export interface UseSubscriptionsPageReturn {
    // Store data
    packages: Package[];
    customPackages: Package[];
    features: Feature[];
    clinics: Clinic[];
    
    // Loading states
    isLoading: boolean;
    isLoadingCustom: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isArchiving: boolean;
    error: string | null;
    
    // Tab state
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tabs: Array<{ id: string; label: string }>;
    
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
    handleFormSubmit: (data: DynamicFormData) => void;
    handleFeatureEdit: (featureId: string) => void;
    handleFeatureDelete: (featureId: string) => void;
    
    // Form config helpers
    getDrawerTitle: () => string;
    getFormSubmitLabel: () => string;
    getFormConfig: () => DynamicFormConfig;
    getDefaultValues: () => DynamicFormData | undefined;
    
    // Dynamic configs
    dynamicFinancialPlanConfig: DynamicFormConfig;
    dynamicCustomCategoryConfig: DynamicFormConfig;
    
    // Package actions
    activatePackage: (id: number) => Promise<boolean>;
}

export function useSubscriptionsPage(): UseSubscriptionsPageReturn {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = useCallback((key: string) => getTranslation(locale, `subscriptions.${key}`), [locale]);
    
    // ========== Store Access ==========
    const {
        packages,
        customPackages,
        isLoading,
        isLoadingCustom,
        isCreating,
        isUpdating,
        isArchiving,
        error,
        fetchPackages,
        fetchCustomPackages,
        archivePackage,
        activatePackage,
        createPackage,
        createCustomPackage,
        updatePackage
    } = usePackagesStore();
    
    const { features, fetchFeatures } = useFeaturesStore();
    const { clinics, fetchClinics } = useClinicsStore();

    // ========== Data Fetching ==========
    useEffect(() => {
        fetchPackages();
        fetchCustomPackages();
        fetchFeatures();
        fetchClinics();
    }, [fetchPackages, fetchCustomPackages, fetchFeatures, fetchClinics]);

    // ========== Dynamic Form Configs ==========
    const featureOptions = useMemo(() => {
        return features.map(f => ({
            value: String(f.id),
            label: f.description || f.name
        }));
    }, [features]);

    const dynamicFinancialPlanConfig = useMemo(() => {
        const config = { ...financialPlanFormConfig };
        const rows = config.rows.map(row => ({
            ...row,
            fields: row.fields.map(field => {
                if (field.name === 'planFeatures') {
                    return { ...field, options: featureOptions };
                }
                return field;
            })
        }));
        return { ...config, rows };
    }, [featureOptions]);

    const dynamicCustomCategoryConfig = useMemo(() => {
        return getCustomCategoryFormConfig(clinics, features);
    }, [clinics, features]);

    // ========== Tab State ==========
    const [activeTab, setActiveTab] = useState<string>('subscriptions');
    
    const tabs = useMemo(() => [
        { id: 'subscriptions', label: t('tabs.subscriptions') },
        { id: 'financial-plans', label: t('tabs.financialPlans') },
        { id: 'custom-categories', label: t('tabs.customCategories') },
    ], [t]);

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
            const success = await archivePackage(Number(packageToDelete));
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

    // ========== Feature Handlers ==========
    const handleFeatureEdit = useCallback((featureId: string) => {
        console.log('Edit feature:', featureId);
        // TODO: Implement feature edit logic
    }, []);

    const handleFeatureDelete = useCallback((featureId: string) => {
        console.log('Delete feature:', featureId);
        // TODO: Implement feature delete logic
    }, []);

    // ========== Form Submission ==========
    const handleAddPackage = useCallback(async (data: PublicPackageFormValues) => {
        const request = buildCreatePublicPackageRequest(data);
        const success = await createPackage(request);
        if (success) {
            closeDrawer();
        }
    }, [createPackage, closeDrawer]);

    const handleAddCustomPackage = useCallback(async (data: CustomPackageFormValues) => {
        const request = buildCreateCustomPackageRequest(data);
        const success = await createCustomPackage(request);
        if (success) {
            closeDrawer();
        }
    }, [createCustomPackage, closeDrawer]);

    const handleUpdatePackageSubmit = useCallback(async (
        data: PublicPackageFormValues | CustomPackageFormValues
    ) => {
        if (!selectedPackage) return;
        const request = buildUpdatePackageRequest(selectedPackage, data);
        const success = await updatePackage(selectedPackage.id, request);
        if (success) {
            closeDrawer();
        }
    }, [selectedPackage, updatePackage, closeDrawer]);

    const handleFormSubmit = useCallback((data: DynamicFormData) => {
        if (activeTab === 'subscriptions') {
            if (drawerType === 'add') {
                handleAddPackage(data as unknown as PublicPackageFormValues);
            } else if (drawerType === 'edit') {
                handleUpdatePackageSubmit(data as unknown as PublicPackageFormValues);
            }
        } else if (activeTab === 'custom-categories') {
            if (drawerType === 'add') {
                handleAddCustomPackage(data as unknown as CustomPackageFormValues);
            } else if (drawerType === 'edit') {
                handleUpdatePackageSubmit(data as unknown as CustomPackageFormValues);
            }
        } else {
            console.log('Form submitted:', data);
            closeDrawer();
        }
    }, [activeTab, drawerType, handleAddPackage, handleAddCustomPackage, handleUpdatePackageSubmit, closeDrawer]);

    // ========== Form Config Helpers ==========
    const getDrawerTitle = useCallback((): string => {
        if (activeTab === 'financial-plans') {
            return drawerType === 'add' ? t('drawer.addFeature') : t('drawer.editFeature');
        }
        if (activeTab === 'custom-categories') {
            return drawerType === 'add' ? t('drawer.addCustomPlan') : t('drawer.editCustomCategory');
        }
        return drawerType === 'add' ? t('drawer.addFinancialPlan') : t('drawer.editFinancialPlan');
    }, [activeTab, drawerType, t]);

    const getFormSubmitLabel = useCallback((): string => {
        if (activeTab === 'financial-plans') {
            return drawerType === 'add' ? t('form.addFeature') : t('form.saveChanges');
        }
        if (activeTab === 'custom-categories') {
            return drawerType === 'add' ? 'إضافة باقة خاصة' : t('form.saveChanges');
        }
        return drawerType === 'add' ? t('form.addFinancialPlan') : t('form.saveChanges');
    }, [activeTab, drawerType, t]);

    const getFormConfig = useCallback(() => {
        if (activeTab === 'financial-plans') {
            return featureFormConfig;
        }
        if (activeTab === 'custom-categories') {
            return dynamicCustomCategoryConfig;
        }
        return dynamicFinancialPlanConfig;
    }, [activeTab, dynamicCustomCategoryConfig, dynamicFinancialPlanConfig]);

    const getDefaultValues = useCallback((): DynamicFormData | undefined => {
        if (!selectedPackage) return undefined;

        if (activeTab === 'custom-categories') {
            return {
                selectedClinic: String(selectedPackage.forClinicId),
                packageName: selectedPackage.name,
                categoryFeatures: selectedPackage.features?.map(f => String(f.featureId)) || [],
                monthlyPrice: selectedPackage.monthlyPrice,
                yearlyPrice: selectedPackage.yearlyPrice,
                trialDays: selectedPackage.trialDays,
            };
        }

        return {
            planName: selectedPackage.name,
            planDetails: selectedPackage.description,
            fullPrice: selectedPackage.monthlyPrice,
            planFeatures: selectedPackage.features?.map(f => String(f.featureId)) || []
        };
    }, [selectedPackage, activeTab]);

    // ========== Return ==========
    return {
        // Store data
        packages,
        customPackages,
        features,
        clinics,
        
        // Loading states
        isLoading,
        isLoadingCustom,
        isCreating,
        isUpdating,
        isArchiving,
        error,
        
        // Tab state
        activeTab,
        setActiveTab,
        tabs,
        
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
        handleFeatureEdit,
        handleFeatureDelete,
        
        // Form config helpers
        getDrawerTitle,
        getFormSubmitLabel,
        getFormConfig,
        getDefaultValues,
        
        // Dynamic configs
        dynamicFinancialPlanConfig,
        dynamicCustomCategoryConfig,
        
        // Package actions
        activatePackage,
    };
}
