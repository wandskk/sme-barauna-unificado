import type { Config } from "tailwindcss";

// Paleta institucional (verde/azul/branco), mesma identidade do projeto
// legado — ver docs/ARCHITECTURE.md, seção "Design system".
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16a34a", // verde institucional
          dark: "#15803d",
          light: "#dcfce7",
        },
        secondary: {
          DEFAULT: "#2563eb", // azul institucional
          dark: "#1d4ed8",
          light: "#dbeafe",
        },
      },
    },
  },
  plugins: [],
};

export default config;
