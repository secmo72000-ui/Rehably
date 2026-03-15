import React, { useState } from 'react';
import { Drawer } from '@/ui/components';
import { Input, Button, Select, Textarea } from '@/ui/primitives';

interface AddExerciseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  isRtl?: boolean;
  t: (key: string) => string;
}

export function AddExerciseDrawer({
  isOpen,
  onClose,
  onSubmit,
  isRtl = true,
  t,
}: AddExerciseDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bodyArea: '',
    relatedDisease: '',
    categories: '',
    repeats: '',
    steps: '',
    hold: '',
    media: null as File | null
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, media: e.target.files![0] }));
    }
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
    onClose();
  };

  // Mock options for diseases - in real app would come from props or API
  const diseaseOptions = [
    { value: 'disease1', label: 'التهاب المفاصل' },
    { value: 'disease2', label: 'ألم أسفل الظهر' },
    { value: 'disease3', label: 'إصابات الركبة' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="اضافة تمرين جديد"
      size="md"
    >
       <div className="flex flex-col h-full bg-white p-6 overflow-y-auto custom-scrollbar">
          <div className="flex-1 space-y-5 pb-4">
            
            {/* Exercise Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block text-start">اسم التمرين</label>
              <Input 
                placeholder="مثال : جوانتي" 
                value={formData.name}
                onChange={(val) => handleChange('name', val)}
                isRtl={isRtl}
                className="!rounded-lg" 
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block text-start">الوصف</label>
              <Textarea 
                placeholder="مثال : وصف التمرين وصف التمرين" 
                value={formData.description}
                onChange={(val) => handleChange('description', val)}
                isRtl={isRtl}
                rows={4}
                className="!rounded-lg text-start" 
              />
            </div>

            {/* Body Area */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block text-start">المنطقة بالجسم</label>
              <Input 
                placeholder="مثال : ادخل المنطقة المحدد لها هذا التمرين" 
                value={formData.bodyArea}
                onChange={(val) => handleChange('bodyArea', val)}
                isRtl={isRtl}
                className="!rounded-lg" 
              />
            </div>

            {/* Related Disease & Categories - Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Categories - moved to left in LTR but right in RTL visually if flex-row-reverse? No grid assumes standard order */}
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 block text-start">الفئات</label>
                  <Input 
                    placeholder="ادخل الفئة المناسب لها التمرين" 
                    value={formData.categories}
                    onChange={(val) => handleChange('categories', val)}
                    isRtl={isRtl}
                    className="!rounded-lg" 
                  />
               </div>
               
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 block text-start">المرض المرتبط</label>
                  <Select
                    options={diseaseOptions}
                    placeholder="اختر مرض"
                    value={formData.relatedDisease}
                    onChange={(val) => handleChange('relatedDisease', val)} 
                    isRtl={isRtl}
                    className="!rounded-lg" 
                  />
               </div>
            </div>

            {/* Repeats */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block text-start">العدات Repeats</label>
              <Input 
                placeholder="ادخل عدد العدات المناسبة للتمرين" 
                value={formData.repeats}
                onChange={(val) => handleChange('repeats', val)}
                isRtl={isRtl}
                type="number"
                className="!rounded-lg" 
              />
            </div>

            {/* Steps */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block text-start">الخطوات Steps</label>
              <Input 
                placeholder="ادخل عدد الخطوات المناسبة للتمرين" 
                value={formData.steps}
                onChange={(val) => handleChange('steps', val)}
                isRtl={isRtl}
                type="number"
                className="!rounded-lg" 
              />
            </div>

            {/* Hold */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block text-start">الوقوف Hold</label>
              <Input 
                placeholder="ادخل الوقت المناسب للوقوف Hold" 
                value={formData.hold}
                onChange={(val) => handleChange('hold', val)}
                isRtl={isRtl}
                className="!rounded-lg" 
              />
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block text-start">اضافة تمرين</label>
              <div className="relative border border-gray-200 rounded-xl p-3 flex items-center bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                 <input 
                   type="file" 
                   className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                   onChange={handleFileChange}
                   accept="video/*,image/*" 
                 />
                 <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                      {/* Cloud Upload Icon */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className={`text-sm flex-1 text-start ${formData.media ? 'text-gray-900' : 'text-gray-400'}`}>
                      {formData.media ? formData.media.name : "اختر التمرين"}
                    </span>
                 </div>
              </div>
            </div>

          </div>
          
          <div className="pt-4 border-t border-gray-100 pb-0 w-full mt-auto">
            <Button 
              variant="primary" 
              className="py-3 w-full text-base font-medium rounded-xl"
              onClick={handleSubmit}
            >
              اضافة تمرين جديد
            </Button>
          </div>
       </div>
    </Drawer>
  );
}
