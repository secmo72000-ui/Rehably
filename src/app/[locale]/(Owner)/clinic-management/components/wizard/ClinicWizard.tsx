'use client';

import React, { useState, useEffect } from 'react';
import { StepIndicator } from './StepIndicator';
import { Step1CreateClinic, Step1Data, Step1Errors, validateStep1, isStep1Valid } from './Step1CreateClinic';
import { Step2VerifyClinic, Step2Data } from './Step2VerifyClinic';
import { Step3Subscription, Step3Data, SelectedFeature } from './Step3Subscription';
import { Button } from '@/ui/primitives';
import { ConfirmationModal } from '@/ui/components';
import { Clinic, CreateClinicRequest } from '@/domains/clinics/clinics.types';
import type { Package } from '@/domains/packages/packages.types';
import type { Feature, FeatureCategory } from '@/domains/features/features.types';

export interface ClinicWizardProps {
    /** If editing, pass existing clinic data */
    clinic?: Clinic | null;
    /** Available packages for step 3 */
    packages: Package[];
    packagesLoading: boolean;
    features: Feature[];
    categories: FeatureCategory[];
    featuresLoading: boolean;
    /** Translation function */
    t: (key: string) => string;
    /** Whether RTL */
    isRtl: boolean;
    /** Loading state when submitting */
    isSubmitting: boolean;
    /** Called when wizard completes */
    onSubmit: (
        data: CreateClinicRequest,
        documents: { idCard: File | null; syndicateCard: File | null },
        customPackage?: { features: SelectedFeature[]; price: number } | null
    ) => void;
    /** Called when wizard is closed/cancelled */
    onClose: () => void;
}

const initialStep1Data: Step1Data = {
    clinicNameArabic: '',
    clinicName: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    phone: '',
    email: '',
    city: '',
    country: '',
    address: '',
    slug: '',
};

const initialStep2Data: Step2Data = {
    idCardFile: null,
    idCardPreview: null,
    syndicateCardFile: null,
    syndicateCardPreview: null,
};

const initialStep3Data: Step3Data = {
    planType: 'existing',
    billingCycle: 'monthly',
    selectedPackageId: null,
    subscriptionStartDate: '',
    subscriptionEndDate: '',
    paymentMethod: '',
    paymentStatus: 'unpaid',
    customFeatures: [],
    customPrice: '',
    selectedLibraries: [],
};

export function ClinicWizard({
    clinic,
    packages,
    packagesLoading,
    features,
    categories,
    featuresLoading,
    t,
    isRtl,
    isSubmitting,
    onSubmit,
    onClose,
}: ClinicWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Step1Data>(initialStep1Data);
    const [step2Data, setStep2Data] = useState<Step2Data>(initialStep2Data);
    const [step3Data, setStep3Data] = useState<Step3Data>(initialStep3Data);

    // Validation state
    const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
    const [step1Touched, setStep1Touched] = useState(false);

    // Confirmation modal state
    const [isConfirmEditOpen, setIsConfirmEditOpen] = useState(false);

    const isEditing = !!clinic;

    // Pre-fill data when editing
    useEffect(() => {
        if (clinic) {
            setStep1Data({
                clinicNameArabic: clinic.nameArabic || '',
                clinicName: clinic.name || '',
                ownerFirstName: clinic.ownerFirstName || '',
                ownerLastName: clinic.ownerLastName || '',
                ownerEmail: clinic.ownerEmail || '',
                phone: clinic.phone || '',
                email: clinic.email || '',
                city: clinic.city || '',
                country: clinic.country || '',
                address: clinic.address || '',
                slug: clinic.slug || '',
            });
            if (clinic.subscriptionPlanId) {
                setStep3Data((prev) => ({
                    ...prev,
                    selectedPackageId: clinic.subscriptionPlanId,
                    subscriptionStartDate: clinic.subscriptionStartDate?.split('T')[0] || '',
                    subscriptionEndDate: clinic.subscriptionEndDate?.split('T')[0] || '',
                }));
            }
        }
    }, [clinic]);

    const steps = [
        { label: t('wizard.steps.createClinic') },
        { label: t('wizard.steps.verifyClinic') },
        { label: t('wizard.steps.subscription') },
    ];

    const handleStep1Change = (field: keyof Step1Data, value: string) => {
        setStep1Data((prev) => {
            const updated = { ...prev, [field]: value };
            // Re-validate live if already touched
            if (step1Touched) {
                setStep1Errors(validateStep1(updated, t));
            }
            return updated;
        });
    };

    const handleStep2Change = (field: keyof Step2Data, value: File | string | null) => {
        setStep2Data((prev) => ({ ...prev, [field]: value }));
    };

    const handleStep3Change = (field: keyof Step3Data, value: string | null) => {
        setStep3Data((prev) => ({ ...prev, [field]: value }));
    };

    const handleCustomFeaturesChange = (features: SelectedFeature[]) => {
        setStep3Data((prev) => ({ ...prev, customFeatures: features }));
    };

    const handleLibrariesChange = (libraries: string[]) => {
        setStep3Data((prev) => ({ ...prev, selectedLibraries: libraries }));
    };

    const handleNext = () => {
        if (currentStep === 1) {
            setStep1Touched(true);
            const errors = validateStep1(step1Data, t);
            setStep1Errors(errors);
            if (!isStep1Valid(errors)) return;
        }
        if (currentStep < 3) {
            setCurrentStep((prev) => prev + 1);
        } else {
            if (isEditing) {
                setIsConfirmEditOpen(true);
            } else {
                handleSubmit();
            }
        }
    };

    // Check if next button should be disabled
    const isNextDisabled = (): boolean => {
        if (isSubmitting) return true;
        if (currentStep === 1 && step1Touched && !isStep1Valid(step1Errors)) return true;
        return false;
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        const request: CreateClinicRequest = {
            clinicName: step1Data.clinicName,
            clinicNameArabic: step1Data.clinicNameArabic || undefined,
            phone: step1Data.phone,
            email: step1Data.ownerEmail,
            address: step1Data.address || undefined,
            city: step1Data.city || undefined,
            country: step1Data.country || undefined,
            ownerEmail: step1Data.ownerEmail,
            ownerFirstName: step1Data.ownerFirstName,
            ownerLastName: step1Data.ownerLastName,
            packageId: step3Data.planType === 'existing'
                ? (step3Data.selectedPackageId || undefined)
                : undefined, // Custom package will be created separately
            billingCycle: step3Data.billingCycle === 'monthly' ? 0 : 1,
            paymentType: step3Data.paymentMethod ? Number(step3Data.paymentMethod) : 0,
        };

        const customPackageData = step3Data.planType === 'custom'
            ? {
                features: step3Data.customFeatures,
                price: parseFloat(step3Data.customPrice) || 0,
            }
            : null;

        onSubmit(
            request,
            {
                idCard: step2Data.idCardFile,
                syndicateCard: step2Data.syndicateCardFile,
            },
            customPackageData
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-grey-800">
                    {isEditing ? t('wizard.titleEdit') : t('wizard.titleAdd')}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5 text-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Step Indicator */}
            <StepIndicator steps={steps} currentStep={currentStep} />

            {/* Step Content */}
            <div className="min-h-[400px]">
                {currentStep === 1 && (
                    <Step1CreateClinic
                        data={step1Data}
                        errors={step1Errors}
                        onChange={handleStep1Change}
                        t={t}
                        isRtl={isRtl}
                    />
                )}
                {currentStep === 2 && (
                    <Step2VerifyClinic
                        data={step2Data}
                        onChange={handleStep2Change}
                        t={t}
                    />
                )}
                {currentStep === 3 && (
                    <Step3Subscription
                        data={step3Data}
                        onChange={handleStep3Change}
                        onCustomFeaturesChange={handleCustomFeaturesChange}
                        onLibrariesChange={handleLibrariesChange}
                        packages={packages}
                        packagesLoading={packagesLoading}
                        features={features}
                        categories={categories}
                        featuresLoading={featuresLoading}
                        t={t}
                        isRtl={isRtl}
                    />
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 mt-8">
                {/* التالي button */}
                <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={isNextDisabled()}
                    className="flex-1 max-w-sm py-3"
                >
                    {isSubmitting
                        ? t('common.loading')
                        : currentStep === 3
                            ? t('wizard.submit')
                            : t('wizard.next')
                    }
                </Button>

                {/* رجوع button */}
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="text-sm font-medium text-grey-500 hover:text-grey-700 transition-colors"
                    >
                        {t('wizard.back')}
                    </button>
                )}
            </div>

            {/* Edit Confirmation Modal */}
            {isEditing && (
                <ConfirmationModal
                    isOpen={isConfirmEditOpen}
                    onClose={() => setIsConfirmEditOpen(false)}
                    onConfirm={() => {
                        setIsConfirmEditOpen(false);
                        handleSubmit();
                    }}
                    title={t('wizard.confirmEditTitle') || 'تأكيد التعديل'}
                    confirmText={t('wizard.confirmEditButton') || 'تأكيد'}
                    cancelText={t('confirmationModal.cancel') || 'إلغاء'}
                    variant="primary"
                >
                    <p className="text-gray-600 text-lg">
                        {t('wizard.confirmEditMessage') || 'هل تريد تأكيد تعديل بيانات العيادة؟'}
                    </p>
                </ConfirmationModal>
            )}
        </div>
    );
}
