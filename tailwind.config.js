/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0E1A",
        panel: "#111729",
        line: "#1E2740",
        gold: "#F2B705",
        teal: "#2DD4BF",
        mist: "#8B93A8",
        paper: "#E8EAF2",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
