'use client';

import { COURSES } from '@/data/mockCourses';
import { useCalendarContext } from '@/hooks/useCalendarContext';

export default function CourseToggle() {
  const { activeCourses, setActiveCourses } = useCalendarContext();

  const toggleCourse = (courseId: string) => {
    const newActiveCourses = new Set(activeCourses);
    if (newActiveCourses.has(courseId)) {
      if (newActiveCourses.size > 1) {
        newActiveCourses.delete(courseId);
      }
    } else {
      newActiveCourses.add(courseId);
    }
    setActiveCourses(newActiveCourses);
  };

  return (
    <div className="flex gap-[5px]">
      {Object.entries(COURSES).map(([id, course]) => {
        const isActive = activeCourses.has(id);
        return (
          <button
            key={id}
            onClick={() => toggleCourse(id)}
            className={`
              flex items-center gap-[5px] px-[10px] py-[5px] rounded-lg border
              text-[12px] font-medium transition-all cursor-pointer
              ${
                isActive
                  ? id === 'junior-sem'
                    ? 'bg-junior-sem-light text-[#3730a3] border-junior-sem-chip'
                    : id === 'fresh-sem'
                    ? 'bg-fresh-sem-light text-[#115e59] border-fresh-sem-chip'
                    : 'bg-ninth-adv-light text-[#9f1239] border-ninth-adv-chip'
                  : 'bg-surface text-text-muted border-border'
              }
            `}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: course.color }}
            />
            {course.name}
          </button>
        );
      })}
    </div>
  );
}
