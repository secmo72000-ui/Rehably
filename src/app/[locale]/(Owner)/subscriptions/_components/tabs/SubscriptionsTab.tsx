'use client';

import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { ContentContainer, PackageCard } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { transformPackage } from '../../helpers';
import type { Package } from '@/services/packages.service';

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

    return (
        <>
            {/* Add Package Button */}
            <div className="flex justify-end">
                <Button onClick={onAddClick} variant="primary">
                    {t('addPackage')}
                </Button>
            </div>

            {/* Packages Grid Container */}
            <ContentContainer
                showFilter
                filterLabel={t('newest')}
                onFilterClick={() => console.log('Filter clicked')}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((apiPkg) => {
                            const pkg = transformPackage(apiPkg, {
                                trialDays: t('package.trialDays'),
                                yearlyPrice: t('package.yearlyPrice'),
                                currency: t('package.currency'),
                            });
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
        </>
    );
}
