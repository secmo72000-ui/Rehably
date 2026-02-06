import type { DynamicFormConfig } from '@/ui/components';
import type { Clinic } from '@/domains/clinics/clinics.types';
import type { Feature } from '@/services/features.service';

interface FormOption {
    value: string;
    label: string;
}

/**
 * Generate custom category form config with dynamic clinic and feature options
 */
export const getCustomCategoryFormConfig = (
    clinics: Clinic[],
    features: Feature[]
): DynamicFormConfig => {
    // Map clinics to dropdown options
    const clinicOptions: FormOption[] = clinics.map(clinic => ({
        value: String(clinic.id),
        label: `${clinic.name} - ${clinic.email}`
    }));

    // Map features to multiselect options
    const featureOptions: FormOption[] = features.map(feature => ({
        value: String(feature.id),
        label: feature.description || feature.name
    }));

    return {
        submitLabel: 'إضافة باقة خاصة',
        rows: [
            {
                fields: [
                    {
                        name: 'selectedClinic',
                        type: 'select',
                        label: 'العيادة المخصص لها الباقة',
                        placeholder: 'إختار عيادة',
                        options: clinicOptions,
                        required: true,
                    },
                ],
            },
            {
                fields: [
                    {
                        name: 'packageName',
                        type: 'text',
                        label: 'اسم الباقة',
                        placeholder: 'أدخل اسم الباقة',
                        required: true,
                    },
                ],
            },
            {
                fields: [
                    {
                        name: 'categoryFeatures',
                        type: 'multiselect',
                        label: 'خصائص الباقة',
                        placeholder: 'إختار الخصائص',
                        options: featureOptions,
                        required: false,
                    },
                ],
            },
            {
                fields: [
                    {
                        name: 'monthlyPrice',
                        type: 'number',
                        label: 'السعر الشهري',
                        placeholder: 'مثال: 1200',
                        required: true,
                    },
                    {
                        name: 'yearlyPrice',
                        type: 'number',
                        label: 'السعر السنوي',
                        placeholder: 'مثال: 12000',
                        required: true,
                    },
                ],
            },
            {
                fields: [
                    {
                        name: 'trialDays',
                        type: 'number',
                        label: 'أيام التجربة',
                        placeholder: 'مثال: 14',
                        required: false,
                    },
                ],
            },
        ],
    };
};

// Keep the old static config for backward compatibility (deprecated)
export const customCategoryFormConfig: DynamicFormConfig = {
    submitLabel: 'إضافة خطة مالية',
    rows: [
        {
            fields: [
                {
                    name: 'selectedUser',
                    type: 'select',
                    label: 'المستخدم المخصص من الخطة المالية',
                    placeholder: 'إختار مستخدم',
                    options: [],
                    required: true,
                },
            ],
        },
        {
            fields: [
                {
                    name: 'categoryFeatures',
                    type: 'select',
                    label: 'خصائص الخطة المالية',
                    placeholder: 'إختار الخصائص',
                    options: [],
                    required: true,
                },
            ],
        },
        {
            fields: [
                {
                    name: 'fullPrice',
                    type: 'text',
                    label: 'السعر الكامل لخصائص المالية المختارة',
                    placeholder: 'مثال: 1200 جنيها',
                    required: true,
                },
            ],
        },
        {
            fields: [
                {
                    name: 'minimumPrice',
                    type: 'text',
                    label: 'السعر الأدنى لخطة المالية',
                    placeholder: 'مثال: 1200 جنيها',
                    required: true,
                },
            ],
        },
    ],
};
