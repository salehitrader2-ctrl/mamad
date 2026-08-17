/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Calm, low-saturation palette on purpose — this reads as a serious
        // workplace tool, not a consumer app. Avoid adding bright/loud
        // accent colors here; status colors are intentionally muted too.
        ink: {
          900: "#1f2a33",
          700: "#33475b",
          500: "#5b6b79",
          300: "#94a3ae",
        },
        surface: {
          50: "#f6f7f9",
          100: "#eef1f4",
          200: "#e2e6ea",
        },
        brand: {
          50: "#eef2f4",
          100: "#d7e0e5",
          400: "#5c7c8c",
          500: "#3e5c6c",
          600: "#33475b",
          700: "#293a4a",
        },
        good: {
          100: "#e4efe6",
          500: "#4a8a63",
          700: "#33623f",
        },
        warn: {
          100: "#f4ecdd",
          500: "#a97a34",
          700: "#7a5522",
        },
        bad: {
          100: "#f3e3e1",
          500: "#a34d43",
          700: "#79352d",
        },
      },
      fontFamily: {
        sans: [
          "Vazirmatn",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Tahoma",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
