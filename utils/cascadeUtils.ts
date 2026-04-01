import type {
  Course,
  Lesson,
  NonInstructionalDay,
  ScheduleOverride,
  CascadeShift,
  CascadePreview,
} from "@/types";
import { SCHOOL_YEAR_END } from "@/data/mockCourses";

/**
 * Convert a Date to 'YYYY-MM-DD' string.
 * Uses local date parts (getFullYear/getMonth/getDate) to avoid timezone drift.
 */
export function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a 'YYYY-MM-DD' string into a Date object.
 * Appends 'T12:00:00' to avoid timezone boundary issues.
 */
export function stringToDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

/**
 * Returns true if the date falls on a Saturday (6) or Sunday (0).
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Returns true if the given date string appears in the non-instructional days array
 * AND should prevent lessons from being scheduled (i.e., shouldCascade !== false).
 * Teacher absences with shouldCascade=false will NOT block lesson scheduling.
 */
export function isNonInstructionalDate(
  dateStr: string,
  nonInstructionalDays: NonInstructionalDay[],
): boolean {
  return nonInstructionalDays.some(
    (nid) => nid.date === dateStr && nid.shouldCascade !== false,
  );
}

/**
 * Returns the effective day-of-week for a given date, considering schedule overrides.
 * If there's an override, returns the runsAsDayOfWeek; otherwise returns the actual day-of-week.
 */
export function getEffectiveDayOfWeek(
  date: Date,
  dateStr: string,
  scheduleOverrides: ScheduleOverride[] = [],
): number {
  const override = scheduleOverrides.find((o) => o.date === dateStr);
  if (override) {
    return override.runsAsDayOfWeek;
  }
  return date.getDay();
}

/**
 * Returns true if the date's day-of-week is one of the course's meeting days.
 */
export function isMeetingDay(
  date: Date,
  course: Course,
  scheduleOverrides: ScheduleOverride[] = [],
): boolean {
  const dateStr = dateToString(date);
  const effectiveDay = getEffectiveDayOfWeek(date, dateStr, scheduleOverrides);
  return course.meetingDays.includes(effectiveDay);
}

/**
 * Returns true if the given date falls on a Willow cadence day for the course.
 * - "every": always true (default)
 * - "everyOther": true on even weeks relative to the anchor date
 * - "nthWeeks": true if the nth occurrence of the day-of-week in the month is included
 */
export function isWillowCadenceDay(dateStr: string, course: Course): boolean {
  const cadence = course.willowCadence;
  if (!cadence || cadence.type === "every") return true;

  const date = stringToDate(dateStr);

  if (cadence.type === "everyOther") {
    const anchor = stringToDate(cadence.anchorDate);
    const diffMs = date.getTime() - anchor.getTime();
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    return diffWeeks % 2 === 0;
  }

  if (cadence.type === "nthWeeks") {
    // nth occurrence of this day-of-week in the month (1-indexed)
    const nthOccurrence = Math.ceil(date.getDate() / 7);
    return cadence.weeks.includes(nthOccurrence);
  }

  return true;
}

/**
 * Returns true if the date is a valid meeting date for the course:
 * it must be a meeting day, not a weekend, not a non-instructional day,
 * and must fall on a Willow cadence day.
 */
export function isValidMeetingDate(
  dateStr: string,
  course: Course,
  nonInstructionalDays: NonInstructionalDay[],
  scheduleOverrides: ScheduleOverride[] = [],
): boolean {
  const date = stringToDate(dateStr);
  return (
    isMeetingDay(date, course, scheduleOverrides) &&
    !isWeekend(date) &&
    !isNonInstructionalDate(dateStr, nonInstructionalDays) &&
    isWillowCadenceDay(dateStr, course)
  );
}

/**
 * Starting from the day after (or before, if backward) `fromDateStr`, find the
 * next valid meeting date for the course.
 *
 * Returns null if we exceed SCHOOL_YEAR_END (forward) or search more than 365 days.
 */
export function getNextMeetingDate(
  fromDateStr: string,
  course: Course,
  nonInstructionalDays: NonInstructionalDay[],
  direction: "forward" | "backward" = "forward",
  scheduleOverrides: ScheduleOverride[] = [],
): string | null {
  const schoolYearEndStr = dateToString(SCHOOL_YEAR_END);
  const delta = direction === "forward" ? 1 : -1;
  const current = stringToDate(fromDateStr);

  for (let i = 0; i < 365; i++) {
    current.setDate(current.getDate() + delta);
    const currentStr = dateToString(current);

    // Boundary check: if moving forward and past school year end, stop
    if (direction === "forward" && currentStr > schoolYearEndStr) {
      return null;
    }

    if (
      isValidMeetingDate(
        currentStr,
        course,
        nonInstructionalDays,
        scheduleOverrides,
      )
    ) {
      return currentStr;
    }
  }

  return null;
}

/**
 * Returns all courses that have a valid meeting on the given date
 * (meeting day for the course, not a weekend, not a non-instructional day).
 */
export function getCoursesOnDate(
  dateStr: string,
  courses: Record<string, Course>,
  nonInstructionalDays: NonInstructionalDay[],
  scheduleOverrides: ScheduleOverride[] = [],
): Course[] {
  const date = stringToDate(dateStr);

  // If it's a weekend or non-instructional day, no courses meet
  if (
    isWeekend(date) ||
    isNonInstructionalDate(dateStr, nonInstructionalDays)
  ) {
    return [];
  }

  return Object.values(courses).filter((course) =>
    isMeetingDay(date, course, scheduleOverrides),
  );
}

/**
 * Core single-course cascade builder.
 *
 * Finds all lessons for `courseId` scheduled on or after `fromDate`, then walks
 * them forward to sequential valid meeting dates starting from the first meeting
 * date after `fromDate`. Lessons that overflow past SCHOOL_YEAR_END are collected
 * in `overflowLessons`.
 */
export function buildCascadePreview(
  lessons: Lesson[],
  courseId: string,
  fromDate: string,
  course: Course,
  nonInstructionalDays: NonInstructionalDay[],
  scheduleOverrides: ScheduleOverride[] = [],
): CascadePreview {
  // 1. Filter to lessons for this course, scheduled on or after fromDate, sorted ascending
  const affected = lessons
    .filter(
      (l) =>
        l.courseId === courseId &&
        l.scheduledDate !== null &&
        l.scheduledDate >= fromDate,
    )
    .sort((a, b) => a.scheduledDate!.localeCompare(b.scheduledDate!));

  const shifts: CascadeShift[] = [];
  const overflowLessons: Lesson[] = [];

  // 2. Walk through sorted lessons, assigning each to the next available meeting date
  let lastAssignedDate = fromDate;

  for (const lesson of affected) {
    const nextDate = getNextMeetingDate(
      lastAssignedDate,
      course,
      nonInstructionalDays,
      "forward",
      scheduleOverrides,
    );

    if (nextDate === null) {
      // Overflow — no available date within the school year
      overflowLessons.push(lesson);
      shifts.push({
        lesson,
        oldDate: lesson.scheduledDate!,
        newDate: null,
      });
    } else {
      // Only record a shift if the date actually changed
      if (lesson.scheduledDate !== nextDate) {
        shifts.push({
          lesson,
          oldDate: lesson.scheduledDate!,
          newDate: nextDate,
        });
      }
      lastAssignedDate = nextDate;
    }
  }

  return {
    shifts,
    overflowLessons,
    affectedCourseIds: [courseId],
  };
}

/**
 * Runs `buildCascadePreview` for each course ID and merges the results.
 */
export function buildMultiCourseCascadePreview(
  lessons: Lesson[],
  courseIds: string[],
  fromDate: string,
  courses: Record<string, Course>,
  nonInstructionalDays: NonInstructionalDay[],
  scheduleOverrides: ScheduleOverride[] = [],
): CascadePreview {
  const allShifts: CascadeShift[] = [];
  const allOverflow: Lesson[] = [];
  const allAffectedCourseIds: string[] = [];

  for (const courseId of courseIds) {
    const course = courses[courseId];
    if (!course) continue;

    const preview = buildCascadePreview(
      lessons,
      courseId,
      fromDate,
      course,
      nonInstructionalDays,
      scheduleOverrides,
    );

    allShifts.push(...preview.shifts);
    allOverflow.push(...preview.overflowLessons);
    allAffectedCourseIds.push(...preview.affectedCourseIds);
  }

  return {
    shifts: allShifts,
    overflowLessons: allOverflow,
    affectedCourseIds: allAffectedCourseIds,
  };
}

/**
 * Apply a cascade preview to the full lessons array (immutable update).
 *
 * - Lessons whose IDs are in `unscheduleIds` get their scheduledDate set to null.
 * - Lessons whose IDs appear in the preview shifts get their scheduledDate updated.
 * - All other lessons pass through unchanged.
 */
export function executeCascade(
  allLessons: Lesson[],
  preview: CascadePreview,
  unscheduleIds: Set<string>,
): Lesson[] {
  // Build a map: lesson ID → new date from shifts
  const shiftMap = new Map<string, string | null>();
  for (const shift of preview.shifts) {
    shiftMap.set(shift.lesson.id, shift.newDate);
  }

  return allLessons.map((lesson) => {
    if (unscheduleIds.has(lesson.id)) {
      return { ...lesson, scheduledDate: null };
    }

    if (shiftMap.has(lesson.id)) {
      return { ...lesson, scheduledDate: shiftMap.get(lesson.id) ?? null };
    }

    return lesson;
  });
}

/**
 * For multi-day disruptions: returns all lessons for the given course that are
 * scheduled between startDate and endDate (inclusive).
 */
export function countAffectedLessonsInRange(
  lessons: Lesson[],
  courseId: string,
  startDate: string,
  endDate: string,
): Lesson[] {
  return lessons.filter(
    (l) =>
      l.courseId === courseId &&
      l.scheduledDate !== null &&
      l.scheduledDate >= startDate &&
      l.scheduledDate <= endDate,
  );
}

/**
 * Multi-day disruption cascade builder.
 *
 * 1. Count how many meeting days for this course fall within the disruption range
 *    (startDate–endDate). These are the "lost" meeting days.
 * 2. Find all lessons scheduled on or after startDate, sorted by date.
 * 3. Lessons within the disruption range all need to shift forward.
 * 4. The cascade starts from the first meeting day AFTER endDate.
 * 5. Walk forward assigning each displaced lesson + subsequent lessons to sequential
 *    meeting dates. Overflow handling same as single-day.
 */
export function buildMultiDayCascadePreview(
  lessons: Lesson[],
  courseId: string,
  startDate: string,
  endDate: string,
  course: Course,
  nonInstructionalDays: NonInstructionalDay[],
  scheduleOverrides: ScheduleOverride[] = [],
): CascadePreview {
  // 1. Count lost meeting days in the disruption range
  //    (not strictly needed for the cascade logic, but useful context)
  //    We iterate through the range and count valid meeting dates.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _lostMeetingDays = 0;
  const rangeStart = stringToDate(startDate);
  const rangeEnd = stringToDate(endDate);
  const cursor = new Date(rangeStart);
  while (cursor <= rangeEnd) {
    const cursorStr = dateToString(cursor);
    if (
      isValidMeetingDate(
        cursorStr,
        course,
        nonInstructionalDays,
        scheduleOverrides,
      )
    ) {
      _lostMeetingDays++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  // 2. Find all lessons for this course scheduled on or after startDate, sorted by date
  const affected = lessons
    .filter(
      (l) =>
        l.courseId === courseId &&
        l.scheduledDate !== null &&
        l.scheduledDate >= startDate,
    )
    .sort((a, b) => a.scheduledDate!.localeCompare(b.scheduledDate!));

  const shifts: CascadeShift[] = [];
  const overflowLessons: Lesson[] = [];

  // 4. The cascade starts from the first meeting day AFTER endDate
  //    We use endDate as the anchor so getNextMeetingDate looks from the day after endDate
  let lastAssignedDate = endDate;

  // 5. Walk forward assigning each lesson to sequential meeting dates
  for (const lesson of affected) {
    const nextDate = getNextMeetingDate(
      lastAssignedDate,
      course,
      nonInstructionalDays,
      "forward",
      scheduleOverrides,
    );

    if (nextDate === null) {
      overflowLessons.push(lesson);
      shifts.push({
        lesson,
        oldDate: lesson.scheduledDate!,
        newDate: null,
      });
    } else {
      if (lesson.scheduledDate !== nextDate) {
        shifts.push({
          lesson,
          oldDate: lesson.scheduledDate!,
          newDate: nextDate,
        });
      }
      lastAssignedDate = nextDate;
    }
  }

  return {
    shifts,
    overflowLessons,
    affectedCourseIds: [courseId],
  };
}
