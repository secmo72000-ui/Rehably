import React, { useState, useEffect } from 'react';
import { Drawer } from '@/ui/components';
import { Input, Button } from '@/ui/primitives';
import type { CreateStageRequest } from '@/domains/library';
import type { Stage } from '../useLibrariesPage';

interface AddStageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateStageRequest) => void;
  isSubmitting?: boolean;
  isRtl?: boolean;
  t: (key: string) => string;
  initialData?: Stage | null;
}

export function AddStageDrawer({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  isRtl = true,
  t,
  initialData,
}: AddStageDrawerProps) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    mainGoal: '',
    clinicNotes: '',
    minWeeks: '',
    maxWeeks: '',
    minSessions: '',
    maxSessions: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          code: initialData.code,
          name: initialData.title,
          description: initialData.description,
          mainGoal: initialData.mainGoal,
          clinicNotes: initialData.clinicNotes,
          minWeeks: String(initialData.minWeeks),
          maxWeeks: String(initialData.maxWeeks),
          minSessions: String(initialData.minSessions),
          maxSessions: String(initialData.maxSessions),
        });
      } else {
        setFormData({
          code: '', name: '', description: '', mainGoal: '',
          clinicNotes: '', minWeeks: '', maxWeeks: '', minSessions: '', maxSessions: '',
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const request: CreateStageRequest = {
      code: formData.code,
      name: formData.name,
      description: formData.description || undefined,
      minWeeks: formData.minWeeks ? parseInt(formData.minWeeks) : undefined,
      maxWeeks: formData.maxWeeks ? parseInt(formData.maxWeeks) : undefined,
      minSessions: formData.minSessions ? parseInt(formData.minSessions) : undefined,
      maxSessions: formData.maxSessions ? parseInt(formData.maxSessions) : undefined,
    };
    onSubmit?.(request);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'تعديل المرحلة' : t('addStage')}
      size="md"
    >
      <div className="space-y-5 p-2">

        {/* Code Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('codeLabel')}</label>
          <Input
            placeholder={t('codePlaceholder')}
            value={formData.code}
            onChange={(val) => handleChange('code', val)}
            isRtl={isRtl}
            className="!rounded-lg"
          />
        </div>

        {/* Stage Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('stageNameLabel')}</label>
          <Input
            placeholder={t('stageNamePlaceholder')}
            value={formData.name}
            onChange={(val) => handleChange('name', val)}
            isRtl={isRtl}
            className="!rounded-lg text-start"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('description')}</label>
          <Input
            placeholder={t('descPlaceholder')}
            value={formData.description}
            onChange={(val) => handleChange('description', val)}
            isRtl={isRtl}
            className="!rounded-lg text-start"
          />
        </div>

        {/* Main Goal */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('mainGoal')}</label>
          <Input
            placeholder={t('mainGoalPlaceholder')}
            value={formData.mainGoal}
            onChange={(val) => handleChange('mainGoal', val)}
            isRtl={isRtl}
            className="!rounded-lg text-start"
          />
        </div>

        {/* Clinic Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('clinicNotes')}</label>
          <Input
            placeholder={t('notesPlaceholder')}
            value={formData.clinicNotes}
            onChange={(val) => handleChange('clinicNotes', val)}
            isRtl={isRtl}
            className="!rounded-lg text-start"
          />
        </div>

        {/* Weeks Durations Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">{t('minWeeksLabel')}</label>
            <Input
              placeholder={t('numberPlaceholder2')}
              type="number"
              value={formData.minWeeks}
              onChange={(val) => handleChange('minWeeks', val)}
              isRtl={isRtl}
              className="!rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">{t('maxWeeksLabel')}</label>
            <Input
              placeholder={t('numberPlaceholder6')}
              type="number"
              value={formData.maxWeeks}
              onChange={(val) => handleChange('maxWeeks', val)}
              isRtl={isRtl}
              className="!rounded-lg"
            />
          </div>
        </div>

        {/* Sessions Durations Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">{t('minSessionsLabel')}</label>
            <Input
              placeholder={t('numberPlaceholder2')}
              type="number"
              value={formData.minSessions}
              onChange={(val) => handleChange('minSessions', val)}
              isRtl={isRtl}
              className="!rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">{t('maxSessionsLabel')}</label>
            <Input
              placeholder={t('numberPlaceholder6')}
              type="number"
              value={formData.maxSessions}
              onChange={(val) => handleChange('maxSessions', val)}
              isRtl={isRtl}
              className="!rounded-lg"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 pb-6">
          <Button
            variant="primary"
            fullWidth
            className="py-3 text-base font-medium"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isEditMode ? 'جاري التعديل...' : 'جاري الاضافة...')
              : (isEditMode ? 'حفظ التعديلات' : t('addStage'))}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
