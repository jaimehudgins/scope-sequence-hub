"use client";

import { useCalendarContext } from "@/hooks/useCalendarContext";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import LessonCard from "./LessonCard";
import DayActionMenu from "./DayActionMenu";
import TeacherAbsenceModal from "./TeacherAbsenceModal";
import { isValidMeetingDate } from "@/utils/cascadeUtils";

const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DraggableLessonCard({
  lessonId,
  lesson,
  context,
}: {
  lessonId: string;
  lesson: any;
  context: "month" | "week";
}) {
  const { currentRole, setSelectedLessonId } = useCalendarContext();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lessonId,
    disabled: currentRole !== "admin",
  });

  const handleClick = (e: React.MouseEvent) => {
    // If we're not dragging and not in the middle of a drag operation, open the detail panel
    if (!isDragging) {
      setSelectedLessonId(lessonId);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <LessonCard lesson={lesson} context={context} isDraggable />
    </div>
  );
}

function MeetingDayBars({ dateStr }: { dateStr: string }) {
  const { courses, activeCourses, nonInstructionalDays, scheduleOverrides } =
    useCalendarContext();

  const meetingCourses = Object.values(courses).filter(
    (course) =>
      activeCourses.has(course.id) &&
      isValidMeetingDate(
        dateStr,
        course,
        nonInstructionalDays,
        scheduleOverrides,
      ),
  );

  if (meetingCourses.length === 0) return null;

  return (
    <div className="absolute top-0 left-0 right-0 flex flex-col">
      {meetingCourses.map((course) => (
        <div
          key={course.id}
          className="w-full h-[3px] opacity-70"
          style={{ backgroundColor: course.color }}
          title={`${course.name} meets this day`}
        />
      ))}
    </div>
  );
}

function DroppableDay({
  date,
  children,
  isWeekend,
  className = "",
}: {
  date: string;
  children: React.ReactNode;
  isWeekend: boolean;
  className?: string;
}) {
  const { currentRole, nonInstructionalDays } = useCalendarContext();
  // Only block dropping if it's a real non-instructional day (not a teacher absence)
  const isNonInstructional = nonInstructionalDays.some(
    (d) => d.date === date && d.shouldCascade !== false
  );

  const { setNodeRef, isOver } = useDroppable({
    id: date,
    disabled: currentRole !== "admin" || isWeekend || isNonInstructional,
  });

  const dropClass =
    isOver && currentRole === "admin" && !isWeekend && !isNonInstructional
      ? "bg-drop-target outline outline-2 outline-dashed outline-drop-border outline-offset-[-2px]"
      : "";

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
    courses,
    currentRole,
    scheduleOverrides,
    teacherAbsenceModal,
    openTeacherAbsenceModal,
    closeTeacherAbsenceModal,
  } = useCalendarContext();

  const today = new Date();

  const isToday = (y: number, m: number, d: number) => {
    return (
      today.getFullYear() === y &&
      today.getMonth() === m &&
      today.getDate() === d
    );
  };

  const dateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  // Check if any active course meets on this date
  const hasMeetingDay = (ds: string, isWeekend: boolean) => {
    if (isWeekend) return false;
    // Only exclude real non-instructional days, not teacher absences
    if (nonInstructionalDays.some((d) => d.date === ds && d.shouldCascade !== false)) return false;
    return Object.values(courses).some(
      (course) =>
        activeCourses.has(course.id) &&
        isValidMeetingDate(ds, course, nonInstructionalDays, scheduleOverrides),
    );
  };

  // Find schedule override for a date
  const getOverrideForDate = (ds: string) => {
    return scheduleOverrides.find((o) => o.date === ds) || null;
  };

  if (currentView === "month") {
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
      days.push({
        day,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
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
      days.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return (
      <>
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

            // Separate teacher absences from regular non-instructional days
            const teacherAbsences = nonInstructionalDays.filter(
              (d) => d.date === ds && d.shouldCascade === false
            );
            const nonInstructionalDay = nonInstructionalDays.find(
              (d) => d.date === ds && d.shouldCascade !== false,
            );

            const isMeeting = hasMeetingDay(ds, isWeekend);
            const override = getOverrideForDate(ds);

            const dayLessons = lessons.filter(
              (l) => l.scheduledDate === ds && activeCourses.has(l.courseId),
            );

            let cellClasses =
              "bg-surface min-h-[100px] p-[5px] flex flex-col transition-all relative group";
            if (!isCurrentMonth) cellClasses += " bg-neutral-50";
            if (isTodayCell) cellClasses += " bg-today-bg";
            else if (isMeeting && isCurrentMonth)
              cellClasses += " bg-green-25";
            if (isWeekend) cellClasses += " bg-neutral-25";
            // Only apply non-instructional styling if it's NOT a teacher absence
            if (nonInstructionalDay) cellClasses += " non-instructional-day";

            return (
              <DroppableDay
                key={idx}
                date={ds}
                isWeekend={isWeekend}
                className={cellClasses}
              >
                <MeetingDayBars dateStr={ds} />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-[4px]">
                    <div
                      className={`text-[12px] font-medium text-text-muted mb-[3px] p-[2px] w-fit ${
                        isTodayCell
                          ? "bg-today-border text-white w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px]"
                          : !isCurrentMonth
                            ? "text-neutral-100"
                            : ""
                      }`}
                    >
                      {day}
                    </div>
                    {/* Teacher absence indicator */}
                    {teacherAbsences.length > 0 && (
                      <div className="relative group/absence">
                        <div className="text-[14px] cursor-help">
                          👤
                        </div>
                        <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/absence:opacity-100 transition-opacity pointer-events-none z-10">
                          {teacherAbsences.map(a => a.teacherName || a.label).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Day action menu - admin only, not on weekends or non-instructional days */}
                  {currentRole === "admin" &&
                    !isWeekend &&
                    !nonInstructionalDay &&
                    isCurrentMonth && <DayActionMenu date={ds} />}
                  {/* Teacher absence button - teachers only, not on weekends */}
                  {currentRole === "teacher" &&
                    !isWeekend &&
                    isCurrentMonth && (
                      <button
                        onClick={() => openTeacherAbsenceModal(ds)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[16px] hover:scale-110"
                        title="Mark absent"
                      >
                        📅
                      </button>
                    )}
                </div>
                {nonInstructionalDay && (
                  <div className="non-instructional-label">
                    {nonInstructionalDay.label}
                  </div>
                )}
                {override && (
                  <div className="text-[9px] font-semibold text-lavender-700 bg-lavender-25 px-[5px] py-[1px] rounded w-fit mb-[2px]">
                    🔄 {override.label}
                  </div>
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
        <TeacherAbsenceModal
          isOpen={teacherAbsenceModal?.isOpen || false}
          onClose={closeTeacherAbsenceModal}
          initialDate={teacherAbsenceModal?.targetDate || ""}
        />
      </>
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
    <>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-5 gap-[1px] bg-border border border-border rounded-xl overflow-hidden">
        {weekDays.map((d) => {
          const ds = dateStr(d.getFullYear(), d.getMonth(), d.getDate());
          const isTodayCell = d.toDateString() === today.toDateString();
          const isMeeting = hasMeetingDay(ds, false);
          return (
            <div
              key={d.toISOString()}
              className={`bg-surface p-[10px] px-3 text-center border-b border-border relative ${
                isTodayCell ? "bg-today-bg" : isMeeting ? "bg-green-25" : ""
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted">
                {dayNamesShort[d.getDay()]}
              </div>
              <div
                className={`text-[18px] font-semibold text-text mt-[2px] ${
                  isTodayCell
                    ? "bg-today-border text-white w-[30px] h-[30px] rounded-full inline-flex items-center justify-center"
                    : ""
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}

        {weekDays.map((d) => {
          const ds = dateStr(d.getFullYear(), d.getMonth(), d.getDate());

          // Separate teacher absences from regular non-instructional days
          const teacherAbsences = nonInstructionalDays.filter(
            (nd) => nd.date === ds && nd.shouldCascade === false
          );
          const nonInstructionalDay = nonInstructionalDays.find(
            (nd) => nd.date === ds && nd.shouldCascade !== false,
          );

          const dayLessons = lessons.filter(
            (l) => l.scheduledDate === ds && activeCourses.has(l.courseId),
          );
          const override = getOverrideForDate(ds);

          let cellClasses =
            "bg-surface min-h-[400px] p-2 flex flex-col gap-1 transition-all relative group";
          // Only apply non-instructional styling if it's NOT a teacher absence
          if (nonInstructionalDay) cellClasses += " non-instructional-day";

          return (
            <DroppableDay
              key={d.toISOString()}
              date={ds}
              isWeekend={false}
              className={cellClasses}
            >
              <MeetingDayBars dateStr={ds} />
              <div className="flex items-center justify-between mb-1">
                {/* Teacher absence indicator */}
                {teacherAbsences.length > 0 && (
                  <div className="relative group/absence">
                    <div className="text-[16px] cursor-help">
                      👤
                    </div>
                    <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover/absence:opacity-100 transition-opacity pointer-events-none z-10">
                      {teacherAbsences.map(a => a.teacherName || a.label).join(', ')}
                    </div>
                  </div>
                )}
                {teacherAbsences.length === 0 && <div />}
                {currentRole === "admin" && !nonInstructionalDay && (
                  <DayActionMenu date={ds} />
                )}
                {/* Teacher absence button - teachers only */}
                {currentRole === "teacher" && (
                  <button
                    onClick={() => openTeacherAbsenceModal(ds)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[16px] hover:scale-110"
                    title="Mark absent"
                  >
                    📅
                  </button>
                )}
              </div>
              {nonInstructionalDay && (
                <div className="non-instructional-label mb-2">
                  {nonInstructionalDay.label}
                </div>
              )}
              {override && (
                <div className="text-[9px] font-semibold text-lavender-700 bg-lavender-25 px-[5px] py-[1px] rounded w-fit mb-[2px]">
                  🔄 {override.label}
                </div>
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
      <TeacherAbsenceModal
        isOpen={teacherAbsenceModal?.isOpen || false}
        onClose={closeTeacherAbsenceModal}
        initialDate={teacherAbsenceModal?.targetDate || ""}
      />
    </>
  );
}
