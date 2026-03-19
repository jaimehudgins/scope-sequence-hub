"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import Header from "@/components/Header";
import SemesterRibbon from "@/components/SemesterRibbon";
import CalendarControls from "@/components/CalendarControls";
import UnscheduledSidebar from "@/components/UnscheduledSidebar";
import CalendarView from "@/components/CalendarView";
import LessonDetailPanel from "@/components/LessonDetailPanel";
import DisruptionModal from "@/components/DisruptionModal";
import Toast from "@/components/Toast";
import LessonCard from "@/components/LessonCard";
import { format } from "date-fns";
import { isValidMeetingDate } from "@/utils/cascadeUtils";

export default function Home() {
  const {
    lessons,
    setLessons,
    addToast,
    currentRole,
    courses,
    pushSnapshot,
    nonInstructionalDays,
    scheduleOverrides,
  } = useCalendarContext();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);

    const { active, over } = event;

    if (!over || currentRole !== "admin") return;

    const lessonId = active.id as string;
    const targetDate = over.id as string;

    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    // Check for conflicts (one lesson per course per day)
    const conflict = lessons.find(
      (l) =>
        l.scheduledDate === targetDate &&
        l.courseId === lesson.courseId &&
        l.id !== lesson.id,
    );

    if (conflict) {
      addToast(
        `⚠️ ${courses[lesson.courseId]?.name || "Course"} already has a lesson on this date`,
      );
      return;
    }

    // Check if the target date is a valid meeting day for this course
    const course = courses[lesson.courseId];
    if (
      course &&
      !isValidMeetingDate(
        targetDate,
        course,
        nonInstructionalDays,
        scheduleOverrides,
      )
    ) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const targetDayName =
        dayNames[new Date(targetDate + "T12:00:00").getDay()];
      const meetingDayNames = course.meetingDays
        .map((d) => dayNames[d])
        .join(", ");
      addToast(
        `⚠️ ${course.name} doesn't meet on ${targetDayName}s. This course meets: ${meetingDayNames}`,
      );
      return;
    }

    // Snapshot for undo before drag-drop
    const oldDate = lesson.scheduledDate;
    const dateObj = new Date(targetDate + "T12:00:00");
    const formatted = format(dateObj, "MMM d");
    const action = oldDate ? "moved to" : "scheduled for";
    pushSnapshot(`${lesson.title} ${action} ${formatted}`);

    // Update lesson schedule
    setLessons(
      lessons.map((l) =>
        l.id === lessonId ? { ...l, scheduledDate: targetDate } : l,
      ),
    );

    addToast(`✓ ${lesson.title} ${action} ${formatted}`);
  };

  const activeDragLesson = activeDragId
    ? lessons.find((l) => l.id === activeDragId)
    : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <UnscheduledSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <SemesterRibbon />
            <CalendarControls />
            <CalendarView />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDragLesson ? (
          <div className="opacity-90 rotate-3">
            <LessonCard lesson={activeDragLesson} context="month" />
          </div>
        ) : null}
      </DragOverlay>

      <LessonDetailPanel />
      <DisruptionModal />
      <Toast />
    </DndContext>
  );
}
