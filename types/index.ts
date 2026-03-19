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

export type DisruptionModalMode = "cancel-day" | "insert-school-created";

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
