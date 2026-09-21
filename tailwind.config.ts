import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#FAF5EC",
          200: "#F3E9D8",
          300: "#E9D9BE",
        },
        ink: {
          50: "#F4F2EF",
          100: "#E7E2DB",
          400: "#5B5347",
          600: "#3A342B",
          800: "#221E19",
          900: "#171310",
        },
        rust: {
          50: "#FBECE3",
          100: "#F4CBB3",
          300: "#DE8E5A",
          500: "#BE5A2E",
          600: "#A44823",
          700: "#82391B",
        },
        olive: {
          100: "#E4E6D3",
          300: "#B7BD8F",
          500: "#767E4F",
          600: "#5C6340",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-work-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 20px -4px rgba(34, 30, 25, 0.12)",
        card: "0 1px 2px rgba(34,30,25,0.06), 0 8px 24px -12px rgba(34,30,25,0.18)",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "16px",
        xl: "22px",
      },
      backgroundImage: {
        grain: "url('/grain.svg')",
      },
    },
  },
  plugins: [],
};
export default config;
