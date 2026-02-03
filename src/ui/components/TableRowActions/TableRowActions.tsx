'use client';

import Image from 'next/image';

interface TableRowActionsProps {
  /** Callback when view icon is clicked */
  onView?: () => void;
  /** Callback when delete icon is clicked */
  onDelete?: () => void;
}

export function TableRowActions({ onView, onDelete }: TableRowActionsProps) {
  const handleClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation(); // Prevent row click
    callback?.();
  };

  return (
    <div className="flex items-center gap-3">
      {onView && (
        <button
          onClick={(e) => handleClick(e, onView)}
          className="p-1 rounded hover:bg-grey-100 transition-colors shrink-0"
          aria-label="عرض التفاصيل"
        >
          <Image
            src="/shered/table/eye.svg"
            alt="عرض"
            width={20}
            height={20}
          />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => handleClick(e, onDelete)}
          className="p-1 rounded hover:bg-error-50 transition-colors shrink-0"
          aria-label="حذف"
        >
          <Image
            src="/shered/trash.svg"
            alt="حذف"
            width={20}
            height={20}
          />
        </button>
      )}
    </div>
  );
}

export default TableRowActions;


