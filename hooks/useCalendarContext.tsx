"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  Lesson,
  NonInstructionalDay,
  ScheduleOverride,
  Role,
  ViewMode,
  CalendarSnapshot,
  DisruptionModalState,
  DisruptionModalMode,
  Course,
} from "@/types";
import { mockLessons } from "@/data/mockLessons";
import { mockHolidays } from "@/data/mockHolidays";
import { COURSES as INITIAL_COURSES } from "@/data/mockCourses";

const MAX_UNDO_STACK = 20;

type CalendarContextType = {
  // Existing
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  currentWeekStart: Date | null;
  setCurrentWeekStart: (date: Date | null) => void;
  activeCourses: Set<string>;
  setActiveCourses: (courses: Set<string>) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
  nonInstructionalDays: NonInstructionalDay[];
  setNonInstructionalDays: (days: NonInstructionalDay[]) => void;
  // Schedule overrides
  scheduleOverrides: ScheduleOverride[];
  addScheduleOverride: (override: ScheduleOverride) => void;
  removeScheduleOverride: (date: string) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  toasts: ToastMessage[];
  addToast: (message: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Course schedule management
  courses: Record<string, Course>;
  updateCourseMeetingDays: (courseId: string, meetingDays: number[]) => void;

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  pushSnapshot: (description: string) => void;
  undo: () => void;
  redo: () => void;

  // Disruption modal
  disruptionModal: DisruptionModalState;
  openDisruptionModal: (
    mode: DisruptionModalMode,
    targetDate: string,
    endDate?: string,
  ) => void;
  closeDisruptionModal: () => void;

  // Teacher absence modal
  teacherAbsenceModal: { isOpen: boolean; targetDate: string } | null;
  openTeacherAbsenceModal: (targetDate: string) => void;
  closeTeacherAbsenceModal: () => void;

  // Calendar upload modal
  calendarUploadModalOpen: boolean;
  openCalendarUploadModal: () => void;
  closeCalendarUploadModal: () => void;
};

export type ToastMessage = {
  id: string;
  message: string;
};

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export function CalendarProvider({ children }: { children: ReactNode }) {
  // Existing state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [currentView, setCurrentView] = useState<ViewMode>("month");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);
  const [activeCourses, setActiveCourses] = useState<Set<string>>(
    new Set(["junior-sem", "fresh-sem", "ninth-adv"]),
  );
  const [currentRole, setCurrentRole] = useState<Role>("admin");
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
  const [nonInstructionalDays, setNonInstructionalDays] =
    useState<NonInstructionalDay[]>(mockHolidays);
  const [scheduleOverrides, setScheduleOverrides] = useState<
    ScheduleOverride[]
  >([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Course schedule management - mutable copy so meetingDays can be changed
  const [courses, setCourses] = useState<Record<string, Course>>(() => {
    // Deep copy the initial courses
    const copy: Record<string, Course> = {};
    for (const [key, course] of Object.entries(INITIAL_COURSES)) {
      copy[key] = {
        ...course,
        meetingDays: [...course.meetingDays],
        unitColors: [...course.unitColors],
      };
    }
    return copy;
  });

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<CalendarSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<CalendarSnapshot[]>([]);

  // Disruption modal
  const [disruptionModal, setDisruptionModal] =
    useState<DisruptionModalState>(null);

  // Teacher absence modal
  const [teacherAbsenceModal, setTeacherAbsenceModal] = useState<{
    isOpen: boolean;
    targetDate: string;
  } | null>(null);

  // Calendar upload modal
  const [calendarUploadModalOpen, setCalendarUploadModalOpen] = useState(false);

  const addToast = useCallback((message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // --- Course schedule management ---
  const updateCourseMeetingDays = useCallback(
    (courseId: string, meetingDays: number[]) => {
      setCourses((prev) => {
        if (!prev[courseId]) return prev;
        return {
          ...prev,
          [courseId]: { ...prev[courseId], meetingDays: [...meetingDays] },
        };
      });
    },
    [],
  );

  // --- Undo/Redo ---
  const pushSnapshot = useCallback(
    (description: string) => {
      setUndoStack((prev) => {
        const snapshot: CalendarSnapshot = {
          lessons: [...lessons],
          nonInstructionalDays: [...nonInstructionalDays],
          description,
        };
        const newStack = [...prev, snapshot];
        // Trim stack to max size
        if (newStack.length > MAX_UNDO_STACK) {
          return newStack.slice(newStack.length - MAX_UNDO_STACK);
        }
        return newStack;
      });
      // Clear redo stack whenever a new action is taken
      setRedoStack([]);
    },
    [lessons, nonInstructionalDays],
  );

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const snapshot = newStack.pop()!;

      // Push current state to redo stack before restoring
      const currentSnapshot: CalendarSnapshot = {
        lessons,
        nonInstructionalDays,
        description: snapshot.description,
      };
      setRedoStack((redoPrev) => [...redoPrev, currentSnapshot]);

      // Restore the snapshot
      setLessons(snapshot.lessons);
      setNonInstructionalDays(snapshot.nonInstructionalDays);
      addToast(`↩ Undid: ${snapshot.description}`);

      return newStack;
    });
  }, [lessons, nonInstructionalDays, addToast]);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const snapshot = newStack.pop()!;

      // Push current state to undo stack before restoring
      const currentSnapshot: CalendarSnapshot = {
        lessons,
        nonInstructionalDays,
        description: snapshot.description,
      };
      setUndoStack((undoPrev) => [...undoPrev, currentSnapshot]);

      // Restore the snapshot
      setLessons(snapshot.lessons);
      setNonInstructionalDays(snapshot.nonInstructionalDays);
      addToast(`↪ Redid: ${snapshot.description}`);

      return newStack;
    });
  }, [lessons, nonInstructionalDays, addToast]);

  // --- Disruption modal ---
  const openDisruptionModal = useCallback(
    (mode: DisruptionModalMode, targetDate: string, endDate?: string) => {
      setDisruptionModal({
        isOpen: true,
        mode,
        targetDate,
        endDate,
      });
    },
    [],
  );

  const closeDisruptionModal = useCallback(() => {
    setDisruptionModal(null);
  }, []);

  // --- Teacher absence modal ---
  const openTeacherAbsenceModal = useCallback((targetDate: string) => {
    setTeacherAbsenceModal({ isOpen: true, targetDate });
  }, []);

  const closeTeacherAbsenceModal = useCallback(() => {
    setTeacherAbsenceModal(null);
  }, []);

  // --- Calendar upload modal ---
  const openCalendarUploadModal = useCallback(() => {
    setCalendarUploadModalOpen(true);
  }, []);

  const closeCalendarUploadModal = useCallback(() => {
    setCalendarUploadModalOpen(false);
  }, []);

  // --- Schedule overrides ---
  const addScheduleOverride = useCallback((override: ScheduleOverride) => {
    setScheduleOverrides((prev) => {
      // Replace if same date exists, otherwise add
      const filtered = prev.filter((o) => o.date !== override.date);
      return [...filtered, override];
    });
  }, []);

  const removeScheduleOverride = useCallback((date: string) => {
    setScheduleOverrides((prev) => prev.filter((o) => o.date !== date));
  }, []);

  return (
    <CalendarContext.Provider
      value={{
        // Existing
        currentDate,
        setCurrentDate,
        currentView,
        setCurrentView,
        currentWeekStart,
        setCurrentWeekStart,
        activeCourses,
        setActiveCourses,
        currentRole,
        setCurrentRole,
        lessons,
        setLessons,
        nonInstructionalDays,
        setNonInstructionalDays,
        // Schedule overrides
        scheduleOverrides,
        addScheduleOverride,
        removeScheduleOverride,
        selectedLessonId,
        setSelectedLessonId,
        toasts,
        addToast,
        sidebarCollapsed,
        setSidebarCollapsed,

        // Course schedule management
        courses,
        updateCourseMeetingDays,

        // Undo/Redo
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        pushSnapshot,
        undo,
        redo,

        // Disruption modal
        disruptionModal,
        openDisruptionModal,
        closeDisruptionModal,

        // Teacher absence modal
        teacherAbsenceModal,
        openTeacherAbsenceModal,
        closeTeacherAbsenceModal,

        // Calendar upload modal
        calendarUploadModalOpen,
        openCalendarUploadModal,
        closeCalendarUploadModal,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider",
    );
  }
  return context;
}
