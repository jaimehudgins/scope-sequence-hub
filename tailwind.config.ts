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
        // Brand Color Palettes
        neutral: {
          25: '#F0F0F0',
          50: '#E0E0E0',
          100: '#C4C4C4',
          200: '#A8A8A8',
          300: '#8C8C8C',
          400: '#707070',
          500: '#545454',
          600: '#383838',
          700: '#2C2C2C',
          800: '#201C28',
          900: '#1B1027',
        },
        slate: {
          25: '#E1FBFA',
          50: '#C3F7F5',
          100: '#A5F3F0',
          200: '#87EFEB',
          300: '#69EBE6',
          400: '#4BE7E1',
          500: '#2DE3DC',
          600: '#0FDFD7',
          700: '#0BC0B9',
          800: '#08807A',
          900: '#041B1A',
        },
        mint: {
          25: '#DBF8CB',
          50: '#C8F5AF',
          100: '#B5F293',
          200: '#A2EF77',
          300: '#8FEC5B',
          400: '#7CE93F',
          500: '#69E623',
          600: '#56E307',
          700: '#43C006',
          800: '#2E8004',
          900: '#0F120F',
        },
        green: {
          25: '#B9F4EF',
          50: '#9DF1E9',
          100: '#81EEE3',
          200: '#65EBDD',
          300: '#49E8D7',
          400: '#2DE5D1',
          500: '#11E2CB',
          600: '#0EC7B4',
          700: '#0BA895',
          800: '#098976',
          900: '#08130F',
        },
        red: {
          25: '#FFF8FB',
          50: '#FFE8F1',
          100: '#FFD1E3',
          200: '#FFB3D0',
          300: '#FF8FB5',
          400: '#FF6B9A',
          500: '#E5476F',
          600: '#C6345A',
          700: '#A72847',
          800: '#882D38',
          900: '#702B1B',
        },
        yellow: {
          25: '#FFFCF5',
          50: '#FFF8E6',
          100: '#FFF0CC',
          200: '#FFE8B3',
          300: '#FFE099',
          400: '#FFD880',
          500: '#FFD066',
          600: '#E6BB5C',
          700: '#CCA652',
          800: '#B39148',
          900: '#785F2F',
        },
        pink: {
          25: '#FFF6FB',
          50: '#FFEDF7',
          100: '#FFE4F3',
          200: '#FFD1EB',
          300: '#FFBEE3',
          400: '#FFABDB',
          500: '#FF98D3',
          600: '#E685BE',
          700: '#CC72A9',
          800: '#D94784',
          900: '#B61552',
        },
        lavender: {
          25: '#F9F8FF',
          50: '#F3F1FF',
          100: '#EDE9FF',
          200: '#DCDAFF',
          300: '#CBC8FF',
          400: '#BAB6FF',
          500: '#A9A4FF',
          600: '#8882E6',
          700: '#6760CC',
          800: '#4750B3',
          900: '#2D3A83',
        },
        blue: {
          25: '#F6FCFF',
          50: '#EDF9FF',
          100: '#E4F6FF',
          200: '#CCF0FF',
          300: '#B3E9FF',
          400: '#9AE3FF',
          500: '#81DDFF',
          600: '#74C7E6',
          700: '#67B1CC',
          800: '#5A9BB3',
          900: '#06436D',
        },

        // UI Color Mappings (using brand palette)
        bg: '#F0F0F0', // neutral-25
        surface: '#ffffff',
        text: '#1B1027', // neutral-900
        'text-muted': '#707070', // neutral-400
        border: '#C4C4C4', // neutral-100
        'border-light': '#E0E0E0', // neutral-50
        'today-bg': '#FFFCF5', // yellow-25
        'today-border': '#CCA652', // yellow-700
        'drop-target': '#F6FCFF', // blue-25
        'drop-border': '#67B1CC', // blue-700

        // Course Colors (using brand palette)
        'junior-sem': {
          DEFAULT: '#6760CC', // lavender-700
          light: '#F9F8FF', // lavender-25
          chip: '#DCDAFF', // lavender-200
          u1: '#8882E6', // lavender-600
          u2: '#A9A4FF', // lavender-500
          u3: '#CBC8FF', // lavender-300
        },
        'fresh-sem': {
          DEFAULT: '#0BA895', // green-700
          light: '#B9F4EF', // green-25
          chip: '#65EBDD', // green-200
          u1: '#0EC7B4', // green-600
          u2: '#2DE5D1', // green-400
          u3: '#81EEE3', // green-100
        },
        'ninth-adv': {
          DEFAULT: '#C6345A', // red-600
          light: '#FFF8FB', // red-25
          chip: '#FFD1E3', // red-200
          u1: '#E5476F', // red-500
          u2: '#FF8FB5', // red-300
          u3: '#FFB3D0', // red-200
        },
      },
    },
  },
  plugins: [],
};
export default config;
