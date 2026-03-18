# Scope & Sequence Calendar

A modern, interactive calendar application for planning and visualizing lesson schedules across the school year. Built for Willow Education's internal staff.

![Scope & Sequence Calendar](reference-prototype.html)

## Features

### Calendar Views
- **Monthly View**: Traditional calendar grid showing lessons scheduled across the month
- **Weekly View**: Detailed 5-day week view with expanded lesson information
- **Semester Ribbon**: Year-at-a-glance timeline showing unit blocks across the entire school year

### Multi-Course Management
- View and manage multiple courses simultaneously
- Toggle courses on/off to customize your view
- Three courses included:
  - Junior Seminar (11th grade, 50-min lessons)
  - Freshman Seminar (9th grade, 50-min lessons)
  - 9th Advisory (9th grade, 30-min lessons)

### Lesson Management
- **Drag-and-Drop Scheduling**: Easily reschedule lessons by dragging them between dates (Admin only)
- **Lesson Bank**: Sidebar showing unscheduled lessons, organized by course and unit
- **Lesson Details**: Click any lesson to view full details including:
  - Duration
  - Milestone status
  - Alma AI integration status
  - Unit context
  - Scheduled date

### Non-Instructional Days
- Pre-populated holidays and breaks throughout the school year
- Visual indicators with diagonal stripe pattern
- Lessons cannot be scheduled on non-instructional days

### Role-Based Permissions
- **Admin View**: Full editing capabilities with drag-and-drop
- **Teacher View**: Read-only access for viewing schedules

### User Experience
- Toast notifications for all actions
- Smooth animations and transitions
- Responsive design optimized for desktop/laptop
- Clean, minimal aesthetic with calm color palette

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Drag-and-Drop**: @dnd-kit/core
- **Date Utilities**: date-fns
- **Fonts**: DM Sans (body), Fraunces (headings)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jaimehudgins/scope-sequence-hub.git
cd scope-sequence-hub
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
scope-sequence-hub/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main calendar page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Header.tsx         # Header with role toggle
│   ├── SemesterRibbon.tsx # Year-at-a-glance timeline
│   ├── CalendarControls.tsx # Navigation and view controls
│   ├── CalendarView.tsx   # Monthly/weekly calendar grids
│   ├── CourseToggle.tsx   # Multi-course selector
│   ├── LessonCard.tsx     # Lesson display component
│   ├── LessonDetailPanel.tsx # Lesson details side panel
│   ├── UnscheduledSidebar.tsx # Lesson Bank sidebar
│   └── Toast.tsx          # Toast notifications
├── data/                  # Mock data
│   ├── mockCourses.ts     # Course definitions
│   ├── mockLessons.ts     # Generated lesson data
│   └── mockHolidays.ts    # Non-instructional days
├── hooks/                 # Custom React hooks
│   └── useCalendarContext.tsx # Global state management
├── types/                 # TypeScript type definitions
│   └── index.ts
└── reference-prototype.html # Original HTML prototype
```

## Data Structure

The application uses mock data that can be easily swapped for real database queries:

- **Courses**: 3 courses with unique colors and settings
- **Lessons**: ~60 lessons across all courses with ~20% unscheduled
- **Units**: 3-4 units per course with distinct colors
- **Non-Instructional Days**: Pre-populated holidays and breaks

## Key Features Implementation

### Drag-and-Drop
- Uses @dnd-kit for accessible, performant drag-and-drop
- Prevents conflicts (one lesson per course per day)
- Blocks dropping on weekends and non-instructional days

### State Management
- React Context API for global state
- Centralized in `useCalendarContext` hook
- Easy to replace with database layer

### Responsive Design
- Optimized for desktop (1280px+)
- Usable on tablets (768px+)
- Mobile support not prioritized

## Future Enhancements

When connecting to Supabase or another backend:

1. Replace `mockLessons.ts` and `mockHolidays.ts` with API calls
2. Update `useCalendarContext` to use server state
3. Add authentication and user roles
4. Implement real-time updates for collaborative editing
5. Add lesson creation and editing capabilities
6. Enable custom non-instructional day management

## Contributing

This is an internal prototype for Willow Education. For questions or suggestions, contact the development team.

## License

Internal use only - Willow Education © 2026
