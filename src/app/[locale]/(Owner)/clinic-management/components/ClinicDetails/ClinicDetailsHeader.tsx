import React from 'react';
import { cn } from "@/shared/utils/cn";
import { rtlFlexReverse } from '@/shared/utils/rtl.utils';

interface ClinicDetailsHeaderProps {
    onClose: () => void;
    t: (key: string) => string;
    isRtl: boolean;
}

export function ClinicDetailsHeader({ onClose, t, isRtl }: ClinicDetailsHeaderProps) {
    return (
        <div className={cn("flex justify-between items-center p-6 border-b border-gray-100", rtlFlexReverse(isRtl))}>
            <h2 className="text-xl font-bold text-gray-900">{t('clinicDetails')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors p-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
