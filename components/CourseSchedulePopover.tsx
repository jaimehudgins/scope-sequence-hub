"use client";

import { useCalendarContext } from "@/hooks/useCalendarContext";
import { useEffect, useRef } from "react";

type CourseSchedulePopoverProps = {
  courseId: string;
  anchorRect: DOMRect | null;
  onClose: () => void;
};

const DAY_LABELS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
];

export default function CourseSchedulePopover({
  courseId,
  anchorRect,
  onClose,
}: CourseSchedulePopoverProps) {
  const { courses, updateCourseMeetingDays, addToast } = useCalendarContext();
  const popoverRef = useRef<HTMLDivElement>(null);
  const course = courses[courseId];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // Use timeout to prevent the click that opened the popover from immediately closing it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!course || !anchorRect) return null;

  const toggleDay = (dayValue: number) => {
    const current = course.meetingDays;
    let newDays: number[];
    if (current.includes(dayValue)) {
      // Don't allow removing all days
      if (current.length <= 1) {
        addToast("⚠️ Course must meet at least one day per week");
        return;
      }
      newDays = current.filter((d) => d !== dayValue);
    } else {
      newDays = [...current, dayValue].sort((a, b) => a - b);
    }
    updateCourseMeetingDays(courseId, newDays);
    const dayNames = newDays
      .map((d) => DAY_LABELS.find((dl) => dl.value === d)?.label)
      .join(", ");
    addToast(`📅 ${course.name} now meets: ${dayNames}`);
  };

  // Position the popover below the anchor, flipping to right-align if it would overflow
  const popoverWidth = 220;
  const wouldOverflowRight =
    anchorRect.left + popoverWidth > window.innerWidth - 16;

  const style: React.CSSProperties = {
    position: "fixed",
    top: anchorRect.bottom + 8,
    zIndex: 150,
    ...(wouldOverflowRight
      ? { right: window.innerWidth - anchorRect.right }
      : { left: anchorRect.left }),
  };

  return (
    <div
      ref={popoverRef}
      style={style}
      className="bg-surface rounded-xl border border-border shadow-lg p-4 min-w-[220px] animate-[fade-in_0.15s_ease]"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted mb-1">
        Meeting Schedule
      </div>
      <div
        className="text-[13px] font-medium text-text mb-3"
        style={{ color: course.color }}
      >
        {course.name}
      </div>
      <div className="flex gap-[6px]">
        {DAY_LABELS.map(({ value, label }) => {
          const isActive = course.meetingDays.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggleDay(value)}
              className={`
                w-[38px] h-[38px] rounded-lg text-[12px] font-semibold
                transition-all cursor-pointer border
                flex items-center justify-center
                ${
                  isActive
                    ? "text-white shadow-sm"
                    : "bg-bg text-text-muted border-border hover:border-[#ccc]"
                }
              `}
              style={
                isActive
                  ? { backgroundColor: course.color, borderColor: course.color }
                  : {}
              }
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-text-muted">
        Click days to toggle when this course meets
      </div>
    </div>
  );
}
