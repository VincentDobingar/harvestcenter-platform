// 1. ✅ tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1F75BB", // bleu du logo
          700: "#155b94",
          800: "#0d4c80",
        },
      },
    },
  },
  plugins: [],
};
