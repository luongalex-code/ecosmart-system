/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#F8FAFC',
        cardBg: '#FFFFFF',
        darkCard: '#1E293B',
      }
    },
  },
  plugins: [],
}