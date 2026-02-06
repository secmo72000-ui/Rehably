import type { Package } from '@/services/packages.service';

// ========== Drawer Types ==========
export type DrawerType = 'add' | 'edit' | null;
export type TabType = 'subscriptions' | 'financial-plans' | 'custom-categories';
export type DeleteStatus = 'idle' | 'deleting' | 'success' | 'error';

// ========== Form Value Types ==========

/**
 * Form values for creating/editing public packages
 * Fields match financialPlanFormConfig
 */
export interface PublicPackageFormValues {
    planName: string;
    planDetails: string;
    fullPrice: string;
    planFeatures: string[];
}

/**
 * Form values for creating/editing custom category packages
 * Fields match customCategoryFormConfig
 */
export interface CustomPackageFormValues {
    packageName: string;
    monthlyPrice: string;
    yearlyPrice: string;
    trialDays: string;
    selectedClinic: string;
    categoryFeatures: string[];
}

/**
 * Union type for any form submission
 */
export type PackageFormValues = PublicPackageFormValues | CustomPackageFormValues;

// ========== Controller State Types ==========

export interface DrawerState {
    type: DrawerType;
    selectedPackage: Package | null;
}

export interface DeleteState {
    packageId: string | null;
    status: DeleteStatus;
}
