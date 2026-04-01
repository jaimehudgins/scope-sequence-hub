"use client";

import { useState, useRef, useEffect } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import { SCHOOL_YEAR_START, SCHOOL_YEAR_END } from "@/data/mockCourses";
import { format } from "date-fns";
import { Lesson } from "@/types";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type UnitPopoverData = {
  unitName: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  unitColor: string;
  lessons: Lesson[];
  anchorRect: DOMRect;
};

function UnitDetailPopover({
  data,
  onClose,
  onJumpToDate,
  onSelectLesson,
}: {
  data: UnitPopoverData;
  onClose: () => void;
  onJumpToDate: (dateStr: string) => void;
  onSelectLesson: (lessonId: string) => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const sorted = [...data.lessons].sort(
    (a, b) => a.lessonNumber - b.lessonNumber,
  );
  const scheduled = sorted.filter((l) => l.scheduledDate);
  const unscheduled = sorted.filter((l) => !l.scheduledDate);

  // Position below the unit bar, clamped to viewport
  const popoverWidth = 340;
  const popoverMaxHeight = 380;
  const { anchorRect } = data;

  let left = anchorRect.left;
  if (left + popoverWidth > window.innerWidth - 16) {
    left = window.innerWidth - popoverWidth - 16;
  }
  if (left < 16) left = 16;

  let top = anchorRect.bottom + 6;
  if (top + popoverMaxHeight > window.innerHeight - 16) {
    top = anchorRect.top - popoverMaxHeight - 6;
    if (top < 16) top = 16;
  }

  return (
    <div
      ref={popoverRef}
      className="fixed bg-surface rounded-xl border border-border shadow-xl z-[200] flex flex-col animate-[fade-in_0.12s_ease]"
      style={{
        top,
        left,
        width: popoverWidth,
        maxHeight: popoverMaxHeight,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-[2px]">
          <div
            className="w-[10px] h-[10px] rounded-[3px] flex-shrink-0"
            style={{ backgroundColor: data.unitColor }}
          />
          <div className="text-[13px] font-semibold text-text truncate">
            {data.unitName}
          </div>
        </div>
        <div className="text-[11px] text-text-muted" style={{ color: data.courseColor }}>
          {data.courseName}
        </div>
        <div className="flex items-center gap-3 mt-[6px]">
          <span className="text-[11px] text-text-muted">
            {scheduled.length} of {sorted.length} scheduled
          </span>
          {sorted.length > 0 && (
            <div className="flex-1 h-[4px] bg-border-light rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(scheduled.length / sorted.length) * 100}%`,
                  backgroundColor: data.unitColor,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sorted.map((lesson) => {
          const isScheduled = !!lesson.scheduledDate;
          return (
            <div
              key={lesson.id}
              className="flex items-center gap-2 px-2 py-[5px] rounded-lg text-[12px] hover:bg-bg cursor-pointer"
              onClick={() => {
                if (isScheduled && lesson.scheduledDate) {
                  onJumpToDate(lesson.scheduledDate);
                  onClose();
                } else {
                  onSelectLesson(lesson.id);
                  onClose();
                }
              }}
            >
              {/* Status indicator */}
              <div
                className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                  isScheduled ? "" : "border border-text-muted"
                }`}
                style={
                  isScheduled
                    ? { backgroundColor: data.unitColor }
                    : { backgroundColor: "transparent" }
                }
              />

              {/* Lesson number */}
              <span className="text-text-muted font-medium w-[18px] flex-shrink-0 text-right">
                {lesson.lessonNumber}.
              </span>

              {/* Lesson title */}
              <span
                className="flex-1 truncate text-text"
              >
                {lesson.title}
              </span>

              {/* Date or "Unscheduled" */}
              {isScheduled ? (
                <span className="text-[10px] text-text-muted flex-shrink-0 font-medium">
                  {format(
                    new Date(lesson.scheduledDate + "T12:00:00"),
                    "MMM d",
                  )}
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 flex-shrink-0 font-medium">
                  Unscheduled
                </span>
              )}

              {/* Milestone badge */}
              {lesson.isMilestone && (
                <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-[1px] rounded flex-shrink-0 font-medium">
                  MS
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      {unscheduled.length > 0 && (
        <div className="px-4 py-2 border-t border-border flex-shrink-0 bg-amber-50/50">
          <div className="text-[11px] text-amber-700">
            {unscheduled.length} lesson{unscheduled.length !== 1 ? "s" : ""} still
            need{unscheduled.length === 1 ? "s" : ""} to be scheduled
          </div>
        </div>
      )}
      {unscheduled.length === 0 && (
        <div className="px-4 py-2 border-t border-border flex-shrink-0 bg-emerald-50/50">
          <div className="text-[11px] text-emerald-700">
            All lessons scheduled
          </div>
        </div>
      )}
    </div>
  );
}

export default function SemesterRibbon() {
  const {
    lessons,
    activeCourses,
    courses,
    setCurrentDate,
    setCurrentWeekStart,
    currentView,
    setSelectedLessonId,
  } = useCalendarContext();
  const [unitPopover, setUnitPopover] = useState<UnitPopoverData | null>(null);
  const today = new Date();

  const totalDays =
    (SCHOOL_YEAR_END.getTime() - SCHOOL_YEAR_START.getTime()) /
    (1000 * 60 * 60 * 24);

  const pct = (date: Date) => {
    const d = Math.max(
      0,
      (date.getTime() - SCHOOL_YEAR_START.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.min(100, (d / totalDays) * 100);
  };

  const jumpToDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    if (currentView === "week") {
      const getMonday = (d: Date) => {
        const copy = new Date(d);
        const day = copy.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        copy.setDate(copy.getDate() + diff);
        return copy;
      };
      setCurrentWeekStart(getMonday(date));
    }
  };

  const jumpToMonth = (month: number, year: number) => {
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
    if (currentView === "week") {
      const getMonday = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return d;
      };
      setCurrentWeekStart(getMonday(newDate));
    }
  };

  const handleUnitClick = (
    e: React.MouseEvent,
    unitName: string,
    courseId: string,
    unitIndex: number,
  ) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const course = courses[courseId];
    if (!course) return;

    const unitLessons = lessons.filter(
      (l) => l.courseId === courseId && l.unitName === unitName,
    );

    setUnitPopover({
      unitName,
      courseId,
      courseName: course.name,
      courseColor: course.color,
      unitColor: course.unitColors[unitIndex] || course.color,
      lessons: unitLessons,
      anchorRect: rect,
    });
  };

  const nowPct = pct(today);

  return (
    <div className="bg-surface border-b border-border px-6 py-3 flex-shrink-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted mb-2">
        School Year Overview
      </div>
      <div className="flex flex-col gap-[3px]">
        {Object.entries(courses).map(([courseId, course]) => {
          if (!activeCourses.has(courseId)) return null;

          const courseLessons = lessons.filter(
            (l) => l.courseId === courseId && l.scheduledDate,
          );
          const unitMap: Record<string, { dates: Date[]; index: number }> = {};

          courseLessons.forEach((l) => {
            if (!unitMap[l.unitName]) {
              unitMap[l.unitName] = { dates: [], index: l.unitIndex };
            }
            unitMap[l.unitName].dates.push(
              new Date(l.scheduledDate + "T12:00:00"),
            );
          });

          // Also include units that have NO scheduled lessons (fully unscheduled)
          const allUnitNames = new Set(
            lessons
              .filter((l) => l.courseId === courseId)
              .map((l) => l.unitName),
          );
          allUnitNames.forEach((uName) => {
            if (!unitMap[uName]) {
              const sample = lessons.find(
                (l) => l.courseId === courseId && l.unitName === uName,
              );
              if (sample) {
                unitMap[uName] = { dates: [], index: sample.unitIndex };
              }
            }
          });

          return (
            <div key={courseId} className="flex items-center gap-0 h-[18px]">
              <div className="w-[100px] text-[10px] font-semibold text-text-muted text-right pr-[10px] flex-shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
                {course.name}
              </div>
              <div className="flex-1 h-full relative bg-border-light rounded-[3px] overflow-hidden">
                {Object.entries(unitMap).map(([unitName, data]) => {
                  const unitColor =
                    course.unitColors[data.index] || course.color;

                  // Fully unscheduled units: show a small indicator at the end
                  if (data.dates.length === 0) {
                    // Find where the last scheduled unit ends to place this after
                    const allScheduledDates = courseLessons
                      .map((l) => new Date(l.scheduledDate + "T12:00:00"))
                      .sort((a, b) => a.getTime() - b.getTime());
                    const lastDate =
                      allScheduledDates.length > 0
                        ? allScheduledDates[allScheduledDates.length - 1]
                        : SCHOOL_YEAR_START;
                    const afterLast = new Date(lastDate);
                    afterLast.setDate(
                      afterLast.getDate() + 7 + data.index * 14,
                    );
                    const left = pct(afterLast);
                    const width = 4;

                    return (
                      <div
                        key={unitName}
                        className="absolute top-0 h-full rounded-[3px] text-[9px] font-semibold text-white flex items-center justify-center cursor-pointer border border-dashed border-white/40"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          background: unitColor,
                          opacity: 0.4,
                        }}
                        title={`${unitName} (unscheduled)`}
                        onClick={(e) =>
                          handleUnitClick(e, unitName, courseId, data.index)
                        }
                      />
                    );
                  }

                  data.dates.sort((a, b) => a.getTime() - b.getTime());
                  const start = data.dates[0];
                  const end = data.dates[data.dates.length - 1];
                  const endExt = new Date(end);
                  endExt.setDate(endExt.getDate() + 5);
                  const left = pct(start);
                  const width = Math.max(3, pct(endExt) - left);
                  const shortName = unitName.replace(/^Unit \d+: /, "");

                  // Check if this unit has unscheduled lessons
                  const totalInUnit = lessons.filter(
                    (l) =>
                      l.courseId === courseId && l.unitName === unitName,
                  ).length;
                  const hasUnscheduled = data.dates.length < totalInUnit;

                  return (
                    <div
                      key={unitName}
                      className="absolute top-0 h-full rounded-[3px] text-[9px] font-semibold text-white flex items-center px-[5px] whitespace-nowrap overflow-hidden text-ellipsis opacity-85 hover:opacity-100 cursor-pointer transition-opacity"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: unitColor,
                      }}
                      title={`${unitName} - click for details`}
                      onClick={(e) =>
                        handleUnitClick(e, unitName, courseId, data.index)
                      }
                    >
                      {shortName}
                      {hasUnscheduled && (
                        <span className="ml-[3px] w-[5px] h-[5px] rounded-full bg-white/60 flex-shrink-0 inline-block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Month labels */}
        <div className="flex h-4">
          <div className="w-[100px] flex-shrink-0" />
          <div className="flex-1 relative">
            {[...Array(10)].map((_, i) => {
              const m = (8 + i) % 12;
              const year = 8 + i < 12 ? 2025 : 2026;
              const d = new Date(year, m, 1);
              const left = pct(d);
              const isCurrent =
                today.getMonth() === m && today.getFullYear() === year;
              const label = monthNames[m].substring(0, 3);

              return (
                <span
                  key={`${year}-${m}`}
                  onClick={() => jumpToMonth(m, year)}
                  className={`absolute top-0 text-[9px] font-medium cursor-pointer transition-colors ${
                    isCurrent
                      ? "text-today-border font-bold"
                      : "text-text-muted hover:text-text"
                  }`}
                  style={{ left: `${left}%` }}
                >
                  {label}
                </span>
              );
            })}

            {/* Today line */}
            {nowPct > 0 && nowPct < 100 && (
              <div
                className="absolute top-[-3px] w-[2px] h-[calc(100%+3px)] bg-today-border rounded-[1px] z-[5]"
                style={{ left: `${nowPct}%` }}
                title="Today"
              />
            )}
          </div>
        </div>
      </div>

      {/* Unit detail popover */}
      {unitPopover && (
        <UnitDetailPopover
          data={unitPopover}
          onClose={() => setUnitPopover(null)}
          onJumpToDate={jumpToDate}
          onSelectLesson={setSelectedLessonId}
        />
      )}
    </div>
  );
}
