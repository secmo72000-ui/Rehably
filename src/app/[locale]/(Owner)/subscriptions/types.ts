import type { Package } from '@/domains/packages/packages.types';

// ========== Drawer Types ==========
export type DrawerType = 'add' | 'edit' | null;
export type TabType = 'subscriptions';
export type DeleteStatus = 'idle' | 'deleting' | 'success' | 'error';

// ========== Form Value Types ==========
export interface FinancialPlanFormValues {
    planName: string;
    planDetails: string;
    billingCycle: 'monthly' | 'yearly';
    price: string;
    selectedFeatures: Array<{ featureId: string; limit: number }>;
    selectedLibraries: string[];
}

export type PackageFormValues = FinancialPlanFormValues;

// ========== Controller State Types ==========
export interface DrawerState {
    type: DrawerType;
    selectedPackage: Package | null;
}

export interface DeleteState {
    packageId: string | null;
    status: DeleteStatus;
}
