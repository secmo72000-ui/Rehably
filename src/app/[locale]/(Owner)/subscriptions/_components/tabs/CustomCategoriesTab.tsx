'use client';

import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { ContentContainer } from '@/ui/components';
import { Button } from '@/ui/primitives';
import { CustomCategoryCard } from '../CustomCategoryCard';
import { transformCustomPackage } from '../../helpers';
import type { Package } from '@/services/packages.service';
import type { Clinic } from '@/domains/clinics/clinics.types';

interface CustomCategoriesTabProps {
    customPackages: Package[];
    clinics: Clinic[];
    isLoading: boolean;
    onAddClick: () => void;
    onEdit: (pkg: Package) => void;
    onDelete: (pkgId: string) => void;
    onActivate: (pkgId: number) => void;
}

export function CustomCategoriesTab({
    customPackages,
    clinics,
    isLoading,
    onAddClick,
    onEdit,
    onDelete,
    onActivate,
}: CustomCategoriesTabProps) {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `subscriptions.${key}`);

    return (
        <>
            {/* Add Category Button */}
            <div className="flex justify-end">
                <Button onClick={onAddClick} variant="primary">
                    {t('addCustomCategory')}
                </Button>
            </div>

            {/* Categories Grid Container */}
            <ContentContainer
                showFilter
                filterLabel={t('newest')}
                onFilterClick={() => console.log('Filter clicked')}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary-500"></div>
                    </div>
                ) : customPackages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        لا توجد باقات خاصة حالياً
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customPackages.map((apiPkg) => {
                            const category = transformCustomPackage(apiPkg, clinics);
                            return (
                                <CustomCategoryCard
                                    key={category.id}
                                    id={category.id}
                                    name={category.name}
                                    clinicName={category.clinicName}
                                    email={category.email}
                                    price={category.price}
                                    features={category.features}
                                    status={category.status}
                                    onEdit={() => onEdit(apiPkg)}
                                    onDelete={() => onDelete(String(apiPkg.id))}
                                    onActivate={() => onActivate(apiPkg.id)}
                                />
                            );
                        })}
                    </div>
                )}
            </ContentContainer>
        </>
    );
}
