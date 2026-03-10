import { cn } from "@/shared/utils/cn";
import { rtlTextAlign, rtlFlexReverse } from '@/shared/utils/rtl.utils';
import { Clinic } from "@/domains/clinics/clinics.types";

interface ProfileSectionProps {
    clinic: Clinic;
    isActive: boolean;
    t: (key: string) => string;
    isRtl: boolean;
}

export function ProfileSection({ clinic, isActive, t, isRtl }: ProfileSectionProps) {
    return (
        <div className={cn("flex justify-between items-center", rtlFlexReverse(isRtl))}>
            <div className={cn("flex items-center gap-4", isRtl ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(rtlTextAlign(isRtl))}>
                    <h4 className="font-extrabold text-gray-900 text-lg">
                        {isRtl ? (clinic.nameArabic || clinic.name) : clinic.name}
                    </h4>
                    <p className="text-gray-500 text-sm font-medium">{clinic.email}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                    <img src="/images/avatar-placeholder.png" alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
            <div>
                <span className={cn(
                    "px-5 py-1.5 rounded-lg text-sm font-bold",
                    isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                )}>
                    {isActive ? t('status.active') : t('status.suspended')}
                </span>
            </div>
        </div>
    );
}
