'use client';

import React from 'react';
import { Input, Select } from '@/ui/primitives';
import Image from 'next/image';
import type { Step1Data, Step1Errors } from '@/domains/clinics/clinics.validation';

// Re-export types for convenience
export type { Step1Data, Step1Errors } from '@/domains/clinics/clinics.validation';
export { validateStep1, isStep1Valid } from '@/domains/clinics/clinics.validation';

interface Step1Props {
    data: Step1Data;
    errors: Step1Errors;
    onChange: (field: keyof Step1Data, value: string) => void;
    t: (key: string) => string;
    isRtl: boolean;
}

// ===== Static data =====
const egyptianGovernorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
    'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
    'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
    'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
    'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
    'شمال سيناء', 'سوهاج',
];

const cities: Record<string, string[]> = {
    'القاهرة': ['مدينة نصر', 'المعادي', 'مصر الجديدة', 'التجمع الخامس', 'الشروق', 'العبور', 'المقطم', 'الزمالك', 'وسط البلد'],
    'الجيزة': ['الدقي', 'المهندسين', 'الهرم', '6 أكتوبر', 'الشيخ زايد', 'فيصل'],
    'الإسكندرية': ['سموحة', 'سيدي بشر', 'المنتزه', 'كليوباترا', 'ستانلي', 'العجمي'],
};

// ===== Component (UI only — no validation logic) =====
export function Step1CreateClinic({ data, errors, onChange, t, isRtl }: Step1Props) {
    const personIcon = (
        <Image src="/shered/person.svg" alt="" width={18} height={18} />
    );

    const currentCities = cities[data.country] || [];

    return (
        <div className="space-y-5">
            {/* Row 1: اسم العيادة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step1.clinicNameAr')} <span className="text-error-600">*</span>
                    </label>
                    <Input
                        value={data.clinicNameArabic}
                        onChange={(v) => onChange('clinicNameArabic', v)}
                        placeholder={t('wizard.step1.clinicNameArPlaceholder')}
                        icon={personIcon}
                        isRtl={isRtl}
                        error={errors.clinicNameArabic}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step1.clinicNameEn')} <span className="text-error-600">*</span>
                    </label>
                    <Input
                        value={data.clinicName}
                        onChange={(v) => onChange('clinicName', v)}
                        placeholder={t('wizard.step1.clinicNameEnPlaceholder')}
                        icon={personIcon}
                        isRtl={isRtl}
                        error={errors.clinicName}
                    />
                </div>
            </div>

            {/* Row 2: مدير العيادة */}
            <div>
                <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                    {t('wizard.step1.clinicManager')} <span className="text-error-600">*</span>
                </label>
                <Input
                    value={`${data.ownerFirstName} ${data.ownerLastName}`.trim()}
                    onChange={(v) => {
                        const parts = v.split(' ');
                        onChange('ownerFirstName', parts[0] || '');
                        onChange('ownerLastName', parts.slice(1).join(' ') || '');
                    }}
                    placeholder={t('wizard.step1.clinicManagerPlaceholder')}
                    isRtl={isRtl}
                    error={errors.ownerFirstName}
                />
            </div>

            {/* Row 3: البريد الالكتروني + رقم التليفون */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step1.email')} <span className="text-error-600">*</span>
                    </label>
                    <Input
                        type="email"
                        value={data.ownerEmail}
                        onChange={(v) => onChange('ownerEmail', v)}
                        placeholder={t('wizard.step1.emailPlaceholder')}
                        isRtl={isRtl}
                        error={errors.ownerEmail}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step1.phone')} <span className="text-error-600">*</span>
                    </label>
                    <Input
                        type="tel"
                        value={data.phone}
                        onChange={(v) => onChange('phone', v)}
                        placeholder={t('wizard.step1.phonePlaceholder')}
                        isRtl={isRtl}
                        error={errors.phone}
                    />
                </div>
            </div>

            {/* Row 4: المحافظة + المدينة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step1.governorate')} <span className="text-error-600">*</span>
                    </label>
                    <Select
                        value={data.country}
                        onChange={(v) => {
                            onChange('country', v);
                            onChange('city', '');
                        }}
                        placeholder={t('wizard.step1.governoratePlaceholder')}
                        options={egyptianGovernorates.map((g) => ({ value: g, label: g }))}
                        isRtl={isRtl}
                        error={errors.country}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                        {t('wizard.step1.city')} <span className="text-error-600">*</span>
                    </label>
                    <Select
                        value={data.city}
                        onChange={(v) => onChange('city', v)}
                        placeholder={t('wizard.step1.cityPlaceholder')}
                        options={currentCities.map((c) => ({ value: c, label: c }))}
                        isRtl={isRtl}
                        error={errors.city}
                    />
                </div>
            </div>

            {/* Row 5: العنوان */}
            <div>
                <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                    {t('wizard.step1.address')} <span className="text-error-600">*</span>
                </label>
                <Input
                    value={data.address}
                    onChange={(v) => onChange('address', v)}
                    placeholder={t('wizard.step1.addressPlaceholder')}
                    isRtl={isRtl}
                    error={errors.address}
                />
            </div>

            {/* Row 6: slug */}
            <div>
                <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                    slug <span className="text-error-600">*</span>
                </label>
                <Input
                    value={data.slug}
                    onChange={(v) => onChange('slug', v)}
                    placeholder={t('wizard.step1.slugPlaceholder')}
                    isRtl={false}
                    error={errors.slug}
                />
            </div>
        </div>
    );
}
