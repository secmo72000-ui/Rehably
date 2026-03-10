'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { StatsCard, Table, type TableColumn, PaymentStatusBadge } from '@/ui/components';
import { SubscriptionsChart, SalesChart } from './components';
import Image from 'next/image';
import { useAuthStore } from '@/domains/auth/auth.store';

// ========== Types ==========
interface Subscription {
  id: string;
  clinicName: string;
  package: string;
  paymentDate: string;
  dueDate: string;
  paymentMethod: string;
  status: 'paid' | 'rejected' | 'pending';
  invoiceNumber: string;
}

// ========== Mock Data ==========
const statsData = [
  {
    title: 'اجمالي المدخلات',
    value: '2,530',
    trend: 17, // +17%
  },
  {
    title: 'عدد العيادات',
    value: '2,530',
    trend: -11, // -11%
  },
  {
    title: 'العيادات النشطة',
    value: '2,530',
    trend: 17, // +17%
  },
  {
    title: 'عدد المستخدمين',
    value: '2,530',
    trend: 17, // +17%
  }
];

const mockSubscriptions: Subscription[] = [
  {
    id: 'Sub-10',
    clinicName: 'أحمد منصور',
    package: 'Package-1',
    paymentDate: '01/02/2025',
    dueDate: '01/03/2025',
    paymentMethod: 'بطاقة ائتمان',
    status: 'paid',
    invoiceNumber: 'INV-001'
  },
  {
    id: 'Sub-11',
    clinicName: 'أحمد منصور',
    package: 'Package-1',
    paymentDate: '01/02/2025',
    dueDate: '01/03/2025',
    paymentMethod: 'بطاقة ائتمان',
    status: 'paid',
    invoiceNumber: 'INV-002'
  },
  {
    id: 'Sub-12',
    clinicName: 'أحمد منصور',
    package: 'Package-1',
    paymentDate: '01/02/2025',
    dueDate: '01/03/2025',
    paymentMethod: 'بطاقة ائتمان',
    status: 'paid',
    invoiceNumber: 'INV-003'
  },
  {
    id: 'Sub-13',
    clinicName: 'أحمد منصور',
    package: 'Package-1',
    paymentDate: '01/02/2025',
    dueDate: '01/03/2025',
    paymentMethod: 'بطاقة ائتمان',
    status: 'paid',
    invoiceNumber: 'INV-004'
  },
];

export default function HomePage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const t = (key: string) => getTranslation(locale, `home.${key}`);
  const tGlobal = (key: string) => getTranslation(locale, `${key}`);
  const { user } = useAuthStore();

  // Translation Helpers for dynamic keys
  const getStatTitle = (index: number) => {
    const keys = ['totalEntries', 'clinicsCount', 'activeClinics', 'usersCount'];
    return t(`stats.${keys[index]}`);
  };

  // Table Columns
  const columns: TableColumn<Subscription>[] = [
    { key: 'id', header: 'ID' },
    { key: 'clinicName', header: 'اسم العيادة' }, // Should use translations in real app
    { key: 'package', header: 'Package' },
    { key: 'paymentDate', header: 'تاريخ الدفع' },
    { key: 'dueDate', header: 'ممتد الى' },
    { key: 'paymentMethod', header: 'طريقة الدفع' },
    {
      key: 'status',
      header: 'حالة الدفع',
      render: (value) => <PaymentStatusBadge status={value as string} />,
    },
    {
      key: 'invoiceNumber',
      header: 'تفاصيل',
      render: () => (
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <Image src="/shered/trash.svg" alt="delete" width={18} height={18} />
        </button>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="flex justify-start mb-6">
        <h1 className="text-2xl font-bold text-[#101828]">
          {t('welcome')} {user?.firstName || 'User'}
        </h1>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={getStatTitle(index)}
            value={stat.value}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[400px]">
        {/* Donut Chart (Sales) - Takes ~30% */}
        <div className="w-full lg:w-[30%]">
          <SalesChart
            title={t('charts.salesReport')}
            filterLabel={t('stats.thisMonth')}
            totalSales="20.480"
            percentage="+15%"
          />
        </div>
        {/* Bar Chart (Subscriptions) - Takes ~70% */}
        <div className="w-full lg:w-[70%]">
          <SubscriptionsChart
            title={t('charts.subscriptions')}
            filterLabel={t('stats.thisMonth')}
          />
        </div>
      </div>

      {/* Recent Subscriptions Table */}
      <div className="pt-4 bg-white rounded-2xl  shadow-sm">
        <div className="flex items-center justify-between mb-4 px-6 ">

          <h3 className=" text-xl-bold text-text">{t('charts.lastSubscriptions')}</h3>
          {/* View All Button - styled as link */}
          <button className=" text-primary-500 text-base-regular  underline cursor-pointer">
            {t('charts.viewAll')}
          </button>
        </div>

        <Table
          data={mockSubscriptions}
          columns={columns}
          rowKey="id"
          // Simplified table without complex pagination/sorting visuals for this widget view if needed
          className="shadow-none border-none"
        />
      </div>
    </div>
  );
}
