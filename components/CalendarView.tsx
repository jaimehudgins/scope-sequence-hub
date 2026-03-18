'use client';

import { useCalendarContext } from '@/hooks/useCalendarContext';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import LessonCard from './LessonCard';
import { COURSES } from '@/data/mockCourses';

const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DraggableLessonCard({ lessonId, lesson, context }: { lessonId: string; lesson: any; context: 'month' | 'week' }) {
  const { currentRole } = useCalendarContext();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lessonId,
    disabled: currentRole !== 'admin',
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <LessonCard lesson={lesson} context={context} isDraggable />
    </div>
  );
}

function DroppableDay({ date, children, isWeekend, className = '' }: { date: string; children: React.ReactNode; isWeekend: boolean; className?: string }) {
  const { currentRole, nonInstructionalDays } = useCalendarContext();
  const isNonInstructional = nonInstructionalDays.some((d) => d.date === date);

  const { setNodeRef, isOver } = useDroppable({
    id: date,
    disabled: currentRole !== 'admin' || isWeekend || isNonInstructional,
  });

  const dropClass = isOver && currentRole === 'admin' && !isWeekend && !isNonInstructional
    ? 'bg-drop-target outline outline-2 outline-dashed outline-drop-border outline-offset-[-2px]'
    : '';

  return (
    <div ref={setNodeRef} className={`${className} ${dropClass}`}>
      {children}
    </div>
  );
}

export default function CalendarView() {
  const {
    currentDate,
    currentView,
    currentWeekStart,
    lessons,
    activeCourses,
    nonInstructionalDays,
  } = useCalendarContext();

  const today = new Date();

  const isToday = (y: number, m: number, d: number) => {
    return today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
  };

  const dateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  if (currentView === 'month') {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({ day, month: prevMonth, year: prevYear, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, month, year, isCurrentMonth: true });
    }

    // Next month days
    const totalCells = days.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
    }

    return (
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-7 gap-[1px] bg-border border border-border rounded-xl overflow-hidden">
          {dayNamesShort.map((day) => (
            <div
              key={day}
              className="bg-surface p-2 text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted text-center"
            >
              {day}
            </div>
          ))}

          {days.map(({ day, month: m, year: y, isCurrentMonth }, idx) => {
            const ds = dateStr(y, m, day);
            const dow = new Date(y, m, day).getDay();
            const isTodayCell = isToday(y, m, day);
            const isWeekend = dow === 0 || dow === 6;
            const nonInstructionalDay = nonInstructionalDays.find((d) => d.date === ds);

            const dayLessons = lessons.filter(
              (l) => l.scheduledDate === ds && activeCourses.has(l.courseId)
            );

            let cellClasses = 'bg-surface min-h-[100px] p-[5px] flex flex-col transition-all';
            if (!isCurrentMonth) cellClasses += ' bg-[#fafaf8]';
            if (isTodayCell) cellClasses += ' bg-today-bg';
            if (isWeekend) cellClasses += ' bg-[#fbfbf9]';
            if (nonInstructionalDay) cellClasses += ' non-instructional-day';

            return (
              <DroppableDay key={idx} date={ds} isWeekend={isWeekend} className={cellClasses}>
                <div
                  className={`text-[12px] font-medium text-text-muted mb-[3px] p-[2px] w-fit ${
                    isTodayCell
                      ? 'bg-today-border text-white w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px]'
                      : !isCurrentMonth
                      ? 'text-[#ccc]'
                      : ''
                  }`}
                >
                  {day}
                </div>
                {nonInstructionalDay && (
                  <div className="non-instructional-label">{nonInstructionalDay.label}</div>
                )}
                <div className="flex flex-col gap-[2px] flex-1">
                  {dayLessons.map((lesson) => (
                    <DraggableLessonCard
                      key={lesson.id}
                      lessonId={lesson.id}
                      lesson={lesson}
                      context="month"
                    />
                  ))}
                </div>
              </DroppableDay>
            );
          })}
        </div>
      </div>
    );
  }

  // Weekly view
  if (!currentWeekStart) return null;

  const weekDays = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-6">
      <div className="grid grid-cols-5 gap-[1px] bg-border border border-border rounded-xl overflow-hidden">
        {weekDays.map((d) => {
          const isTodayCell = d.toDateString() === today.toDateString();
          return (
            <div
              key={d.toISOString()}
              className={`bg-surface p-[10px] px-3 text-center border-b border-border ${
                isTodayCell ? 'bg-today-bg' : ''
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted">
                {dayNamesShort[d.getDay()]}
              </div>
              <div
                className={`text-[18px] font-semibold text-text mt-[2px] ${
                  isTodayCell
                    ? 'bg-today-border text-white w-[30px] h-[30px] rounded-full inline-flex items-center justify-center'
                    : ''
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}

        {weekDays.map((d) => {
          const ds = dateStr(d.getFullYear(), d.getMonth(), d.getDate());
          const nonInstructionalDay = nonInstructionalDays.find((nd) => nd.date === ds);
          const dayLessons = lessons.filter(
            (l) => l.scheduledDate === ds && activeCourses.has(l.courseId)
          );

          let cellClasses = 'bg-surface min-h-[400px] p-2 flex flex-col gap-1 transition-all';
          if (nonInstructionalDay) cellClasses += ' non-instructional-day';

          return (
            <DroppableDay key={d.toISOString()} date={ds} isWeekend={false} className={cellClasses}>
              {nonInstructionalDay && (
                <div className="non-instructional-label mb-2">{nonInstructionalDay.label}</div>
              )}
              {dayLessons.map((lesson) => (
                <DraggableLessonCard
                  key={lesson.id}
                  lessonId={lesson.id}
                  lesson={lesson}
                  context="week"
                />
              ))}
            </DroppableDay>
          );
        })}
      </div>
    </div>
  );
}
