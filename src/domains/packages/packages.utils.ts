import { Package } from './packages.types';

export interface TransformedPackage {
    id: string;
    badge: string;
    badgeColor: 'blue' | 'green' | 'gray';
    price: number;
    description: string;
    features: Array<{ text: string; icon?: string }>;
    isFeatured?: boolean;
}

/**
 * Helper to map package features to a unified display string.
 */
export function mapPackageFeaturesToDisplay(pkg: Package) {
    return (
        pkg.features?.map((f) => ({
            text: `${f.featureName || ''}${f.limit && f.limit > 0 ? `: ${f.limit}` : ''}`,
        })) || []
    );
}

export const getBadgeColor = (displayOrder: number): 'blue' | 'green' | 'gray' => {
    switch (displayOrder) {
        case 1: return 'gray';   // Starter
        case 2: return 'blue';   // Pro
        case 3: return 'green';  // Enterprise
        default: return 'gray';
    }
};

export const transformPackage = (
    pkg: Package,
    billingCycle: 'monthly' | 'yearly',
    noFeaturesText: string
): TransformedPackage => {
    const featuresList = pkg.features ? mapPackageFeaturesToDisplay(pkg) : [];
    
    return {
        id: String(pkg.id),
        badge: pkg.name,
        badgeColor: getBadgeColor(pkg.displayOrder),
        price: billingCycle === 'yearly' ? pkg.yearlyPrice : pkg.monthlyPrice,
        description: pkg.description,
        features: featuresList.length > 0 ? featuresList : [{ text: noFeaturesText }],
        isFeatured: pkg.displayOrder === 2,
    };
};
