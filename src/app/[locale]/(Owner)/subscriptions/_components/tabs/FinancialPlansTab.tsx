'use client';

import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { ContentContainer } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { FeatureCard } from '../FeatureCard';
import type { Feature } from '@/services/features.service';

interface FinancialPlansTabProps {
    features: Feature[];
    isLoading: boolean;
    onAddClick: () => void;
    onEdit: (featureId: string) => void;
    onDelete: (featureId: string) => void;
}

export function FinancialPlansTab({
    features,
    isLoading,
    onAddClick,
    onEdit,
    onDelete,
}: FinancialPlansTabProps) {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `subscriptions.${key}`);

    return (
        <>
            {/* Add Feature Button */}
            <div className="flex justify-end">
                <Button onClick={onAddClick} variant="primary">
                    {t('addFeature')}
                </Button>
            </div>

            {/* Features Grid Container */}
            <ContentContainer
                showFilter
                filterLabel={t('newest')}
                onFilterClick={() => console.log('Filter clicked')}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary-500"></div>
                    </div>
                ) : features.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        لا توجد خصائص حالياً
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature) => (
                            <FeatureCard
                                key={feature.id}
                                id={String(feature.id)}
                                price={0}
                                description={feature.description || feature.name}
                                isHighPrice={false}
                                onEdit={() => onEdit(String(feature.id))}
                                onDelete={() => onDelete(String(feature.id))}
                            />
                        ))}
                    </div>
                )}
            </ContentContainer>
        </>
    );
}
