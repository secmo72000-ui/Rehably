import { cn } from "@/shared/utils/cn";
import { rtlJustify, rtlFlexReverse } from '@/shared/utils/rtl.utils';
import { PackageCard } from '@/ui/components/PackageCard/PackageCard';
import { Clinic } from "@/domains/clinics/clinics.types";
import { mapPackageFeaturesToDisplay, type Package } from '@/domains/packages';

interface PackageSectionProps {
    clinic: Clinic;
    packageDetails?: Package;
    onAddFeatureClick: () => void;
    t: (key: string) => string;
    isRtl: boolean;
}

export function PackageSection({
    clinic,
    packageDetails,
    onAddFeatureClick,
    t,
    isRtl
}: PackageSectionProps) {

    // Safely parse out package features or fallback to noData
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
        </div>
    );
}
