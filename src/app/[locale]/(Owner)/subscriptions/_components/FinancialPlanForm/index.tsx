import React, { useState, useMemo } from 'react';
import { getGroupedLibraries, getGroupedBasicFeatures } from '@/domains/features/features.utils';
import type { FinancialPlanFormProps } from './types';
import type { FinancialPlanFormValues } from '../../types';
import { BasicInfoSection } from './BasicInfoSection';
import { FeaturesSection } from './FeaturesSection';
import { LibrariesSection } from './LibrariesSection';
import { BillingSection } from './BillingSection';
import { PriceSection } from './PriceSection';

function splitInitialFeatures(
    initialFeatures: Array<{ featureId: string; limit: number }> | undefined,
    initialLibs: string[] | undefined,
    libraryIds: Set<string>
): {
    basic: Array<{ featureId: string; limit: number }>;
    libs: string[];
} {
    if (!initialFeatures || (initialLibs && initialLibs.length > 0)) {
        return { basic: initialFeatures || [], libs: initialLibs || [] };
    }
    const basic: Array<{ featureId: string; limit: number }> = [];
    const libs: string[] = [];
    initialFeatures.forEach(f => {
        if (libraryIds.has(f.featureId)) {
            libs.push(f.featureId);
        } else {
            basic.push(f);
        }
    });
    return { basic, libs };
}

export function FinancialPlanForm({
    initialValues,
    onSubmit,
    onCancel,
    isLoading,
    features,
    categories,
    t: tProp,
}: FinancialPlanFormProps) {
    const t = tProp || ((k: string) => k);
    const librariesGroup = useMemo(() => getGroupedLibraries(features, categories), [features, categories]);
    const basicFeaturesGroup = useMemo(() => getGroupedBasicFeatures(features, librariesGroup), [features, librariesGroup]);
    const libraryIdSet = useMemo(() => new Set(librariesGroup.map(l => String(l.id))), [librariesGroup]);

    const { basic: initBasic, libs: initLibs } = useMemo(
        () => splitInitialFeatures(initialValues?.selectedFeatures, initialValues?.selectedLibraries, libraryIdSet),
        [initialValues, libraryIdSet]
    );

    const [planName, setPlanName] = useState(initialValues?.planName || '');
    const [planDetails, setPlanDetails] = useState(initialValues?.planDetails || '');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialValues?.billingCycle || 'monthly');
    const [price, setPrice] = useState(initialValues?.price || '');
    const [selectedFeatures, setSelectedFeatures] = useState(initBasic);
    const [selectedLibraries, setSelectedLibraries] = useState(initLibs);
    const [validationError, setValidationError] = useState<string | null>(null);

    const hasFeatures = selectedFeatures.length > 0 || selectedLibraries.length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!planName.trim()) {
            setValidationError(t('validation.planNameRequired') || 'يرجى إدخال اسم الخطة');
            return;
        }
        if (!hasFeatures) {
            setValidationError(t('validation.atLeastOneFeature') || 'يجب اختيار خاصية واحدة على الأقل');
            return;
        }
        if (!price || Number(price) <= 0) {
            setValidationError(t('validation.validPrice') || 'يرجى إدخال سعر صحيح');
            return;
        }
        setValidationError(null);
        onSubmit({
            planName,
            planDetails,
            billingCycle,
            price,
            selectedFeatures,
            selectedLibraries
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white relative">
            <div className="flex-1 overflow-y-auto w-full p-4 lg:p-6 custom-scrollbar space-y-8">
                <BasicInfoSection
                    planName={planName}
                    onPlanNameChange={setPlanName}
                    planDetails={planDetails}
                    onPlanDetailsChange={setPlanDetails}
                    t={t}
                />

                <FeaturesSection
                    features={basicFeaturesGroup}
                    selectedFeatures={selectedFeatures}
                    onChange={setSelectedFeatures}
                    t={t}
                />

                <LibrariesSection
                    libraries={librariesGroup}
                    selectedLibraries={selectedLibraries}
                    onChange={setSelectedLibraries}
                    t={t}
                />

                <BillingSection
                    billingCycle={billingCycle}
                    onChange={setBillingCycle}
                    t={t}
                />

                <PriceSection
                    price={price}
                    onChange={setPrice}
                    t={t}
                />
            </div>

            <div className="sticky bottom-0 right-0 left-0 bg-white border-t border-gray-100 p-4 lg:p-6 w-full flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                {validationError && (
                    <p className="text-red-500 text-sm text-center font-medium">{validationError}</p>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-semibold border-2 border-Primary-50 text-Primary-500 bg-white hover:bg-Primary-50 transition-colors disabled:opacity-50"
                    >
                        {t('form.cancel') || 'الغاء'}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-Primary-500 text-white hover:bg-Primary-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (t('form.saving') || 'جاري الحفظ...') : (t('form.save') || 'حفظ')}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default FinancialPlanForm;
