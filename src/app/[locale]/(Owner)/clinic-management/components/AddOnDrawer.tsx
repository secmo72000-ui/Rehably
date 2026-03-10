'use client';

import React, { useState } from 'react';
import { Drawer } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { getGroupedLibraries, getGroupedBasicFeatures, type Feature, type FeatureCategory } from '@/domains/features';
import { cn } from '@/shared/utils/cn';
import { FeatureCheckboxRow } from '@/ui/components/FeatureSelection';
import { CreateAddOnRequestDto } from '@/domains/clinics/clinics.types';
import { clinicsService } from '@/domains/clinics/clinics.service';

interface AddOnDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    clinicId: string;
    features: Feature[];
    categories: FeatureCategory[];
    isRtl: boolean;
    t: (key: string) => string;
}

interface AddonState {
    isSelected: boolean;
    limit: string;
    startDate: string;
    endDate: string;
}

export function AddOnDrawer({
    isOpen,
    onClose,
    clinicId,
    features,
    categories,
    isRtl,
    t
}: AddOnDrawerProps) {
    const [addonsState, setAddonsState] = useState<Record<string, AddonState>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleFeature = (featureId: string) => {
        setAddonsState(prev => {
            const current = prev[featureId] || { isSelected: false, limit: '', startDate: '', endDate: '' };
            return {
                ...prev,
                [featureId]: { ...current, isSelected: !current.isSelected }
            };
        });
    };

    const updateFeature = (featureId: string, field: keyof AddonState, value: string) => {
        setAddonsState(prev => {
            const current = prev[featureId] || { isSelected: true, limit: '', startDate: '', endDate: '' };
            return {
                ...prev,
                [featureId]: { ...current, [field]: value }
            };
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const selectedIds = Object.keys(addonsState).filter(id => addonsState[id].isSelected);

            if (selectedIds.length === 0) {
                setError(t('addonDrawer.validation.required'));
                setIsSubmitting(false);
                return;
            }

            // Validate dates
            for (const featureId of selectedIds) {
                const state = addonsState[featureId];
                if (state.startDate && state.endDate) {
                    const sDate = new Date(state.startDate);
                    const eDate = new Date(state.endDate);
                    if (eDate <= sDate) {
                        const featureName = features.find(f => f.id === featureId)?.name || t('addonDrawer.defaultFeatureName');
                        setError(`${t('addonDrawer.validation.dateOrder')}${featureName}`);
                        setIsSubmitting(false);
                        return;
                    }
                }
            }

            // Create promises for each selected addon
            const promises = selectedIds.map(featureId => {
                const state = addonsState[featureId];
                const request: CreateAddOnRequestDto = {
                    featureId,
                    limit: state.limit ? parseInt(state.limit, 10) : 0,
                    price: 0, // Not available in UI
                    paymentType: 0, // Default to cash/free
                    startDate: state.startDate ? new Date(state.startDate).toISOString() : new Date().toISOString(),
                    endDate: state.endDate ? new Date(state.endDate).toISOString() : new Date().toISOString(),
                };
                return clinicsService.createAddOn(clinicId, request);
            });

            await Promise.all(promises);
            onClose(); // Reset and close if successful
        } catch (err: any) {
            console.error('Error creating addons:', err);
            setError(err?.response?.data?.message || t('common.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group features using our extracted domain logic
    const groupedLibraries = getGroupedLibraries(features, categories);
    const groupedBasicFeatures = getGroupedBasicFeatures(features, groupedLibraries);

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={t('addonDrawer.title')}
            size="lg"
        >
            <div className="p-6 h-full flex flex-col pt-0">
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {/* Basic Features Group */}
                    {groupedBasicFeatures.length > 0 && (
                        <div>
                            <h4 className="text-gray-800 font-bold mb-4 text-sm">{t('addonDrawer.chooseFeatures')}</h4>
                            <div className="flex flex-col gap-1">
                                {groupedBasicFeatures.map((feat) => {
                                    const state = addonsState[feat.id] || {};
                                    return (
                                        <FeatureCheckboxRow
                                            key={feat.id}
                                            id={feat.id}
                                            label={feat.name}
                                            isSelected={!!state.isSelected}
                                            onToggle={() => toggleFeature(feat.id)}
                                            showLimit={true}
                                            limit={state.limit || ''}
                                            onLimitChange={(v) => updateFeature(feat.id, 'limit', v)}
                                            limitPlaceholder={t('addonDrawer.packageLimit')}
                                            showDates={true}
                                            startDate={state.startDate || ''}
                                            onStartDateChange={(v) => updateFeature(feat.id, 'startDate', v)}
                                            endDate={state.endDate || ''}
                                            onEndDateChange={(v) => updateFeature(feat.id, 'endDate', v)}
                                            isRtl={isRtl}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Libraries Group */}
                    {groupedLibraries.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-gray-800 font-bold mb-4 text-sm">{t('addonDrawer.chooseLibraries')}</h4>
                            <div className="flex flex-col gap-1">
                                {groupedLibraries.map((feat) => {
                                    const state = addonsState[feat.id] || {};
                                    return (
                                        <FeatureCheckboxRow
                                            key={feat.id}
                                            id={feat.id}
                                            label={feat.name}
                                            isSelected={!!state.isSelected}
                                            onToggle={() => toggleFeature(feat.id)}
                                            showLimit={false}
                                            showDates={true}
                                            startDate={state.startDate || ''}
                                            onStartDateChange={(v) => updateFeature(feat.id, 'startDate', v)}
                                            endDate={state.endDate || ''}
                                            onEndDateChange={(v) => updateFeature(feat.id, 'endDate', v)}
                                            isRtl={isRtl}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        fullWidth
                    >
                        {t('addonDrawer.submitButton')}
                    </Button>
                </div>
            </div>
        </Drawer>
    );
}

export default AddOnDrawer;
