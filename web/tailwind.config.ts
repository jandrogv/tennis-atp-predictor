import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0f172a",
          navy: "#111827",
          court: "#15803d",
          lime: "#84cc16",
          limeSoft: "rgba(190, 242, 100, 0.22)",
          mist: "#eef6f1",
          sky: "#eaf2ff"
        },
        surface: {
          page: "#f8faf5",
          soft: "#f2f6ee",
          card: "rgba(255, 255, 255, 0.58)",
          raised: "rgba(255, 255, 255, 0.76)",
          muted: "rgba(248, 250, 252, 0.62)",
          hairline: "rgba(15, 23, 42, 0.06)",
          dark: "#050816"
        },
        status: {
          success: "#15803d",
          warning: "#b45309",
          danger: "#b91c1c",
          info: "#2563eb"
        },
        court: {
          ink: "#172033",
          muted: "#5d6678",
          line: "#d8dde8",
          hard: "#2563eb",
          clay: "#c66a3d",
          grass: "#16803c",
          carpet: "#7c3aed"
        }
      },
      boxShadow: {
        soft: "0 16px 44px rgba(23, 32, 51, 0.04)",
        card: "0 10px 28px rgba(15, 23, 42, 0.028)",
        lift: "0 18px 48px rgba(15, 23, 42, 0.07)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      }
    }
  },
  plugins: []
};

export default config;
