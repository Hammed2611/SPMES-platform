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
          50: '#f0f4ff',
          100: '#dce4ff',
          200: '#c1cfff',
          300: '#96aeff',
          400: '#6482ff',
          500: '#3c55ff',
          600: '#2336ff',
          700: '#1422ff',
          800: '#111be0',
          900: '#131eb1',
          950: '#0b0f69',
        },
      },
    },
  },
  plugins: [],
}
