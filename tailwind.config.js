const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.sky[500],
        background: colors.gray[700],
        secondary: colors.slate[400],
        surface: colors.gray[500],
        font: colors.slate[200],

        loss: colors.red[600],
        win: colors.lime[500],
        draw: colors.amber[500]
      }
    },
  },
  plugins: [],
}
