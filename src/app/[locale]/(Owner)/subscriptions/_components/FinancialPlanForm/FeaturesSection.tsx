import React from 'react';
import type { Feature } from '@/domains/features/features.types';
import { FeatureCheckboxRow } from '@/ui/components/FeatureSelection';

interface FeaturesSectionProps {
    features: Feature[];
    selectedFeatures: Array<{ featureId: string; limit: number }>;
    onChange: (selected: Array<{ featureId: string; limit: number }>) => void;
    t: (key: string) => string;
}

export function FeaturesSection({ features, selectedFeatures, onChange, t }: FeaturesSectionProps) {
    const handleToggle = (featureId: string) => {
        const isSelected = selectedFeatures.some(f => f.featureId === featureId);
        if (isSelected) {
            onChange(selectedFeatures.filter(f => f.featureId !== featureId));
        } else {
            onChange([...selectedFeatures, { featureId, limit: 0 }]);
        }
    };

    const handleLimitChange = (featureId: string, value: string) => {
        const limit = parseInt(value, 10) || 0;
        onChange(
            selectedFeatures.map(f =>
                f.featureId === featureId ? { ...f, limit } : f
            )
        );
    };

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">{t('features') || 'خصائص الخطة المالية'}</h3>
            <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-900 mb-2">{t('chooseFeatures') || 'اختر خصائص'}</p>
                {features.map((feature) => {
                    const selected = selectedFeatures.find(f => f.featureId === String(feature.id));
                    return (
                        <FeatureCheckboxRow
                            key={feature.id}
                            id={`feature-${feature.id}`}
                            label={feature.description || feature.name}
                            isSelected={!!selected}
                            onToggle={() => handleToggle(String(feature.id))}
                            showLimit={true}
                            limit={selected?.limit ? String(selected.limit) : ''}
                            onLimitChange={(val) => handleLimitChange(String(feature.id), val)}
                            limitPlaceholder={t('limitPlaceholder') || 'حدود الباقة'}
                        />
                    );
                })}
            </div>
        </div>
    );
}
