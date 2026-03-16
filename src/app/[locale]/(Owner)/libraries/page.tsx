'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TabNavigator } from '@/ui/components';
import { Button } from '@/ui/primitives';
import type { Locale } from '@/configs/i18n.config';
import { useLibrariesPage } from './useLibrariesPage';
import { TreatmentsTab, AddTreatmentDrawer, TreatmentDetailsDrawer, StagesTab, AddStageDrawer, ExercisesTab, AddExerciseDrawer, AssessmentsTab } from './_components';

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
      {/* Top Header: Tabs */}
      <div className="flex justify-start w-full overflow-x-auto pb-2 lg:pb-0">
        <TabNavigator
          tabs={tabs}
          activeTab={controller.activeTab}
          onTabChange={controller.handleTabChange}
          className="bg-transparent shadow-none p-0 flex-nowrap"
        />
      </div>
      
      {/* Add Treatment Button Row */}
      <div className="flex justify-end items-center">
        <Button
          variant="primary"
          startIcon={<span className="text-xl font-bold">+</span>}
          className="px-6 py-3 w-full sm:w-auto block"
          onClick={
            controller.activeTab === 'stages' 
              ? controller.handleAddStage 
              : controller.activeTab === 'exercises' 
                ? controller.handleAddExercise 
                : controller.activeTab === 'assessments'
                  ? controller.handleAddAssessment
                  : controller.handleAddTreatment
          }
        >
          {controller.activeTab === 'stages' 
            ? controller.t('addStage') 
            : controller.activeTab === 'exercises' 
              ? controller.t('addExercise') 
              : controller.activeTab === 'assessments'
                ? 'اضافة تقييم'
                : controller.t('addTreatment')}
        </Button>
      </div>

      {/* Error Display */}
      {controller.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {controller.error}
        </div>
      )}

      {/* Loading State */}
      {controller.isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      )}

      {/* Main Content Area */}
      <div>
        {!controller.isLoading && controller.activeTab === 'treatments' && (
          <TreatmentsTab 
            treatments={controller.treatments}
            searchQuery={controller.searchQuery}
            onSearchChange={controller.setSearchQuery}
            sortDirection={controller.sortDirection}
            onSortToggle={controller.handleSortToggle}
            onView={controller.handleOpenDetails}
            locale={locale}
          />
        )}
        {!controller.isLoading && controller.activeTab === 'stages' && (
          <StagesTab 
             stages={controller.stages}
             t={controller.t}
             onEdit={controller.handleEditStage}
             onDelete={controller.handleDeleteStage}
          />
        )}
        {!controller.isLoading && controller.activeTab === 'exercises' && (
          <ExercisesTab 
             exercises={controller.exercises}
             t={controller.t}
             onEdit={controller.handleEditExercise}
             onDelete={controller.handleDeleteExercise}
          />
        )}
        {!controller.isLoading && controller.activeTab === 'assessments' && (
          <AssessmentsTab 
             assessments={controller.assessments}
             t={controller.t}
             onEdit={controller.handleEditAssessment}
             onDelete={controller.handleDeleteAssessment}
          />
        )}
        {!controller.isLoading && controller.activeTab !== 'treatments' && controller.activeTab !== 'stages' && controller.activeTab !== 'exercises' && controller.activeTab !== 'assessments' && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 font-medium">
            هذه المكتبة قيد التطوير
          </div>
        )}
      </div>

      {/* Add Treatment Drawer */}
      <AddTreatmentDrawer
        isOpen={controller.isDrawerOpen}
        onClose={controller.handleCloseDrawer}
        onSubmit={controller.handleSubmitTreatment}
        isSubmitting={controller.isSubmitting}
        isRtl={locale === 'ar'}
      />

      {/* Add Stage Drawer */}
      <AddStageDrawer
        isOpen={controller.isStageDrawerOpen}
        onClose={controller.handleCloseStageDrawer}
        onSubmit={controller.handleSubmitStage}
        isSubmitting={controller.isSubmitting}
        isRtl={locale === 'ar'}
        t={controller.t}
      />

      {/* Add Exercise Drawer */}
      <AddExerciseDrawer
        isOpen={controller.isExerciseDrawerOpen}
        onClose={controller.handleCloseExerciseDrawer}
        onSubmit={controller.handleSubmitExercise}
        isRtl={locale === 'ar'}
        t={controller.t}
      />

      {/* Treatment Details Drawer */}
      <TreatmentDetailsDrawer 
        isOpen={controller.isDetailsDrawerOpen}
        onClose={controller.handleCloseDetails}
        treatment={controller.selectedTreatment}
        onEdit={controller.handleEditTreatment}
        onDelete={controller.handleDeleteTreatment}
        isRtl={locale === 'ar'}
        t={controller.t}
      />
    </div>
  );
}
