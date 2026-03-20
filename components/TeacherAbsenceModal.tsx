"use client";

import { useState, useEffect } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";

export default function TeacherAbsenceModal({
  isOpen,
  onClose,
  initialDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialDate: string;
}) {
  const { nonInstructionalDays, setNonInstructionalDays, pushSnapshot, addToast } =
    useCalendarContext();

  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(initialDate);
  const [note, setNote] = useState("");
  const [teacherName, setTeacherName] = useState("");

  // Update dates when modal opens with new initialDate
  useEffect(() => {
    if (isOpen && initialDate) {
      setStartDate(initialDate);
      setEndDate(initialDate);
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!teacherName.trim()) {
      addToast("Please enter your name");
      return;
    }

    pushSnapshot("Mark teacher absence");

    // Generate all dates in the range
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      dates.push(dateStr);
    }

    // Create absence events for each date
    const newAbsences = dates.map((date) => ({
      date,
      label: note.trim() || `${teacherName} Absent`,
      type: "other" as any,
      teacherName: teacherName.trim(),
      shouldCascade: false, // Teacher absences don't shift lessons
    }));

    // Add to non-instructional days
    setNonInstructionalDays([...nonInstructionalDays, ...newAbsences]);

    const dateRange =
      dates.length === 1
        ? new Date(startDate).toLocaleDateString()
        : `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;

    addToast(`Marked ${teacherName} absent for ${dateRange}`);

    // Reset and close
    setStartDate(initialDate);
    setEndDate(initialDate);
    setNote("");
    setTeacherName("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        style={{ pointerEvents: 'auto' }}
      >
        <h2 className="text-xl font-bold text-text mb-4">Mark Absence</h2>

        {/* Teacher Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="e.g., Ms. Smith"
            className="w-full border border-border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Date Range */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text mb-1">
            Date Range
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              className="flex-1 border border-border rounded px-3 py-2 text-sm"
            />
            <span className="text-text-muted">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="flex-1 border border-border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Optional Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional details..."
            className="w-full border border-border rounded px-3 py-2 text-sm"
          />
          <p className="text-xs text-text-muted mt-1">
            Note: This will not shift any lessons on the calendar
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-junior-sem text-white rounded text-sm hover:bg-junior-sem/90 transition-colors"
          >
            Mark Absent
          </button>
        </div>
      </div>
    </div>
  );
}
