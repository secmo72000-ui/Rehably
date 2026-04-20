import React, { useState, useEffect } from 'react';
import { Drawer } from '@/ui/components';
import { Input, Button } from '@/ui/primitives';
import type { CreateDeviceRequest } from '@/domains/library';
import type { Device } from '../useLibrariesPage';

interface AddDeviceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateDeviceRequest, image?: File) => void;
  isSubmitting?: boolean;
  isRtl?: boolean;
  initialData?: Device | null;
}

export function AddDeviceDrawer({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  isRtl = true,
  initialData,
}: AddDeviceDrawerProps) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manufacturer: '',
    model: '',
    relatedConditionCodes: '',
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description ?? '',
          manufacturer: initialData.manufacturer ?? '',
          model: initialData.model ?? '',
          relatedConditionCodes: initialData.relatedConditionCodes ?? '',
        });
      } else {
        setFormData({ name: '', description: '', manufacturer: '', model: '', relatedConditionCodes: '' });
      }
      setImage(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    const request: CreateDeviceRequest = {
      name: formData.name,
      description: formData.description || undefined,
      manufacturer: formData.manufacturer || undefined,
      model: formData.model || undefined,
      relatedConditionCodes: formData.relatedConditionCodes || undefined,
    };
    onSubmit?.(request, image ?? undefined);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'تعديل الجهاز' : 'اضافة جهاز جديد'}
      size="md"
    >
      <div className="space-y-5 p-2">

        {/* Device Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">اسم الجهاز</label>
          <Input
            placeholder="مثال : TENS Device"
            value={formData.name}
            onChange={(val) => handleChange('name', val)}
            isRtl={isRtl}
            className="!rounded-lg"
          />
        </div>

        {/* Manufacturer + Model row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">الشركة المصنعة</label>
            <Input
              placeholder="مثال : Chattanooga"
              value={formData.manufacturer}
              onChange={(val) => handleChange('manufacturer', val)}
              isRtl={isRtl}
              className="!rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">الموديل</label>
            <Input
              placeholder="مثال : Intelect 77"
              value={formData.model}
              onChange={(val) => handleChange('model', val)}
              isRtl={isRtl}
              className="!rounded-lg"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الوصف</label>
          <textarea
            placeholder="ادخل وصف للجهاز"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[90px] resize-y"
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

        {/* Image Upload */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">صورة الجهاز</label>
          <div className="relative border border-gray-200 rounded-xl p-3 flex items-center bg-white cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              onChange={handleFileChange}
              accept="image/*"
            />
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className={`text-sm flex-1 text-start ${image ? 'text-gray-900' : 'text-gray-400'}`}>
                {image ? image.name : 'اختر صورة للجهاز'}
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 pb-6">
          <Button
            variant="primary"
            fullWidth
            className="py-3 text-base font-medium"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name}
          >
            {isSubmitting
              ? (isEditMode ? 'جاري التعديل...' : 'جاري الاضافة...')
              : (isEditMode ? 'حفظ التعديلات' : 'اضافة جهاز جديد')}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
