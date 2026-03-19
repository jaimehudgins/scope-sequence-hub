"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";

type DayActionMenuProps = {
  date: string;
};

export default function DayActionMenu({ date }: DayActionMenuProps) {
  const { currentRole, openDisruptionModal } = useCalendarContext();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Don't render for non-admin users
  if (currentRole !== "admin") return null;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 240;
    const menuWidth = 210;
    const pad = 12;

    const fitsBelow = rect.bottom + menuHeight + pad < window.innerHeight;
    const fitsRight = rect.right + menuWidth + pad < window.innerWidth;

    setMenuPos({
      top: fitsBelow ? rect.bottom + 4 : rect.top - menuHeight - 4,
      left: fitsRight ? rect.left : rect.right - menuWidth,
    });
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, updatePosition]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleCancelDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    openDisruptionModal("cancel-day", date);
  };

  const handleInsertLesson = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    openDisruptionModal("insert-school-created", date);
  };

  const handleScheduleOverride = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    openDisruptionModal("schedule-override", date);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="w-[20px] h-[20px] rounded-md flex items-center justify-center
          text-[11px] text-text-muted opacity-0 group-hover:opacity-100
          hover:bg-border-light hover:text-text transition-all cursor-pointer
          absolute top-[4px] right-[4px]"
        title="Day actions"
      >
        ⋯
      </button>

      {isOpen && menuPos && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            zIndex: 150,
          }}
          className="bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[200px] animate-[fade-in_0.1s_ease]"
          onClick={(e) => e.stopPropagation()}
        >
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
          <div className="border-t border-border my-1" />
          <button
            onClick={handleScheduleOverride}
            className="w-full text-left px-3 py-[7px] text-[12px] text-text hover:bg-bg transition-colors flex items-center gap-2"
          >
            <span className="text-[14px]">🔄</span>
            Run a different schedule
          </button>
        </div>
      )}
    </>
  );
}
