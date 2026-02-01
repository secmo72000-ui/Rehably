'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { Table, TableColumn, Drawer, DynamicForm, DynamicFormConfig, FormData } from '@/ui/components';
import TableRowActions from '@/ui/components/TableRowActions';
import PaymentStatusBadge from '@/ui/components/PaymentStatusBadge';
import { Button } from '@/ui/primitives';
import { ClinicDetails } from './components';

// ========== Types ==========
interface Clinic {
  id: string;
  name: string;
  email?: string;
  managerName?: string;
  phone?: string;
  package: string;
  location?: string;
  subscriptionDate: string;
  expiryDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'suspended' | 'refunded';
  doctorsCount: number;
  storageUsed?: number;
  storageTotal?: number;
}

// Drawer types
type DrawerType = 'add' | 'view' | null;

// ========== Mock Data ==========
const mockClinics: Clinic[] = [
  {
    id: 'CLN-001',
    name: 'عيادة النور للعلاج الطبيعي',
    email: 'alnoor@gmail.com',
    managerName: 'د. أحمد محمود',
    phone: '01000000000',
    package: 'Package-1',
    location: 'القاهرة',
    subscriptionDate: '01/01/2025',
    expiryDate: '01/01/2026',
    paymentStatus: 'paid',
    doctorsCount: 5,
    storageUsed: 50,
    storageTotal: 100,
  },
  {
    id: 'CLN-002',
    name: 'مركز الشفاء الطبي',
    email: 'alshefa@gmail.com',
    managerName: 'د. محمد علي',
    phone: '01111111111',
    package: 'Package-2',
    location: 'الجيزة',
    subscriptionDate: '15/02/2025',
    expiryDate: '15/02/2026',
    paymentStatus: 'paid',
    doctorsCount: 8,
    storageUsed: 75,
    storageTotal: 150,
  },
  {
    id: 'CLN-003',
    name: 'عيادة الأمل',
    email: 'alamal@gmail.com',
    managerName: 'د. سارة محمد',
    phone: '01222222222',
    package: 'Package-1',
    location: 'الإسكندرية',
    subscriptionDate: '01/03/2025',
    expiryDate: '01/03/2026',
    paymentStatus: 'unpaid',
    doctorsCount: 3,
    storageUsed: 30,
    storageTotal: 100,
  },
  {
    id: 'CLN-004',
    name: 'مركز الحياة للتأهيل',
    email: 'alhayat@gmail.com',
    managerName: 'د. خالد عبدالله',
    phone: '01333333333',
    package: 'Package-3',
    location: 'المنصورة',
    subscriptionDate: '20/12/2024',
    expiryDate: '20/12/2025',
    paymentStatus: 'suspended',
    doctorsCount: 12,
    storageUsed: 180,
    storageTotal: 200,
  },
  {
    id: 'CLN-005',
    name: 'عيادة الرعاية المتكاملة',
    email: 'alreaya@gmail.com',
    managerName: 'د. فاطمة حسن',
    phone: '01444444444',
    package: 'Package-2',
    location: 'طنطا',
    subscriptionDate: '10/01/2025',
    expiryDate: '10/01/2026',
    paymentStatus: 'paid',
    doctorsCount: 6,
    storageUsed: 60,
    storageTotal: 150,
  },
];

// ========== Options ==========
const governorates = [
  { value: 'cairo', label: 'القاهرة' },
  { value: 'giza', label: 'الجيزة' },
  { value: 'alex', label: 'الإسكندرية' },
  { value: 'dakahlia', label: 'الدقهلية' },
  { value: 'sharqia', label: 'الشرقية' },
];

const cities = [
  { value: 'nasr-city', label: 'مدينة نصر' },
  { value: 'maadi', label: 'المعادي' },
  { value: 'heliopolis', label: 'مصر الجديدة' },
  { value: 'dokki', label: 'الدقي' },
  { value: '6october', label: '6 أكتوبر' },
];

const subscriptionPlans = [
  { value: 'basic', label: 'الباقة الأساسية' },
  { value: 'pro', label: 'الباقة المتقدمة' },
  { value: 'enterprise', label: 'باقة المؤسسات' },
];

const paymentMethods = [
  { value: 'cash', label: 'نقدي' },
  { value: 'card', label: 'بطاقة ائتمان' },
  { value: 'bank', label: 'تحويل بنكي' },
];

// ========== Form Config ==========
const addClinicFormConfig: DynamicFormConfig = {
  rows: [
    // Row 1: اسم العيادة
    {
      fields: [
        {
          name: 'name',
          label: 'اسم العيادة',
          type: 'text',
          placeholder: 'اسم العيادة',
          required: true,
        },
      ],
    },
    // Row 2: مدير العيادة
    {
      fields: [
        {
          name: 'managerName',
          label: 'مدير العيادة',
          type: 'text',
          placeholder: 'اسم مدير العيادة',
        },
      ],
    },
    // Row 3: رقم التليفون
    {
      fields: [
        {
          name: 'phone',
          label: 'رقم التليفون',
          type: 'tel',
          placeholder: 'رقم التليفون',
          required: true,
        },
      ],
    },
    // Row 4: البريد الإلكتروني
    {
      fields: [
        {
          name: 'email',
          label: 'البريد الإلكتروني',
          type: 'email',
          placeholder: 'البريد الإلكتروني',
        },
      ],
    },
    // Row 5: المحافظة + المدينة (2 fields)
    {
      fields: [
        {
          name: 'governorate',
          label: 'المحافظة',
          type: 'select',
          placeholder: 'اختر محافظة',
          options: governorates,
        },
        {
          name: 'city',
          label: 'المدينة',
          type: 'select',
          placeholder: 'اختر مدينة',
          options: cities,
        },
      ],
    },
    // Row 6: العنوان
    {
      fields: [
        {
          name: 'address',
          label: 'العنوان',
          type: 'text',
          placeholder: 'ادخل العنوان بالكامل',
        },
      ],
    },
    // Row 7: تعيين خطة اشتراكية
    {
      fields: [
        {
          name: 'subscriptionPlan',
          label: 'تعيين خطة اشتراكية',
          type: 'select',
          placeholder: 'ادخل المنطقة',
          options: subscriptionPlans,
        },
      ],
    },
    // Row 8: طريقة الدفع + حالة الدفع (2 fields)
    {
      fields: [
        {
          name: 'paymentMethod',
          label: 'طريقة الدفع',
          type: 'select',
          placeholder: 'اختر طريقة الدفع',
          options: paymentMethods,
        },
        {
          name: 'paymentStatus',
          label: 'حالة الدفع',
          type: 'radio',
          options: [
            { value: 'paid', label: 'مدفوع', color: 'green' },
            { value: 'unpaid', label: 'غير مدفوع', color: 'red' },
          ],
        },
      ],
    },
  ],
  submitLabel: 'إضافة عيادة',
};



// ========== Page Component ==========
export default function ClinicManagementPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const t = (key: string) => getTranslation(locale, `clinicManagement.${key}`);

  const [currentPage, setCurrentPage] = useState(1);

  // Drawer state
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Open add drawer
  const openAddDrawer = () => {
    setDrawerType('add');
    setSelectedClinic(null);
  };

  // Open view drawer
  const openViewDrawer = (clinic: Clinic) => {
    setDrawerType('view');
    setSelectedClinic(clinic);
  };

  // Close drawer
  const closeDrawer = () => {
    setDrawerType(null);
    setSelectedClinic(null);
  };

  // Handle form submit
  const handleAddClinic = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log('Adding clinic:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Close drawer on success
      closeDrawer();

      // TODO: Refresh data or add to list
    } catch (error) {
      console.error('Error adding clinic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Drawer config based on type
  const getDrawerTitle = () => {
    switch (drawerType) {
      case 'add':
        return t('addClinic');
      case 'view':
        return t('clinicDetails');
      default:
        return '';
    }
  };

  // Define columns
  const columns: TableColumn<Clinic>[] = [
    { key: 'id', header: t('columns.id') },
    { key: 'name', header: t('columns.name') },
    { key: 'package', header: t('columns.package') },
    { key: 'subscriptionDate', header: t('columns.subscriptionDate') },
    { key: 'expiryDate', header: t('columns.expiryDate') },
    {
      key: 'paymentStatus',
      header: t('columns.paymentStatus'),
      render: (value) => <PaymentStatusBadge status={value as string} />,
    },
    { key: 'doctorsCount', header: t('columns.doctorsCount'), align: 'center' },
    {
      key: 'actions',
      header: t('columns.actions'),
      render: (_, row) => (
        <TableRowActions
          onView={() => openViewDrawer(row)}
          onDelete={() => console.log('Delete:', row.id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">{t('pageTitle')}</h1>
        <Button onClick={openAddDrawer} variant="primary">
          {t('addClinic')}
        </Button>
      </div>

      {/* Table */}
      <Table<Clinic>
        columns={columns}
        data={mockClinics}
        rowKey="id"
        pagination={{
          currentPage,
          totalPages: 3,
          onPageChange: setCurrentPage,
        }}
        footerContent={
          <div className="w-full flex justify-between items-center text-sm-medium">
            <span className="text-grey-600">
              {t('totalClinics')}: {mockClinics.length}
            </span>
            <span className="text-Primary-600">
              {t('activePackages')}:{' '}
              {mockClinics.filter((c) => c.paymentStatus === 'paid').length}
            </span>
          </div>
        }
      />

      {/* Drawer */}
      <Drawer
        isOpen={!!drawerType}
        onClose={closeDrawer}
        title={getDrawerTitle()}
        size="lg"
      >
        {/* Add Clinic Form */}
        {drawerType === 'add' && (
          <DynamicForm
            config={addClinicFormConfig}
            onSubmit={handleAddClinic}
            isLoading={isLoading}
          />
        )}

        {/* View Clinic Details */}
        {drawerType === 'view' && (
          <ClinicDetails
            clinic={selectedClinic}
            onBlock={() => console.log('Block clinic:', selectedClinic?.id)}
            onSendNotification={() => console.log('Send notification to:', selectedClinic?.id)}
          />
        )}
      </Drawer>
    </div>
  );
}
