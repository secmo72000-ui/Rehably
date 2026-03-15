import React from 'react';
import { AssessmentCard } from './AssessmentCard';
import { Assessment } from '../useLibrariesPage';

interface AssessmentsTabProps {
  assessments: Assessment[];
  t: (key: string) => string;
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
}

export function AssessmentsTab({
  assessments,
  t,
  onEdit,
  onDelete
}: AssessmentsTabProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 flex-1">
      {/* Add Button & Filter Header is usually handled in the main page, 
          but if we need specific filters inside the card area we can add them here.
          Current design shows just the grid in the container. 
      */}
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 w-full">
        {assessments.map(assessment => (
           <AssessmentCard 
             key={assessment.id} 
             assessment={assessment} 
             t={t} 
             onEdit={() => onEdit(assessment)}
             onDelete={() => onDelete(assessment)} 
           />
        ))}
      </div>

      {/* Pagination (Mock UI as per image) */}
      <div className="flex justify-center items-center gap-2 pt-4 border-t border-gray-50 mt-4" dir="rtl">
         <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded border border-gray-200">
            السابق
         </button>
         
         <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium bg-gray-900 text-white">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium text-gray-600 hover:bg-gray-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium text-gray-600 hover:bg-gray-50">3</button>
            <span className="text-gray-400">...</span>
         </div>
         
         <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded border border-gray-200">
            التالي
         </button>
      </div>

    </div>
  );
}