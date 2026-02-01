import type { DynamicFormConfig } from '@/ui/components';

export const featureFormConfig: DynamicFormConfig = {
    submitLabel: 'إضافة خاصية مالية',
    rows: [
        {
            fields: [
                {
                    name: 'featureName',
                    type: 'text',
                    label: 'اسم خاصية المالية',
                    placeholder: 'مثال: تصل حتى 200 مستخدم',
                    required: true,
                },
            ],
        },
        {
            fields: [
                {
                    name: 'featurePrice',
                    type: 'number',
                    label: 'سعر الخاصية',
                    placeholder: 'مثال: 20 دينارًا',
                    required: true,
                },
            ],
        },
    ],
};
