import React from 'react';
import { Input } from '@/ui/primitives/Input/Input';

interface BasicInfoSectionProps {
    planName: string;
    onPlanNameChange: (val: string) => void;
    planDetails: string;
    onPlanDetailsChange: (val: string) => void;
    t: (key: string) => string;
}

export function BasicInfoSection({
    planName,
    onPlanNameChange,
    planDetails,
    onPlanDetailsChange,
    t
}: BasicInfoSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('planName') || 'اسم الخطة المالية'}</label>
                <Input
                    placeholder={t('placeholders.planName') || 'مثال : خبير'}
                    value={planName}
                    onChange={(val) => onPlanNameChange(val)}
                    required
                    className=""
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('planDetails') || 'تفاصيل الخطة المالية'}</label>
                <Input
                    placeholder={t('placeholders.planDetails') || 'مثال : تناسب العيادات المبتدأة'}
                    value={planDetails}
                    onChange={(val) => onPlanDetailsChange(val)}
                />
            </div>
        </div>
    );
}
