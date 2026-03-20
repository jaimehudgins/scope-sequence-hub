"use client";

import { useState, useMemo, useEffect } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import {
  CascadePreview as CascadePreviewType,
  NonInstructionalDay,
  ScheduleOverride,
} from "@/types";
import {
  buildCascadePreview,
  buildMultiCourseCascadePreview,
  buildMultiDayCascadePreview,
  executeCascade,
  stringToDate,
  dateToString,
} from "@/utils/cascadeUtils";
import CascadePreviewComponent from "@/components/CascadePreview";
import { format } from "date-fns";

const DISRUPTION_TYPES: {
  value: NonInstructionalDay["type"];
  label: string;
  icon: string;
}[] = [
  { value: "holiday", label: "Holiday / Break", icon: "🎉" },
  { value: "snow", label: "Snow Day", icon: "❄️" },
  { value: "sick", label: "Teacher Absence", icon: "🤒" },
  { value: "assembly", label: "Assembly", icon: "🎤" },
  { value: "testing", label: "Testing", icon: "📝" },
  { value: "pd", label: "Professional Development", icon: "📚" },
  { value: "conference", label: "Conference", icon: "👥" },
  { value: "school-closed", label: "School Closed", icon: "🏫" },
  { value: "other", label: "Other", icon: "📌" },
];

export default function DisruptionModal() {
  const {
    disruptionModal,
    closeDisruptionModal,
    lessons,
    setLessons,
    nonInstructionalDays,
    setNonInstructionalDays,
    courses,
    activeCourses,
    pushSnapshot,
    addToast,
    addScheduleOverride,
    scheduleOverrides,
  } = useCalendarContext();

  // Cancel Day state
  const [disruptionLabel, setDisruptionLabel] = useState("");
  const [disruptionType, setDisruptionType] =
    useState<NonInstructionalDay["type"]>("other");
  const [endDate, setEndDate] = useState("");
  const [scope, setScope] = useState<"all" | "selected">("all");
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set(),
  );

  // Insert school-created lesson state
  const [schoolCreatedTitle, setSchoolCreatedTitle] = useState("");
  const [schoolCreatedDescription, setSchoolCreatedDescription] = useState("");
  const [schoolCreatedCourseId, setSchoolCreatedCourseId] = useState("");

  // Schedule override state
  const [overrideDayOfWeek, setOverrideDayOfWeek] = useState<number | null>(
    null,
  );

  // Shared state
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<string>>(
    new Set(),
  );

  // Reset state when modal opens/changes
  useEffect(() => {
    if (disruptionModal) {
      setDisruptionLabel("");
      setDisruptionType("other");
      setEndDate(disruptionModal.endDate || "");
      setScope("all");
      setSelectedCourseIds(new Set(activeCourses));
      setSchoolCreatedTitle("");
      setSchoolCreatedDescription("");
      setSchoolCreatedCourseId("");
      setOverrideDayOfWeek(null);
      setSelectedForRemoval(new Set());
    }
  }, [disruptionModal, activeCourses]);

  // Compute cascade preview
  const cascadePreview: CascadePreviewType | null = useMemo(() => {
    if (!disruptionModal) return null;

    const targetDate = disruptionModal.targetDate;
    const rangeEnd = endDate || targetDate;
    const isMultiDay = rangeEnd > targetDate;

    if (disruptionModal.mode === "cancel-day") {
      const courseIds =
        scope === "all" ? Object.keys(courses) : Array.from(selectedCourseIds);

      if (isMultiDay) {
        // Multi-day: merge previews for each course
        const allShifts: CascadePreviewType["shifts"] = [];
        const allOverflow: CascadePreviewType["overflowLessons"] = [];
        const allAffected: string[] = [];

        for (const courseId of courseIds) {
          const course = courses[courseId];
          if (!course) continue;
          const preview = buildMultiDayCascadePreview(
            lessons,
            courseId,
            targetDate,
            rangeEnd,
            course,
            nonInstructionalDays,
          );
          allShifts.push(...preview.shifts);
          allOverflow.push(...preview.overflowLessons);
          allAffected.push(...preview.affectedCourseIds);
        }

        return {
          shifts: allShifts,
          overflowLessons: allOverflow,
          affectedCourseIds: allAffected,
        };
      } else {
        // Single day
        return buildMultiCourseCascadePreview(
          lessons,
          courseIds,
          targetDate,
          courses,
          nonInstructionalDays,
        );
      }
    }

    if (
      disruptionModal.mode === "insert-school-created" &&
      schoolCreatedCourseId
    ) {
      const course = courses[schoolCreatedCourseId];
      if (!course) return null;
      // When inserting a school-created lesson, the existing lesson on that date
      // and everything after needs to shift forward
      return buildCascadePreview(
        lessons,
        schoolCreatedCourseId,
        targetDate,
        course,
        nonInstructionalDays,
      );
    }

    return null;
  }, [
    disruptionModal,
    lessons,
    courses,
    nonInstructionalDays,
    scope,
    selectedCourseIds,
    endDate,
    schoolCreatedCourseId,
  ]);

  // Auto-select overflow lessons for removal
  useEffect(() => {
    if (cascadePreview && cascadePreview.overflowLessons.length > 0) {
      setSelectedForRemoval((prev) => {
        const newSet = new Set(prev);
        for (const lesson of cascadePreview.overflowLessons) {
          newSet.add(lesson.id);
        }
        return newSet;
      });
    }
    // We intentionally only run this when cascadePreview changes structurally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cascadePreview?.overflowLessons.length]);

  if (!disruptionModal) return null;

  const targetDate = disruptionModal.targetDate;
  const formattedDate = format(stringToDate(targetDate), "EEEE, MMMM d, yyyy");

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        if (newSet.size > 1) newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleRemoval = (lessonId: string) => {
    setSelectedForRemoval((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  // --- Cancel Day handler ---
  const handleCancelDay = () => {
    if (!cascadePreview) return;

    const label = disruptionLabel.trim() || "Cancelled";
    const rangeEnd = endDate || targetDate;
    const description =
      rangeEnd > targetDate
        ? `Cancelled ${formattedDate} through ${format(stringToDate(rangeEnd), "MMM d")} — ${label}`
        : `Cancelled ${formattedDate} — ${label}`;

    // Snapshot for undo
    pushSnapshot(description);

    // Add non-instructional days
    const newNonInstructionalDays = [...nonInstructionalDays];
    const start = stringToDate(targetDate);
    const end = stringToDate(rangeEnd);
    const cursor = new Date(start);
    while (cursor <= end) {
      const ds = dateToString(cursor);
      // Only add if not already a non-instructional day
      if (!nonInstructionalDays.some((d) => d.date === ds)) {
        newNonInstructionalDays.push({ date: ds, label, type: disruptionType });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    setNonInstructionalDays(newNonInstructionalDays);

    // Execute cascade
    const updatedLessons = executeCascade(
      lessons,
      cascadePreview,
      selectedForRemoval,
    );
    setLessons(updatedLessons);

    const shiftCount = cascadePreview.shifts.filter(
      (s) => s.newDate !== null && !selectedForRemoval.has(s.lesson.id),
    ).length;
    const removedCount = selectedForRemoval.size;
    addToast(
      `🚫 ${label}: ${shiftCount} lesson${shiftCount !== 1 ? "s" : ""} rescheduled${removedCount > 0 ? `, ${removedCount} moved to Lesson Bank` : ""}`,
    );

    closeDisruptionModal();
  };

  // --- Insert School-Created Lesson handler ---
  const handleInsertSchoolCreated = () => {
    if (!schoolCreatedCourseId || !schoolCreatedTitle.trim()) return;

    const description = `Inserted "${schoolCreatedTitle.trim()}" on ${formattedDate}`;

    // Snapshot for undo
    pushSnapshot(description);

    // Execute cascade first (shift existing lessons)
    let updatedLessons = cascadePreview
      ? executeCascade(lessons, cascadePreview, selectedForRemoval)
      : [...lessons];

    // Create the school-created lesson
    const newLesson = {
      id: `school-created-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      courseId: schoolCreatedCourseId,
      unitName: "School-Created",
      unitIndex: -1,
      lessonNumber: 0,
      title: schoolCreatedTitle.trim(),
      description:
        schoolCreatedDescription.trim() ||
        `School-created lesson: ${schoolCreatedTitle.trim()}`,
      scheduledDate: targetDate,
      duration: courses[schoolCreatedCourseId]?.lessonDuration || 50,
      isMilestone: false,
      hasAlmaIntegration: false,
      platformUrl: "",
      type: "school-created" as const,
      schoolCreatedTitle: schoolCreatedTitle.trim(),
      schoolCreatedDescription: schoolCreatedDescription.trim(),
    };

    updatedLessons = [...updatedLessons, newLesson];
    setLessons(updatedLessons);

    const shiftCount =
      cascadePreview?.shifts.filter(
        (s) => s.newDate !== null && !selectedForRemoval.has(s.lesson.id),
      ).length || 0;
    addToast(
      `🏫 "${schoolCreatedTitle.trim()}" added${shiftCount > 0 ? `, ${shiftCount} lesson${shiftCount !== 1 ? "s" : ""} rescheduled` : ""}`,
    );

    closeDisruptionModal();
  };

  // --- Schedule Override handler ---
  const handleScheduleOverride = () => {
    if (overrideDayOfWeek === null) return;

    const dayNames: Record<number, string> = {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
    };
    const dayName = dayNames[overrideDayOfWeek] || "Unknown";
    const label = `${dayName} schedule`;

    pushSnapshot(`Schedule override on ${formattedDate}`);

    addScheduleOverride({
      date: targetDate,
      runsAsDayOfWeek: overrideDayOfWeek,
      label,
    });

    addToast(`🔄 ${formattedDate} will run on ${dayName}'s schedule`);
    closeDisruptionModal();
  };

  const isCancelMode = disruptionModal.mode === "cancel-day";
  const isOverrideMode = disruptionModal.mode === "schedule-override";

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[200] flex items-center justify-center animate-[fade-in_0.15s_ease]"
      onClick={closeDisruptionModal}
    >
      <div
        className="w-[560px] max-h-[85vh] bg-surface rounded-2xl shadow-xl flex flex-col overflow-hidden animate-[fade-in_0.15s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-serif text-[20px] font-semibold text-text">
              {isCancelMode
                ? "🚫 Cancel Day"
                : isOverrideMode
                  ? "🔄 Run a Different Schedule"
                  : "🏫 Add School-Created Lesson"}
            </h2>
            <p className="text-[13px] text-text-muted mt-[2px]">
              {formattedDate}
            </p>
          </div>
          <button
            onClick={closeDisruptionModal}
            className="w-[30px] h-[30px] rounded-lg border border-border bg-surface cursor-pointer text-[14px] flex items-center justify-center text-text-muted hover:bg-bg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {isCancelMode ? (
            <>
              {/* Disruption type */}
              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Reason
                </label>
                <div className="flex flex-wrap gap-[6px]">
                  {DISRUPTION_TYPES.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setDisruptionType(value);
                        if (!disruptionLabel) setDisruptionLabel(label);
                      }}
                      className={`px-3 py-[6px] rounded-lg text-[12px] font-medium border transition-all cursor-pointer flex items-center gap-[5px]
                        ${
                          disruptionType === value
                            ? "bg-text text-white border-text"
                            : "bg-surface text-text-muted border-border hover:bg-bg"
                        }`}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Label
                </label>
                <input
                  type="text"
                  value={disruptionLabel}
                  onChange={(e) => setDisruptionLabel(e.target.value)}
                  placeholder="e.g., Snow Day, Assembly..."
                  className="w-full px-3 py-[8px] rounded-lg border border-border text-[13px] text-text bg-surface focus:outline-none focus:border-text-muted transition-colors"
                />
              </div>

              {/* Date range (for multi-day) */}
              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  End Date (optional — for multi-day disruptions)
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={targetDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-[8px] rounded-lg border border-border text-[13px] text-text bg-surface focus:outline-none focus:border-text-muted transition-colors"
                />
                {endDate && endDate > targetDate && (
                  <p className="text-[11px] text-text-muted mt-1">
                    Range: {formattedDate} through{" "}
                    {format(stringToDate(endDate), "EEEE, MMMM d, yyyy")}
                  </p>
                )}
              </div>

              {/* Scope: all courses or selected */}
              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Affected Courses
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setScope("all")}
                    className={`px-3 py-[6px] rounded-lg text-[12px] font-medium border transition-all cursor-pointer
                      ${scope === "all" ? "bg-text text-white border-text" : "bg-surface text-text-muted border-border hover:bg-bg"}`}
                  >
                    All Courses
                  </button>
                  <button
                    onClick={() => setScope("selected")}
                    className={`px-3 py-[6px] rounded-lg text-[12px] font-medium border transition-all cursor-pointer
                      ${scope === "selected" ? "bg-text text-white border-text" : "bg-surface text-text-muted border-border hover:bg-bg"}`}
                  >
                    Select Courses
                  </button>
                </div>
                {scope === "selected" && (
                  <div className="flex flex-wrap gap-[6px]">
                    {Object.values(courses).map((course) => (
                      <button
                        key={course.id}
                        onClick={() => toggleCourseSelection(course.id)}
                        className={`px-3 py-[5px] rounded-lg text-[12px] font-medium border transition-all cursor-pointer flex items-center gap-[5px]
                          ${
                            selectedCourseIds.has(course.id)
                              ? "text-white shadow-sm"
                              : "bg-surface text-text-muted border-border hover:bg-bg"
                          }`}
                        style={
                          selectedCourseIds.has(course.id)
                            ? {
                                backgroundColor: course.color,
                                borderColor: course.color,
                              }
                            : {}
                        }
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: selectedCourseIds.has(course.id)
                              ? "white"
                              : course.color,
                          }}
                        />
                        {course.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : isOverrideMode ? (
            <>
              {/* Schedule Override form */}
              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Run this day on which schedule?
                </label>
                <p className="text-[13px] text-text-muted mb-3">
                  Courses that normally meet on the selected day will also meet
                  on {formattedDate}.
                </p>
                <div className="flex gap-[6px]">
                  {[
                    { value: 1, label: "Monday" },
                    { value: 2, label: "Tuesday" },
                    { value: 3, label: "Wednesday" },
                    { value: 4, label: "Thursday" },
                    { value: 5, label: "Friday" },
                  ].map(({ value, label }) => {
                    const isSelected = overrideDayOfWeek === value;
                    // Find courses that meet on this day
                    const coursesOnDay = Object.values(courses).filter((c) =>
                      c.meetingDays.includes(value),
                    );
                    return (
                      <button
                        key={value}
                        onClick={() => setOverrideDayOfWeek(value)}
                        className={`flex-1 py-3 rounded-lg text-[13px] font-medium border transition-all cursor-pointer flex flex-col items-center gap-1
                          ${
                            isSelected
                              ? "bg-text text-white border-text"
                              : "bg-surface text-text border-border hover:bg-bg"
                          }`}
                      >
                        <span>{label}</span>
                        <div className="flex gap-[3px]">
                          {coursesOnDay.map((c) => (
                            <span
                              key={c.id}
                              className="w-[6px] h-[6px] rounded-full"
                              style={{
                                backgroundColor: isSelected
                                  ? "rgba(255,255,255,0.7)"
                                  : c.color,
                              }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Show which courses will meet */}
              {overrideDayOfWeek !== null && (
                <div className="bg-bg rounded-lg border border-border p-4">
                  <div className="text-[12px] font-semibold text-text mb-2">
                    Courses that will meet on this day:
                  </div>
                  {Object.values(courses)
                    .filter((c) => c.meetingDays.includes(overrideDayOfWeek))
                    .map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-2 py-[4px]"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: course.color }}
                        />
                        <span className="text-[13px] text-text">
                          {course.name}
                        </span>
                      </div>
                    ))}
                  {Object.values(courses).filter((c) =>
                    c.meetingDays.includes(overrideDayOfWeek),
                  ).length === 0 && (
                    <div className="text-[13px] text-text-muted">
                      No courses meet on this day.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* School-Created Lesson form */}
              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Course
                </label>
                <div className="flex flex-wrap gap-[6px]">
                  {Object.values(courses).map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSchoolCreatedCourseId(course.id)}
                      className={`px-3 py-[5px] rounded-lg text-[12px] font-medium border transition-all cursor-pointer flex items-center gap-[5px]
                        ${
                          schoolCreatedCourseId === course.id
                            ? "text-white shadow-sm"
                            : "bg-surface text-text-muted border-border hover:bg-bg"
                        }`}
                      style={
                        schoolCreatedCourseId === course.id
                          ? {
                              backgroundColor: course.color,
                              borderColor: course.color,
                            }
                          : {}
                      }
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            schoolCreatedCourseId === course.id
                              ? "white"
                              : course.color,
                        }}
                      />
                      {course.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={schoolCreatedTitle}
                  onChange={(e) => setSchoolCreatedTitle(e.target.value)}
                  placeholder="e.g., Guest Speaker: Dr. Smith"
                  className="w-full px-3 py-[8px] rounded-lg border border-border text-[13px] text-text bg-surface focus:outline-none focus:border-text-muted transition-colors"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Description (optional)
                </label>
                <textarea
                  value={schoolCreatedDescription}
                  onChange={(e) => setSchoolCreatedDescription(e.target.value)}
                  placeholder="Notes about this lesson..."
                  rows={3}
                  className="w-full px-3 py-[8px] rounded-lg border border-border text-[13px] text-text bg-surface focus:outline-none focus:border-text-muted transition-colors resize-none"
                />
              </div>
            </>
          )}

          {/* Cascade Preview */}
          {!isOverrideMode &&
            cascadePreview &&
            cascadePreview.shifts.length > 0 && (
              <div>
                <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-[6px] block">
                  Schedule Impact
                </label>
                <CascadePreviewComponent
                  preview={cascadePreview}
                  selectedForRemoval={selectedForRemoval}
                  onToggleRemoval={toggleRemoval}
                  maxHeight="250px"
                />
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-neutral-50">
          <button
            onClick={closeDisruptionModal}
            className="px-4 py-[8px] rounded-lg border border-border text-[13px] font-medium text-text-muted hover:bg-bg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {isCancelMode ? (
            <button
              onClick={handleCancelDay}
              disabled={!cascadePreview}
              className="px-5 py-[8px] rounded-lg bg-text text-white text-[13px] font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm & Reschedule
            </button>
          ) : isOverrideMode ? (
            <button
              onClick={handleScheduleOverride}
              disabled={overrideDayOfWeek === null}
              className="px-5 py-[8px] rounded-lg bg-text text-white text-[13px] font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply Schedule Override
            </button>
          ) : (
            <button
              onClick={handleInsertSchoolCreated}
              disabled={!schoolCreatedCourseId || !schoolCreatedTitle.trim()}
              className="px-5 py-[8px] rounded-lg bg-text text-white text-[13px] font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Lesson & Reschedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
