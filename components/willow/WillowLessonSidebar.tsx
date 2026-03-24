"use client";

import { useState, useMemo, useCallback } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import { computeSidebarData } from "@/utils/willowUtils";

export default function WillowLessonSidebar() {
  const { partners, willowLessonFilter, setWillowLessonFilter } =
    useCalendarContext();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedUnits, setCollapsedUnits] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarData = useMemo(
    () => computeSidebarData(partners),
    [partners],
  );

  // Filter units/lessons by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sidebarData;
    const q = searchQuery.toLowerCase();
    return sidebarData
      .map((unit) => ({
        ...unit,
        lessons: unit.lessons.filter((l) =>
          l.title.toLowerCase().includes(q),
        ),
      }))
      .filter((unit) => unit.lessons.length > 0);
  }, [sidebarData, searchQuery]);

  const toggleUnit = useCallback((unitName: string) => {
    setCollapsedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitName)) {
        next.delete(unitName);
      } else {
        next.add(unitName);
      }
      return next;
    });
  }, []);

  return (
    <div
      className={`bg-surface border-r border-border flex flex-col transition-all duration-300 overflow-hidden ${
        collapsed ? "w-12 min-w-[48px]" : "w-[260px] min-w-[260px]"
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-[14px] border-b border-border flex items-center flex-shrink-0 ${
          collapsed ? "justify-center px-[10px]" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="text-[13px] font-semibold flex items-center gap-2 whitespace-nowrap">
            All Lessons
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-[26px] h-[26px] rounded-md border border-border bg-surface cursor-pointer flex items-center justify-center text-text-muted text-[12px] flex-shrink-0 transition-all hover:bg-bg hover:text-text"
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Search bar */}
      {!collapsed && (
        <div className="px-2 py-2 border-b border-border flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-7 py-[5px] text-[12px] border border-border rounded-md bg-bg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-text-muted"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-text-muted/50">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-text-muted hover:text-text"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lesson list grouped by unit */}
      {!collapsed && (
        <div className="overflow-y-auto flex-1">
          {filteredData.map((unit) => {
            const isUnitCollapsed = collapsedUnits.has(unit.unitName);

            return (
              <div key={unit.unitName} className="border-b border-border last:border-b-0">
                {/* Unit header — collapsible */}
                <button
                  onClick={() => toggleUnit(unit.unitName)}
                  className="w-full text-left px-3 py-[8px] flex items-center gap-2 hover:bg-bg transition-colors"
                >
                  <span className="text-[10px] text-text-muted transition-transform" style={{ transform: isUnitCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>
                    ▼
                  </span>
                  <span className="text-[11px] font-semibold text-text-muted leading-tight flex-1">
                    {unit.unitName}
                  </span>
                  <span className="text-[10px] text-text-muted/60 flex-shrink-0">
                    {unit.lessons.length}
                  </span>
                </button>

                {/* Lessons */}
                {!isUnitCollapsed && (
                  <div className="pb-[6px]">
                    {unit.lessons.map((lesson) => {
                      const isActive = willowLessonFilter === lesson.title;
                      return (
                        <button
                          key={`${unit.unitName}-${lesson.title}`}
                          onClick={() =>
                            setWillowLessonFilter(
                              isActive ? null : lesson.title,
                            )
                          }
                          className={`w-full text-left px-3 py-[4px] text-[12px] transition-all flex items-center gap-[6px] group ${
                            isActive
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-text hover:bg-bg"
                          }`}
                          title={`${lesson.scheduledCount} of ${lesson.totalSchools} schools have this scheduled`}
                        >
                          {/* Lesson number */}
                          <span
                            className={`flex-shrink-0 text-[10px] w-[18px] text-right ${
                              isActive ? "text-blue-500" : "text-text-muted/50"
                            }`}
                          >
                            {lesson.lessonNumber}.
                          </span>

                          {/* Title */}
                          <span className="truncate flex-1">
                            {lesson.title}
                          </span>

                          {/* Scheduled count badge */}
                          <span
                            className={`flex-shrink-0 text-[10px] font-medium rounded-full px-[6px] py-[1px] ${
                              isActive
                                ? "bg-blue-200 text-blue-700"
                                : lesson.scheduledCount === lesson.totalSchools
                                  ? "bg-green-100 text-green-700"
                                  : lesson.scheduledCount === 0
                                    ? "bg-bg text-text-muted/50"
                                    : "bg-bg text-text-muted"
                            }`}
                          >
                            {lesson.scheduledCount}/{lesson.totalSchools}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
