import type {
  Lesson,
  Course,
  NonInstructionalDay,
  ScheduleOverride,
} from "@/types";
import { getNextMeetingDate } from "./cascadeUtils";

/**
 * Auto-schedule all unscheduled lessons in a unit starting from a given date
 */
export function autoScheduleUnit(
  lessons: Lesson[],
  unitLessons: Lesson[],
  startDate: string,
  course: Course,
  nonInstructionalDays: NonInstructionalDay[],
  scheduleOverrides: ScheduleOverride[] = [],
): Lesson[] {
  // Sort unit lessons by lesson number
  const sortedUnitLessons = [...unitLessons].sort(
    (a, b) => a.lessonNumber - b.lessonNumber,
  );

  // Build a map of scheduled dates for this course to avoid conflicts
  const courseDates = new Set(
    lessons
      .filter(
        (l) =>
          l.courseId === course.id &&
          l.scheduledDate &&
          !unitLessons.find((ul) => ul.id === l.id),
      )
      .map((l) => l.scheduledDate as string),
  );

  // Auto-assign dates
  const updatedLessons = new Map<string, Lesson>();
  let currentDate = startDate;

  for (const lesson of sortedUnitLessons) {
    // Check if this date is already taken by another lesson in this course
    while (courseDates.has(currentDate)) {
      const nextDate = getNextMeetingDate(
        currentDate,
        course,
        nonInstructionalDays,
        "forward",
        scheduleOverrides,
      );
      if (!nextDate) break;
      currentDate = nextDate;
    }

    // Schedule this lesson
    updatedLessons.set(lesson.id, { ...lesson, scheduledDate: currentDate });
    courseDates.add(currentDate);

    // Move to next available date
    const nextDate = getNextMeetingDate(
      currentDate,
      course,
      nonInstructionalDays,
      "forward",
      scheduleOverrides,
    );
    if (!nextDate) break; // Reached end of school year
    currentDate = nextDate;
  }

  // Apply updates to the full lessons array
  return lessons.map((l) => updatedLessons.get(l.id) || l);
}

/**
 * Get all units for a course with their lessons
 */
export function getUnitsForCourse(
  lessons: Lesson[],
  courseId: string,
): Map<string, Lesson[]> {
  const units = new Map<string, Lesson[]>();

  lessons
    .filter((l) => l.courseId === courseId)
    .forEach((lesson) => {
      const unitKey = `${lesson.unitName}-${lesson.unitIndex}`;
      if (!units.has(unitKey)) {
        units.set(unitKey, []);
      }
      units.get(unitKey)!.push(lesson);
    });

  return units;
}
