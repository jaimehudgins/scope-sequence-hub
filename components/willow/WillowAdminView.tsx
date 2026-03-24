"use client";

import { useMemo } from "react";
import { useCalendarContext } from "@/hooks/useCalendarContext";
import { computeFilteredLessons } from "@/utils/willowUtils";
import WillowControls from "./WillowControls";
import WillowListView from "./WillowListView";
import WillowLessonSidebar from "./WillowLessonSidebar";

export default function WillowAdminView() {
  const {
    partners,
    willowSchoolFilter,
    willowCourseFilter,
    willowDateRange,
    willowLessonFilter,
  } = useCalendarContext();

  const filteredData = useMemo(
    () =>
      computeFilteredLessons(
        partners,
        willowSchoolFilter,
        willowCourseFilter,
        willowDateRange,
        willowLessonFilter,
      ),
    [partners, willowSchoolFilter, willowCourseFilter, willowDateRange, willowLessonFilter],
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      <WillowLessonSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <WillowControls totalLessons={filteredData.length} />
        <WillowListView data={filteredData} />
      </div>
    </div>
  );
}
