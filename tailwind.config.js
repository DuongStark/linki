/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  safelist: [
    'bg-primary-500',
    'border-primary-600',
    'text-primary-100',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f9f2',
          100: '#c3f2df',
          200: '#9eeacc',
          300: '#6fdcb2',
          400: '#3fcf99',
          500: '#58cc02', // Main primary: giống màu nút Học ngay
          600: '#46a302',
          700: '#128a56',
          800: '#0d6b41',
          900: '#084d2d',
        },
        secondary: {
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7', // Main secondary: blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0a3652',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
