'use client';

import { Lesson } from '@/types';
import { COURSES } from '@/data/mockCourses';
import { useCalendarContext } from '@/hooks/useCalendarContext';

type LessonCardProps = {
  lesson: Lesson;
  context?: 'month' | 'week' | 'sidebar';
  isDraggable?: boolean;
};

export default function LessonCard({ lesson, context = 'month', isDraggable = false }: LessonCardProps) {
  const { setSelectedLessonId, currentRole } = useCalendarContext();
  const course = COURSES[lesson.courseId];

  const handleClick = () => {
    setSelectedLessonId(lesson.id);
  };

  const icons = (
    <>
      {lesson.isMilestone && <span className="text-[11px]">🏁</span>}
      {lesson.hasAlmaIntegration && <span className="text-[11px]">🤖</span>}
    </>
  );

  const isViewOnly = currentRole !== 'admin';
  const cursorClass = isViewOnly ? 'cursor-default' : isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer';

  const baseClasses = `
    rounded-[5px] font-medium transition-all duration-150
    border-l-[3px] flex items-center gap-1
    ${cursorClass}
    hover:brightness-95
  `.trim();

  const colorClasses = {
    'junior-sem': 'bg-junior-sem-light border-l-junior-sem text-[#3730a3]',
    'fresh-sem': 'bg-fresh-sem-light border-l-fresh-sem text-[#115e59]',
    'ninth-adv': 'bg-ninth-adv-light border-l-ninth-adv text-[#9f1239]',
  };

  if (context === 'week') {
    return (
      <div
        data-lesson-id={lesson.id}
        onClick={handleClick}
        className={`${baseClasses} ${colorClasses[lesson.courseId as keyof typeof colorClasses]}
          text-[12px] px-[10px] py-2 flex-col items-start gap-1 whitespace-normal`}
      >
        <span className="lesson-text">{lesson.title} ({lesson.duration})</span>
        <span className="text-[10px] opacity-70 font-normal">{lesson.unitName}</span>
        {(lesson.isMilestone || lesson.hasAlmaIntegration) && (
          <span className="flex gap-[2px] self-start">{icons}</span>
        )}
      </div>
    );
  }

  if (context === 'sidebar') {
    return (
      <div
        data-lesson-id={lesson.id}
        onClick={handleClick}
        className={`${baseClasses} ${colorClasses[lesson.courseId as keyof typeof colorClasses]}
          text-[12px] px-2 py-[6px] mb-[2px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        <span className="lesson-text overflow-hidden text-ellipsis">{lesson.title} ({lesson.duration})</span>
        {(lesson.isMilestone || lesson.hasAlmaIntegration) && (
          <span className="ml-auto flex gap-[2px] flex-shrink-0">{icons}</span>
        )}
      </div>
    );
  }

  // month view
  return (
    <div
      data-lesson-id={lesson.id}
      onClick={handleClick}
      className={`${baseClasses} ${colorClasses[lesson.courseId as keyof typeof colorClasses]}
        text-[10.5px] px-[5px] py-[3px]`}
    >
      <span className="lesson-text overflow-hidden text-ellipsis">{lesson.title} ({lesson.duration})</span>
      {(lesson.isMilestone || lesson.hasAlmaIntegration) && (
        <span className="ml-auto flex gap-[2px] text-[9px] flex-shrink-0">{icons}</span>
      )}
    </div>
  );
}
