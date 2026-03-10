import type { Package } from '@/domains/packages/packages.types';
import type { Feature, FeatureCategory } from '@/domains/features/features.types';

export interface SelectedFeature {
    featureId: string;
    quantity: number;
}

export interface Step3Data {
    planType: 'existing' | 'custom';
    billingCycle: 'monthly' | 'yearly';
    selectedPackageId: string | null;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    paymentMethod: string;
    paymentStatus: 'paid' | 'unpaid';
    customFeatures: SelectedFeature[];
    customPrice: string;
    selectedLibraries: string[];
}

export interface Step3Props {
    data: Step3Data;
    onChange: (field: keyof Step3Data, value: string | null) => void;
    onCustomFeaturesChange: (features: SelectedFeature[]) => void;
    onLibrariesChange: (libraries: string[]) => void;
    packages: Package[];
    packagesLoading: boolean;
    features: Feature[];
    categories: FeatureCategory[];
    featuresLoading: boolean;
    t: (key: string) => string;
    isRtl: boolean;
}
