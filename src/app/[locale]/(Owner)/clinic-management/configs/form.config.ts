import { DynamicFormConfig } from '@/ui/components';
import { Package } from '@/services/packages.service';

const billingCycleOptions = (t: (key: string) => string) => [
  { value: '0', label: t('form.billingCycle.monthly') },
  { value: '1', label: t('form.billingCycle.yearly') },
];

/**
 * Generate clinic form configuration
 * @param packages Available packages list
 * @param packagesLoading Loading state for packages
 * @param t Translation function
 */
export const getAddClinicFormConfig = (
  packages: Package[],
  packagesLoading: boolean,
  t: (key: string) => string
): DynamicFormConfig => ({
  rows: [
    // Row 1: اسم العيادة (EN + AR)
    {
      fields: [
        {
          name: 'clinicName',
          label: t('form.clinicName.label'),
          type: 'text',
          placeholder: t('form.clinicName.placeholder'),
          required: true,
        },
        {
          name: 'clinicNameArabic',
          label: t('form.clinicNameArabic.label'),
          type: 'text',
          placeholder: t('form.clinicNameArabic.placeholder'),
        },
      ],
    },
    // Row 2: رقم التليفون + البريد الإلكتروني
    {
      fields: [
        {
          name: 'phone',
          label: t('form.phone.label'),
          type: 'tel',
          placeholder: t('form.phone.placeholder'),
          required: true,
        },
        {
          name: 'email',
          label: t('form.email.label'),
          type: 'email',
          placeholder: t('form.email.placeholder'),
          required: true,
        },
      ],
    },
    // Row 3: المدينة + الدولة (text inputs)
    {
      fields: [
        {
          name: 'city',
          label: t('form.city.label'),
          type: 'text',
          placeholder: t('form.city.placeholder'),
        },
        {
          name: 'country',
          label: t('form.country.label'),
          type: 'text',
          placeholder: t('form.country.placeholder'),
        },
      ],
    },
    // Row 4: العنوان
    {
      fields: [
        {
          name: 'address',
          label: t('form.address.label'),
          type: 'text',
          placeholder: t('form.address.placeholder'),
        },
      ],
    },
    // Row 5: اللوجو
    {
      fields: [
        {
          name: 'logoUrl',
          label: t('form.logoUrl.label'),
          type: 'text',
          placeholder: t('form.logoUrl.placeholder'),
        },
      ],
    },
    // Row 6: الباقة + دورة الفوترة
    {
      fields: [
        {
          name: 'packageId',
          label: t('form.packageId.label'),
          type: 'select',
          placeholder: packagesLoading ? t('common.loading') : t('form.packageId.placeholder'),
          required: true,
          options: packages.map((p) => ({
            value: String(p.id),
            label: `${p.name} - ${p.monthlyPrice} ${t('common.currency')}/${t('common.month')}`,
          })),
        },
        {
          name: 'billingCycle',
          label: t('form.billingCycle.label'),
          type: 'select',
          placeholder: t('form.billingCycle.placeholder'),
          required: true,
          options: billingCycleOptions(t),
        },
      ],
    },
    // Row 7: بريد مدير العيادة
    {
      fields: [
        {
          name: 'ownerEmail',
          label: t('form.ownerEmail.label'),
          type: 'email',
          placeholder: t('form.ownerEmail.placeholder'),
          required: true,
        },
      ],
    },
    // Row 8: اسم المدير
    {
      fields: [
        {
          name: 'ownerFirstName',
          label: t('form.ownerFirstName.label'),
          type: 'text',
          placeholder: t('form.ownerFirstName.placeholder'),
          required: true,
        },
        {
          name: 'ownerLastName',
          label: t('form.ownerLastName.label'),
          type: 'text',
          placeholder: t('form.ownerLastName.placeholder'),
          required: true,
        },
      ],
    },
  ],
  submitLabel: t('form.submit'),
});
