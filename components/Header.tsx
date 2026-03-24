"use client";

import { useCalendarContext } from "@/hooks/useCalendarContext";

export default function Header() {
  const {
    currentRole,
    setCurrentRole,
    addToast,
    canUndo,
    canRedo,
    undo,
    redo,
    lessons,
    courses,
    openCalendarUploadModal,
  } = useCalendarContext();

  const handleRoleChange = (role: "admin" | "teacher" | "willow_admin") => {
    setCurrentRole(role);
    if (role === "admin") {
      addToast("🔓 Admin mode — drag & drop enabled");
    } else if (role === "willow_admin") {
      addToast("🌿 Willow Admin — aggregate view across all schools");
    } else {
      addToast("🔒 Teacher mode — view only");
    }
  };

  const handleExportCSV = () => {
    // Sort lessons by course and scheduled date
    const sortedLessons = [...lessons].sort((a, b) => {
      // First sort by course
      const courseA = courses[a.courseId]?.name || a.courseId;
      const courseB = courses[b.courseId]?.name || b.courseId;
      if (courseA !== courseB) return courseA.localeCompare(courseB);

      // Then by scheduled date (nulls at the end)
      if (!a.scheduledDate && !b.scheduledDate) return 0;
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return a.scheduledDate.localeCompare(b.scheduledDate);
    });

    // Create CSV header
    const headers = [
      'Course',
      'Unit',
      'Lesson Number',
      'Lesson Title',
      'Scheduled Date',
      'Duration (min)',
      'Type',
      'Milestone',
      'Description',
      'Platform URL'
    ];

    // Create CSV rows
    const rows = sortedLessons.map(lesson => {
      const course = courses[lesson.courseId];
      return [
        course?.name || lesson.courseId,
        lesson.unitName,
        lesson.lessonNumber,
        lesson.title || lesson.schoolCreatedTitle || '',
        lesson.scheduledDate || 'Unscheduled',
        lesson.duration,
        lesson.type || 'curriculum',
        lesson.isMilestone ? 'Yes' : 'No',
        lesson.description || lesson.schoolCreatedDescription || '',
        lesson.platformUrl || ''
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          // Escape cells that contain commas, quotes, or newlines
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scope-sequence-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('📊 Exported scope & sequence to CSV');
  };

  return (
    <div className="bg-surface border-b border-border px-8 py-[14px] flex items-center justify-between sticky top-0 z-[100]">
      <div className="flex items-center gap-4">
        <div className="font-serif text-[22px] font-bold text-text tracking-[-0.5px]">
          <span className="text-green-700">W</span> Willow
        </div>
        <div className="text-[14px] text-text-muted pl-4 border-l border-border">
          Scope & Sequence
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Import Calendar button - Admin only */}
        {currentRole === "admin" && (
          <button
            onClick={openCalendarUploadModal}
            className="px-3 py-2 border border-border rounded-lg text-[13px] font-medium text-text-muted hover:bg-bg hover:text-text transition-all flex items-center gap-2"
            title="Import non-instructional days"
          >
            <span>📅</span>
            <span>Import Calendar</span>
          </button>
        )}

        {/* Export button - hidden for Willow Admin */}
        {currentRole !== "willow_admin" && (
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 border border-border rounded-lg text-[13px] font-medium text-text-muted hover:bg-bg hover:text-text transition-all flex items-center gap-2"
            title="Export to CSV"
          >
            <span>📊</span>
            <span>Export CSV</span>
          </button>
        )}

        {/* Undo/Redo buttons - only visible for admin when there's something to undo/redo */}
        {currentRole === "admin" && (canUndo || canRedo) && (
          <div className="flex items-center gap-1 mr-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] transition-all
                ${
                  canUndo
                    ? "border-border bg-surface text-text-muted cursor-pointer hover:bg-bg hover:text-text"
                    : "border-transparent bg-transparent text-[#ddd] cursor-not-allowed"
                }`}
              title="Undo (Ctrl+Z)"
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] transition-all
                ${
                  canRedo
                    ? "border-border bg-surface text-text-muted cursor-pointer hover:bg-bg hover:text-text"
                    : "border-transparent bg-transparent text-[#ddd] cursor-not-allowed"
                }`}
              title="Redo (Ctrl+Y)"
            >
              ↪
            </button>
          </div>
        )}

        <div className="flex bg-bg rounded-lg p-[3px] border border-border">
          <button
            onClick={() => handleRoleChange("admin")}
            className={`px-[14px] py-[6px] rounded-md border-none text-[13px] font-medium transition-all ${
              currentRole === "admin"
                ? "bg-surface text-text shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "bg-transparent text-text-muted"
            }`}
          >
            Admin View
          </button>
          <button
            onClick={() => handleRoleChange("teacher")}
            className={`px-[14px] py-[6px] rounded-md border-none text-[13px] font-medium transition-all ${
              currentRole === "teacher"
                ? "bg-surface text-text shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "bg-transparent text-text-muted"
            }`}
          >
            Teacher View
          </button>
          <button
            onClick={() => handleRoleChange("willow_admin")}
            className={`px-[14px] py-[6px] rounded-md border-none text-[13px] font-medium transition-all ${
              currentRole === "willow_admin"
                ? "bg-surface text-text shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "bg-transparent text-text-muted"
            }`}
          >
            Willow Admin
          </button>
        </div>
      </div>
    </div>
  );
}
