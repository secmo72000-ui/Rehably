import React from 'react';
import { Table, TableRowActions } from '@/ui/components';
import { Input } from '@/ui/primitives';
import { TableColumn } from '@/ui/components/Table/Table.types';

interface TreatmentsTabProps {
  treatments: any[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  locale: string;
}

export function TreatmentsTab({
  treatments,
  searchQuery,
  onSearchChange,
  locale
}: TreatmentsTabProps) {

  const columns: TableColumn<any>[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'الأسم' },
    { key: 'code', header: 'الكود' },
    { key: 'category', header: 'اسم الفئة' },
    { key: 'affectedArea', header: 'المنطقة المصابة' },
    { key: 'sessions', header: 'الجلسات', align: 'center' },
    { key: 'minWeeks', header: 'اقل مدة الاسابيع', align: 'center' },
    { key: 'maxWeeks', header: 'اعلى مدة الاسابيع', align: 'center' },
    { 
      key: 'reviewSource', 
      header: 'مصدر مراجعة',
      render: (val: any) => (
        <span className="underline cursor-pointer text-gray-700 hover:text-Primary-500">
          {String(val)}
        </span>
      )
    },
    { 
      key: 'progress', 
      header: 'التقدم العلاجي',
      render: () => (
        <span className="bg-[#E8F8F5] text-[#00A884] px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap">
          تفاصيل المرض كاملة
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-full sm:w-[250px]">
          <Input 
            placeholder="البحث"
            value={searchQuery}
            onChange={onSearchChange}
            isRtl={locale === 'ar'}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
            className="!rounded-lg"
          />
        </div>
      </div>
      
      <Table 
        data={treatments}
        columns={columns}
        rowKey="id"
        actionsHeader="تفاصيل"
        rowActions={() => (
          <TableRowActions 
             onView={() => {}}
             onDelete={() => {}}
          />
        )}
      />
    </div>
  );
}
