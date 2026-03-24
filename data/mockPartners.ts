import { Partner, Course, Lesson, NonInstructionalDay } from "@/types";

// Shared lesson content per course (same curriculum across schools)
const courseConfigs: Record<
  string,
  { name: string; gradeLevel: number; duration: number; units: { name: string; lessons: string[] }[] }
> = {
  "junior-sem": {
    name: "Junior Seminar",
    gradeLevel: 11,
    duration: 50,
    units: [
      {
        name: "Unit 1: Tell Your Story",
        lessons: [
          "Personal Narrative", "Brainstorming Your Essay", "Drafting Your Statement",
          "Peer Review Workshop", "Revision & Polish", "Voice & Tone Workshop", "Final Draft Prep",
        ],
      },
      {
        name: "Unit 2: Research & Fit",
        lessons: [
          "Building a Balanced List", "Campus Culture Research", "Financial Fit Check",
          "Comparing Offers", "Decision Defense Prep", "Alumni Panel Debrief", "Application Tracker Setup",
        ],
      },
      {
        name: "Unit 3: Test Prep & Timelines",
        lessons: [
          "SAT Strategy Overview", "Practice Test Debrief", "Junior Year Timeline",
          "Summer Planning", "Goal Setting Checkpoint", "Score Analysis Workshop", "Test Registration Guide",
        ],
      },
      {
        name: "Unit 4: Application Strategy",
        lessons: [
          "Early vs Regular Decision", "Resume Basics", "Letters of Recommendation",
          "Scholarship Search", "Essay Brainstorm Session", "Common App Walkthrough",
          "Interview Prep Basics", "Portfolio Assembly",
        ],
      },
    ],
  },
  "fresh-sem": {
    name: "Freshman Seminar",
    gradeLevel: 9,
    duration: 50,
    units: [
      {
        name: "Unit 1: Who Am I?",
        lessons: [
          "Identity Mapping", "Values Exploration", "Strengths Inventory",
          "Learning Style Discovery", "My Story So Far", "Cultural Identity Collage", "Personality Assessment",
        ],
      },
      {
        name: "Unit 2: High School Success",
        lessons: [
          "GPA & Transcript Basics", "Time Management Tools", "Study Strategies",
          "Asking for Help", "Extracurricular Exploration", "Note-Taking Methods",
          "Digital Organization", "Goal Setting Checkpoint",
        ],
      },
      {
        name: "Unit 3: Looking Ahead",
        lessons: [
          "What Is College?", "Career Curiosity Survey", "Pathways Overview",
          "Role Model Research", "Freshman Year Reflection", "Vision Board Project", "Interview Prep Basics",
        ],
      },
      {
        name: "Unit 4: Career Exploration",
        lessons: [
          "Interest Inventory", "Job Shadow Planning", "Industry Research",
          "Skills Assessment", "Workplace Etiquette", "Resume Basics",
          "Mock Interview Intro", "Career Day Reflection",
        ],
      },
    ],
  },
  "tenth-adv": {
    name: "10th Grade Advisory",
    gradeLevel: 10,
    duration: 30,
    units: [
      {
        name: "Unit 1: Identity & Purpose",
        lessons: [
          "Who Am I Now?", "Strengths Revisited", "Core Values Deep Dive",
          "Purpose Statement Draft", "Peer Feedback Circle", "Identity & Community",
        ],
      },
      {
        name: "Unit 2: Academic Ownership",
        lessons: [
          "Transcript Review", "Study Plan Design", "Test Prep Strategies",
          "GPA Goal Setting", "Academic Recovery Plans", "Self-Advocacy Practice",
        ],
      },
      {
        name: "Unit 3: Leadership & Service",
        lessons: [
          "Leadership Styles", "Service Learning Intro", "Community Needs Assessment",
          "Project Planning", "Reflection & Impact", "Presentation Prep",
        ],
      },
      {
        name: "Unit 4: Future Planning",
        lessons: [
          "Sophomore Year Reflection", "Summer Opportunities", "Mentorship Check-In",
          "Skill Building Workshop", "Portfolio Review", "Year-End Celebration",
        ],
      },
    ],
  },
  "ninth-adv": {
    name: "9th Advisory",
    gradeLevel: 9,
    duration: 30,
    units: [
      {
        name: "Unit 1: Community Building",
        lessons: [
          "Name Stories", "Group Agreements", "Trust Circles",
          "Conflict Navigation", "Team Challenges", "Listening Skills",
        ],
      },
      {
        name: "Unit 2: Self-Awareness",
        lessons: [
          "Emotion Check-Ins", "Values Exploration", "Growth Mindset Intro",
          "Journaling Practice", "Mindfulness Basics", "Strengths Inventory",
        ],
      },
      {
        name: "Unit 3: Goal Setting",
        lessons: [
          "SMART Goals Workshop", "Academic Planning", "Accountability Partners",
          "Quarter Reflection", "Mid-Year Check-In", "Habit Tracking",
        ],
      },
      {
        name: "Unit 4: Wellbeing",
        lessons: [
          "Stress Management", "Healthy Relationships", "Digital Wellness",
          "Sleep & Nutrition", "Boundaries Workshop", "Year-End Reflection",
        ],
      },
    ],
  },
};

// School-specific configurations
const schoolConfigs = [
  {
    id: "lincoln",
    name: "Lincoln High",
    color: "#6760CC",
    location: "Chicago, IL",
    courseIds: ["junior-sem", "fresh-sem", "ninth-adv"],
    meetingDays: { "junior-sem": [1], "fresh-sem": [2], "ninth-adv": [3] } as Record<string, number[]>, // Mon, Tue, Wed
    courseColors: {
      "junior-sem": { color: "#6760CC", unitColors: ["#6760CC", "#8882E6", "#A9A4FF", "#CBC8FF"] },
      "fresh-sem": { color: "#0BA895", unitColors: ["#0BA895", "#0EC7B4", "#2DE5D1", "#81EEE3"] },
      "ninth-adv": { color: "#C6345A", unitColors: ["#C6345A", "#E5476F", "#FF8FB5", "#FFB3D0"] },
    } as Record<string, { color: string; unitColors: string[] }>,
    startOffset: 0, // Starts Sep 8
    unscheduledRate: 0.3,
    extraHolidays: [
      { date: "2025-10-10", label: "Staff PD Day", type: "pd" as const },
    ],
  },
  {
    id: "riverside",
    name: "Riverside Academy",
    color: "#0BA895",
    location: "Evanston, IL",
    courseIds: ["junior-sem", "fresh-sem", "tenth-adv"], // 3 courses, unique 10th Grade Advisory
    meetingDays: { "junior-sem": [2], "fresh-sem": [4], "tenth-adv": [3] } as Record<string, number[]>, // Tue, Thu, Wed
    courseColors: {
      "junior-sem": { color: "#4F7CAC", unitColors: ["#4F7CAC", "#6B96C4", "#8DB1D9", "#B5CDE8"] },
      "fresh-sem": { color: "#E8871E", unitColors: ["#E8871E", "#F09D45", "#F5B673", "#FACE9F"] },
      "tenth-adv": { color: "#7B68AE", unitColors: ["#7B68AE", "#9580C8", "#AF9CE0", "#C9B8F0"] },
    } as Record<string, { color: string; unitColors: string[] }>,
    startOffset: 1, // Starts Sep 9
    unscheduledRate: 0.25,
    extraHolidays: [
      { date: "2025-11-03", label: "Parent-Teacher Conferences", type: "conference" as const },
      { date: "2026-03-13", label: "Staff PD Day", type: "pd" as const },
    ],
  },
  {
    id: "maple",
    name: "Maple Grove",
    color: "#C6345A",
    location: "Oak Park, IL",
    courseIds: ["junior-sem", "fresh-sem", "ninth-adv"],
    meetingDays: { "junior-sem": [3], "fresh-sem": [1], "ninth-adv": [4] } as Record<string, number[]>, // Wed, Mon, Thu
    courseColors: {
      "junior-sem": { color: "#7B5EA7", unitColors: ["#7B5EA7", "#9678C1", "#B196D6", "#CCB8E8"] },
      "fresh-sem": { color: "#2D8E6C", unitColors: ["#2D8E6C", "#3DA882", "#55C29B", "#7DDAB7"] },
      "ninth-adv": { color: "#D4782F", unitColors: ["#D4782F", "#E08E4C", "#EAA56E", "#F2BF96"] },
    } as Record<string, { color: string; unitColors: string[] }>,
    startOffset: 0, // Starts Sep 8
    unscheduledRate: 0.2, // Most scheduled
    extraHolidays: [
      { date: "2025-09-26", label: "School Retreat", type: "other" as const },
      { date: "2026-01-30", label: "Semester Assessment Day", type: "testing" as const },
    ],
  },
];

// Shared base holidays (all schools observe these)
const baseHolidays: NonInstructionalDay[] = [
  { date: "2025-09-01", label: "Labor Day", type: "holiday" },
  { date: "2025-10-14", label: "Indigenous Peoples' Day", type: "holiday" },
  { date: "2025-11-04", label: "Election Day", type: "holiday" },
  { date: "2025-11-11", label: "Veterans Day", type: "holiday" },
  { date: "2025-11-26", label: "Thanksgiving", type: "holiday" },
  { date: "2025-11-27", label: "Thanksgiving Break", type: "holiday" },
  { date: "2025-11-28", label: "Thanksgiving Break", type: "holiday" },
  { date: "2025-12-22", label: "Winter Break", type: "holiday" },
  { date: "2025-12-23", label: "Winter Break", type: "holiday" },
  { date: "2025-12-24", label: "Winter Break", type: "holiday" },
  { date: "2025-12-25", label: "Christmas", type: "holiday" },
  { date: "2025-12-26", label: "Winter Break", type: "holiday" },
  { date: "2025-12-29", label: "Winter Break", type: "holiday" },
  { date: "2025-12-30", label: "Winter Break", type: "holiday" },
  { date: "2025-12-31", label: "Winter Break", type: "holiday" },
  { date: "2026-01-01", label: "New Year's Day", type: "holiday" },
  { date: "2026-01-02", label: "Winter Break", type: "holiday" },
  { date: "2026-01-19", label: "MLK Jr. Day", type: "holiday" },
  { date: "2026-02-16", label: "Presidents' Day", type: "holiday" },
  { date: "2026-02-17", label: "Mid-Winter Break", type: "holiday" },
  { date: "2026-02-18", label: "Mid-Winter Break", type: "holiday" },
  { date: "2026-02-19", label: "Mid-Winter Break", type: "holiday" },
  { date: "2026-02-20", label: "Mid-Winter Break", type: "holiday" },
  { date: "2026-04-06", label: "Spring Break", type: "holiday" },
  { date: "2026-04-07", label: "Spring Break", type: "holiday" },
  { date: "2026-04-08", label: "Spring Break", type: "holiday" },
  { date: "2026-04-09", label: "Spring Break", type: "holiday" },
  { date: "2026-04-10", label: "Spring Break", type: "holiday" },
  { date: "2026-05-25", label: "Memorial Day", type: "holiday" },
  { date: "2026-06-19", label: "Juneteenth", type: "holiday" },
];

// Sample Willow notes to sprinkle on lessons
const willowNotes = [
  "Great engagement reported by counselor",
  "Follow up with school admin on pacing concerns",
  "This school is ahead of schedule on this unit",
  "Partner requested additional resources for this lesson",
  "Counselor flagged low attendance this week",
  "Check in about differentiation support",
];

// Sample teacher notes
const teacherNotes = [
  "Students really enjoyed this activity",
  "Need more time for this lesson next year",
  "Modified for ELL students - worked well",
  "Consider adding group work component",
  "Great discussion - extend next time",
];

// Deterministic pseudo-random based on a seed string
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Return value between 0 and 1
  return Math.abs((Math.sin(hash) * 10000) % 1);
}

function generateSchoolLessons(
  schoolId: string,
  schoolCourseIds: string[],
  meetingDays: Record<string, number[]>,
  schoolCourseColors: Record<string, { color: string; unitColors: string[] }>,
  startOffset: number,
  unscheduledRate: number,
): { courses: Course[]; lessons: Lesson[] } {
  const courses: Course[] = [];
  const lessons: Lesson[] = [];

  for (const baseCourseId of schoolCourseIds) {
    const config = courseConfigs[baseCourseId];
    if (!config) continue;

    const courseId = `${schoolId}-${baseCourseId}`;
    const colors = schoolCourseColors[baseCourseId];

    courses.push({
      id: courseId,
      name: config.name,
      gradeLevel: config.gradeLevel,
      lessonDuration: config.duration,
      color: colors?.color || "#888",
      unitColors: colors?.unitColors || [],
      meetingDays: meetingDays[baseCourseId] || [1],
    });

    // Start date calculation
    const dp = new Date(2025, 8, 8 + startOffset); // Sep 8 + offset

    let lessonNum = 1;
    let unitIdx = 0;

    for (const unit of config.units) {
      for (let i = 0; i < unit.lessons.length; i++) {
        const isMilestone = lessonNum % 5 === 0;
        const hasAlma = lessonNum % 3 === 0;

        // Deterministic scheduling decision
        const rand = seededRandom(`${schoolId}-${baseCourseId}-${lessonNum}`);
        const isLaterInUnit = i >= unit.lessons.length - 3;
        const threshold = isLaterInUnit ? unscheduledRate + 0.25 : unscheduledRate;
        const unscheduled = rand < threshold;

        let scheduledDate: string | null = null;

        if (!unscheduled) {
          // Skip weekends
          while (dp.getDay() === 0 || dp.getDay() === 6) {
            dp.setDate(dp.getDate() + 1);
          }
          scheduledDate = dp.toISOString().split("T")[0];
          dp.setDate(dp.getDate() + 7); // Weekly lessons
        }

        // Add some teacher notes and willow notes deterministically
        const noteRand = seededRandom(`note-${schoolId}-${baseCourseId}-${lessonNum}`);
        const willowRand = seededRandom(`willow-${schoolId}-${baseCourseId}-${lessonNum}`);

        const lesson: Lesson = {
          id: `${courseId}-${lessonNum}`,
          courseId,
          unitName: unit.name,
          unitIndex: unitIdx,
          lessonNumber: lessonNum,
          title: unit.lessons[i],
          duration: config.duration,
          scheduledDate,
          isMilestone,
          hasAlmaIntegration: hasAlma,
          description: `In this lesson, students engage with "${unit.lessons[i]}" as part of ${unit.name}. This session builds on prior work and moves students toward the unit's culminating milestone.`,
          platformUrl: `/lessons/${courseId}-${lessonNum}`,
        };

        // ~20% chance of teacher note
        if (noteRand < 0.2 && scheduledDate) {
          const noteIdx = Math.floor(noteRand * 100) % teacherNotes.length;
          lesson.teacherNote = teacherNotes[noteIdx];
          lesson.teacherNoteAuthor = "Teacher";
          lesson.teacherNoteDate = scheduledDate;
        }

        // ~15% chance of willow note
        if (willowRand < 0.15 && scheduledDate) {
          const noteIdx = Math.floor(willowRand * 100) % willowNotes.length;
          lesson.willowNote = willowNotes[noteIdx];
          lesson.willowNoteAuthor = "Willow Admin";
          lesson.willowNoteDate = scheduledDate;
        }

        lessons.push(lesson);
        lessonNum++;
      }
      unitIdx++;
    }
  }

  return { courses, lessons };
}

function generatePartners(): Partner[] {
  return schoolConfigs.map((school) => {
    const { courses, lessons } = generateSchoolLessons(
      school.id,
      school.courseIds,
      school.meetingDays,
      school.courseColors,
      school.startOffset,
      school.unscheduledRate,
    );

    const holidays: NonInstructionalDay[] = [
      ...baseHolidays,
      ...school.extraHolidays,
    ];

    return {
      id: school.id,
      name: school.name,
      color: school.color,
      location: school.location,
      courses,
      lessons,
      nonInstructionalDays: holidays,
    };
  });
}

export const mockPartners: Partner[] = generatePartners();
