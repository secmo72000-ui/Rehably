import type { DynamicFormConfig } from '@/ui/components';

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
                    options: [
                        { value: 'user1', label: 'Clinic Group - uxeasin@gmail.com' },
                        { value: 'user2', label: 'Health Center - health@example.com' },
                        { value: 'user3', label: 'Medical Clinic - medical@example.com' },
                    ],
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
                    options: [
                        { value: 'pkg1', label: 'خطة مبتدئ - 500 جنيها' },
                        { value: 'pkg2', label: 'خطة متقدم - 1000 جنيها' },
                        { value: 'pkg3', label: 'خطة خبير - 1500 جنيها' },
                    ],
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
