import { Partner, Lesson } from "@/types";

export type WillowLessonRow = {
  partnerId: string;
  partnerName: string;
  partnerColor: string;
  lesson: Lesson;
  courseName: string;
  courseColor: string;
};

export function computeFilteredLessons(
  partners: Partner[],
  schoolFilter: string[],
  courseFilter: string[],
  dateRange: { start: string; end: string } | null,
  lessonFilter?: string | null,
): WillowLessonRow[] {
  const rows: WillowLessonRow[] = [];

  for (const partner of partners) {
    // Skip if school filter is active and this school is not included
    if (schoolFilter.length > 0 && !schoolFilter.includes(partner.id)) continue;

    const courseMap = new Map(partner.courses.map((c) => [c.id, c]));

    for (const lesson of partner.lessons) {
      // Only show scheduled lessons
      if (!lesson.scheduledDate) continue;

      const course = courseMap.get(lesson.courseId);
      if (!course) continue;

      // Course name filter
      if (courseFilter.length > 0 && !courseFilter.includes(course.name)) continue;

      // Lesson title filter
      if (lessonFilter && lesson.title !== lessonFilter) continue;

      // Date range filter
      if (dateRange) {
        if (lesson.scheduledDate < dateRange.start || lesson.scheduledDate > dateRange.end) continue;
      }

      rows.push({
        partnerId: partner.id,
        partnerName: partner.name,
        partnerColor: partner.color,
        lesson,
        courseName: course.name,
        courseColor: course.color,
      });
    }
  }

  return rows;
}

export type SortKey = "date" | "school" | "course" | "lesson" | "unit";
export type SortDirection = "asc" | "desc";

export function sortWillowRows(
  rows: WillowLessonRow[],
  key: SortKey,
  direction: SortDirection,
): WillowLessonRow[] {
  return [...rows].sort((a, b) => {
    let valA: string;
    let valB: string;

    switch (key) {
      case "date":
        valA = a.lesson.scheduledDate || "";
        valB = b.lesson.scheduledDate || "";
        break;
      case "school":
        valA = a.partnerName;
        valB = b.partnerName;
        break;
      case "course":
        valA = a.courseName;
        valB = b.courseName;
        break;
      case "lesson":
        valA = a.lesson.title;
        valB = b.lesson.title;
        break;
      case "unit":
        valA = a.lesson.unitName;
        valB = b.lesson.unitName;
        break;
      default:
        valA = "";
        valB = "";
    }

    const cmp = valA.localeCompare(valB);
    return direction === "asc" ? cmp : -cmp;
  });
}

// Get all unique course names across all partners
export function getUniqueCourseNames(partners: Partner[]): string[] {
  const names = new Set<string>();
  for (const partner of partners) {
    for (const course of partner.courses) {
      names.add(course.name);
    }
  }
  return Array.from(names).sort();
}

// Sidebar data: lessons grouped by unit (flat), with scheduled-school counts
export type SidebarLesson = {
  lessonNumber: number; // display number within the unit (1-based)
  title: string;
  scheduledCount: number; // how many schools have this lesson scheduled
  totalSchools: number;   // total schools in the system
};

export type SidebarUnit = {
  unitName: string;
  lessons: SidebarLesson[];
};

export function computeSidebarData(partners: Partner[]): SidebarUnit[] {
  const totalSchools = partners.length;

  // Step 1: Build unique units with their lessons (order-preserved)
  // Units share names across courses, so we deduplicate by unitName
  const unitMap = new Map<string, string[]>(); // unitName -> lessonTitles[]

  for (const partner of partners) {
    for (const lesson of partner.lessons) {
      if (!unitMap.has(lesson.unitName)) {
        unitMap.set(lesson.unitName, []);
      }
      const titles = unitMap.get(lesson.unitName)!;
      if (!titles.includes(lesson.title)) {
        titles.push(lesson.title);
      }
    }
  }

  // Step 2: Count how many schools have each lesson scheduled (by title)
  const scheduledCounts = new Map<string, Set<string>>(); // title -> Set of partnerIds

  for (const partner of partners) {
    for (const lesson of partner.lessons) {
      if (!lesson.scheduledDate) continue;
      if (!scheduledCounts.has(lesson.title)) {
        scheduledCounts.set(lesson.title, new Set());
      }
      scheduledCounts.get(lesson.title)!.add(partner.id);
    }
  }

  // Step 3: Build the output
  const result: SidebarUnit[] = [];

  for (const [unitName, lessonTitles] of unitMap) {
    const lessons: SidebarLesson[] = lessonTitles.map((title, idx) => ({
      lessonNumber: idx + 1,
      title,
      scheduledCount: scheduledCounts.get(title)?.size || 0,
      totalSchools,
    }));
    result.push({ unitName, lessons });
  }

  return result;
}
