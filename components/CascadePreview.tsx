'use client';

import { CascadePreview as CascadePreviewType, Lesson } from '@/types';
import { useCalendarContext } from '@/hooks/useCalendarContext';
import { format } from 'date-fns';

type CascadePreviewProps = {
  preview: CascadePreviewType;
  selectedForRemoval: Set<string>;
  onToggleRemoval: (lessonId: string) => void;
  maxHeight?: string;
};

export default function CascadePreview({
  preview,
  selectedForRemoval,
  onToggleRemoval,
  maxHeight = '300px',
}: CascadePreviewProps) {
  const { courses } = useCalendarContext();

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr + 'T12:00:00'), 'MMM d');
  };

  // Group shifts by course
  const shiftsByCourse: Record<string, typeof preview.shifts> = {};
  for (const shift of preview.shifts) {
    const courseId = shift.lesson.courseId;
    if (!shiftsByCourse[courseId]) shiftsByCourse[courseId] = [];
    shiftsByCourse[courseId].push(shift);
  }

  const totalShifts = preview.shifts.filter((s) => s.newDate !== null).length;
  const totalOverflow = preview.overflowLessons.length;

  if (preview.shifts.length === 0) {
    return (
      <div className="text-[13px] text-text-muted py-3 px-4 bg-bg rounded-lg border border-border">
        No lessons need to be rescheduled.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Summary header */}
      <div className="bg-bg px-4 py-[10px] border-b border-border flex items-center justify-between">
        <div className="text-[12px] font-semibold text-text">
          📋 {totalShifts} lesson{totalShifts !== 1 ? 's' : ''} will shift forward
        </div>
        {totalOverflow > 0 && (
          <div className="text-[11px] font-medium text-red-600 flex items-center gap-1">
            ⚠️ {totalOverflow} overflow
          </div>
        )}
      </div>

      {/* Shifts list */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {Object.entries(shiftsByCourse).map(([courseId, shifts]) => {
          const course = courses[courseId];
          if (!course) return null;

          return (
            <div key={courseId}>
              {/* Course header */}
              <div className="px-4 py-[6px] bg-neutral-50 border-b border-border flex items-center gap-[6px]">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: course.color }}
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted">
                  {course.name} — {shifts.length} lesson{shifts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Lesson shifts */}
              {shifts.map((shift) => {
                const isOverflow = shift.newDate === null;
                const isSelectedForRemoval = selectedForRemoval.has(shift.lesson.id);

                return (
                  <div
                    key={shift.lesson.id}
                    className={`px-4 py-[8px] border-b border-border-light flex items-center gap-3 text-[12px] ${
                      isOverflow ? 'bg-red-25' : ''
                    } ${isSelectedForRemoval ? 'bg-yellow-25' : ''}`}
                  >
                    {/* Checkbox for removal selection */}
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelectedForRemoval}
                        onChange={() => onToggleRemoval(shift.lesson.id)}
                        className="w-[14px] h-[14px] rounded cursor-pointer accent-yellow-700 flex-shrink-0"
                      />
                      <span
                        className={`font-medium truncate ${isSelectedForRemoval ? 'line-through text-text-muted' : 'text-text'}`}
                      >
                        {shift.lesson.title}
                      </span>
                    </label>

                    {/* Date shift visualization */}
                    <div className="flex items-center gap-[6px] flex-shrink-0 text-[11px] text-text-muted">
                      <span>{formatDate(shift.oldDate)}</span>
                      <span className="text-[10px]">→</span>
                      {isOverflow ? (
                        <span className="text-red-600 font-medium">No date</span>
                      ) : (
                        <span className="font-medium text-text">{formatDate(shift.newDate!)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer - removal help text */}
      {preview.shifts.length > 0 && (
        <div className="bg-yellow-25 px-4 py-[8px] border-t border-border text-[11px] text-text-muted flex items-center gap-[6px]">
          <span>☑️</span>
          <span>Check lessons to move them back to the Lesson Bank instead of rescheduling</span>
        </div>
      )}
    </div>
  );
}
