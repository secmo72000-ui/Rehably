import React, { useState, useEffect } from 'react';
import { Drawer } from '@/ui/components';
import { Input, Button } from '@/ui/primitives';
import type { CreateAssessmentRequest } from '@/domains/library';
import type { Assessment } from '../useLibrariesPage';

interface AddAssessmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateAssessmentRequest) => void;
  isSubmitting?: boolean;
  isRtl?: boolean;
  initialData?: Assessment | null;
}

export function AddAssessmentDrawer({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  isRtl = true,
  initialData,
}: AddAssessmentDrawerProps) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    instructions: '',
    scoringGuide: '',
    timePoint: '',
    relatedConditionCodes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          code: initialData.code,
          name: initialData.title,
          description: initialData.description,
          instructions: '',
          scoringGuide: '',
          timePoint: initialData.frequency,
          relatedConditionCodes: '',
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          instructions: '',
          scoringGuide: '',
          timePoint: '',
          relatedConditionCodes: '',
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const request: CreateAssessmentRequest = {
      code: formData.code,
      name: formData.name,
      description: formData.description || undefined,
      instructions: formData.instructions || undefined,
      scoringGuide: formData.scoringGuide || undefined,
      timePoint: formData.timePoint ? parseInt(formData.timePoint) : undefined,
      relatedConditionCodes: formData.relatedConditionCodes || undefined,
    };
    onSubmit?.(request);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'تعديل التقييم' : 'اضافة تقييم جديد'}
      size="md"
    >
      <div className="space-y-5 p-2">

        {/* Code */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الكود</label>
          <Input
            placeholder="مثال : VAS-01"
            value={formData.code}
            onChange={(val) => handleChange('code', val)}
            isRtl={isRtl}
            className="!rounded-lg"
          />
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">اسم التقييم</label>
          <Input
            placeholder="مثال : Visual Analogue Scale"
            value={formData.name}
            onChange={(val) => handleChange('name', val)}
            isRtl={isRtl}
            className="!rounded-lg text-start"
          />
        </div>

        {/* Time Point */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">نقطة الوقت (TimePoint)</label>
          <Input
            placeholder="مثال : 0"
            type="number"
            value={formData.timePoint}
            onChange={(val) => handleChange('timePoint', val)}
            isRtl={isRtl}
            className="!rounded-lg"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الوصف</label>
          <textarea
            placeholder="ادخل وصف للتقييم"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[90px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Instructions */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">التعليمات</label>
          <textarea
            placeholder="ادخل تعليمات التقييم"
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[80px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Scoring Guide */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">دليل التسجيل Scoring Guide</label>
          <textarea
            placeholder="ادخل دليل التسجيل"
            value={formData.scoringGuide}
            onChange={(e) => handleChange('scoringGuide', e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[80px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Related Condition Codes */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الأكواد المرتبطة</label>
          <Input
            placeholder="مثال : M54.5, M54.4"
            value={formData.relatedConditionCodes}
            onChange={(val) => handleChange('relatedConditionCodes', val)}
            isRtl={isRtl}
            className="!rounded-lg"
          />
        </div>

        {/* Action button */}
        <div className="pt-4 pb-6">
          <Button
            variant="primary"
            fullWidth
            className="py-3 text-base font-medium"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.code || !formData.name}
          >
            {isSubmitting
              ? (isEditMode ? 'جاري التعديل...' : 'جاري الاضافة...')
              : (isEditMode ? 'حفظ التعديلات' : 'اضافة تقييم جديد')}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
