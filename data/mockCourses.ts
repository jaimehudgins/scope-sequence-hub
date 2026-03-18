import { Course } from '@/types';

export const COURSES: Record<string, Course> = {
  'junior-sem': {
    id: 'junior-sem',
    name: 'Junior Seminar',
    gradeLevel: 11,
    lessonDuration: 50,
    color: '#4f46e5',
    unitColors: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'],
  },
  'fresh-sem': {
    id: 'fresh-sem',
    name: 'Freshman Seminar',
    gradeLevel: 9,
    lessonDuration: 50,
    color: '#0d9488',
    unitColors: ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'],
  },
  'ninth-adv': {
    id: 'ninth-adv',
    name: '9th Advisory',
    gradeLevel: 9,
    lessonDuration: 30,
    color: '#e11d48',
    unitColors: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af'],
  },
};

export const SCHOOL_YEAR_START = new Date(2025, 8, 1);  // Sep 1, 2025
export const SCHOOL_YEAR_END = new Date(2026, 5, 30);   // Jun 30, 2026
