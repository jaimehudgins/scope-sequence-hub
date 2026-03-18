import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      animation: {
        'toast-in': 'toast-in 0.3s ease',
        'fade-in': 'fade-in 0.15s ease',
        'slide-in': 'slide-in 0.2s ease',
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      colors: {
        bg: '#f8f7f4',
        surface: '#ffffff',
        text: '#1a1a1a',
        'text-muted': '#6b6b6b',
        border: '#e5e2dc',
        'border-light': '#f0ede8',
        'today-bg': '#fffbeb',
        'today-border': '#f59e0b',
        'drop-target': '#e0f2fe',
        'drop-border': '#38bdf8',
        'junior-sem': {
          DEFAULT: '#4f46e5',
          light: '#eef2ff',
          chip: '#c7d2fe',
          u1: '#6366f1',
          u2: '#818cf8',
          u3: '#a5b4fc',
        },
        'fresh-sem': {
          DEFAULT: '#0d9488',
          light: '#f0fdfa',
          chip: '#99f6e4',
          u1: '#14b8a6',
          u2: '#2dd4bf',
          u3: '#5eead4',
        },
        'ninth-adv': {
          DEFAULT: '#e11d48',
          light: '#fff1f2',
          chip: '#fecdd3',
          u1: '#f43f5e',
          u2: '#fb7185',
          u3: '#fda4af',
        },
      },
    },
  },
  plugins: [],
};
export default config;
