"use client";

import { useCalendarContext } from "@/hooks/useCalendarContext";
import { format } from "date-fns";

export default function LessonDetailPanel() {
  const {
    lessons,
    selectedLessonId,
    setSelectedLessonId,
    setLessons,
    addToast,
    currentRole,
    courses,
    pushSnapshot,
    openDisruptionModal,
  } = useCalendarContext();

  if (!selectedLessonId) return null;

  const lesson = lessons.find((l) => l.id === selectedLessonId);
  if (!lesson) return null;

  const course = courses[lesson.courseId];
  const isSchoolCreated = lesson.type === "school-created";

  const closePanel = () => {
    setSelectedLessonId(null);
  };

  const handleUnschedule = () => {
    pushSnapshot(`Removed "${lesson.title}" from calendar`);
    setLessons(
      lessons.map((l) =>
        l.id === lesson.id ? { ...l, scheduledDate: null } : l,
      ),
    );
    addToast(`↩ ${lesson.title} moved back to Lesson Bank`);
    setSelectedLessonId(null);
  };

  const handleCancelFromHere = () => {
    if (lesson.scheduledDate) {
      setSelectedLessonId(null);
      openDisruptionModal("cancel-day", lesson.scheduledDate);
    }
  };

  const dateDisplay = lesson.scheduledDate
    ? format(new Date(lesson.scheduledDate + "T12:00:00"), "EEEE, MMMM d, yyyy")
    : "Not yet scheduled";

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

        {/* Course label */}
        <div className="flex items-center gap-2 mb-[6px]">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.8px]"
            style={{ color: course?.color }}
          >
            {course?.name}
          </div>
          {isSchoolCreated && (
            <span className="text-[10px] font-medium uppercase tracking-[0.5px] px-[6px] py-[2px] rounded bg-[#fffbeb] border border-[#fde68a] text-[#92400e]">
              🏫 School-Created
            </span>
          )}
        </div>

        {/* Title */}
        <div className="font-serif text-[22px] font-semibold mb-1">
          {isSchoolCreated
            ? lesson.schoolCreatedTitle || lesson.title
            : lesson.title}
        </div>

        {/* Subtitle */}
        <div className="text-[13px] text-text-muted mb-[18px]">
          {isSchoolCreated
            ? "School-Created Lesson"
            : `${lesson.unitName} · Lesson ${lesson.lessonNumber}`}
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-[18px] flex-wrap">
          <div className="px-[10px] py-1 rounded-md text-[12px] font-medium bg-bg border border-border flex items-center gap-1">
            ⏱ {lesson.duration} min
          </div>
          {isSchoolCreated && (
            <div className="px-[10px] py-1 rounded-md text-[12px] font-medium bg-[#fffbeb] border border-[#fde68a] text-[#92400e] flex items-center gap-1">
              🏫 School-Created
            </div>
          )}
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

        {/* Date */}
        <div className="text-[13px] text-text-muted mb-6 flex items-center gap-[6px]">
          📅 {dateDisplay}
        </div>

        {/* Description */}
        <div className="text-[14px] leading-[1.65] text-text-muted mb-6">
          {isSchoolCreated && lesson.schoolCreatedDescription
            ? lesson.schoolCreatedDescription
            : lesson.description}
        </div>

        {/* View Full Lesson button - only for curriculum lessons */}
        {!isSchoolCreated && lesson.platformUrl && (
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
        )}

        {/* Admin actions */}
        {currentRole === "admin" && (
          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
            {lesson.scheduledDate && (
              <>
                <button
                  onClick={handleUnschedule}
                  className="inline-flex items-center gap-[6px] px-[18px] py-[11px] bg-bg text-text border border-border rounded-lg text-[13px] font-semibold cursor-pointer transition-all hover:bg-border-light w-full justify-center"
                >
                  ↩ Remove from Calendar
                </button>
                <button
                  onClick={handleCancelFromHere}
                  className="inline-flex items-center gap-[6px] px-[18px] py-[11px] bg-bg text-text border border-border rounded-lg text-[13px] font-semibold cursor-pointer transition-all hover:bg-border-light w-full justify-center"
                >
                  🚫 Cancel This Day & Reschedule
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
