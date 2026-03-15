import React from 'react';
import Image from 'next/image';
import { Assessment } from '../useLibrariesPage';

interface AssessmentCardProps {
  assessment: Assessment;
  t: (key: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

export function AssessmentCard({
  assessment,
  t,
  onEdit,
  onDelete
}: AssessmentCardProps) {
  return (
    <div className="bg-white border transition-all rounded-xl p-4 relative flex flex-col h-full shadow-sm hover:shadow-md hover:border-Primary-200" style={{ borderColor: '#e5e7eb' }}>
      
      {/* Header Row: Actions (Left) & Code (Right) */}
      <div className="flex justify-between items-start mb-4">
        {/* Actions (Left in RTL) */}
        <div className="flex items-center gap-2">
           <button 
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-gray-400 transition-colors"
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <polyline points="3 6 5 6 21 6"></polyline>
               <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
             </svg>
           </button>
           <button 
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-400 transition-colors"
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
             </svg>
           </button>
        </div>

        {/* Code Badge (Right in RTL) */}
        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-semibold">
           {assessment.code}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 text-end space-y-4 mb-3">
         {/* Title and Frequency Badge */}
         <div className="flex justify-between items-start flex-row-reverse gap-4">
            <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight text-right flex-1">
               {assessment.title}
            </h3>
            <div className="inline-flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap">
               <span>{assessment.frequency}</span>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="12" cy="12" r="10"></circle>
                   <polyline points="12 6 12 12 16 14"></polyline>
               </svg>
            </div>
         </div>

         {/* Description Section */}
         <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 block">الوصف</span>
            <p className="text-sm text-gray-600 leading-relaxed">
               {assessment.description}
            </p>
         </div>
      </div>


    </div>
  );
}