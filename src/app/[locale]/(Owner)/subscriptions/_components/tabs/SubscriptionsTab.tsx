'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { ContentContainer, PackageCard } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { transformPackage } from '@/domains/packages/packages.utils';
import type { Package } from '@/domains/packages/packages.types';
import { cn } from '@/shared/utils/cn';

interface SubscriptionsTabProps {
    packages: Package[];
    isLoading: boolean;
    error: string | null;
    onAddClick: () => void;
    onEdit: (pkg: Package) => void;
    onDelete: (pkgId: string) => void;
}

export function SubscriptionsTab({
    packages,
    isLoading,
    error,
    onAddClick,
    onEdit,
    onDelete,
}: SubscriptionsTabProps) {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `subscriptions.${key}`);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="space-y-6">
            {/* Add Package Button */}
            <div className="flex justify-end">
                <Button onClick={onAddClick} variant="primary" className="w-full sm:w-auto">
                    {t('addFinancialPlan') || 'اضافة خطة مالية'}
                </Button>
            </div>

            {/* Packages Grid Container */}
            <ContentContainer
                showFilter={false}
                filterLabel={t('newest') || 'الاحدث'}
            >
                {/* Billing Toggle (Month / Year) */}
                <div className="flex justify-center mb-10 w-full mt-4">
                    <div className="flex bg-gray-50 rounded-full p-1 border border-gray-100 items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setBillingCycle('yearly')}
                            className={cn(
                                'px-8 py-2.5 text-sm font-semibold rounded-full transition-all duration-300',
                                billingCycle === 'yearly'
                                    ? 'bg-Primary-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            {t('yearly') || 'سنوي'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                                'px-8 py-2.5 text-sm font-semibold rounded-full transition-all duration-300',
                                billingCycle === 'monthly'
                                    ? 'bg-Primary-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            {t('monthly') || 'شهري'}
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((apiPkg) => {
                            const pkg = transformPackage(apiPkg, billingCycle, t('noFeatures') || 'لا يوجد مميزات');
                            return (
                                <PackageCard
                                    key={pkg.id}
                                    id={pkg.id}
                                    badge={pkg.badge}
                                    badgeColor={pkg.badgeColor}
                                    price={pkg.price}
                                    description={pkg.description}
                                    features={pkg.features}
                                    isFeatured={pkg.isFeatured}
                                    onEdit={() => onEdit(apiPkg)}
                                    onDelete={() => onDelete(String(apiPkg.id))}
                                />
                            );
                        })}
                    </div>
                )}
            </ContentContainer>
        </div>
    );
}
