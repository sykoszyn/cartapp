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
        // superficies neutras (blanco → gris muy claro)
        cream: {
          50: "#FFFFFF",
          100: "#FAFAFA",
          200: "#F0F0F1",
          300: "#E4E4E6",
        },
        // escala de grises real para texto y bordes
        ink: {
          50: "#F7F7F8",
          100: "#EBEBED",
          200: "#D8D8DC",
          400: "#7B7B84",
          600: "#3F3F46",
          800: "#161618",
          900: "#0A0A0B",
        },
        // acento único: naranja de sello/ticket (más vivo que el ámbar anterior)
        rust: {
          50: "#FFF4E0",
          100: "#FFE2AD",
          300: "#FFB13D",
          500: "#FF8A00",
          600: "#E06E00",
          700: "#A85400",
        },
        // secundario: verde azulado para estados "activo/éxito"
        olive: {
          100: "#DEEEEA",
          300: "#8FC7BB",
          500: "#1F7A66",
          600: "#166352",
        },
        // reservado sólo para errores/estados destructivos
        danger: {
          50: "#FDF0EF",
          500: "#C4432E",
          600: "#A8351F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10, 10, 11, 0.04)",
        card: "0 1px 2px rgba(10, 10, 11, 0.04)",
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "5px",
        lg: "7px",
        xl: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
