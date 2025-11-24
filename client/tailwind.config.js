/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#d8e8ff',
          200: '#b0d0ff',
          300: '#88b9ff',
          400: '#5795ff',
          500: '#2f74ff',
          600: '#1c57db',
          700: '#1744af',
          800: '#123183',
          900: '#0c215a',
        },
      },
    },
  },
  plugins: [],
};

