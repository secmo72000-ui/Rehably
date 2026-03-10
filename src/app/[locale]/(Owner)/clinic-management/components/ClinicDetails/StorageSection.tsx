import { cn } from "@/shared/utils/cn";
import { rtlTextAlign, rtlFlexReverse } from '@/shared/utils/rtl.utils';
import { CloudIcon, CalendarIcon } from './icons';

interface StorageSectionProps {
    storagePercentage: number;
    storageUsedGB: number;
    storageTotalGB: number;
    startDate: string;
    endDate: string;
    t: (key: string) => string;
    isRtl: boolean;
}

export function StorageSection({
    storagePercentage,
    storageUsedGB,
    storageTotalGB,
    startDate,
    endDate,
    t,
    isRtl,
}: StorageSectionProps) {
    return (
        <div className={cn("rounded-2xl p-6 bg-[#e0faef] flex flex-col md:flex-row justify-between items-center border border-cyan-100/50 gap-4", !isRtl && "md:flex-row-reverse")}>
            <div className={cn("flex items-center gap-6", rtlFlexReverse(isRtl))}>
                <div className={cn(rtlTextAlign(isRtl))}>
                    <h3 className={cn("text-3xl font-extrabold text-gray-800 mb-1 flex items-baseline gap-1", isRtl ? "justify-end" : "justify-start flex-row-reverse")}>
                        <span>{t('details.storageFull').replace('%', '')}</span>
                        <span>{storagePercentage}%</span>
                    </h3>
                    <div className={cn("text-sm text-gray-600 flex items-center gap-1.5 font-medium", isRtl ? "justify-end" : "justify-start flex-row-reverse")}>
                        <span className="direction-ltr">{t('details.storageUsage').replace('{used}', storageUsedGB.toString()).replace('{total}', storageTotalGB.toString())}</span>
                        <CloudIcon />
                    </div>
                </div>

                {/* Circular Progress */}
                <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="none" className="text-cyan-200 opacity-50" />
                        <circle
                            cx="32" cy="32" r="28"
                            stroke="currentColor" strokeWidth="8" fill="none"
                            strokeDasharray={`${storagePercentage * 1.76} 176`}
                            className="text-[#1da0f2]"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </div>

            <div className={cn("flex items-center gap-4 text-gray-600 font-medium", rtlFlexReverse(isRtl))}>
                <span className="tracking-widest">{startDate} - {endDate}</span>
                <CalendarIcon />
            </div>
        </div>
    );
}
