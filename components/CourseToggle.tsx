"use client";

import { useState, useRef } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import CourseSchedulePopover from "./CourseSchedulePopover";

const DAY_SHORT: Record<number, string> = {
  1: "M",
  2: "T",
  3: "W",
  4: "Th",
  5: "F",
};

export default function CourseToggle() {
  const { activeCourses, setActiveCourses, courses, currentRole } =
    useCalendarContext();
  const [popoverCourseId, setPopoverCourseId] = useState<string | null>(null);
  const [popoverAnchorRect, setPopoverAnchorRect] = useState<DOMRect | null>(
    null,
  );
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  const openPopover = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const btn = buttonRefs.current[courseId];
    if (btn) {
      setPopoverAnchorRect(btn.getBoundingClientRect());
      setPopoverCourseId(courseId);
    }
  };

  return (
    <div className="flex gap-[5px] items-center">
      {Object.entries(courses).map(([id, course]) => {
        const isActive = activeCourses.has(id);
        const meetingDayLabels = course.meetingDays
          .filter((d) => d >= 1 && d <= 5)
          .sort((a, b) => a - b)
          .map((d) => DAY_SHORT[d])
          .join("/");

        return (
          <div key={id} className="flex items-center gap-[2px]">
            <button
              onClick={() => toggleCourse(id)}
              className={`
                flex items-center gap-[5px] px-[10px] py-[5px] rounded-lg border
                text-[12px] font-medium transition-all cursor-pointer
                ${
                  isActive
                    ? id === "junior-sem"
                      ? "bg-junior-sem-light text-lavender-900 border-junior-sem-chip"
                      : id === "fresh-sem"
                        ? "bg-fresh-sem-light text-green-900 border-fresh-sem-chip"
                        : "bg-ninth-adv-light text-red-900 border-ninth-adv-chip"
                    : "bg-surface text-text-muted border-border"
                }
              `}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: course.color }}
              />
              <span>{course.name}</span>
              {isActive && meetingDayLabels && (
                <span className="text-[10px] opacity-60 font-normal ml-[2px]">
                  ({meetingDayLabels})
                </span>
              )}
            </button>

            {/* Settings gear for admin */}
            {currentRole === "admin" && isActive && (
              <button
                ref={(el) => {
                  buttonRefs.current[id] = el;
                }}
                onClick={(e) => openPopover(id, e)}
                className="w-[30px] h-[30px] rounded-md flex items-center justify-center text-[17px] text-text-muted hover:bg-bg hover:text-text transition-all cursor-pointer border border-transparent hover:border-border"
                title={`Configure ${course.name} schedule`}
              >
                ⚙
              </button>
            )}
          </div>
        );
      })}

      {/* Schedule popover */}
      {popoverCourseId && (
        <CourseSchedulePopover
          courseId={popoverCourseId}
          anchorRect={popoverAnchorRect}
          onClose={() => setPopoverCourseId(null)}
        />
      )}
    </div>
  );
}
