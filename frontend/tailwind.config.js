/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6200ee',
        secondary: '#03dac6',
        error: '#b00020',
        background: '#f5f5f5',
      },
    },
  },
  plugins: [],
}
