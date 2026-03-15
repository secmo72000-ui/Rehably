'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TabNavigator } from '@/ui/components';
import { Button } from '@/ui/primitives';
import type { Locale } from '@/configs/i18n.config';
import { useLibrariesPage } from './useLibrariesPage';
import { TreatmentsTab } from './_components';

export default function LibrariesPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const controller = useLibrariesPage();

  const tabs = [
    { id: 'treatments', label: 'مكتبة العلاجات' },
    { id: 'stages', label: 'مكتبة المراحل' },
    { id: 'exercises', label: 'مكتبة التمارين' },
    { id: 'assessments', label: 'التقييمات' },
    { id: 'devices', label: 'الأجهزة' }
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Top Header: Tabs and Add Button */}
      <div className="flex flex-col-reverse lg:flex-row justify-between items-start lg:items-center gap-6">
        
        {/* Tabs Navigator */}
        <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <TabNavigator
            tabs={tabs}
            activeTab={controller.activeTab}
            onTabChange={controller.handleTabChange}
            className="bg-transparent shadow-none p-0 flex-nowrap"
          />
        </div>
        
        {/* Add Treatment Button */}
        <div className="w-full lg:w-auto flex justify-start lg:justify-end shrink-0">
          <Button
            variant="primary"
            startIcon={<span className="text-xl font-bold">+</span>}
            className="px-6 py-3 w-full lg:w-auto"
            onClick={controller.handleAddTreatment}
          >
            اضافة علاج
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {controller.activeTab === 'treatments' && (
          <TreatmentsTab 
            treatments={controller.treatments}
            searchQuery={controller.searchQuery}
            onSearchChange={controller.setSearchQuery}
            locale={locale}
          />
        )}
        {controller.activeTab !== 'treatments' && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 font-medium">
            هذه المكتبة قيد التطوير
          </div>
        )}
      </div>
    </div>
  );
}
