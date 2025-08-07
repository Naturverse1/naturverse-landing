
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
          50: '#e8f7ff',
          100: '#d1efff',
          500: '#4caf50',
          600: '#388e3c',
        },
        nature: {
          green: '#4caf50',
          blue: '#2196f3',
          orange: '#ff9800',
          purple: '#9c27b0',
        }
      },
      fontFamily: {
        'kid-friendly': ['Comic Sans MS', 'cursive', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
