"use client";

import { useCalendarContext } from "@/hooks/useCalendarContext";
import { useEffect, useRef } from "react";
import { WillowCadence } from "@/types";

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

const CADENCE_OPTIONS: { value: WillowCadence["type"]; label: string }[] = [
  { value: "every", label: "Every Week" },
  { value: "everyOther", label: "Every Other" },
  { value: "nthWeeks", label: "Specific Weeks" },
];

const WEEK_LABELS = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
];

export default function CourseSchedulePopover({
  courseId,
  anchorRect,
  onClose,
}: CourseSchedulePopoverProps) {
  const { courses, updateCourseMeetingDays, updateCourseCadence, addToast } =
    useCalendarContext();
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

  const cadence = course.willowCadence || { type: "every" as const };
  const cadenceType = cadence.type;

  const toggleDay = (dayValue: number) => {
    const current = course.meetingDays;
    let newDays: number[];
    if (current.includes(dayValue)) {
      if (current.length <= 1) {
        addToast("Course must meet at least one day per week");
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
    addToast(`${course.name} now meets: ${dayNames}`);
  };

  const handleCadenceChange = (type: WillowCadence["type"]) => {
    let newCadence: WillowCadence;
    if (type === "every") {
      newCadence = { type: "every" };
    } else if (type === "everyOther") {
      // Default anchor to first Monday of school year
      newCadence = { type: "everyOther", anchorDate: "2025-09-08" };
    } else {
      newCadence = { type: "nthWeeks", weeks: [1, 3] };
    }
    updateCourseCadence(courseId, newCadence);

    const labels: Record<string, string> = {
      every: "every week",
      everyOther: "every other week",
      nthWeeks: "specific weeks of the month",
    };
    addToast(`${course.name} Willow cadence: ${labels[type]}`);
  };

  const handleAnchorDateChange = (dateStr: string) => {
    if (!dateStr) return;
    updateCourseCadence(courseId, { type: "everyOther", anchorDate: dateStr });
  };

  const toggleWeek = (weekNum: number) => {
    if (cadence.type !== "nthWeeks") return;
    const current = cadence.weeks;
    let newWeeks: number[];
    if (current.includes(weekNum)) {
      if (current.length <= 1) {
        addToast("Must select at least one week");
        return;
      }
      newWeeks = current.filter((w) => w !== weekNum);
    } else {
      newWeeks = [...current, weekNum].sort((a, b) => a - b);
    }
    updateCourseCadence(courseId, { type: "nthWeeks", weeks: newWeeks });
    const weekNames = newWeeks
      .map((w) => WEEK_LABELS.find((wl) => wl.value === w)?.label)
      .join(", ");
    addToast(`${course.name} Willow weeks: ${weekNames}`);
  };

  // Position the popover below the anchor
  const popoverWidth = 280;
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
      className="bg-surface rounded-xl border border-border shadow-lg p-4 min-w-[280px] animate-[fade-in_0.15s_ease]"
    >
      {/* Meeting days section */}
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
      <div className="mt-2 text-[11px] text-text-muted">
        Click days to toggle when this course meets
      </div>

      {/* Divider */}
      <div className="border-t border-border my-3" />

      {/* Willow cadence section */}
      <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted mb-2">
        Willow Cadence
      </div>
      <div className="flex gap-[5px] mb-2">
        {CADENCE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleCadenceChange(value)}
            className={`
              px-[10px] py-[6px] rounded-lg text-[11px] font-medium
              transition-all cursor-pointer border
              ${
                cadenceType === value
                  ? "bg-text text-white border-text shadow-sm"
                  : "bg-bg text-text-muted border-border hover:border-[#ccc]"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Every Other: anchor date */}
      {cadenceType === "everyOther" && cadence.type === "everyOther" && (
        <div className="mt-2">
          <label className="text-[11px] text-text-muted block mb-1">
            First Willow day (anchor)
          </label>
          <input
            type="date"
            value={cadence.anchorDate}
            onChange={(e) => handleAnchorDateChange(e.target.value)}
            className="w-full px-2 py-[5px] rounded-lg border border-border text-[12px] text-text bg-surface focus:outline-none focus:border-text-muted transition-colors"
          />
          <div className="text-[10px] text-text-muted mt-1">
            Willow lessons will be scheduled every other week starting from this date
          </div>
        </div>
      )}

      {/* Nth Weeks: week checkboxes */}
      {cadenceType === "nthWeeks" && cadence.type === "nthWeeks" && (
        <div className="mt-2">
          <label className="text-[11px] text-text-muted block mb-[6px]">
            Which weeks of the month?
          </label>
          <div className="flex gap-[5px]">
            {WEEK_LABELS.map(({ value, label }) => {
              const isActive = cadence.weeks.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleWeek(value)}
                  className={`
                    w-[42px] h-[32px] rounded-lg text-[11px] font-medium
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
                      ? {
                          backgroundColor: course.color,
                          borderColor: course.color,
                        }
                      : {}
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-text-muted mt-1">
            e.g., 1st & 3rd = Willow on the 1st and 3rd occurrence each month
          </div>
        </div>
      )}

      {/* Cadence summary */}
      {cadenceType !== "every" && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <div className="text-[11px] text-amber-800">
            {cadenceType === "everyOther"
              ? "Non-Willow weeks are available for school-directed content"
              : `Weeks without Willow are available for school-directed content`}
          </div>
        </div>
      )}
    </div>
  );
}
