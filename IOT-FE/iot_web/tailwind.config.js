/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // ...
}

module.exports = {
  darkMode: ['class', '[data-mode="dark"]'],
  // ...
}

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}