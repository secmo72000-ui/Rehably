'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';
import { PackageCard } from '@/ui/components/PackageCard/PackageCard';
import { mapPackageFeaturesToDisplay, type Package } from '@/domains/packages';
import { Step3Data } from './types';

interface ExistingPackagesViewProps {
    data: Step3Data;
    onChange: (field: keyof Step3Data, value: string | null) => void;
    packages: Package[];
    packagesLoading: boolean;
    t: (key: string) => string;
}

export function ExistingPackagesView({
    data,
    onChange,
    packages,
    packagesLoading,
    t,
}: ExistingPackagesViewProps) {
    if (data.planType !== 'existing') return null;

    const displayedPrice = (pkg: Package) =>
        data.billingCycle === 'monthly' ? pkg.monthlyPrice : pkg.yearlyPrice;

    return (
        <>
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center">
                <div className="inline-flex bg-grey-100 rounded-full">
                    <button
                        type="button"
                        onClick={() => onChange('billingCycle', 'yearly')}
                        className={cn(
                            'px-[18px] py-[16px] rounded-full font-semibold transition-all',
                            data.billingCycle === 'yearly'
                                ? 'bg-Primary-500 text-white shadow-sm'
                                : 'text-[#292D30]'
                        )}
                    >
                        {t('wizard.step3.yearly')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange('billingCycle', 'monthly')}
                        className={cn(
                            'px-[18px] py-[16px] rounded-full font-semibold transition-all',
                            data.billingCycle === 'monthly'
                                ? 'bg-Primary-500 text-white shadow-sm'
                                : 'text-[#292D30]'
                        )}
                    >
                        {t('wizard.step3.monthly')}
                    </button>
                </div>
            </div>

            {/* Package Cards */}
            {packagesLoading ? (
                <div className="text-center py-8 text-grey-400 text-sm">
                    {t('common.loading')}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map((pkg) => {
                        const isSelected = data.selectedPackageId === String(pkg.id);
                        return (
                            <PackageCard
                                key={pkg.id}
                                id={String(pkg.id)}
                                badge={pkg.name}
                                price={displayedPrice(pkg)}
                                description={pkg.description}
                                features={mapPackageFeaturesToDisplay(pkg)}
                                isSelected={isSelected}
                                onSelect={() => onChange('selectedPackageId', String(pkg.id))}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}
