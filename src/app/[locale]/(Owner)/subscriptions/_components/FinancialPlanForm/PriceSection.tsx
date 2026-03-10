import React from 'react';
import { Input } from '@/ui/primitives/Input/Input';

interface PriceSectionProps {
    price: string;
    onChange: (val: string) => void;
    t: (key: string) => string;
}

export function PriceSection({ price, onChange, t }: PriceSectionProps) {
    return (
        <div className="space-y-3 mt-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('price') || 'سعر الخطة المالية'}</label>
                <Input
                    placeholder={t('placeholders.price') || 'مثال : 1200 جنيها'}
                    value={price}
                    onChange={(val) => onChange(val)}
                    required
                />
            </div>
        </div>
    );
}
