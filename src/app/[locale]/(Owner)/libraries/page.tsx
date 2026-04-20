'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TabNavigator } from '@/ui/components';
import { Button } from '@/ui/primitives';
import type { Locale } from '@/configs/i18n.config';
import { useLibrariesPage } from './useLibrariesPage';
import {
  TreatmentsTab,
  AddTreatmentDrawer,
  TreatmentDetailsDrawer,
  StagesTab,
  AddStageDrawer,
  ExercisesTab,
  AddExerciseDrawer,
  AssessmentsTab,
  AddAssessmentDrawer,
  DevicesTab,
  AddDeviceDrawer,
} from './_components';

export default function LibrariesPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const c = useLibrariesPage();

  const tabs = [
    { id: 'treatments', label: 'مكتبة العلاجات' },
    { id: 'stages', label: 'مكتبة المراحل' },
    { id: 'exercises', label: 'مكتبة التمارين' },
    { id: 'assessments', label: 'التقييمات' },
    { id: 'devices', label: 'الأجهزة' },
  ];

  // Add button label per tab
  const addLabel = {
    treatments: c.t('addTreatment'),
    stages: c.t('addStage'),
    exercises: c.t('addExercise'),
    assessments: 'اضافة تقييم',
    devices: 'اضافة جهاز',
  }[c.activeTab] ?? c.t('addTreatment');

  // Add button handler per tab
  const handleAdd = {
    treatments: c.handleAddTreatment,
    stages: c.handleAddStage,
    exercises: c.handleAddExercise,
    assessments: c.handleAddAssessment,
    devices: c.handleAddDevice,
  }[c.activeTab] ?? c.handleAddTreatment;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Tabs */}
      <div className="flex justify-start w-full overflow-x-auto pb-2 lg:pb-0">
        <TabNavigator
          tabs={tabs}
          activeTab={c.activeTab}
          onTabChange={c.handleTabChange}
          className="bg-transparent shadow-none p-0 flex-nowrap"
        />
      </div>

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button
          variant="primary"
          startIcon={<span className="text-xl font-bold">+</span>}
          className="px-6 py-3 w-full sm:w-auto block"
          onClick={handleAdd}
        >
          {addLabel}
        </Button>
      </div>

      {/* Error */}
      {c.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {c.error}
        </div>
      )}

      {/* Loading */}
      {c.isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      )}

      {/* Tab Content */}
      <div>
        {!c.isLoading && c.activeTab === 'treatments' && (
          <TreatmentsTab
            treatments={c.treatments}
            searchQuery={c.searchQuery}
            onSearchChange={c.setSearchQuery}
            sortDirection={c.sortDirection}
            onSortToggle={c.handleSortToggle}
            onView={c.handleOpenDetails}
            locale={locale}
          />
        )}
        {!c.isLoading && c.activeTab === 'stages' && (
          <StagesTab
            stages={c.stages}
            t={c.t}
            onEdit={c.handleEditStage}
            onDelete={c.handleDeleteStage}
          />
        )}
        {!c.isLoading && c.activeTab === 'exercises' && (
          <ExercisesTab
            exercises={c.exercises}
            t={c.t}
            onEdit={c.handleEditExercise}
            onDelete={c.handleDeleteExercise}
          />
        )}
        {!c.isLoading && c.activeTab === 'assessments' && (
          <AssessmentsTab
            assessments={c.assessments}
            t={c.t}
            onEdit={c.handleEditAssessment}
            onDelete={c.handleDeleteAssessment}
          />
        )}
        {!c.isLoading && c.activeTab === 'devices' && (
          <DevicesTab
            devices={c.devices}
            onEdit={c.handleEditDevice}
            onDelete={c.handleDeleteDevice}
          />
        )}
      </div>

      {/* ====== Drawers ====== */}

      {/* Treatment Add/Edit */}
      <AddTreatmentDrawer
        isOpen={c.isDrawerOpen}
        onClose={c.handleCloseDrawer}
        onSubmit={c.handleSubmitTreatment}
        isSubmitting={c.isSubmitting}
        isRtl={locale === 'ar'}
        initialData={c.editingTreatment}
      />

      {/* Stage Add/Edit */}
      <AddStageDrawer
        isOpen={c.isStageDrawerOpen}
        onClose={c.handleCloseStageDrawer}
        onSubmit={c.handleSubmitStage}
        isSubmitting={c.isSubmitting}
        isRtl={locale === 'ar'}
        t={c.t}
        initialData={c.editingStage}
      />

      {/* Exercise Add/Edit */}
      <AddExerciseDrawer
        isOpen={c.isExerciseDrawerOpen}
        onClose={c.handleCloseExerciseDrawer}
        onSubmit={c.handleSubmitExercise}
        isRtl={locale === 'ar'}
        t={c.t}
        initialData={c.editingExercise}
      />

      {/* Assessment Add/Edit */}
      <AddAssessmentDrawer
        isOpen={c.isAssessmentDrawerOpen}
        onClose={c.handleCloseAssessmentDrawer}
        onSubmit={c.handleSubmitAssessment}
        isSubmitting={c.isSubmitting}
        isRtl={locale === 'ar'}
        initialData={c.editingAssessment}
      />

      {/* Device Add/Edit */}
      <AddDeviceDrawer
        isOpen={c.isDeviceDrawerOpen}
        onClose={c.handleCloseDeviceDrawer}
        onSubmit={c.handleSubmitDevice}
        isSubmitting={c.isSubmitting}
        isRtl={locale === 'ar'}
        initialData={c.editingDevice}
      />

      {/* Treatment Details */}
      <TreatmentDetailsDrawer
        isOpen={c.isDetailsDrawerOpen}
        onClose={c.handleCloseDetails}
        treatment={c.selectedTreatment}
        onEdit={c.handleEditTreatment}
        onDelete={c.handleDeleteTreatment}
        isRtl={locale === 'ar'}
        t={c.t}
      />
    </div>
  );
}
