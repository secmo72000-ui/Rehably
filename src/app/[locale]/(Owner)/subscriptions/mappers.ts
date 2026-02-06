import type { CreatePackageRequest, UpdatePackageRequest, Package } from '@/services/packages.service';
import type { PublicPackageFormValues, CustomPackageFormValues } from './types';

/**
 * Build CreatePackageRequest from public package form values
 */
export function buildCreatePublicPackageRequest(
    form: PublicPackageFormValues
): CreatePackageRequest {
    return {
        name: form.planName,
        description: form.planDetails,
        monthlyPrice: Number(form.fullPrice),
        yearlyPrice: Number(form.fullPrice) * 10,
        trialDays: 14,
        features: (form.planFeatures || []).map((featureId) => ({
            featureId: Number(featureId),
            quantity: 0,
            calculatedPrice: 0,
            isIncluded: true
        })),
        isPublic: true,
        isCustom: false,
        displayOrder: 0,
        code: String(Math.floor(Math.random() * 1000)),
    };
}

/**
 * Build CreatePackageRequest from custom package form values
 */
export function buildCreateCustomPackageRequest(
    form: CustomPackageFormValues
): CreatePackageRequest {
    return {
        name: form.packageName,
        description: form.packageName,
        monthlyPrice: Number(form.monthlyPrice),
        yearlyPrice: Number(form.yearlyPrice) || Number(form.monthlyPrice) * 10,
        trialDays: Number(form.trialDays) || 0,
        features: (form.categoryFeatures || []).map((featureId) => ({
            featureId: Number(featureId),
            quantity: 0,
            calculatedPrice: 0,
            isIncluded: true
        })),
        isPublic: false,
        isCustom: true,
        forClinicId: Number(form.selectedClinic),
        displayOrder: 0,
        code: String(Math.floor(Math.random() * 1000)),
    };
}

/**
 * Build UpdatePackageRequest from form values and existing package
 */
export function buildUpdatePackageRequest(
    pkg: Package,
    form: PublicPackageFormValues | CustomPackageFormValues
): UpdatePackageRequest {
    // Determine if it's a public or custom package form
    const isPublicForm = 'planName' in form;
    
    const name = isPublicForm 
        ? (form as PublicPackageFormValues).planName 
        : (form as CustomPackageFormValues).packageName;
    
    const description = isPublicForm 
        ? (form as PublicPackageFormValues).planDetails 
        : (form as CustomPackageFormValues).packageName;
    
    const monthlyPrice = isPublicForm 
        ? Number((form as PublicPackageFormValues).fullPrice)
        : Number((form as CustomPackageFormValues).monthlyPrice);
    
    const features = isPublicForm
        ? (form as PublicPackageFormValues).planFeatures
        : (form as CustomPackageFormValues).categoryFeatures;

    return {
        id: pkg.id,
        name,
        description,
        monthlyPrice,
        yearlyPrice: monthlyPrice * 10,
        trialDays: pkg.trialDays || 14,
        features: (features || []).map((featureId) => ({
            featureId: Number(featureId),
            quantity: 0,
            calculatedPrice: 0,
            isIncluded: true
        })),
        isPublic: pkg.isPublic,
        isCustom: pkg.isCustom,
        displayOrder: pkg.displayOrder,
        code: pkg.code,
        forClinicId: pkg.forClinicId || undefined,
    };
}
