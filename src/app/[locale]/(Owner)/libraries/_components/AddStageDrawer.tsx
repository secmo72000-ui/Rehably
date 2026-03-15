import React from 'react';
import { Drawer } from '@/ui/components';
import { Input, Button } from '@/ui/primitives';

interface AddStageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  isRtl?: boolean;
  t: (key: string) => string;
}

export function AddStageDrawer({
  isOpen,
  onClose,
  onSubmit,
  isRtl = true,
  t,
}: AddStageDrawerProps) {
  
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('addStage')}
      size="md"
    >
      <div className="space-y-5 p-2">
        
        {/* Code Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('codeLabel')}</label>
          <Input 
            placeholder={t('codePlaceholder')} 
            isRtl={isRtl}
            className="!rounded-lg" 
          />
        </div>

        {/* Stage Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('stageNameLabel')}</label>
          <Input 
            placeholder={t('stageNamePlaceholder')} 
            isRtl={isRtl}
            className="!rounded-lg text-start" 
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('description')}</label>
          <Input 
            placeholder={t('descPlaceholder')} 
            isRtl={isRtl}
            className="!rounded-lg text-start" 
          />
        </div>

        {/* Main Goal */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('mainGoal')}</label>
          <Input 
            placeholder={t('mainGoalPlaceholder')} 
            isRtl={isRtl}
            className="!rounded-lg text-start" 
          />
        </div>

        {/* Clinic Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">{t('clinicNotes')}</label>
          <Input 
            placeholder={t('notesPlaceholder')} 
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
              isRtl={isRtl}
              className="!rounded-lg" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">{t('maxWeeksLabel')}</label>
            <Input 
              placeholder={t('numberPlaceholder6')} 
              type="number"
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
              isRtl={isRtl}
              className="!rounded-lg" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">{t('maxSessionsLabel')}</label>
            <Input 
              placeholder={t('numberPlaceholder6')} 
              type="number"
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
            className="py-3 text-base  font-medium"
            onClick={onClose}
          >
            {t('addStage')}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
