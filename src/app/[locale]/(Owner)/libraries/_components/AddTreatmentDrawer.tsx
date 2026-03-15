import React from 'react';
import { Drawer } from '@/ui/components';
import { Input, Button } from '@/ui/primitives';

interface AddTreatmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  isRtl?: boolean;
}

export function AddTreatmentDrawer({
  isOpen,
  onClose,
  onSubmit,
  isRtl = true,
}: AddTreatmentDrawerProps) {
  
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="اضافة علاج جديد"
      size="md"
    >
      <div className="space-y-5 p-2">
        
        {/* Code Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الكود</label>
          <Input 
            placeholder="مثال : جوانتي" 
            isRtl={isRtl}
            className="!rounded-lg" 
          />
        </div>

        {/* Treatment Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">اسم المرض</label>
          <Input 
            placeholder="Neck pain with mobility deficits : مثال" 
            isRtl={isRtl}
            className="!rounded-lg text-start" 
          />
        </div>

        {/* Category Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">اسم الفئة</label>
          <Input 
            placeholder="Cervical Spine : مثال" 
            isRtl={isRtl}
            className="!rounded-lg text-start" 
          />
        </div>

        {/* Affected Area */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">المنطقة المصابة</label>
          <Input 
            placeholder="cervical_spine : مثال" 
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
              isRtl={isRtl}
              className="!rounded-lg" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-start">اعلى مدة اسابيع متابعة</label>
            <Input 
              placeholder="مثال : 6" 
              type="number"
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
            isRtl={isRtl}
            className="!rounded-lg" 
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الوصف</label>
          <textarea 
            placeholder="ادخل وصف للمرض" 
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[100px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Red Flags */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">العلامات الخطر Red Flags</label>
          <textarea 
            placeholder="ادخل وصف للمرض" 
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[100px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Contraindications 1 */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الموانع contraindications</label>
          <textarea 
            placeholder="ادخل وصف للمرض" 
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[80px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>
        
        {/* Contraindications 2 */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الموانع contraindications</label>
          <textarea 
            placeholder="ادخل وصف للمرض" 
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[80px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">الملاحظات</label>
          <textarea 
            placeholder="ادخل ملاحظات" 
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Primary-400 min-h-[80px] resize-y"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Source Reference */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">مصدر المراجعة Source Reference</label>
          <Input 
            placeholder="ادخل المرجع" 
            isRtl={isRtl}
            className="!rounded-lg" 
          />
        </div>

        {/* Source details */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block text-start">تفاصيل عن المصدر Source Details</label>
          <Input 
            placeholder="ادخل تفاصيل عن المصدر" 
            isRtl={isRtl}
            className="!rounded-lg" 
          />
        </div>
        
        {/* Action button */}
        <div className="pt-4 pb-6">
          <Button 
            variant="primary" 
            fullWidth 
            className="py-3 text-base  font-medium"
            onClick={onClose}
          >
            اضافة مرض جديد
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
