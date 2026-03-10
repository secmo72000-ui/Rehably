import React from 'react';
import { cn } from "@/shared/utils/cn";
import { rtlJustify } from '@/shared/utils/rtl.utils';

interface ClinicDetailsActionsProps {
    onEdit: () => void;
    onDelete: () => void;
    t: (key: string) => string;
    isRtl: boolean;
}

export function ClinicDetailsActions({ onEdit, onDelete, t, isRtl }: ClinicDetailsActionsProps) {
    return (
        <div className={cn("flex gap-4", rtlJustify(isRtl))}>
            <button
                onClick={onEdit}
                className="px-4 py-2.5 bg-[#1da0f2] hover:bg-blue-500 text-white rounded-lg font-bold shadow-sm transition-colors"
            >
                {t('wizard.edit')}
            </button>
            <button
                onClick={onDelete}
                className="px-4 py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors"
            >
                {t('wizard.removeClinic')}
            </button>
        </div>
    );
}
