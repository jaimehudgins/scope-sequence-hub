import { Lesson } from '@/types';
import { COURSES } from './mockCourses';

function generateMockLessons(): Lesson[] {
  const lessons: Lesson[] = [];

  const courseConfigs = {
    'junior-sem': {
      units: [
        {
          name: 'Unit 1: Tell Your Story',
          lessons: [
            'Personal Narrative',
            'Brainstorming Your Essay',
            'Drafting Your Statement',
            'Peer Review Workshop',
            'Revision & Polish',
          ],
        },
        {
          name: 'Unit 2: Research & Fit',
          lessons: [
            'Building a Balanced List',
            'Campus Culture Research',
            'Financial Fit Check',
            'Comparing Offers',
            'Decision Defense Prep',
          ],
        },
        {
          name: 'Unit 3: Test Prep & Timelines',
          lessons: [
            'SAT Strategy Overview',
            'Practice Test Debrief',
            'Junior Year Timeline',
            'Summer Planning',
            'Goal Setting Checkpoint',
          ],
        },
        {
          name: 'Unit 4: Application Strategy',
          lessons: [
            'Early vs Regular Decision',
            'Building Your Resume',
            'Letters of Recommendation',
            'Scholarship Search',
          ],
        },
      ],
    },
    'fresh-sem': {
      units: [
        {
          name: 'Unit 1: Who Am I?',
          lessons: [
            'Identity Mapping',
            'Values Exploration',
            'Strengths Inventory',
            'Learning Style Discovery',
            'My Story So Far',
          ],
        },
        {
          name: 'Unit 2: High School Success',
          lessons: [
            'GPA & Transcript Basics',
            'Time Management Tools',
            'Study Strategies',
            'Asking for Help',
            'Extracurricular Exploration',
          ],
        },
        {
          name: 'Unit 3: Looking Ahead',
          lessons: [
            'What Is College?',
            'Career Curiosity Survey',
            'Pathways Overview',
            'Role Model Research',
            'Freshman Year Reflection',
          ],
        },
        {
          name: 'Unit 4: Career Exploration',
          lessons: [
            'Interest Inventory',
            'Job Shadow Planning',
            'Industry Research',
            'Skills Assessment',
          ],
        },
      ],
    },
    'ninth-adv': {
      units: [
        {
          name: 'Unit 1: Community Building',
          lessons: ['Name Stories', 'Group Agreements', 'Trust Circles', 'Conflict Navigation'],
        },
        {
          name: 'Unit 2: Self-Awareness',
          lessons: [
            'Emotion Check-Ins',
            'Defining Your Values',
            'Growth Mindset Intro',
            'Journaling Practice',
          ],
        },
        {
          name: 'Unit 3: Goal Setting',
          lessons: [
            'SMART Goals Workshop',
            'Academic Planning',
            'Accountability Partners',
            'Quarter Reflection',
          ],
        },
        {
          name: 'Unit 4: Wellbeing',
          lessons: [
            'Stress Management',
            'Healthy Relationships',
            'Digital Wellness',
          ],
        },
      ],
    },
  };

  for (const [courseId, config] of Object.entries(courseConfigs)) {
    // Starting date for this course
    let dp = new Date(2025, 8, 8); // Sep 8, 2025 (Monday)
    if (courseId === 'fresh-sem') dp.setDate(dp.getDate() + 1);
    if (courseId === 'ninth-adv') dp.setDate(dp.getDate() + 2);

    let lessonNum = 1;
    let unitIdx = 0;

    for (const unit of config.units) {
      const course = COURSES[courseId];
      const unitColor = course.unitColors[unitIdx] || course.color;

      for (let i = 0; i < unit.lessons.length; i++) {
        const isMilestone = lessonNum % 5 === 0;
        const hasAlma = lessonNum % 3 === 0;
        const unscheduled = Math.random() < 0.2;
        let scheduledDate: string | null = null;

        if (!unscheduled) {
          // Skip weekends
          while (dp.getDay() === 0 || dp.getDay() === 6) {
            dp.setDate(dp.getDate() + 1);
          }

          // Skip holidays
          const dateStr = dp.toISOString().split('T')[0];
          // For simplicity, just schedule - we'll handle conflicts in the app
          scheduledDate = dateStr;
          dp.setDate(dp.getDate() + 7); // Weekly lessons
        }

        lessons.push({
          id: `${courseId}-${lessonNum}`,
          courseId,
          unitName: unit.name,
          unitIndex: unitIdx,
          lessonNumber: lessonNum,
          title: unit.lessons[i],
          duration: COURSES[courseId].lessonDuration,
          scheduledDate,
          isMilestone,
          hasAlmaIntegration: hasAlma,
          description: `In this lesson, students engage with "${unit.lessons[i]}" as part of ${unit.name}. This session builds on prior work and moves students toward the unit's culminating milestone.`,
          platformUrl: `/lessons/${courseId}-${lessonNum}`,
        });
        lessonNum++;
      }
      unitIdx++;
    }
  }

  return lessons;
}

export const mockLessons = generateMockLessons();
