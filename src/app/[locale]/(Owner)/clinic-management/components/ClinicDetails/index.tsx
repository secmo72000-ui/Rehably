'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { cn } from "@/shared/utils/cn";
import { bytesToGB } from '@/shared/utils/format.utils';
import { rtlTextAlign } from '@/shared/utils/rtl.utils';

import { ClinicDetailsProps } from './types';
import { ClinicDetailsHeader } from './ClinicDetailsHeader';
import { ClinicDetailsActions } from './ClinicDetailsActions';
import { StorageSection } from './StorageSection';
import { ProfileSection } from './ProfileSection';
import { InfoGrid } from './InfoGrid';
import { PackageSection } from './PackageSection';
import { AddOnDrawer } from '../AddOnDrawer';

export function ClinicDetails({
    clinic,
    packageDetails,
    features = [],
    categories = [],
    featuresLoading = false,
    onClose,
    onEdit,
    onDelete,
}: ClinicDetailsProps) {
    const [isAddonDrawerOpen, setIsAddonDrawerOpen] = useState(false);
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `clinicManagement.${key}`);

    if (!clinic) return null;

    const isActive = clinic.subscriptionStatus === 1;

    // Storage Calculations using domain helper
    const storageUsedGB = bytesToGB(clinic.storageUsedBytes || 0);
    const storageTotalGB = bytesToGB(clinic.storageLimitBytes || 107374182400); // 100GB default
    const storagePercentage = clinic.storageUsedPercentage || Math.round((storageUsedGB / storageTotalGB) * 100) || 50;

    const startDate = new Date(clinic.subscriptionStartDate || new Date()).toLocaleDateString('en-GB').replace(/\//g, '-');
    const endDate = new Date(clinic.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB').replace(/\//g, '-');

    const isRtl = locale === 'ar';

    return (
        <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto overflow-hidden", rtlTextAlign(isRtl))}>
            <ClinicDetailsHeader onClose={onClose} t={t} isRtl={isRtl} />

            <div className="p-8 space-y-10">
                <ClinicDetailsActions onEdit={onEdit} onDelete={onDelete} t={t} isRtl={isRtl} />

                <StorageSection
                    storagePercentage={storagePercentage}
                    storageUsedGB={storageUsedGB}
                    storageTotalGB={storageTotalGB}
                    startDate={startDate}
                    endDate={endDate}
                    t={t}
                    isRtl={isRtl}
                />

                <ProfileSection
                    clinic={clinic}
                    isActive={isActive}
                    t={t}
                    isRtl={isRtl}
                />

                {/* Manager Placeholder */}
                <div className={cn(rtlTextAlign(isRtl))}>
                    <label className="block text-sm text-gray-600 font-bold mb-2">
                        {t('details.manager')}
                    </label>
                    <input
                        type="text"
                        value={clinic.ownerFirstName ? `${clinic.ownerFirstName} ${clinic.ownerLastName}` : t('details.managerPlaceholder')}
                        readOnly
                        className={cn("w-full border border-gray-200 rounded-xl p-4 text-gray-400 bg-white shadow-sm outline-none focus:ring-0", rtlTextAlign(isRtl))}
                    />
                </div>

                <InfoGrid
                    clinic={clinic}
                    t={t}
                    isRtl={isRtl}
                />

                <PackageSection
                    clinic={clinic}
                    packageDetails={packageDetails}
                    onAddFeatureClick={() => setIsAddonDrawerOpen(true)}
                    t={t}
                    isRtl={isRtl}
                />
            </div>

            <AddOnDrawer
                isOpen={isAddonDrawerOpen}
                onClose={() => setIsAddonDrawerOpen(false)}
                clinicId={clinic.id}
                features={features}
                categories={categories}
                isRtl={isRtl}
                t={t}
            />
        </div>
    );
}

export default ClinicDetails;
