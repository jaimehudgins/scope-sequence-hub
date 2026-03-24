"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import {
  WillowLessonRow,
  sortWillowRows,
  SortKey,
  SortDirection,
} from "@/utils/willowUtils";

type WillowListViewProps = {
  data: WillowLessonRow[];
};

function WillowNoteCell({
  partnerId,
  lessonId,
  currentNote,
}: {
  partnerId: string;
  lessonId: string;
  currentNote?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(currentNote || "");
  const { updateWillowNote } = useCalendarContext();

  if (!editing) {
    return (
      <div
        onClick={() => {
          setText(currentNote || "");
          setEditing(true);
        }}
        className="cursor-pointer min-h-[24px] px-2 py-1 rounded hover:bg-bg transition-colors"
      >
        {currentNote ? (
          <span className="text-[12px] text-text">{currentNote}</span>
        ) : (
          <span className="text-[12px] text-text-muted italic">+ Add note</span>
        )}
      </div>
    );
  }

  return (
    <textarea
      autoFocus
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        updateWillowNote(partnerId, lessonId, text);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          updateWillowNote(partnerId, lessonId, text);
          setEditing(false);
        }
        if (e.key === "Escape") {
          setEditing(false);
        }
      }}
      className="w-full px-2 py-1 text-[12px] border border-border rounded bg-surface focus:outline-none focus:border-text-muted resize-none"
      rows={2}
    />
  );
}

export default function WillowListView({ data }: WillowListViewProps) {
  const { willowLessonFilter, setWillowLessonFilter } = useCalendarContext();
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: "date", direction: "asc" });

  const sortedData = sortWillowRows(data, sortConfig.key, sortConfig.direction);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: SortKey;
  }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <button
        onClick={() => handleSort(sortKey)}
        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted hover:text-text transition-colors"
      >
        {label}
        {isActive && (
          <span className="text-[10px]">
            {sortConfig.direction === "asc" ? "▲" : "▼"}
          </span>
        )}
      </button>
    );
  };

  if (sortedData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[40px] mb-2">🔍</div>
          <div className="text-[14px] text-text-muted">
            No scheduled lessons match your filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-6 py-4">
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[100px_140px_140px_200px_160px_180px_1fr] gap-0 bg-bg border-b border-border">
          <div className="px-3 py-2">
            <SortHeader label="Date" sortKey="date" />
          </div>
          <div className="px-3 py-2">
            <SortHeader label="School" sortKey="school" />
          </div>
          <div className="px-3 py-2">
            <SortHeader label="Course" sortKey="course" />
          </div>
          <div className="px-3 py-2">
            <SortHeader label="Lesson" sortKey="lesson" />
          </div>
          <div className="px-3 py-2">
            <SortHeader label="Unit" sortKey="unit" />
          </div>
          <div className="px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted">
              Teacher Note
            </span>
          </div>
          <div className="px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted">
              Willow Note
            </span>
          </div>
        </div>

        {/* Table body */}
        {sortedData.map((row) => {
          const dateObj = row.lesson.scheduledDate
            ? new Date(row.lesson.scheduledDate + "T12:00:00")
            : null;
          const dateStr = dateObj ? format(dateObj, "MMM d, yyyy") : "";
          const dayStr = dateObj ? format(dateObj, "EEE") : "";

          return (
            <div
              key={`${row.partnerId}-${row.lesson.id}`}
              className="grid grid-cols-[100px_140px_140px_200px_160px_180px_1fr] gap-0 border-b border-border last:border-b-0 bg-surface hover:bg-bg/50 transition-colors"
              style={{ borderLeft: `3px solid ${row.courseColor}` }}
            >
              {/* Date */}
              <div className="px-3 py-2 flex flex-col justify-center">
                <span className="text-[12px] font-medium text-text">
                  {dateStr}
                </span>
                <span className="text-[10px] text-text-muted">{dayStr}</span>
              </div>

              {/* School */}
              <div className="px-3 py-2 flex items-center gap-2">
                <div
                  className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: row.partnerColor }}
                />
                <span className="text-[12px] text-text truncate">
                  {row.partnerName}
                </span>
              </div>

              {/* Course */}
              <div className="px-3 py-2 flex items-center">
                <span className="text-[12px] text-text truncate">
                  {row.courseName}
                </span>
              </div>

              {/* Lesson */}
              <div className="px-3 py-2 flex flex-col justify-center">
                <button
                  onClick={() =>
                    setWillowLessonFilter(
                      willowLessonFilter === row.lesson.title
                        ? null
                        : row.lesson.title,
                    )
                  }
                  className={`text-[12px] font-medium truncate text-left transition-colors ${
                    willowLessonFilter === row.lesson.title
                      ? "text-blue-600"
                      : "text-text hover:text-blue-600"
                  }`}
                  title={`Click to see "${row.lesson.title}" across all schools`}
                >
                  {row.lesson.title}
                </button>
                <span className="text-[10px] text-text-muted">
                  Lesson {row.lesson.lessonNumber}
                  {row.lesson.isMilestone && " 🏁"}
                </span>
              </div>

              {/* Unit */}
              <div className="px-3 py-2 flex items-center">
                <span className="text-[12px] text-text-muted truncate">
                  {row.lesson.unitName}
                </span>
              </div>

              {/* Teacher Note */}
              <div className="px-3 py-2 flex items-center">
                {row.lesson.teacherNote ? (
                  <div className="group relative">
                    <span className="text-[12px] text-text-muted truncate block max-w-[160px]">
                      {row.lesson.teacherNoteFlagged && "🚩 "}
                      {row.lesson.teacherNote}
                    </span>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50">
                      <div className="bg-text text-surface text-[11px] px-3 py-2 rounded-lg shadow-lg max-w-[250px] whitespace-normal">
                        {row.lesson.teacherNote}
                        {row.lesson.teacherNoteAuthor && (
                          <div className="text-[10px] opacity-70 mt-1">
                            — {row.lesson.teacherNoteAuthor}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-[12px] text-text-muted/40">—</span>
                )}
              </div>

              {/* Willow Note */}
              <div className="px-3 py-2 flex items-center">
                <WillowNoteCell
                  partnerId={row.partnerId}
                  lessonId={row.lesson.id}
                  currentNote={row.lesson.willowNote}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
