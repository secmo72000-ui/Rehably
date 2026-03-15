import React from 'react';
import Image from 'next/image';
import { Exercise } from '../useLibrariesPage';

interface ExerciseCardProps {
  exercise: Exercise;
  t: (key: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExerciseCard({
  exercise,
  t,
  onEdit,
  onDelete
}: ExerciseCardProps) {
  return (
    <div className="bg-white border focus-within:ring-2 focus-within:ring-Primary-200 transition-all rounded-xl p-3 relative flex flex-col" style={{ borderColor: '#2dd4bf' }}>
      {/* Actions (Floating) */}
      <div className="absolute top-1 left-1 flex items-center gap-1 z-10 bg-white rounded-lg shadow-sm border border-gray-100 p-1" dir="ltr">
        <button 
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Image src="/shered/trash.svg" alt="Delete" width={16} height={16} />
        </button>
        <button 
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-50 transition-colors"
        >
          <Image src="/shered/table/edit.svg" alt="Edit" width={16} height={16} />
        </button>
      </div>

      {/* Video Thumbnail Placeholder */}
      <div className="w-full relative h-[180px] rounded-lg overflow-hidden bg-gray-100 mb-4">
        {/* Placeholder image that looks like a video */}
        <picture>
           <img 
             src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop" 
             alt="Exercise Thumbnail"
             className="w-full h-full object-cover"
           />
        </picture>
        {/* Video progress/player bar mock */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent flex items-end px-3 py-1.5">
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden mb-1">
             <div className="w-1/3 h-full bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-row-reverse items-center justify-end gap-3 text-[13px] text-gray-600 mb-4" dir="rtl">
        <div className="flex items-center gap-1">
          <span>{t('reps')}</span>
          <span className="font-semibold text-gray-900">{exercise.reps}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{t('sets')}</span>
          <span className="font-semibold text-gray-900">{exercise.sets}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{t('hold')}</span>
          <span className="font-semibold text-gray-900">{exercise.holdTime}</span>
          <span>{t('seconds')}</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-right flex-1 flex flex-col justify-between" dir="rtl">
        <h3 className="font-bold text-gray-900 text-lg">
          {exercise.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {exercise.description}
        </p>
      </div>

    </div>
  );
}
