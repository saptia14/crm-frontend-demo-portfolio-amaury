/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{hbs,js,gjs,ts,gts}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9', // Tailwind Sky 500
        secondary: '#64748b', // Tailwind Slate 500
      }
    },
  },
  plugins: [],
}
