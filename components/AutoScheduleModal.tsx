"use client";

import { useState } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import { Lesson } from "@/types";
import { autoScheduleUnit } from "@/utils/autoScheduleUtils";
import { isValidMeetingDate } from "@/utils/cascadeUtils";
import { format } from "date-fns";

export default function AutoScheduleModal({
  isOpen,
  onClose,
  unitLessons,
  unitName,
}: {
  isOpen: boolean;
  onClose: () => void;
  unitLessons: Lesson[];
  unitName: string;
}) {
  const {
    lessons,
    setLessons,
    courses,
    nonInstructionalDays,
    scheduleOverrides,
    pushSnapshot,
    addToast,
  } = useCalendarContext();

  const [selectedDate, setSelectedDate] = useState("");
  const [previewDates, setPreviewDates] = useState<
    { lesson: Lesson; date: string }[]
  >([]);

  if (!isOpen || unitLessons.length === 0) return null;

  const course = courses[unitLessons[0].courseId];
  if (!course) return null;

  const unscheduledLessons = unitLessons.filter((l) => !l.scheduledDate);
  const totalLessons = unitLessons.length;

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);

    if (!dateStr) {
      setPreviewDates([]);
      return;
    }

    // Generate preview
    const tempUpdated = autoScheduleUnit(
      lessons,
      unscheduledLessons,
      dateStr,
      course,
      nonInstructionalDays,
      scheduleOverrides,
    );

    const preview = unscheduledLessons
      .map((lesson) => {
        const updated = tempUpdated.find((l) => l.id === lesson.id);
        return {
          lesson,
          date: updated?.scheduledDate || "",
        };
      })
      .filter((p) => p.date);

    setPreviewDates(preview);
  };

  const handleConfirm = () => {
    if (!selectedDate) return;

    pushSnapshot(`Auto-scheduled ${unitName}`);

    const updatedLessons = autoScheduleUnit(
      lessons,
      unscheduledLessons,
      selectedDate,
      course,
      nonInstructionalDays,
      scheduleOverrides,
    );

    setLessons(updatedLessons);

    addToast(
      `✨ Auto-scheduled ${previewDates.length} lesson${previewDates.length !== 1 ? "s" : ""} in ${unitName}`,
    );

    handleClose();
  };

  const handleClose = () => {
    setSelectedDate("");
    setPreviewDates([]);
    onClose();
  };

  // Get suggested start date (first valid meeting day in current month)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let suggestedDate = "";
  for (let day = 1; day <= 31; day++) {
    const testDate = new Date(currentYear, currentMonth, day);
    if (testDate.getMonth() !== currentMonth) break;
    const dateStr = testDate.toISOString().split("T")[0];
    if (
      isValidMeetingDate(
        dateStr,
        course,
        nonInstructionalDays,
        scheduleOverrides,
      )
    ) {
      suggestedDate = dateStr;
      break;
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[200] flex items-center justify-center animate-[fade-in_0.15s_ease]"
      onClick={handleClose}
    >
      <div
        className="w-[600px] max-h-[85vh] bg-surface rounded-2xl shadow-xl flex flex-col overflow-hidden animate-[fade-in_0.15s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-serif text-[20px] font-semibold text-text">
              ✨ Auto-Schedule Unit
            </h2>
            <p className="text-[13px] text-text-muted mt-[2px]">
              {unitName} • {course.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-[30px] h-[30px] rounded-lg border border-border bg-surface cursor-pointer text-[14px] flex items-center justify-center text-text-muted hover:bg-bg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Info */}
          <div className="bg-blue-25 border border-blue-200 rounded-lg p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="text-[20px]">💡</div>
              <div className="flex-1">
                <div className="text-[13px] text-blue-900">
                  Select the first date this unit should be taught. The
                  remaining {unscheduledLessons.length} unscheduled lesson
                  {unscheduledLessons.length !== 1 ? "s" : ""} will be
                  automatically scheduled on subsequent meeting days.
                </div>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div className="mb-5">
            <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
              First Lesson Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-[8px] rounded-lg border border-border text-[13px] text-text bg-surface focus:outline-none focus:border-text-muted transition-colors"
            />
            {suggestedDate && !selectedDate && (
              <button
                onClick={() => handleDateChange(suggestedDate)}
                className="text-[11px] text-blue-700 hover:underline mt-1"
              >
                Use suggested date:{" "}
                {format(new Date(suggestedDate + "T12:00:00"), "MMM d, yyyy")}
              </button>
            )}
          </div>

          {/* Preview */}
          {previewDates.length > 0 && (
            <div>
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                Schedule Preview
              </label>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-y-auto max-h-[300px]">
                  <table className="w-full text-[12px]">
                    <thead className="bg-neutral-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-text-muted uppercase tracking-[0.5px] text-[10px]">
                          Lesson
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-text-muted uppercase tracking-[0.5px] text-[10px]">
                          Scheduled Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewDates.map(({ lesson, date }, index) => (
                        <tr
                          key={lesson.id}
                          className="border-t border-border-light"
                        >
                          <td className="px-3 py-2 text-text">
                            Lesson {lesson.lessonNumber}: {lesson.title}
                          </td>
                          <td className="px-3 py-2 font-medium text-text">
                            {format(
                              new Date(date + "T12:00:00"),
                              "EEE, MMM d, yyyy",
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="text-[11px] text-text-muted mt-2">
                {previewDates.length} of {unscheduledLessons.length} lessons
                will be scheduled
                {unscheduledLessons.length > previewDates.length &&
                  ` (${unscheduledLessons.length - previewDates.length} beyond school year)`}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-neutral-50">
          <button
            onClick={handleClose}
            className="px-4 py-[8px] rounded-lg border border-border text-[13px] font-medium text-text-muted hover:bg-bg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={previewDates.length === 0}
            className="px-5 py-[8px] rounded-lg bg-text text-white text-[13px] font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Schedule {previewDates.length} Lesson
            {previewDates.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
