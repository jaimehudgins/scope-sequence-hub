'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lesson, NonInstructionalDay, Role, ViewMode } from '@/types';
import { mockLessons } from '@/data/mockLessons';
import { mockHolidays } from '@/data/mockHolidays';

type CalendarContextType = {
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
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  toasts: ToastMessage[];
  addToast: (message: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

export type ToastMessage = {
  id: string;
  message: string;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [currentView, setCurrentView] = useState<ViewMode>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);
  const [activeCourses, setActiveCourses] = useState<Set<string>>(
    new Set(['junior-sem', 'fresh-sem', 'ninth-adv'])
  );
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
  const [nonInstructionalDays, setNonInstructionalDays] = useState<NonInstructionalDay[]>(mockHolidays);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const addToast = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <CalendarContext.Provider
      value={{
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
        selectedLessonId,
        setSelectedLessonId,
        toasts,
        addToast,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
}
