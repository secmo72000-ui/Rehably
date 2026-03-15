import React from 'react';
import Image from 'next/image';
import { Drawer } from '@/ui/components';
import { Treatment } from '../useLibrariesPage';

interface TreatmentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: Treatment | null;
  onEdit?: (treatment: Treatment) => void;
  onDelete?: (treatment: Treatment) => void;
  isRtl?: boolean;
  t: (key: string) => string;
}

export function TreatmentDetailsDrawer({
  isOpen,
  onClose,
  treatment,
  onEdit,
  onDelete,
  isRtl = true,
  t,
}: TreatmentDetailsDrawerProps) {
  if (!treatment) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('detailsTitle')}
      size="lg"
    >
      <div className="p-1">
        <div className="border border-gray-200 rounded-lg p-5 md:p-6 bg-white space-y-6">
          
          {/* Header Row: Actions and Code */}
          <div className="flex justify-between items-start">
            
            {/* Code Badge */}
            <div className="px-5 py-1.5 bg-gray-100 text-gray-700 font-medium rounded-md text-sm">
              {treatment.code}
            </div>
            {/* Actions (Left in RTL is usually start, but design shows them on the visual left, and code on the visual right. If RTL, right is start) */}
            <div className="flex items-center gap-2" dir="ltr">
              {onDelete && (
                <button 
                  onClick={() => onDelete(treatment)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <Image src="/shered/trash.svg" alt="Delete" width={20} height={20} />
                </button>
              )}
              {onEdit && (
                <button 
                  onClick={() => onEdit(treatment)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Image src="/shered/table/edit.svg" alt="Edit" width={20} height={20} />
                </button>
              )}
            </div>
            
          </div>

          {/* Title & Tag Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold text-gray-900 order-2 md:order-1 text-end md:text-start flex-1 w-full">
              {treatment.name}
            </h3>
            <div className="px-4 py-1.5 bg-gray-100 text-Primary-500 font-normal rounded-lg text-base order-1 md:order-2 self-end md:self-auto">
              {treatment.affectedArea}
            </div>
          </div>

          {/* Stats Rows */}
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-start gap-4 w-full">
               <div className="grid grid-cols-2 gap-4 w-full text-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                       <Image src="/Admin/Sidebar/Lib/Duration-icon.svg" alt="Duration" width={40} height={40} />
                    </div>
                    <span className="font-bold text-gray-900">{t('durationWeeks')}</span>
                    <span className="text-gray-600">{treatment.minWeeks} </span>
                    <span>{t('to')}</span>
                    <span className="text-gray-600">{treatment.maxWeeks}</span>   
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                       <Image src="/Admin/Sidebar/Lib/Category-icon.svg" alt="Category" width={40} height={40} />
                    </div>
                    <span className="font-bold text-gray-900">{t('category')}</span>
                    <span className="text-gray-600">{treatment.category}</span>
                  </div>

                 
               </div>
               
               <div className="flex items-center gap-2 text-sm justify-start w-full">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                     <Image src="/Admin/Sidebar/Lib/Duration-icon.svg" alt="Sessions" width={40} height={40} />
                  </div>
                  <span className="font-bold text-gray-900">{t('expectedSessions')}</span>
                  <span className="text-gray-600">{treatment.sessions}</span>
               </div>
            </div>
          </div>

          {/* Text Content Sections */}
          <div className="space-y-6 text-right">
            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-base">{t('description')}</h4>
              <p className="text-gray-600 text-sm leading-relaxed" dir="ltr" style={{ textAlign: 'right' }}>
                {treatment.description || 'Mechanical neck pain without serious pathology, typically localized to the cervical region with movement-related aggravation and mobility restriction.'}
              </p>
            </div>

            {/* Red Flags */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-base">{t('redFlags')}</h4>
              <p className="text-gray-600 text-sm leading-relaxed" dir="ltr" style={{ textAlign: 'right' }}>
                {treatment.redFlags || 'History of malignancy; Unexplained weight loss; Recent significant trauma; Progressive neurological deficit; Signs of myelopathy (gait disturbance, bowel or bladder dysfunction); Fever, chills, or systemic infection signs'}
              </p>
            </div>

            {/* Contraindications */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-base">{t('contraindications')}</h4>
              <p className="text-gray-600 text-sm leading-relaxed" dir="ltr" style={{ textAlign: 'right' }}>
                {treatment.contraindications || 'Suspected cervical fracture or instability; Acute cervical myelopathy; Vertebral artery insufficiency; Suspected infection or malignancy of the cervical spine'}
              </p>
            </div>

            {/* Source Reference */}
            <div className="flex justify-end gap-2 items-center">
              <span className="text-gray-600 text-sm" dir="ltr">{treatment.reviewSource || 'Neck Pain CPG – Mobility Deficits'}</span>
              <h4 className="font-bold text-gray-900 text-base">{t('reviewSource')}</h4>
            </div>

            {/* Clinic Notes */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-base">{t('clinicNotes')}</h4>
              <p className="text-gray-600 text-sm leading-relaxed" dir="ltr" style={{ textAlign: 'right' }}>
                {treatment.clinicNotes || 'Use for non-specific cervicalgia without radicular symptoms or major trauma; follow neck pain CPG mobility-deficit pathway.'}
              </p>
            </div>

            {/* Source Details */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-base">{t('sourceDetails')}</h4>
              <p className="text-gray-600 text-sm leading-relaxed" dir="ltr" style={{ textAlign: 'right' }}>
                {treatment.sourceDetails || 'Derived from APTA/JOSPT Neck Pain Clinical Practice Guidelines (neck pain with mobility deficits subgroup) and ICD-10 cervicalgia (M54.2). Protocol adapted for Rehably.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
