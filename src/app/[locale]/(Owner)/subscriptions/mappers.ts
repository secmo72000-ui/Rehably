import type { CreatePackageRequest, UpdatePackageRequest, Package } from '@/domains/packages/packages.types';
import type { FinancialPlanFormValues } from './types';

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
        .replace(/\-\-+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start of text
        .replace(/-+$/, '');        // Trim - from end of text
}

function buildFeaturesList(form: FinancialPlanFormValues): CreatePackageRequest['features'] {
    const toFeatureId = (id: string): number | string => {
        const num = Number(id);
        return Number.isNaN(num) ? id : num;
    };
    return [
        ...form.selectedFeatures.map((f) => ({
            featureId: toFeatureId(f.featureId),
            quantity: f.limit || 0,
            calculatedPrice: 0,
            isIncluded: true
        })),
        ...form.selectedLibraries.map((libId) => ({
            featureId: toFeatureId(libId),
            quantity: 0,
            calculatedPrice: 0,
            isIncluded: true
        }))
    ];
}

/**
 * Build CreatePackageRequest from financial plan form values
 */
export function buildCreatePackageRequest(
    form: FinancialPlanFormValues
): CreatePackageRequest {
    const isYearly = form.billingCycle === 'yearly';
    const price = Number(form.price);
    const features = buildFeaturesList(form);

    return {
        name: form.planName,
        description: form.planDetails,
        monthlyPrice: isYearly ? Math.round(price / 12) : price, // Adjust logic based on API expectation, or maybe just send what is requested
        yearlyPrice: isYearly ? price : price * 12,
        trialDays: 0,
        features,
        isPublic: true,
        isCustom: false,
        displayOrder: 0,
        code: `${slugify(form.planName) || 'pkg'}-${Date.now()}`,
    };
}

/**
 * Build UpdatePackageRequest from form values and existing package
 */
export function buildUpdatePackageRequest(
    pkg: Package,
    form: FinancialPlanFormValues
): UpdatePackageRequest {
    const isYearly = form.billingCycle === 'yearly';
    const price = Number(form.price);
    const features = buildFeaturesList(form);

    return {
        id: pkg.id,
        name: form.planName,
        description: form.planDetails,
        monthlyPrice: isYearly ? Math.round(price / 12) : price,
        yearlyPrice: isYearly ? price : price * 12,
        trialDays: pkg.trialDays || 0,
        features,
        isPublic: pkg.isPublic,
        isCustom: pkg.isCustom,
        displayOrder: pkg.displayOrder,
        code: pkg.code,
        forClinicId: pkg.forClinicId || undefined,
    };
}
