'use client';

import React from 'react';
import { LIBRARY_TYPES, type Feature, type FeatureCategory } from '@/domains/features';
import { FeatureCheckboxRow } from '@/ui/components/FeatureSelection';
import { Input } from '@/ui/primitives';
import { Step3Data, SelectedFeature } from './types';

interface CustomPackageViewProps {
    data: Step3Data;
    onChange: (field: keyof Step3Data, value: string | null) => void;
    onCustomFeaturesChange: (features: SelectedFeature[]) => void;
    onLibrariesChange: (libraries: string[]) => void;
    features: Feature[];
    categories: FeatureCategory[];
    featuresLoading: boolean;
    t: (key: string) => string;
    isRtl: boolean;
}

export function CustomPackageView({
    data,
    onChange,
    onCustomFeaturesChange,
    onLibrariesChange,
    features,
    categories,
    featuresLoading,
    t,
    isRtl,
}: CustomPackageViewProps) {
    if (data.planType !== 'custom') return null;

    // Group features by category
    const groupedFeatures = categories
        .map((cat) => ({
            category: cat,
            features: features.filter((f) => f.categoryId === cat.id),
        }))
        .filter((g) => g.features.length > 0);

    const isFeatureSelected = (featureId: string) =>
        data.customFeatures.some((f) => f.featureId === featureId);

    const getFeatureQuantity = (featureId: string) =>
        data.customFeatures.find((f) => f.featureId === featureId)?.quantity || 0;

    const toggleFeature = (featureId: string) => {
        if (isFeatureSelected(featureId)) {
            onCustomFeaturesChange(
                data.customFeatures.filter((f) => f.featureId !== featureId)
            );
        } else {
            onCustomFeaturesChange([
                ...data.customFeatures,
                { featureId, quantity: 0 },
            ]);
        }
    };

    const updateFeatureQuantity = (featureId: string, quantity: string) => {
        onCustomFeaturesChange(
            data.customFeatures.map((f) =>
                f.featureId === featureId
                    ? { ...f, quantity: parseInt(quantity) || 0 }
                    : f
            )
        );
    };

    const isLibrarySelected = (code: string) =>
        data.selectedLibraries.includes(code);

    const toggleLibrary = (code: string) => {
        if (isLibrarySelected(code)) {
            onLibrariesChange(data.selectedLibraries.filter((c) => c !== code));
        } else {
            onLibrariesChange([...data.selectedLibraries, code]);
        }
    };

    return (
        <div className="flex flex-col gap-2">
        <div className="border-2 shadow-sm border-Primary-100 rounded-2xl p-5 md:p-6 bg-white">
            {featuresLoading ? (
                <div className="text-center py-8 text-grey-400 text-sm">
                    {t('common.loading')}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Features grouped by category */}
                    {groupedFeatures.map(({ category, features: catFeatures }) => (
                        <div key={category.id}>
                            <h4 className="text-sm font-semibold text-grey-800 mb-3 text-start">
                                {t('wizard.step3.choosePrefix')} {category.name}
                            </h4>
                            <div className="flex flex-col gap-1">
                                {catFeatures.map((feat) => {
                                    const isSelected = isFeatureSelected(feat.id);
                                    return (
                                        <FeatureCheckboxRow
                                            key={feat.id}
                                            id={feat.id}
                                            label={feat.name}
                                            isSelected={isSelected}
                                            onToggle={() => toggleFeature(feat.id)}
                                            showQuantity={true}
                                            quantity={isSelected ? getFeatureQuantity(feat.id) : ''}
                                            onQuantityChange={(v) => updateFeatureQuantity(feat.id, v)}
                                            quantityPlaceholder={t('wizard.step3.quantityPlaceholder')}
                                            isRtl={isRtl}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}


                    {/* Libraries */}
                    <div>
                        <h4 className="text-sm font-semibold text-grey-800 mb-3 text-start">
                            {t('wizard.step3.chooseLibraries')}
                        </h4>
                        <div className="flex flex-col gap-1">
                            {LIBRARY_TYPES.map((lib) => {
                                const isSelected = isLibrarySelected(lib.code);
                                return (
                                    <FeatureCheckboxRow
                                        key={lib.code}
                                        id={lib.code}
                                        label={t(lib.nameKey)}
                                        isSelected={isSelected}
                                        onToggle={() => toggleLibrary(lib.code)}
                                        showQuantity={false}
                                        isRtl={isRtl}
                                    />
                                );
                            })}
                        </div>
                    </div>


                </div>
            )}           
        </div>
         {/* Custom Price Input */}
                    <div>
                        <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                            {t('wizard.step3.customPrice')}
                        </label>
                        <Input
                            placeholder={t('wizard.step3.customPricePlaceholder')}
                            type="number"
                            min="0"
                            value={data.customPrice}
                            onChange={(val) => onChange('customPrice', val)}
                            endIcon={<span className="text-gray-500 font-medium whitespace-nowrap px-2">{t('common.currency')}</span>}
                            isRtl={isRtl}
                        />
                    </div>
                    </div>
    );
}
