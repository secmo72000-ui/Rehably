'use client';

import React, { useState, useEffect } from 'react';
import { Drawer } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { cn } from '@/shared/utils/cn';
import { getApiError } from '@/shared/utils';
import { CreateAddOnRequestDto, AvailableAddOnDto } from '@/domains/clinics/clinics.types';
import { clinicsService } from '@/domains/clinics/clinics.service';

interface AddOnDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
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
    onSuccess,
    clinicId,
    isRtl,
    t
}: AddOnDrawerProps) {
    const [availableFeatures, setAvailableFeatures] = useState<AvailableAddOnDto[]>([]);
    const [addonsState, setAddonsState] = useState<Record<string, AddonState>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingConfirm, setPendingConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && clinicId) {
            setIsLoadingFeatures(true);
            setError(null);
            setPendingConfirm(false);
            setAddonsState({});
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
        setError(null);

        const selectedIds = Object.keys(addonsState).filter(id => addonsState[id].isSelected);

        if (selectedIds.length === 0) {
            setError(t('addonDrawer.validation.required'));
            return;
        }

        for (const featureId of selectedIds) {
            const state = addonsState[featureId];
            const featureName = availableFeatures.find(f => f.featureId === featureId)?.featureName || featureId;

            if (!state.startDate || !state.endDate) {
                setError(`${featureName}: ${t('addonDrawer.validation.datesRequired')}`);
                return;
            }

            const sDate = new Date(state.startDate);
            const eDate = new Date(state.endDate);
            if (eDate <= sDate) {
                setError(`${featureName}: ${t('addonDrawer.validation.dateOrder')}`);
                return;
            }
            if (eDate <= new Date()) {
                setError(`${featureName}: ${t('addonDrawer.validation.endDateFuture')}`);
                return;
            }
        }

        const hasExistingAddons = selectedIds.some(id => {
            const feat = availableFeatures.find(f => f.featureId === id);
            return feat && feat.currentAddonLimit > 0;
        });

        if (hasExistingAddons && !pendingConfirm) {
            setPendingConfirm(true);
            return;
        }

        setIsSubmitting(true);
        setPendingConfirm(false);

        try {
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
            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }
        } catch (err) {
            console.error('Error creating addons:', err);
            setError(getApiError(err, t('common.error')));
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
                <div className="flex-1 overflow-y-auto space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {isLoadingFeatures ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : availableFeatures.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{t('addonDrawer.noAvailableFeatures')}</div>
                    ) : (
                        <div className="space-y-3">
                            {availableFeatures.map((feat) => {
                                const state = addonsState[feat.featureId] || {};
                                const isSelected = !!state.isSelected;
                                const hasExisting = feat.currentAddonLimit > 0;

                                return (
                                    <div
                                        key={feat.featureId}
                                        className={cn(
                                            "rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer",
                                            isSelected
                                                ? "border-[#1da0f2] bg-blue-50/30 shadow-sm"
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                        )}
                                        onClick={() => toggleFeature(feat.featureId)}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleFeature(feat.featureId)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 rounded border-gray-300 text-[#1da0f2] focus:ring-[#1da0f2] cursor-pointer accent-[#1da0f2]"
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm font-bold text-gray-800">{feat.featureName}</span>
                                                {hasExisting && (
                                                    <span className="text-xs text-[#1da0f2] font-semibold ms-2">
                                                        ({t('details.currentAddon')}: +{feat.currentAddonLimit})
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div
                                                className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1 font-medium">{t('details.limit')}</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="0"
                                                        value={state.limit || ''}
                                                        onChange={(e) => updateFeature(feat.featureId, 'limit', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-700 bg-white focus:border-[#1da0f2] outline-none transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1 font-medium">{t('addonDrawer.startDate') || 'Start'}</label>
                                                    <input
                                                        type="date"
                                                        value={state.startDate || ''}
                                                        onChange={(e) => updateFeature(feat.featureId, 'startDate', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-xl py-2 px-3 text-sm text-gray-700 bg-white focus:border-[#1da0f2] outline-none transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1 font-medium">{t('addonDrawer.endDate') || 'End'}</label>
                                                    <input
                                                        type="date"
                                                        value={state.endDate || ''}
                                                        onChange={(e) => updateFeature(feat.featureId, 'endDate', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-xl py-2 px-3 text-sm text-gray-700 bg-white focus:border-[#1da0f2] outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                    {pendingConfirm && (
                        <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-sm border border-amber-100">
                            {t('addonDrawer.updateConfirm')}
                        </div>
                    )}
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        fullWidth
                    >
                        {pendingConfirm ? t('addonDrawer.confirmUpdate') : t('addonDrawer.submitButton')}
                    </Button>
                </div>
            </div>
        </Drawer>
    );
}

export default AddOnDrawer;
