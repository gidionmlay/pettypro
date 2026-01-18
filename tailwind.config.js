/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f59e0b', // Amber 500
          light: '#fbbf24',   // Amber 400
          dark: '#b45309',    // Amber 700
        },
        secondary: {
          DEFAULT: '#000000',
          light: '#1f2937',   // Gray 800
        },
        neutral: {
          DEFAULT: '#ffffff',
          dim: '#f3f4f6',     // Gray 100
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
