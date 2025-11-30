/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tubes: {
          bg: '#050816',
          'bg-soft': '#0c1220', // Matches bg-elevated in doc
          card: '#111827',
          accent: '#ff7b3a',
          'accent-soft': '#ff9c5c',
          muted: '#9ca3af',
        }
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        tubes: '0 18px 45px rgba(0,0,0,0.45)',
      }
    },
  },
  plugins: [],
}