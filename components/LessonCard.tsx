"use client";

import { Lesson } from "@/types";
import { useCalendarContext } from "@/hooks/useCalendarContext";

type LessonCardProps = {
  lesson: Lesson;
  context?: "month" | "week" | "sidebar";
  isDraggable?: boolean;
};

export default function LessonCard({
  lesson,
  context = "month",
  isDraggable = false,
}: LessonCardProps) {
  const { setSelectedLessonId, currentRole, courses } = useCalendarContext();
  const course = courses[lesson.courseId];

  const isSchoolCreated = lesson.type === "school-created";

  const handleClick = () => {
    setSelectedLessonId(lesson.id);
  };

  const icons = (
    <>
      {isSchoolCreated && <span className="text-[11px]">🏫</span>}
      {lesson.isMilestone && <span className="text-[11px]">🏁</span>}
      {lesson.hasAlmaIntegration && <span className="text-[11px]">🤖</span>}
    </>
  );

  const isViewOnly = currentRole !== "admin";
  const cursorClass = isViewOnly
    ? "cursor-default"
    : isDraggable
      ? "cursor-grab active:cursor-grabbing"
      : "cursor-pointer";

  const baseClasses = `
    rounded-[5px] font-medium transition-all duration-150
    flex items-center gap-1
    ${cursorClass}
    hover:brightness-95
    ${isSchoolCreated ? "border-l-[3px] border-dashed" : "border-l-[3px]"}
  `.trim();

  const colorClasses = {
    "junior-sem": isSchoolCreated
      ? "bg-[#eef2ff] border-l-[#818cf8] text-[#3730a3]"
      : "bg-junior-sem-light border-l-junior-sem text-[#3730a3]",
    "fresh-sem": isSchoolCreated
      ? "bg-[#f0fdfa] border-l-[#2dd4bf] text-[#115e59]"
      : "bg-fresh-sem-light border-l-fresh-sem text-[#115e59]",
    "ninth-adv": isSchoolCreated
      ? "bg-[#fff1f2] border-l-[#fb7185] text-[#9f1239]"
      : "bg-ninth-adv-light border-l-ninth-adv text-[#9f1239]",
  };

  const displayTitle = isSchoolCreated
    ? lesson.schoolCreatedTitle || lesson.title
    : lesson.title;

  if (context === "week") {
    return (
      <div
        data-lesson-id={lesson.id}
        onClick={handleClick}
        className={`${baseClasses} ${colorClasses[lesson.courseId as keyof typeof colorClasses]}
          text-[12px] px-[10px] py-2 flex-col items-start gap-1 whitespace-normal`}
      >
        <span className="lesson-text flex items-center gap-1">
          {isSchoolCreated && <span className="text-[12px]">🏫</span>}
          {displayTitle} ({lesson.duration})
        </span>
        <span className="text-[10px] opacity-70 font-normal">
          {isSchoolCreated ? "School-Created Lesson" : lesson.unitName}
        </span>
        {(lesson.isMilestone || lesson.hasAlmaIntegration) && (
          <span className="flex gap-[2px] self-start">{icons}</span>
        )}
      </div>
    );
  }

  if (context === "sidebar") {
    return (
      <div
        data-lesson-id={lesson.id}
        onClick={handleClick}
        className={`${baseClasses} ${colorClasses[lesson.courseId as keyof typeof colorClasses]}
          text-[12px] px-2 py-[6px] mb-[2px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        <span className="lesson-text overflow-hidden text-ellipsis">
          {isSchoolCreated && "🏫 "}
          {displayTitle} ({lesson.duration})
        </span>
        {(lesson.isMilestone ||
          lesson.hasAlmaIntegration ||
          isSchoolCreated) && (
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
      <span className="lesson-text overflow-hidden text-ellipsis">
        {isSchoolCreated && "🏫 "}
        {displayTitle} ({lesson.duration})
      </span>
      {(lesson.isMilestone || lesson.hasAlmaIntegration || isSchoolCreated) && (
        <span className="ml-auto flex gap-[2px] text-[9px] flex-shrink-0">
          {icons}
        </span>
      )}
    </div>
  );
}
