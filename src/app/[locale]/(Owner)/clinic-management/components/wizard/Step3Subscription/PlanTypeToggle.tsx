'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Step3Data } from './types';

interface PlanTypeToggleProps {
    data: Step3Data;
    onChange: (field: keyof Step3Data, value: string | null) => void;
    t: (key: string) => string;
}

export function PlanTypeToggle({ data, onChange, t }: PlanTypeToggleProps) {
    return (
        <div className="flex gap-3">
            <button
                type="button"
                onClick={() => onChange('planType', 'existing')}
                className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors border',
                    data.planType === 'existing'
                        ? 'bg-Primary-50 text-Primary-600 border-Primary-400'
                        : 'bg-grey-50 text-grey-500 border-grey-200 hover:border-grey-300'
                )}
            >
                {t('wizard.step3.existingPlan')}
            </button>
            <button
                type="button"
                onClick={() => onChange('planType', 'custom')}
                className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors border',
                    data.planType === 'custom'
                        ? 'bg-Primary-50 text-Primary-600 border-Primary-400'
                        : 'bg-grey-50 text-grey-500 border-grey-200 hover:border-grey-300'
                )}
            >
                {t('wizard.step3.customPlan')}
            </button>
        </div>
    );
}
