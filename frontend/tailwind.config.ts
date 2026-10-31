import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "var(--bg)",
          surface: "var(--surface)",
          card: "var(--card)",
          "card-hover": "var(--card-hover)",
          "card-subtle": "var(--card-subtle)",
          border: "var(--hairline)",
          text: "var(--text)",
          muted: "var(--muted)",
          faint: "var(--faint)",
        },
        hairline: {
          DEFAULT: "var(--hairline)",
          strong: "var(--hairline-strong)",
          subtle: "var(--hairline-subtle)",
        },
        spectrum: {
          violet: "#8b5cf6",
          blue: "#3b82f6",
          cyan: "#06b6d4",
          green: "#10b981",
          amber: "#f59e0b",
          orange: "#f97316",
        },
        tricolour: {
          saffron: "#F28C28",
          white: "#FFFFFF",
          green: "#1E8E4E",
        },
        status: {
          process: "#3b82f6",
          pending: "#f59e0b",
          action: "#F28C28",
          disposed: "#10b981",
          overdue: "#ef4444",
          transferred: "#8b5cf6",
        },
        saffron: "var(--saffron)",
        gov: {
          navy: "var(--navy)",
          "navy-light": "var(--surface)",
          gold: "var(--saffron)",
        },
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        serif: ["var(--font-instrument)", "Instrument Serif", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "beam-flow": "beamFlow 3s ease-in-out infinite",
        "marquee-left": "marqueeLeft 40s linear infinite",
        "marquee-right": "marqueeRight 40s linear infinite",
        shimmer: "shimmer 2.5s infinite linear",
      },
      keyframes: {
        beamFlow: {
          "0%, 100%": { opacity: "0.4", strokeDashoffset: "100" },
          "50%": { opacity: "1", strokeDashoffset: "0" },
        },
        marqueeLeft: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeRight: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
