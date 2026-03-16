'use client';

import React, { useState } from 'react';
import { cn } from "@/shared/utils/cn";
import { rtlJustify, rtlFlexReverse, rtlTextAlign } from '@/shared/utils/rtl.utils';
import { PackageCard } from '@/ui/components/PackageCard/PackageCard';
import { Clinic, AddOnDto } from "@/domains/clinics/clinics.types";
import { mapPackageFeaturesToDisplay, type Package } from '@/domains/packages';

interface PackageSectionProps {
    clinic: Clinic;
    packageDetails?: Package;
    addons?: AddOnDto[];
    onCancelAddon?: (addOnId: string) => Promise<void>;
    onAddFeatureClick: () => void;
    t: (key: string) => string;
    isRtl: boolean;
}

function AddonsTable({
    addons,
    onCancel,
    t,
    isRtl
}: {
    addons: AddOnDto[];
    onCancel?: (addOnId: string) => Promise<void>;
    t: (key: string) => string;
    isRtl: boolean;
}) {
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const handleCancel = async (addOnId: string) => {
        if (!onCancel) return;
        if (confirmId !== addOnId) {
            setConfirmId(addOnId);
            return;
        }
        setCancellingId(addOnId);
        try {
            await onCancel(addOnId);
        } finally {
            setCancellingId(null);
            setConfirmId(null);
        }
    };

    return (
        <div className="mt-8">
            <h4 className={cn("text-base font-bold text-gray-900 mb-4", rtlTextAlign(isRtl))}>
                {t('details.activeAddons')} ({addons.length})
            </h4>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/80">
                            <th className={cn("px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider", rtlTextAlign(isRtl))}>{t('addonDrawer.defaultFeatureName')}</th>
                            <th className={cn("px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider", rtlTextAlign(isRtl))}>{t('details.limit')}</th>
                            <th className={cn("px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider", rtlTextAlign(isRtl))}>{t('details.expires')}</th>
                            {onCancel && <th className="px-4 py-3 w-10"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {addons.map((addon) => (
                            <tr key={addon.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className={cn("px-4 py-3 text-sm font-medium text-gray-800", rtlTextAlign(isRtl))}>
                                    {addon.featureName}
                                </td>
                                <td className={cn("px-4 py-3 text-sm font-semibold text-[#1da0f2]", rtlTextAlign(isRtl))}>
                                    +{addon.limit}
                                </td>
                                <td className={cn("px-4 py-3 text-sm text-gray-500", rtlTextAlign(isRtl))}>
                                    {new Date(addon.endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                </td>
                                {onCancel && (
                                    <td className="px-4 py-3">
                                        {confirmId === addon.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCancel(addon.id)}
                                                    disabled={cancellingId === addon.id}
                                                    className="p-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                >
                                                    {cancellingId === addon.id ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><circle cx="12" cy="12" r="10" strokeDasharray="30 60" /></svg>
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmId(null)}
                                                    className="p-1 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleCancel(addon.id)}
                                                className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                title={t('details.cancel')}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function PackageSection({
    clinic,
    packageDetails,
    addons = [],
    onCancelAddon,
    onAddFeatureClick,
    t,
    isRtl
}: PackageSectionProps) {

    const activeAddons = addons.filter(a => a.status === 'Active');
    const mappedFeatures = packageDetails ? mapPackageFeaturesToDisplay(packageDetails) : [];
    const displayFeatures = mappedFeatures.length > 0 ? mappedFeatures : [{ text: t('table.noData') }];

    return (
        <div className="pt-4 border-t border-gray-100">
            <div className={cn("flex justify-between items-center mb-8", rtlFlexReverse(isRtl))}>
                <h3 className="text-xl font-bold text-gray-900">{t('details.subscriptionPlan')}</h3>
                <button
                    onClick={onAddFeatureClick}
                    className="flex items-center gap-2 text-gray-800 font-bold hover:text-blue-600 transition-colors"
                >
                    <span className="text-2xl font-light leading-none mb-1">+</span>
                    {t('details.addonFeature').replace('+', '').trim()}
                </button>
            </div>

            <div className={cn("flex", rtlJustify(!isRtl))}>
                <div className="w-full md:w-[320px]">
                    <PackageCard
                        id={clinic.subscriptionPlanId || 'pkg-1'}
                        badge={clinic.subscriptionPlanName || t('details.noPlan')}
                        price={packageDetails?.monthlyPrice || 0}
                        description={packageDetails?.description || ''}
                        features={displayFeatures}
                        onSelect={() => { }}
                    />
                </div>
            </div>

            {activeAddons.length > 0 && (
                <AddonsTable addons={activeAddons} onCancel={onCancelAddon} t={t} isRtl={isRtl} />
            )}
        </div>
    );
}
