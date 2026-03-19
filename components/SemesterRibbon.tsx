"use client";

import { useCalendarContext } from "@/hooks/useCalendarContext";
import { SCHOOL_YEAR_START, SCHOOL_YEAR_END } from "@/data/mockCourses";

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

export default function SemesterRibbon() {
  const {
    lessons,
    activeCourses,
    courses,
    setCurrentDate,
    setCurrentWeekStart,
    currentView,
  } = useCalendarContext();
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

          return (
            <div key={courseId} className="flex items-center gap-0 h-[18px]">
              <div className="w-[100px] text-[10px] font-semibold text-text-muted text-right pr-[10px] flex-shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
                {course.name}
              </div>
              <div className="flex-1 h-full relative bg-border-light rounded-[3px] overflow-hidden">
                {Object.entries(unitMap).map(([unitName, data]) => {
                  if (data.dates.length === 0) return null;
                  data.dates.sort((a, b) => a.getTime() - b.getTime());
                  const start = data.dates[0];
                  const end = data.dates[data.dates.length - 1];
                  const endExt = new Date(end);
                  endExt.setDate(endExt.getDate() + 5);
                  const left = pct(start);
                  const width = Math.max(3, pct(endExt) - left);
                  const color = course.unitColors[data.index] || course.color;
                  const shortName = unitName.replace(/^Unit \d+: /, "");

                  return (
                    <div
                      key={unitName}
                      className="absolute top-0 h-full rounded-[3px] text-[9px] font-semibold text-white flex items-center px-[5px] whitespace-nowrap overflow-hidden text-ellipsis opacity-85 hover:opacity-100"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: color,
                      }}
                      title={unitName}
                    >
                      {shortName}
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
    </div>
  );
}
