/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe7fe',
          200: '#bfd6fe',
          300: '#93bafc',
          400: '#5f94f8',
          500: '#3a6df0',
          600: '#264ee4',
          700: '#1f3fc9',
          800: '#1f38a3',
          900: '#1f3481',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
