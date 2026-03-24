"use client";

import { useState, useRef, useEffect } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import { getUniqueCourseNames } from "@/utils/willowUtils";

type WillowControlsProps = {
  totalLessons: number;
};

export default function WillowControls({ totalLessons }: WillowControlsProps) {
  const {
    partners,
    willowSchoolFilter,
    setWillowSchoolFilter,
    willowCourseFilter,
    setWillowCourseFilter,
    willowDateRange,
    setWillowDateRange,
    willowLessonFilter,
    setWillowLessonFilter,
  } = useCalendarContext();

  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSchoolDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const courseNames = getUniqueCourseNames(partners, willowSchoolFilter);

  // Clear course filters that are no longer available when school selection changes
  useEffect(() => {
    if (willowCourseFilter.length > 0) {
      const valid = willowCourseFilter.filter((c) => courseNames.includes(c));
      if (valid.length !== willowCourseFilter.length) {
        setWillowCourseFilter(valid);
      }
    }
  }, [courseNames.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSchoolFilter = (id: string) => {
    // Remove the "__none__" sentinel if present
    const cleaned = willowSchoolFilter.filter((s) => s !== "__none__");
    if (cleaned.includes(id)) {
      setWillowSchoolFilter(cleaned.filter((s) => s !== id));
    } else {
      setWillowSchoolFilter([...cleaned, id]);
    }
  };

  const toggleCourseFilter = (name: string) => {
    if (willowCourseFilter.includes(name)) {
      setWillowCourseFilter(willowCourseFilter.filter((c) => c !== name));
    } else {
      setWillowCourseFilter([...willowCourseFilter, name]);
    }
  };

  const realSchoolFilter = willowSchoolFilter.filter((s) => s !== "__none__");
  const activeSchoolCount =
    realSchoolFilter.length === 0
      ? partners.length
      : realSchoolFilter.length;

  const schoolDropdownLabel =
    realSchoolFilter.length === 0
      ? `All Schools (${partners.length})`
      : `${realSchoolFilter.length} of ${partners.length} selected`;

  return (
    <div className="bg-surface border-b border-border px-6 py-3 flex flex-col gap-3">
      {/* Top row: View toggle + summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Summary */}
          <span className="text-[13px] text-text-muted">
            Showing <strong className="text-text">{totalLessons}</strong>{" "}
            lessons across{" "}
            <strong className="text-text">{activeSchoolCount}</strong> school
            {activeSchoolCount !== 1 ? "s" : ""}
          </span>

          {/* Active lesson filter indicator */}
          {willowLessonFilter && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-[12px] text-blue-700">
                Viewing: <strong>{willowLessonFilter}</strong>
              </span>
              <button
                onClick={() => setWillowLessonFilter(null)}
                className="text-[12px] text-blue-500 hover:text-blue-700 font-medium transition-colors"
              >
                &times; Clear
              </button>
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted">
            Date Range
          </span>
          <input
            type="date"
            value={willowDateRange?.start || ""}
            onChange={(e) => {
              const start = e.target.value;
              if (start) {
                setWillowDateRange({
                  start,
                  end: willowDateRange?.end || "2026-06-30",
                });
              } else {
                setWillowDateRange(null);
              }
            }}
            className="px-2 py-1 text-[12px] border border-border rounded bg-bg text-text"
          />
          <span className="text-[12px] text-text-muted">to</span>
          <input
            type="date"
            value={willowDateRange?.end || ""}
            onChange={(e) => {
              const end = e.target.value;
              if (end) {
                setWillowDateRange({
                  start: willowDateRange?.start || "2025-09-01",
                  end,
                });
              } else {
                setWillowDateRange(null);
              }
            }}
            className="px-2 py-1 text-[12px] border border-border rounded bg-bg text-text"
          />
          {willowDateRange && (
            <button
              onClick={() => setWillowDateRange(null)}
              className="text-[11px] text-text-muted hover:text-text transition-colors px-2 py-1 rounded hover:bg-bg"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Filters */}
      <div className="flex items-center gap-4">
        {/* School filter dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted">
            Schools
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
              className="flex items-center gap-2 px-3 py-[5px] rounded-lg text-[12px] font-medium border border-border bg-bg text-text hover:bg-surface transition-colors min-w-[180px] justify-between"
            >
              <span>{schoolDropdownLabel}</span>
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                className={`transition-transform ${schoolDropdownOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>

            {schoolDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-[240px] bg-surface border border-border rounded-lg shadow-lg z-50 py-1">
                {/* Select All / Clear All */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <button
                    onClick={() => setWillowSchoolFilter([])}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() =>
                      setWillowSchoolFilter(["__none__"])
                    }
                    className="text-[11px] text-text-muted hover:text-text font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {/* School list */}
                {partners.map((partner) => {
                  const isActive =
                    willowSchoolFilter.length === 0 ||
                    willowSchoolFilter.includes(partner.id);
                  return (
                    <button
                      key={partner.id}
                      onClick={() => toggleSchoolFilter(partner.id)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-left text-[12px] hover:bg-bg transition-colors"
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isActive
                            ? "border-transparent"
                            : "border-gray-300 bg-white"
                        }`}
                        style={
                          isActive
                            ? { backgroundColor: partner.color }
                            : undefined
                        }
                      >
                        {isActive && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      {/* Color dot + name */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: partner.color }}
                        />
                        <span
                          className={
                            isActive
                              ? "text-text font-medium"
                              : "text-text-muted"
                          }
                        >
                          {partner.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border" />

        {/* Course filters */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text-muted">
            Courses
          </span>
          <div className="flex gap-1">
            {courseNames.map((name) => {
              const isActive =
                willowCourseFilter.length === 0 ||
                willowCourseFilter.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleCourseFilter(name)}
                  className={`px-3 py-[4px] rounded-full text-[12px] font-medium transition-all border ${
                    isActive
                      ? "border-text bg-text text-surface"
                      : "border-border bg-bg text-text-muted opacity-50"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
