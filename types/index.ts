export type Role = "admin" | "curriculum_lead" | "teacher" | "counselor";

export type Course = {
  id: string;
  name: string;
  gradeLevel: number;
  lessonDuration: number;
  color: string;
  unitColors: string[];
  meetingDays: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
};

export type Unit = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
};

export type LessonType = "curriculum" | "school-created";

export type Lesson = {
  id: string;
  courseId: string;
  unitName: string;
  unitIndex: number;
  lessonNumber: number;
  title: string;
  description: string;
  scheduledDate: string | null;
  duration: number;
  isMilestone: boolean;
  hasAlmaIntegration: boolean;
  platformUrl: string;
  type?: LessonType;
  schoolCreatedTitle?: string;
  schoolCreatedDescription?: string;
};

export type NonInstructionalDay = {
  date: string;
  label: string;
  type?:
    | "holiday"
    | "pd"
    | "school-closed"
    | "conference"
    | "testing"
    | "snow"
    | "sick"
    | "assembly"
    | "other";
  teacherName?: string; // For teacher-specific absences
  shouldCascade?: boolean; // If false, lessons won't shift (default: true)
};

export type ScheduleOverride = {
  date: string; // The actual calendar date, e.g. "2026-03-20"
  runsAsDayOfWeek: number; // Which day-of-week schedule to follow (0=Sun..6=Sat)
  label?: string; // e.g. "Wed schedule"
};

export type ViewMode = "month" | "week";

export type CalendarSnapshot = {
  lessons: Lesson[];
  nonInstructionalDays: NonInstructionalDay[];
  description: string;
};

export type CascadeShift = {
  lesson: Lesson;
  oldDate: string;
  newDate: string | null; // null means overflowed — no available date
};

export type CascadePreview = {
  shifts: CascadeShift[];
  overflowLessons: Lesson[];
  affectedCourseIds: string[];
};

export type DisruptionModalMode =
  | "cancel-day"
  | "insert-school-created"
  | "schedule-override";

export type DisruptionModalState = {
  isOpen: boolean;
  mode: DisruptionModalMode;
  targetDate: string;
  endDate?: string; // for multi-day disruptions
} | null;

export type CalendarState = {
  currentDate: Date;
  currentView: ViewMode;
  currentWeekStart: Date | null;
  activeCourses: Set<string>;
  currentRole: Role;
  lessons: Lesson[];
  nonInstructionalDays: NonInstructionalDay[];
};
