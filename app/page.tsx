'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { useCalendarContext } from '@/hooks/useCalendarContext';
import { COURSES } from '@/data/mockCourses';
import Header from '@/components/Header';
import SemesterRibbon from '@/components/SemesterRibbon';
import CalendarControls from '@/components/CalendarControls';
import UnscheduledSidebar from '@/components/UnscheduledSidebar';
import CalendarView from '@/components/CalendarView';
import LessonDetailPanel from '@/components/LessonDetailPanel';
import Toast from '@/components/Toast';
import LessonCard from '@/components/LessonCard';
import { format } from 'date-fns';

export default function Home() {
  const { lessons, setLessons, addToast, currentRole } = useCalendarContext();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);

    const { active, over } = event;

    if (!over || currentRole !== 'admin') return;

    const lessonId = active.id as string;
    const targetDate = over.id as string;

    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    // Check for conflicts (one lesson per course per day)
    const conflict = lessons.find(
      (l) => l.scheduledDate === targetDate && l.courseId === lesson.courseId && l.id !== lesson.id
    );

    if (conflict) {
      addToast(`⚠️ ${COURSES[lesson.courseId].name} already has a lesson on this date`);
      return;
    }

    // Update lesson schedule
    const oldDate = lesson.scheduledDate;
    setLessons(
      lessons.map((l) => (l.id === lessonId ? { ...l, scheduledDate: targetDate } : l))
    );

    const dateObj = new Date(targetDate + 'T12:00:00');
    const formatted = format(dateObj, 'MMM d');
    const action = oldDate ? 'moved to' : 'scheduled for';
    addToast(`✓ ${lesson.title} ${action} ${formatted}`);
  };

  const activeDragLesson = activeDragId ? lessons.find((l) => l.id === activeDragId) : null;

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
      <Toast />
    </DndContext>
  );
}
