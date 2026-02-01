import type { DynamicFormConfig } from '@/ui/components';

export const financialPlanFormConfig: DynamicFormConfig = {
    submitLabel: 'إضافة خطة مالية',
    rows: [
        {
            fields: [
                {
                    name: 'planName',
                    type: 'text',
                    label: 'اسم الخطة المالية',
                    placeholder: 'مثال: خبير',
                    required: true,
                },
            ],
        },
        {
            fields: [
                {
                    name: 'planDetails',
                    type: 'text',
                    label: 'تفاصيل الخطة المالية',
                    placeholder: 'مثال: تناسب العيادات المبتدئة',
                    required: true,
                },
            ],
        },
        {
            fields: [
                {
                    name: 'planFeatures',
                    type: 'multiselect',
                    label: 'خصائص الخطة المالية',
                    placeholder: 'أختر الخصائص',
                    options: [
                        { value: 'storage_5gb', label: 'تخزين يصل إلى 5 جيجا' },
                        { value: 'activity_log', label: 'سجل الأنشطة خاص' },
                        { value: 'users_120', label: 'تناسب حتى 120 مستخدم' },
                        { value: 'users_50', label: 'تناسب حتى 50 مستخدم' },
                        { value: 'patients_150', label: 'عدد المرضى: يصل إلى 150 مريض' },
                        { value: 'custom_page', label: 'صفحة خاصة للعرض' },
                        { value: 'notifications', label: 'إشعارات أساسية ورسائل بريد إلكتروني' },
                    ],
                    required: true,
                    defaultValue: [],
                },
            ],
        },
        {
            fields: [
                {
                    name: 'fullPrice',
                    type: 'text',
                    label: 'السعر الكامل للخصائص المالية المختارة',
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
                    label: 'السعر الأدنى للخطة المالية',
                    placeholder: 'مثال: 1200 جنيها',
                    required: true,
                },
            ],
        },
    ],
};
