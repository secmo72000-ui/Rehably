import React from 'react';
import Image from 'next/image';
import { Stage } from '../useLibrariesPage';

interface StageCardProps {
  stage: Stage;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}

export function StageCard({ stage, onEdit, onDelete, t }: StageCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 md:p-6 bg-white space-y-6">
      
      {/* Header Row: Actions and Code */}
      <div className="flex justify-between items-start">
        {/* Code Badge */}
        <div className="px-5 py-1.5 bg-gray-100 text-gray-700 font-medium rounded-md text-sm">
          {stage.code}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2" dir="ltr">
          <button 
            onClick={onDelete}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Image src="/shered/trash.svg" alt="Delete" width={20} height={20} />
          </button>
          <button 
            onClick={onEdit}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Image src="/shered/table/edit.svg" alt="Edit" width={20} height={20} />
          </button>
        </div>
      </div>

      {/* Title & Number */}
      <div className="flex flex-col items-end gap-2 text-right mt-2 w-full">
        <div className="flex items-center gap-4 justify-start w-full" dir="rtl">
          <span className="text-4xl font-bold text-Primary-500">
            {stage.order}
          </span>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {stage.title}
          </h3>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mt-2" dir="rtl">
          {stage.description}
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full py-2">
         {/* Duration */}
         <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
               <Image src="/Admin/Sidebar/Lib/Duration-icon.svg" alt="Duration" width={40} height={40} />
            </div>
            <span className="font-bold text-gray-900">{t('durationWeeks')}</span>
            <span className="text-gray-600">{stage.minWeeks}</span>
            <span>{t('to')}</span>
            <span className="text-gray-600">{stage.maxWeeks}</span>   
         </div>

         {/* Sessions */}
         <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
               <Image src="/Admin/Sidebar/Lib/Duration-icon.svg" alt="Sessions" width={40} height={40} />
            </div>
            <span className="font-bold text-gray-900">{t('expectedSessions')}</span>
            <span className="text-gray-600">{stage.minSessions}</span>
            <span>{t('to')}</span>
            <span className="text-gray-600">{stage.maxSessions}</span>
         </div>
      </div>

      {/* Text Content Sections */}
      <div className="space-y-4 text-right">
        {/* Main Goal */}
        <div className="space-y-1">
          <h4 className="font-bold text-gray-900 text-base">{t('mainGoal')}</h4>
          <p className="text-gray-600 text-sm leading-relaxed" dir="rtl">
            {stage.mainGoal}
          </p>
        </div>

        {/* Clinic Notes */}
        <div className="space-y-1">
          <h4 className="font-bold text-gray-900 text-base">{t('clinicNotes')}</h4>
          <p className="text-gray-600 text-sm leading-relaxed" dir="rtl">
            {stage.clinicNotes}
          </p>
        </div>
      </div>

    </div>
  );
}
