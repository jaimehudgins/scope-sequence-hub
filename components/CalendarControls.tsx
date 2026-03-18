'use client';

import { useCalendarContext } from '@/hooks/useCalendarContext';
import CourseToggle from './CourseToggle';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarControls() {
  const {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
    currentWeekStart,
    setCurrentWeekStart,
  } = useCalendarContext();

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  const navPrev = () => {
    if (currentView === 'month') {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    } else {
      const newWeekStart = new Date(currentWeekStart!);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      setCurrentWeekStart(newWeekStart);
    }
  };

  const navNext = () => {
    if (currentView === 'month') {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
    } else {
      const newWeekStart = new Date(currentWeekStart!);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      setCurrentWeekStart(newWeekStart);
    }
  };

  const goToday = () => {
    const today = new Date();
    const newDate = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentDate(newDate);
    setCurrentWeekStart(getMonday(today));
  };

  const getNavTitle = () => {
    if (currentView === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      if (!currentWeekStart) return '';
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 4);
      const startStr = `${monthNames[currentWeekStart.getMonth()]} ${currentWeekStart.getDate()}`;
      const endStr =
        currentWeekStart.getMonth() === end.getMonth()
          ? `${end.getDate()}`
          : `${monthNames[end.getMonth()]} ${end.getDate()}`;
      return `${startStr} – ${endStr}, ${end.getFullYear()}`;
    }
  };

  const handleViewChange = (view: 'month' | 'week') => {
    setCurrentView(view);
    if (view === 'week' && !currentWeekStart) {
      setCurrentWeekStart(getMonday(currentDate));
    }
  };

  return (
    <div className="px-6 py-[10px] flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-[10px]">
          <button
            onClick={navPrev}
            className="w-8 h-8 rounded-lg border border-border bg-surface cursor-pointer flex items-center justify-center text-[15px] text-text-muted transition-all hover:bg-bg hover:text-text"
          >
            ←
          </button>
          <h2 className="font-serif text-[20px] font-semibold min-w-[190px] text-center">
            {getNavTitle()}
          </h2>
          <button
            onClick={navNext}
            className="w-8 h-8 rounded-lg border border-border bg-surface cursor-pointer flex items-center justify-center text-[15px] text-text-muted transition-all hover:bg-bg hover:text-text"
          >
            →
          </button>
          <button
            onClick={goToday}
            className="px-3 py-[5px] rounded-lg border border-border bg-surface cursor-pointer text-[12px] font-medium text-text-muted transition-all hover:bg-bg hover:text-text"
          >
            Today
          </button>
        </div>

        <div className="flex bg-bg rounded-lg p-[3px] border border-border">
          <button
            onClick={() => handleViewChange('month')}
            className={`px-3 py-[5px] rounded-md border-none text-[12px] font-medium transition-all ${
              currentView === 'month'
                ? 'bg-surface text-text shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-text-muted'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange('week')}
            className={`px-3 py-[5px] rounded-md border-none text-[12px] font-medium transition-all ${
              currentView === 'week'
                ? 'bg-surface text-text shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-text-muted'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <CourseToggle />
    </div>
  );
}
