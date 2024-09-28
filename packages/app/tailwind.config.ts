/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        alliance: ["Alliance No.2", "sans-serif"],
        "geist-sans": ["GeistSans", "sans-serif"],
        "geist-mono": ["GeistMono", "monospace"],
      },
    },
  },
  plugins: [],
};
