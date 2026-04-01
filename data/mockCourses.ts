import { Course } from "@/types";

export const COURSES: Record<string, Course> = {
  "junior-sem": {
    id: "junior-sem",
    name: "Junior Seminar",
    gradeLevel: 11,
    lessonDuration: 50,
    color: "#6760CC", // lavender-700
    unitColors: ["#6760CC", "#8882E6", "#A9A4FF", "#CBC8FF"], // lavender-700, 600, 500, 300
    meetingDays: [1], // Monday
    willowCadence: { type: "every" },
  },
  "fresh-sem": {
    id: "fresh-sem",
    name: "Freshman Seminar",
    gradeLevel: 9,
    lessonDuration: 50,
    color: "#0BA895", // green-700
    unitColors: ["#0BA895", "#0EC7B4", "#2DE5D1", "#81EEE3"], // green-700, 600, 400, 100
    meetingDays: [2], // Tuesday
    willowCadence: { type: "every" },
  },
  "ninth-adv": {
    id: "ninth-adv",
    name: "9th Advisory",
    gradeLevel: 9,
    lessonDuration: 30,
    color: "#C6345A", // red-600
    unitColors: ["#C6345A", "#E5476F", "#FF8FB5", "#FFB3D0"], // red-600, 500, 300, 200
    meetingDays: [3], // Wednesday
    willowCadence: { type: "every" },
  },
};

export const SCHOOL_YEAR_START = new Date(2025, 8, 1); // Sep 1, 2025
export const SCHOOL_YEAR_END = new Date(2026, 5, 30); // Jun 30, 2026
