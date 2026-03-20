'use client';

import { useState } from 'react';
import { useCalendarContext } from '@/hooks/useCalendarContext';
import { COURSES } from '@/data/mockCourses';
import LessonCard from './LessonCard';
import AutoScheduleModal from './AutoScheduleModal';
import { useDraggable } from '@dnd-kit/core';
import { Lesson } from '@/types';

function DraggableLessonCard({ lessonId, children }: { lessonId: string; children: React.ReactNode }) {
  const { currentRole, setSelectedLessonId } = useCalendarContext();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lessonId,
    disabled: currentRole !== 'admin',
  });

  const handleClick = (e: React.MouseEvent) => {
    setSelectedLessonId(lessonId);
  };

  if (currentRole !== 'admin') {
    // For non-admins, just make it clickable
    return (
      <div onClick={handleClick}>
        {children}
      </div>
    );
  }

  // For admins, separate drag handle from clickable card
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : 1, position: 'relative' }}
    >
      <div onClick={handleClick}>
        {children}
      </div>
      {/* Drag handle - only this area triggers drag */}
      <div
        {...listeners}
        className="absolute top-0 left-0 w-[12px] h-full cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 100%)',
        }}
        title="Drag to reschedule"
      />
    </div>
  );
}

export default function UnscheduledSidebar() {
  const { lessons, sidebarCollapsed, setSidebarCollapsed, currentRole } = useCalendarContext();
  const [autoScheduleModal, setAutoScheduleModal] = useState<{
    isOpen: boolean;
    unitLessons: Lesson[];
    unitName: string;
  } | null>(null);

  const unscheduledLessons = lessons.filter((l) => !l.scheduledDate);

  // Group by course and unit
  const grouped: Record<string, Record<string, typeof unscheduledLessons>> = {};
  unscheduledLessons.forEach((lesson) => {
    if (!grouped[lesson.courseId]) grouped[lesson.courseId] = {};
    if (!grouped[lesson.courseId][lesson.unitName]) grouped[lesson.courseId][lesson.unitName] = [];
    grouped[lesson.courseId][lesson.unitName].push(lesson);
  });

  return (
    <div
      className={`bg-surface border-r border-border flex flex-col transition-all duration-300 overflow-hidden ${
        sidebarCollapsed ? 'w-12 min-w-[48px]' : 'w-[280px] min-w-[280px]'
      }`}
    >
      <div
        className={`px-4 py-[14px] border-b border-border flex items-center flex-shrink-0 ${
          sidebarCollapsed ? 'justify-center px-[10px]' : 'justify-between'
        }`}
      >
        {!sidebarCollapsed && (
          <div className="text-[13px] font-semibold flex items-center gap-2 whitespace-nowrap">
            Lesson Bank
            <span className="bg-bg border border-border rounded-[10px] px-2 py-[1px] text-[11px] font-medium text-text-muted">
              {unscheduledLessons.length}
            </span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-[26px] h-[26px] rounded-md border border-border bg-surface cursor-pointer flex items-center justify-center text-text-muted text-[12px] flex-shrink-0 transition-all hover:bg-bg hover:text-text"
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="overflow-y-auto p-[10px] flex-1">
          {Object.entries(grouped).map(([courseId, units]) => {
            const course = COURSES[courseId];
            return (
              <div key={courseId} className="mb-[14px]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted px-2 py-1 flex items-center gap-[6px]">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: course.color }}
                  />
                  {course.name}
                </div>
                {Object.entries(units).map(([unitName, unitLessons]) => (
                  <div key={unitName} className="mb-[6px]">
                    <div className="flex items-center justify-between px-2 py-[2px] group">
                      <div className="text-[11px] font-medium text-text-muted">
                        {unitName}
                      </div>
                      {currentRole === 'admin' && unitLessons.length > 1 && (
                        <button
                          onClick={() =>
                            setAutoScheduleModal({
                              isOpen: true,
                              unitLessons,
                              unitName,
                            })
                          }
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-700 hover:text-blue-900 transition-all px-1 py-0.5 rounded hover:bg-blue-25"
                          title="Auto-schedule this unit"
                        >
                          ✨ Auto
                        </button>
                      )}
                    </div>
                    {unitLessons.map((lesson) => (
                      <DraggableLessonCard key={lesson.id} lessonId={lesson.id}>
                        <LessonCard lesson={lesson} context="sidebar" isDraggable />
                      </DraggableLessonCard>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}

          {unscheduledLessons.length === 0 && (
            <div className="px-6 py-6 text-center text-text-muted text-[13px]">
              All lessons scheduled! 🎉
            </div>
          )}
        </div>
      )}

      {autoScheduleModal && (
        <AutoScheduleModal
          isOpen={autoScheduleModal.isOpen}
          onClose={() => setAutoScheduleModal(null)}
          unitLessons={autoScheduleModal.unitLessons}
          unitName={autoScheduleModal.unitName}
        />
      )}
    </div>
  );
}
