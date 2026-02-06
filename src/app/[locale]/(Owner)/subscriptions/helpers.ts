import type { Package as PackageType } from '@/services/packages.service';
import type { Clinic } from '@/domains/clinics/clinics.types';

// ========== Types ==========
export interface TransformedPackage {
    id: string;
    badge: string;
    badgeColor: 'blue' | 'green' | 'gray';
    price: number;
    description: string;
    features: Array<{ text: string; icon?: string }>;
    isFeatured?: boolean;
}

export interface TransformedCustomPackage {
    id: string;
    /** Package name (not clinic name) */
    name: string;
    /** Clinic name */
    clinicName: string;
    /** Clinic email */
    email: string;
    price: number;
    features: Array<{ text: string; icon?: string }>;
    status: number;
}

// ========== Helper Functions ==========

/**
 * Map displayOrder to badge color
 */
export const getBadgeColor = (displayOrder: number): 'blue' | 'green' | 'gray' => {
    switch (displayOrder) {
        case 1: return 'gray';   // Starter
        case 2: return 'blue';   // Pro
        case 3: return 'green';  // Enterprise
        default: return 'gray';
    }
};

/**
 * Transform API package to local TransformedPackage type
 * @param pkg - Package from API
 * @param translations - Object containing translation functions or strings
 */
export const transformPackage = (
    pkg: PackageType,
    translations: {
        trialDays: string;
        yearlyPrice: string;
        currency: string;
    }
): TransformedPackage => ({
    id: String(pkg.id),
    badge: pkg.name,
    badgeColor: getBadgeColor(pkg.displayOrder),
    price: pkg.monthlyPrice,
    description: pkg.description,
    features: [
        { text: `${translations.trialDays}: ${pkg.trialDays}` },
        { text: `${translations.yearlyPrice}: ${pkg.yearlyPrice} ${translations.currency}` },
    ],
    isFeatured: pkg.displayOrder === 2, // Pro is featured
});

/**
 * Transform custom package to CustomCategoryCard props
 * @param pkg - Custom package from API
 * @param clinics - List of clinics to look up forClinicId
 */
export const transformCustomPackage = (
    pkg: PackageType,
    clinics: Clinic[]
): TransformedCustomPackage => {
    // Find the clinic this package belongs to
    const clinic = clinics.find(c => c.id === pkg.forClinicId);
    
    // Build features list from package features
    const featuresList: Array<{ text: string }> = pkg.features?.map(f => ({
        text: f.feature?.description || f.feature?.name || `Feature ${f.featureId}`
    })) || [];
    
    // Add basic package info as features if no features defined
    if (featuresList.length === 0) {
        featuresList.push({ text: `السعر الشهري: ${pkg.monthlyPrice} جنيها` });
        if (pkg.trialDays > 0) {
            featuresList.push({ text: `فترة تجربة: ${pkg.trialDays} يوم` });
        }
    }
    
    return {
        id: String(pkg.id),
        name: pkg.name,  // Package name (what user edits)
        clinicName: clinic?.name || 'عيادة غير معروفة',  // Clinic name
        email: clinic?.email || '',  // Clinic email
        price: pkg.monthlyPrice,
        features: featuresList,
        status: pkg.status,
    };
};


