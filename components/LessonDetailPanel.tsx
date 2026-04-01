"use client";

import { useState } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import { format } from "date-fns";
import { isValidMeetingDate } from "@/utils/cascadeUtils";

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
    nonInstructionalDays,
    scheduleOverrides,
  } = useCalendarContext();

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteFlagged, setNoteFlagged] = useState(false);

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

  const handleSaveNote = () => {
    pushSnapshot(`Updated teacher note for "${lesson.title}"`);

    const updatedLesson = {
      ...lesson,
      teacherNote: noteText.trim() || undefined,
      teacherNoteFlagged: noteText.trim() ? noteFlagged : undefined,
      teacherNoteAuthor: noteText.trim()
        ? lesson.teacherNoteAuthor || "Teacher"
        : undefined,
      teacherNoteDate: noteText.trim()
        ? new Date().toISOString().split("T")[0]
        : undefined,
    };

    setLessons(lessons.map((l) => (l.id === lesson.id ? updatedLesson : l)));

    setIsEditingNote(false);

    if (noteText.trim() && noteFlagged) {
      addToast(`🚩 Note saved and flagged for admin review`);
    } else if (noteText.trim()) {
      addToast(`📝 Note saved`);
    } else {
      addToast(`Note removed`);
    }
  };

  const handleClearFlag = () => {
    pushSnapshot(`Cleared teacher note flag for "${lesson.title}"`);

    const updatedLesson = {
      ...lesson,
      teacherNoteFlagged: false,
    };

    setLessons(lessons.map((l) => (l.id === lesson.id ? updatedLesson : l)));
    setNoteFlagged(false);

    addToast(`Flag cleared for "${lesson.title}"`);
  };

  const handleDeleteNote = () => {
    pushSnapshot(`Deleted teacher note for "${lesson.title}"`);

    const updatedLesson = {
      ...lesson,
      teacherNote: undefined,
      teacherNoteFlagged: undefined,
      teacherNoteAuthor: undefined,
      teacherNoteDate: undefined,
    };

    setLessons(lessons.map((l) => (l.id === lesson.id ? updatedLesson : l)));
    setNoteText("");
    setNoteFlagged(false);
    setIsEditingNote(false);

    addToast(`Note deleted`);
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
            <span className="text-[10px] font-medium uppercase tracking-[0.5px] px-[6px] py-[2px] rounded bg-yellow-25 border border-yellow-200 text-yellow-900">
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
            <div className="px-[10px] py-1 rounded-md text-[12px] font-medium bg-yellow-25 border border-yellow-200 text-yellow-900 flex items-center gap-1">
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
        <div className="text-[13px] text-text-muted mb-2 flex items-center gap-[6px]">
          {lesson.scheduledDate ? `📅 ${dateDisplay}` : `📅 ${dateDisplay}`}
        </div>

        {/* Quick schedule for unscheduled lessons */}
        {!lesson.scheduledDate && currentRole === "admin" && course && (
          <div className="mb-6 border border-border rounded-lg p-3 bg-bg">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.8px] block mb-[6px]">
              Schedule This Lesson
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-3 py-[7px] rounded-lg border border-border text-[13px] text-text bg-surface focus:outline-none focus:border-text-muted transition-colors"
                onChange={(e) => {
                  const dateStr = e.target.value;
                  if (!dateStr) return;

                  // Validate it's a valid meeting date
                  if (
                    !isValidMeetingDate(
                      dateStr,
                      course,
                      nonInstructionalDays,
                      scheduleOverrides,
                    )
                  ) {
                    const dayNames = [
                      "Sunday", "Monday", "Tuesday", "Wednesday",
                      "Thursday", "Friday", "Saturday",
                    ];
                    const targetDay =
                      dayNames[new Date(dateStr + "T12:00:00").getDay()];
                    const meetingDayNames = course.meetingDays
                      .map((d) => dayNames[d])
                      .join(", ");
                    addToast(
                      `Not a valid meeting day. ${course.name} meets: ${meetingDayNames} (selected ${targetDay})`,
                    );
                    return;
                  }

                  // Check for conflicts
                  const conflict = lessons.find(
                    (l) =>
                      l.scheduledDate === dateStr &&
                      l.courseId === lesson.courseId &&
                      l.id !== lesson.id,
                  );
                  if (conflict) {
                    addToast(
                      `${course.name} already has a lesson on this date`,
                    );
                    return;
                  }

                  pushSnapshot(
                    `Scheduled "${lesson.title}" for ${format(new Date(dateStr + "T12:00:00"), "MMM d")}`,
                  );
                  setLessons(
                    lessons.map((l) =>
                      l.id === lesson.id
                        ? { ...l, scheduledDate: dateStr }
                        : l,
                    ),
                  );
                  addToast(
                    `${lesson.title} scheduled for ${format(new Date(dateStr + "T12:00:00"), "MMM d, yyyy")}`,
                  );
                }}
              />
            </div>
            <div className="text-[10px] text-text-muted mt-[5px]">
              {(() => {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const meetDays = course.meetingDays.map((d) => dayNames[d]).join(", ");
                return `Meets: ${meetDays}`;
              })()}
            </div>
          </div>
        )}

        {lesson.scheduledDate && <div className="mb-4" />}

        {/* Description */}
        <div className="text-[14px] leading-[1.65] text-text-muted mb-6">
          {isSchoolCreated && lesson.schoolCreatedDescription
            ? lesson.schoolCreatedDescription
            : lesson.description}
        </div>

        {/* Teacher Note Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-[6px]">
            <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px]">
              Teacher Note
            </label>
            {lesson.teacherNoteFlagged && (
              <span className="text-[10px] font-medium uppercase tracking-[0.5px] px-[6px] py-[2px] rounded bg-red-25 border border-red-200 text-red-900">
                🚩 Flagged
              </span>
            )}
          </div>

          {!isEditingNote && !lesson.teacherNote && (
            <button
              onClick={() => { setNoteText(lesson.teacherNote || ""); setNoteFlagged(lesson.teacherNoteFlagged || false); setIsEditingNote(true); }}
              className="w-full px-3 py-[10px] rounded-lg border border-dashed border-border text-[13px] text-text-muted hover:border-text-muted hover:text-text transition-colors cursor-pointer"
            >
              + Add a note for this lesson
            </button>
          )}

          {!isEditingNote && lesson.teacherNote && (
            <div className="border border-border rounded-lg p-3 bg-bg">
              <div className="text-[13px] text-text mb-2 whitespace-pre-wrap">
                {lesson.teacherNote}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-text-muted">
                  {lesson.teacherNoteAuthor &&
                    `${lesson.teacherNoteAuthor} • `}
                  {lesson.teacherNoteDate &&
                    format(
                      new Date(lesson.teacherNoteDate + "T12:00:00"),
                      "MMM d, yyyy",
                    )}
                </div>
                <div className="flex gap-2">
                  {currentRole === "admin" && lesson.teacherNoteFlagged && (
                    <button
                      onClick={handleClearFlag}
                      className="text-[11px] text-text-muted hover:text-text hover:underline cursor-pointer"
                    >
                      Clear Flag
                    </button>
                  )}
                  <button
                    onClick={() => { setNoteText(lesson.teacherNote || ""); setNoteFlagged(lesson.teacherNoteFlagged || false); setIsEditingNote(true); }}
                    className="text-[11px] text-blue-700 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteNote}
                    className="text-[11px] text-red-700 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {isEditingNote && (
            <div className="border border-border rounded-lg p-3 bg-bg">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note about this lesson (e.g., modifications, student needs, pacing adjustments)..."
                className="w-full px-3 py-2 rounded-lg border border-border text-[13px] text-text bg-surface focus:outline-none focus:border-text-muted resize-none mb-3"
                rows={4}
              />
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noteFlagged}
                    onChange={(e) => setNoteFlagged(e.target.checked)}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                  <span className="text-[12px] text-text-muted">
                    🚩 Flag for Admin Review
                  </span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  className="flex-1 px-4 py-[8px] rounded-lg bg-text text-white text-[13px] font-semibold hover:opacity-90 transition-all cursor-pointer"
                >
                  Save Note
                </button>
                <button
                  onClick={() => {
                    setIsEditingNote(false);
                    setNoteText(lesson.teacherNote || "");
                    setNoteFlagged(lesson.teacherNoteFlagged || false);
                  }}
                  className="px-4 py-[8px] rounded-lg border border-border text-[13px] font-medium text-text-muted hover:bg-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
