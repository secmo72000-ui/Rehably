import React from 'react';
import { cn } from '@/shared/utils/cn';

interface BillingSectionProps {
    billingCycle: 'monthly' | 'yearly';
    onChange: (cycle: 'monthly' | 'yearly') => void;
    t: (key: string) => string;
}

export function BillingSection({ billingCycle, onChange, t }: BillingSectionProps) {
    return (
        <div className="space-y-3 mt-4">
            <h3 className="text-sm font-semibold text-gray-700">{t('billingCycle') || 'تحديد مدة الاشتراك'}</h3>
            <div className="flex bg-gray-50 rounded-lg p-1">
                <button
                    type="button"
                    onClick={() => onChange('monthly')}
                    className={cn(
                        'flex-1 py-3 text-sm font-semibold rounded-md transition-colors',
                        billingCycle === 'monthly'
                            ? 'bg-confirm-50 text-confirm-600 border border-confirm-600'
                            : 'text-Primary-500 hover:bg-gray-100'
                    )}
                >
                    {t('billingMonthly') || 'باقة شهرية'}
                </button>
                <button
                    type="button"
                    onClick={() => onChange('yearly')}
                    className={cn(
                        'flex-1 py-3 text-sm font-semibold rounded-md transition-colors',
                        billingCycle === 'yearly'
                            ? 'bg-Primary-50 text-Primary-500 border border-Primary-500'
                            : 'text-Primary-500 hover:bg-Primary-50'
                    )}
                >
                    {t('billingYearly') || 'باقة سنوية'}
                </button>
            </div>
        </div>
    );
}
