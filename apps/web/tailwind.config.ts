import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d7ecff",
          200: "#b0d8ff",
          300: "#7cbcff",
          400: "#4096ff",
          500: "#1f7aff",
          600: "#1559db",
          700: "#1248b1",
          800: "#123c8a",
          900: "#142f69"
        }
      }
    }
  },
  plugins: []
};

export default config;
