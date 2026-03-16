'use client';

import React, { useState, useEffect } from 'react';
import { Drawer } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { cn } from '@/shared/utils/cn';
import { FeatureCheckboxRow } from '@/ui/components/FeatureSelection';
import { CreateAddOnRequestDto, AvailableAddOnDto } from '@/domains/clinics/clinics.types';
import { clinicsService } from '@/domains/clinics/clinics.service';

interface AddOnDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    clinicId: string;
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
    isRtl,
    t
}: AddOnDrawerProps) {
    const [availableFeatures, setAvailableFeatures] = useState<AvailableAddOnDto[]>([]);
    const [addonsState, setAddonsState] = useState<Record<string, AddonState>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && clinicId) {
            setIsLoadingFeatures(true);
            clinicsService.getAvailableAddOns(clinicId)
                .then(data => setAvailableFeatures(data))
                .catch(() => setError(t('common.error')))
                .finally(() => setIsLoadingFeatures(false));
        }
    }, [isOpen, clinicId]);

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

            // Validate all selected addons have dates and limit
            for (const featureId of selectedIds) {
                const state = addonsState[featureId];
                const featureName = availableFeatures.find(f => f.featureId === featureId)?.featureName || featureId;

                if (!state.startDate || !state.endDate) {
                    setError(`${featureName}: ${t('addonDrawer.validation.datesRequired')}`);
                    setIsSubmitting(false);
                    return;
                }

                const sDate = new Date(state.startDate);
                const eDate = new Date(state.endDate);
                if (eDate <= sDate) {
                    setError(`${featureName}: ${t('addonDrawer.validation.dateOrder')}`);
                    setIsSubmitting(false);
                    return;
                }
                if (eDate <= new Date()) {
                    setError(`${featureName}: ${t('addonDrawer.validation.endDateFuture')}`);
                    setIsSubmitting(false);
                    return;
                }
            }

            // Create promises for each selected addon
            const promises = selectedIds.map(featureId => {
                const state = addonsState[featureId];
                const request: CreateAddOnRequestDto = {
                    featureId,
                    limit: state.limit ? parseInt(state.limit, 10) : 1,
                    price: 0,
                    paymentType: 0,
                    startDate: new Date(state.startDate).toISOString(),
                    endDate: new Date(state.endDate).toISOString(),
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

                    {isLoadingFeatures ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : availableFeatures.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{t('addonDrawer.noAvailableFeatures')}</div>
                    ) : (
                        <div>
                            <h4 className="text-gray-800 font-bold mb-4 text-sm">{t('addonDrawer.chooseFeatures')}</h4>
                            <div className="flex flex-col gap-1">
                                {availableFeatures.map((feat) => {
                                    const state = addonsState[feat.featureId] || {};
                                    return (
                                        <FeatureCheckboxRow
                                            key={feat.featureId}
                                            id={feat.featureId}
                                            label={feat.featureName}
                                            isSelected={!!state.isSelected}
                                            onToggle={() => toggleFeature(feat.featureId)}
                                            showLimit={true}
                                            limit={state.limit || ''}
                                            onLimitChange={(v) => updateFeature(feat.featureId, 'limit', v)}
                                            limitPlaceholder={t('addonDrawer.packageLimit')}
                                            showDates={true}
                                            startDate={state.startDate || ''}
                                            onStartDateChange={(v) => updateFeature(feat.featureId, 'startDate', v)}
                                            endDate={state.endDate || ''}
                                            onEndDateChange={(v) => updateFeature(feat.featureId, 'endDate', v)}
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
