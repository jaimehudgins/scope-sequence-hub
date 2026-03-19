'use client';

import { useState, useRef, useEffect } from 'react';
import { useCalendarContext } from '@/hooks/useCalendarContext';

type DayActionMenuProps = {
  date: string;
};

export default function DayActionMenu({ date }: DayActionMenuProps) {
  const { currentRole, openDisruptionModal } = useCalendarContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Don't render for non-admin users
  if (currentRole !== 'admin') return null;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCancelDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    openDisruptionModal('cancel-day', date);
  };

  const handleInsertLesson = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    openDisruptionModal('insert-school-created', date);
  };

  return (
    <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-[20px] h-[20px] rounded-md flex items-center justify-center
          text-[11px] text-text-muted opacity-0 group-hover:opacity-100
          hover:bg-border-light hover:text-text transition-all cursor-pointer
          absolute top-0 right-0"
        title="Day actions"
      >
        ⋯
      </button>

      {isOpen && (
        <div className="absolute top-[22px] right-0 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[200px] z-[120] animate-[fade-in_0.1s_ease]">
          <button
            onClick={handleCancelDay}
            className="w-full text-left px-3 py-[7px] text-[12px] text-text hover:bg-bg transition-colors flex items-center gap-2"
          >
            <span className="text-[14px]">🚫</span>
            Cancel this day
          </button>
          <button
            onClick={handleInsertLesson}
            className="w-full text-left px-3 py-[7px] text-[12px] text-text hover:bg-bg transition-colors flex items-center gap-2"
          >
            <span className="text-[14px]">🏫</span>
            Add school-created lesson
          </button>
        </div>
      )}
    </div>
  );
}
