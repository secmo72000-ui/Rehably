import React, { useState, useEffect } from 'react';
import { Drawer } from '@/ui/components';
import { Input, Button } from '@/ui/primitives';
import type { CreateTreatmentRequest } from '@/domains/library';
import type { Treatment } from '../useLibrariesPage';

interface AddTreatmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateTreatmentRequest) => void;
  isSubmitting?: boolean;
  isRtl?: boolean;
  initialData?: Treatment | null;
}

export function AddTreatmentDrawer({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  isRtl = true,
  initialData,
}: AddTreatmentDrawerProps) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    affectedArea: '',
    minWeeks: '',
    maxWeeks: '',
    sessions: '',
    description: '',
    redFlags: '',
    contraindications: '',
    clinicNotes: '',
    sourceReference: '',
    sourceDetails: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          code: initialData.code,
          name: initialData.name,
          category: initialData.category,
          affectedArea: initialData.affectedArea,
          minWeeks: String(initialData.minWeeks),
          maxWeeks: String(initialData.maxWeeks),
          sessions: String(initialData.sessions),
          description: initialData.description ?? '',
          redFlags: initialData.redFlags ?? '',
          contraindications: initialData.contraindications ?? '',
          clinicNotes: initialData.clinicNotes ?? '',
          sourceReference: initialData.reviewSource,
          sourceDetails: initialData.sourceDetails ?? '',
        });
      } else {
        setFormData({
          code: '', name: '', category: '', affectedArea: '',
          minWeeks: '', maxWeeks: '', sessions: '',
          description: '', redFlags: '', contraindications: '',
          clinicNotes: '', sourceReference: '', sourceDetails: '',
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const request: CreateTreatmentRequest = {
      code: formData.code,
      name: formData.name,
      bodyRegionCategoryId: '00000000-0000-0000-0000-000000000000',
      affectedArea: formData.affectedArea,
      minDurationWeeks: parseInt(formData.minWeeks) || 0,
      maxDurationWeeks: parseInt(formData.maxWeeks) || 0,
      expectedSessions: parseInt(formData.sessions) || 0,
      description: formData.description || undefined,
      redFlags: formData.redFlags || undefined,
      contraindications: formData.contraindications || undefined,
      clinicalNotes: formData.clinicNotes || undefined,
      sourceReference: formData.sourceReference || undefined,
      sourceDetails: formData.sourceDetails || undefined,
    };
    onSubmit?.(request);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'تعديل العلاج' : 'اضافة علاج جديد'}
      size="md"
    >
      <div className="space-y-5 p-2">

        {/* Code Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الكود</label>
          <Input
            placeholder="مثال : جوانتي"
            value={formData.code}
            onChange={(val) => handleChange('code', val)}
            isRtl={isRtl}
            className="!rounded-lg"
          />
        </div>

        {/* Treatment Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">اسم المرض</label>
          <Input
            placeholder="Neck pain with mobility deficits : مثال"
            value={formData.name}
            onChange={(val) => handleChange('name', val)}
            isRtl={isRtl}
            className="!rounded-lg text-start"
          />
        </div>

        {/* Category Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">اسم الفئة</label>
          <Input
            placeholder="Cervical Spine : مثال"
            value={formData.category}
            onChange={(val) => handleChange('category', val)}
            isRtl={isRtl}
            className="!rounded-lg text-start"
          />
        </div>

        {/* Affected Area */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">المنطقة المصابة</label>
          <Input
            placeholder="cervical_spine : مثال"
            value={formData.affectedArea}
            onChange={(val) => handleChange('affectedArea', val)}
            isRtl={isRtl}
            className="!rounded-lg text-start"
          />
        </div>

        {/* Weeks Durations Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">اقل مدة اسابيع متابعة</label>
            <Input
              placeholder="مثال : 2"
              type="number"
              value={formData.minWeeks}
              onChange={(val) => handleChange('minWeeks', val)}
              isRtl={isRtl}
              className="!rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">اعلى مدة اسابيع متابعة</label>
            <Input
              placeholder="مثال : 6"
              type="number"
              value={formData.maxWeeks}
              onChange={(val) => handleChange('maxWeeks', val)}
              isRtl={isRtl}
              className="!rounded-lg"
            />
          </div>
        </div>

        {/* Session count */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">عدد الجلسات المتوقعة للعلاج</label>
          <Input
            placeholder="مثال : 6"
            type="number"
            value={formData.sessions}
            onChange={(val) => handleChange('sessions', val)}
            isRtl={isRtl}
            className="!rounded-lg"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الوصف</label>
          <textarea
            placeholder="ادخل وصف للمرض"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[100px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Red Flags */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">العلامات الخطر Red Flags</label>
          <textarea
            placeholder="ادخل وصف للمرض"
            value={formData.redFlags}
            onChange={(e) => handleChange('redFlags', e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[100px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Contraindications */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الموانع contraindications</label>
          <textarea
            placeholder="ادخل وصف للمرض"
            value={formData.contraindications}
            onChange={(e) => handleChange('contraindications', e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[80px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الملاحظات</label>
          <textarea
            placeholder="ادخل ملاحظات"
            value={formData.clinicNotes}
            onChange={(e) => handleChange('clinicNotes', e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[80px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Source Reference */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">مصدر المراجعة Source Reference</label>
          <Input
            placeholder="ادخل المرجع"
            value={formData.sourceReference}
            onChange={(val) => handleChange('sourceReference', val)}
            isRtl={isRtl}
            className="!rounded-lg"
          />
        </div>

        {/* Source details */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">تفاصيل عن المصدر Source Details</label>
          <Input
            placeholder="ادخل تفاصيل عن المصدر"
            value={formData.sourceDetails}
            onChange={(val) => handleChange('sourceDetails', val)}
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
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isEditMode ? 'جاري التعديل...' : 'جاري الاضافة...')
              : (isEditMode ? 'حفظ التعديلات' : 'اضافة مرض جديد')}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
