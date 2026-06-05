import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

interface DragHandleProps {
  id: string;
}

const DragHandle: React.FC<DragHandleProps> = ({ id }) => {
  const { attributes, listeners } = useSortable({ id });

  return (
    <button
      {...attributes}
      {...listeners}
      className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing transition-colors"
      aria-label="Drag to reorder"
      title="Drag to reorder bills"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="19" r="1" />
      </svg>
    </button>
  );
};

export default DragHandle;
