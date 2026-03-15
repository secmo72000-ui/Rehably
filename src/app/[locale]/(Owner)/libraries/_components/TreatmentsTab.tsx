import React from 'react';
import { Table, TableRowActions } from '@/ui/components';
import { Input } from '@/ui/primitives';
import { TableColumn } from '@/ui/components/Table/Table.types';

interface TreatmentsTabProps {
  treatments: any[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sortDirection: 'asc' | 'desc';
  onSortToggle: () => void;
  onView: (treatment: any) => void;
  locale: string;
}

export function TreatmentsTab({
  treatments,
  searchQuery,
  onSearchChange,
  sortDirection,
  onSortToggle,
  onView,
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
      <Table 
        data={treatments}
        columns={columns}
        rowKey="id"
        actionsHeader="تفاصيل"
        sorting={{
          active: true,
          direction: sortDirection,
          onToggle: onSortToggle,
        }}
       
        rowActions={(row) => (
          <TableRowActions 
             onView={() => onView(row)}
             onDelete={() => {}}
          />
        )}
      />
    </div>
  );
}
