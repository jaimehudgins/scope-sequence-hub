"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isToday,
  isWeekend,
} from "date-fns";
import { WillowLessonRow } from "@/utils/willowUtils";
import { useCalendarContext } from "@/hooks/useCalendarContext";

type WillowCalendarViewProps = {
  data: WillowLessonRow[];
};

export default function WillowCalendarView({ data }: WillowCalendarViewProps) {
  const { partners } = useCalendarContext();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026

  // Group lessons by date, with lesson titles per school
  type DaySchool = {
    partnerId: string;
    partnerName: string;
    partnerColor: string;
    lessons: string[]; // lesson titles
  };

  const lessonsByDate = useMemo(() => {
    const map = new Map<string, DaySchool[]>();

    for (const row of data) {
      const date = row.lesson.scheduledDate;
      if (!date) continue;

      if (!map.has(date)) {
        map.set(date, []);
      }

      const schools = map.get(date)!;
      let existing = schools.find((s) => s.partnerId === row.partnerId);
      if (!existing) {
        existing = {
          partnerId: row.partnerId,
          partnerName: row.partnerName,
          partnerColor: row.partnerColor,
          lessons: [],
        };
        schools.push(existing);
      }
      existing.lessons.push(row.lesson.title);
    }

    return map;
  }, [data]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let d = calendarStart;
  while (d <= calendarEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(startOfMonth(new Date()));

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 py-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-[14px] text-text-muted hover:bg-bg hover:text-text transition-all"
          >
            &lt;
          </button>
          <h2 className="text-[18px] font-semibold text-text min-w-[180px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-[14px] text-text-muted hover:bg-bg hover:text-text transition-all"
          >
            &gt;
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 rounded-lg border border-border text-[12px] font-medium text-text-muted hover:bg-bg hover:text-text transition-all"
          >
            Today
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <div
                className="w-[8px] h-[8px] rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-[11px] text-text-muted">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 border border-border rounded-t-xl overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-bg px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 border-x border-b border-border rounded-b-xl overflow-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0">
            {week.map((day, di) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const weekend = isWeekend(day);
              const schools = lessonsByDate.get(dateStr) || [];
              const totalLessons = schools.reduce(
                (sum, s) => sum + s.lessons.length,
                0,
              );

              return (
                <div
                  key={di}
                  className={`min-h-[90px] p-[6px] border-b border-r border-border last:border-r-0 flex flex-col ${
                    !inMonth
                      ? "bg-bg/50"
                      : weekend
                        ? "bg-bg/30"
                        : "bg-surface"
                  }`}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[12px] font-medium ${
                        today
                          ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                          : !inMonth
                            ? "text-text-muted/40"
                            : "text-text-muted"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {totalLessons > 0 && inMonth && (
                      <span className="text-[10px] font-medium text-text-muted bg-bg px-1.5 py-0.5 rounded-full">
                        {totalLessons}
                      </span>
                    )}
                  </div>

                  {/* Lessons by school */}
                  {inMonth && schools.length > 0 && (
                    <div className="flex flex-col gap-[2px] mt-1 overflow-hidden flex-1">
                      {schools.map((school) => (
                        <div key={school.partnerId} className="flex flex-col gap-[1px]">
                          {school.lessons.map((title, li) => (
                            <div
                              key={li}
                              className="flex items-center gap-[3px] min-w-0"
                              title={`${school.partnerName}: ${title}`}
                            >
                              <div
                                className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                                style={{ backgroundColor: school.partnerColor }}
                              />
                              <span className="text-[8px] text-text-muted truncate leading-tight">
                                {title}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
