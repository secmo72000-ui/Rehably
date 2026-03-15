import React from 'react';
import { StageCard } from './StageCard';
import { Stage } from '../useLibrariesPage';

interface StagesTabProps {
  stages: Stage[];
  t: (key: string) => string;
  onEdit: (stage: Stage) => void;
  onDelete: (stage: Stage) => void;
}

export function StagesTab({
  stages,
  t,
  onEdit,
  onDelete
}: StagesTabProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header with Sort - visual left side in RTL is justify-end */}
      <div className="flex justify-end"> 
         <button 
           className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
         >
            <span>{t('sortNewest')}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
         </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        {stages.map(stage => (
           <StageCard 
             key={stage.id} 
             stage={stage} 
             t={t} 
             onEdit={() => onEdit(stage)}
             onDelete={() => onDelete(stage)} 
           />
        ))}
      </div>
    </div>
  );
}
