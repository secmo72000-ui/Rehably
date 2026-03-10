'use client';

import React from 'react';
import { Step3Props } from './types';
import { PlanTypeToggle } from './PlanTypeToggle';
import { ExistingPackagesView } from './ExistingPackagesView';
import { CustomPackageView } from './CustomPackageView';
import { SharedFieldsSection } from './SharedFieldsSection';

export * from './types';

export function Step3Subscription({
    data,
    onChange,
    onCustomFeaturesChange,
    onLibrariesChange,
    packages,
    packagesLoading,
    features,
    categories,
    featuresLoading,
    t,
    isRtl,
}: Step3Props) {
    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-grey-700 text-start">
                {t('wizard.step3.assignPlan')}
            </h3>

            <PlanTypeToggle data={data} onChange={onChange} t={t} />

            <ExistingPackagesView
                data={data}
                onChange={onChange}
                packages={packages}
                packagesLoading={packagesLoading}
                t={t}
            />

            <CustomPackageView
                data={data}
                onChange={onChange}
                onCustomFeaturesChange={onCustomFeaturesChange}
                onLibrariesChange={onLibrariesChange}
                features={features}
                categories={categories}
                featuresLoading={featuresLoading}
                t={t}
                isRtl={isRtl}
            />

            {/* Shared Fields (Dates & Payment Info) */}
            <SharedFieldsSection data={data} onChange={onChange} t={t} isRtl={isRtl} />
        </div>
    );
}

export default Step3Subscription;
