'use client';

import { useCalendarContext } from '@/hooks/useCalendarContext';
import { COURSES } from '@/data/mockCourses';
import { format } from 'date-fns';

export default function LessonDetailPanel() {
  const { lessons, selectedLessonId, setSelectedLessonId, setLessons, addToast, currentRole } =
    useCalendarContext();

  if (!selectedLessonId) return null;

  const lesson = lessons.find((l) => l.id === selectedLessonId);
  if (!lesson) return null;

  const course = COURSES[lesson.courseId];

  const closePanel = () => {
    setSelectedLessonId(null);
  };

  const handleUnschedule = () => {
    setLessons(
      lessons.map((l) => (l.id === lesson.id ? { ...l, scheduledDate: null } : l))
    );
    addToast(`↩ ${lesson.title} moved back to Lesson Bank`);
    setSelectedLessonId(null);
  };

  const dateDisplay = lesson.scheduledDate
    ? format(new Date(lesson.scheduledDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')
    : 'Not yet scheduled';

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[200] flex justify-end animate-[fade-in_0.15s_ease]"
      onClick={closePanel}
    >
      <div
        className="w-[400px] h-full bg-surface shadow-[-8px_0_30px_rgba(0,0,0,0.1)] p-7 flex flex-col overflow-y-auto animate-[slide-in_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closePanel}
          className="self-end w-[30px] h-[30px] rounded-lg border border-border bg-surface cursor-pointer text-[14px] flex items-center justify-center text-text-muted mb-[14px] hover:bg-bg"
        >
          ✕
        </button>

        <div
          className="text-[11px] font-semibold uppercase tracking-[0.8px] mb-[6px]"
          style={{ color: course.color }}
        >
          {course.name}
        </div>

        <div className="font-serif text-[22px] font-semibold mb-1">{lesson.title}</div>

        <div className="text-[13px] text-text-muted mb-[18px]">
          {lesson.unitName} · Lesson {lesson.lessonNumber}
        </div>

        <div className="flex gap-2 mb-[18px] flex-wrap">
          <div className="px-[10px] py-1 rounded-md text-[12px] font-medium bg-bg border border-border flex items-center gap-1">
            ⏱ {lesson.duration} min
          </div>
          {lesson.isMilestone && (
            <div className="px-[10px] py-1 rounded-md text-[12px] font-medium bg-bg border border-border flex items-center gap-1">
              🏁 Milestone
            </div>
          )}
          {lesson.hasAlmaIntegration && (
            <div className="px-[10px] py-1 rounded-md text-[12px] font-medium bg-bg border border-border flex items-center gap-1">
              🤖 Alma Integration
            </div>
          )}
        </div>

        <div className="text-[13px] text-text-muted mb-6 flex items-center gap-[6px]">
          📅 {dateDisplay}
        </div>

        <div className="text-[14px] leading-[1.65] text-text-muted mb-6">
          {lesson.description}
        </div>

        <a
          href={lesson.platformUrl}
          onClick={(e) => {
            e.preventDefault();
            addToast(`🔗 Would navigate to ${lesson.platformUrl}`);
          }}
          className="inline-flex items-center gap-[6px] px-[18px] py-[11px] bg-text text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all hover:opacity-85 w-fit mb-4"
        >
          View Full Lesson →
        </a>

        {currentRole === 'admin' && lesson.scheduledDate && (
          <button
            onClick={handleUnschedule}
            className="inline-flex items-center gap-[6px] px-[18px] py-[11px] bg-bg text-text border border-border rounded-lg text-[13px] font-semibold cursor-pointer transition-all hover:bg-border-light w-fit"
          >
            ↩ Remove from Calendar
          </button>
        )}
      </div>
    </div>
  );
}
