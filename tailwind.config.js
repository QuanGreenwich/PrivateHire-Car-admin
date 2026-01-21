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
          DEFAULT: '#0f388a',
          dark: '#0a2a6e',
        },
        midnight: '#0B1E48',
        gold: '#D4AF37',
      },
    },
  },
  plugins: [],
}
