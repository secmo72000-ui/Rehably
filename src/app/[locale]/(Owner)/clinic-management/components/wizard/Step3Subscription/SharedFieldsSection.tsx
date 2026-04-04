'use client';

import React from 'react';
import { Input, Select } from '@/ui/primitives';
import { Step3Data } from './types';

interface SharedFieldsSectionProps {
    data: Step3Data;
    onChange: (field: keyof Step3Data, value: string | null) => void;
    t: (key: string) => string;
    isRtl: boolean;
}

export function SharedFieldsSection({ data, onChange, t, isRtl }: SharedFieldsSectionProps) {
    return (
        <div className=" p-5 md:p-6 bg-white space-y-6">
            
            

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step3.startDate')}
                    </label>
                    <Input
                        type="date"
                        value={data.subscriptionStartDate}
                        onChange={(val) => onChange('subscriptionStartDate', val)}
                        max={data.subscriptionEndDate || undefined}
                        isRtl={isRtl}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step3.endDate')}
                    </label>
                    <Input
                        type="date"
                        value={data.subscriptionEndDate}
                        onChange={(val) => onChange('subscriptionEndDate', val)}
                        min={data.subscriptionStartDate || undefined}
                        isRtl={isRtl}
                    />
                </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step3.paymentMethod')}
                    </label>
                    <Select
                        placeholder={t('wizard.step3.paymentMethodPlaceholder')}
                        options={[
                            { value: '0', label: t('wizard.step3.paymentCash') },
                            { value: '1', label: t('wizard.step3.paymentOnline') },
                            { value: '2', label: t('wizard.step3.paymentFree') },
                        ]}
                        value={data.paymentMethod}
                        onChange={(val) => onChange('paymentMethod', val as string)}
                        isRtl={isRtl}
                    />
                </div>

            
            </div>
        </div>
    );
}
