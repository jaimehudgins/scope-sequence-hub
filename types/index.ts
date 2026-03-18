export type Role = "admin" | "curriculum_lead" | "teacher" | "counselor";

export type Course = {
  id: string;
  name: string;
  gradeLevel: number;
  lessonDuration: number;
  color: string;
  unitColors: string[];
};

export type Unit = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
};

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
};

export type NonInstructionalDay = {
  date: string;
  label: string;
  type?: 'holiday' | 'pd' | 'school-closed' | 'conference' | 'testing' | 'snow' | 'other';
};

export type ViewMode = 'month' | 'week';

export type CalendarState = {
  currentDate: Date;
  currentView: ViewMode;
  currentWeekStart: Date | null;
  activeCourses: Set<string>;
  currentRole: Role;
  lessons: Lesson[];
  nonInstructionalDays: NonInstructionalDay[];
};
