import React from 'react';
import { ExerciseCard } from './ExerciseCard';
import { Exercise } from '../useLibrariesPage';

interface ExercisesTabProps {
  exercises: Exercise[];
  t: (key: string) => string;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}

export function ExercisesTab({
  exercises,
  t,
  onEdit,
  onDelete
}: ExercisesTabProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 flex-1">
      {/* Header with Sort Filter */}
      <div className="flex justify-end w-full"> 
         <button 
           className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 bg-white shadow-sm transition-colors"
         >
            <span>{t('sortNewest')}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {exercises.map(exercise => (
           <ExerciseCard 
             key={exercise.id} 
             exercise={exercise} 
             t={t} 
             onEdit={() => onEdit(exercise)}
             onDelete={() => onDelete(exercise)} 
           />
        ))}
      </div>
    </div>
  );
}
