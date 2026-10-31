"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export interface ThemeTokens {
  theme: string;
  resolvedTheme: string;
  isDark: boolean;
  mounted: boolean;
  setTheme: (theme: string) => void;
  // Raw token values
  bg: string;
  surface: string;
  card: string;
  cardSubtle: string;
  hairline: string;
  hairlineStrong: string;
  hairlineSubtle: string;
  text: string;
  muted: string;
  faint: string;
  saffron: string;
  green: string;
  navy: string;
  // Chart specifics
  chartGrid: string;
  chartTooltipBg: string;
  chartTooltipBorder: string;
  chartTooltipText: string;
  chartColors: string[];
  // Status pills
  status: {
    process: { text: string; bg: string; border: string };
    pending: { text: string; bg: string; border: string };
    action: { text: string; bg: string; border: string };
    disposed: { text: string; bg: string; border: string };
    overdue: { text: string; bg: string; border: string };
    transferred: { text: string; bg: string; border: string };
  };
}

export function useThemeTokens(): ThemeTokens {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? (resolvedTheme || theme || "dark") : "dark";
  const isDark = activeTheme === "dark";

  return {
    theme: theme || "dark",
    resolvedTheme: activeTheme,
    isDark,
    mounted,
    setTheme,
    // Surfaces
    bg: isDark ? "#08090B" : "#F5F4F0",
    surface: isDark ? "#0E1014" : "#FBFAF7",
    card: isDark ? "rgba(255, 255, 255, 0.035)" : "#FFFFFF",
    cardSubtle: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(11, 13, 18, 0.025)",
    // Hairlines
    hairline: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(11, 13, 18, 0.08)",
    hairlineStrong: isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(11, 13, 18, 0.16)",
    hairlineSubtle: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(11, 13, 18, 0.04)",
    // Typography
    text: isDark ? "#EDEEF0" : "#0B0D12",
    muted: isDark ? "#8A8F98" : "#5B616B",
    faint: isDark ? "#5B616B" : "#8A8F98",
    // Accents
    saffron: isDark ? "#F28C28" : "#E07B14",
    green: isDark ? "#1E8E4E" : "#17803F",
    navy: isDark ? "#08090B" : "#14305A",
    // Charts
    chartGrid: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(11, 13, 18, 0.06)",
    chartTooltipBg: isDark ? "#0E1014" : "#FFFFFF",
    chartTooltipBorder: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(11, 13, 18, 0.12)",
    chartTooltipText: isDark ? "#ffffff" : "#0B0D12",
    chartColors: isDark
      ? ["#F28C28", "#38bdf8", "#10b981", "#a855f7", "#ec4899", "#f59e0b"]
      : ["#E07B14", "#0284c7", "#16a34a", "#9333ea", "#db2777", "#d97706"],
    // Semantic Status Tones (AA contrast validated)
    status: {
      process: isDark
        ? { text: "#93c5fd", bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)" }
        : { text: "#1d4ed8", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)" },
      pending: isDark
        ? { text: "#fcd34d", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" }
        : { text: "#b45309", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.25)" },
      action: isDark
        ? { text: "#fdba74", bg: "rgba(242, 140, 40, 0.15)", border: "rgba(242, 140, 40, 0.3)" }
        : { text: "#c2410c", bg: "rgba(234, 88, 12, 0.12)", border: "rgba(234, 88, 12, 0.25)" },
      disposed: isDark
        ? { text: "#86efac", bg: "rgba(30, 142, 78, 0.18)", border: "rgba(30, 142, 78, 0.35)" }
        : { text: "#15803d", bg: "rgba(22, 163, 74, 0.12)", border: "rgba(22, 163, 74, 0.25)" },
      overdue: isDark
        ? { text: "#fca5a5", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)" }
        : { text: "#b91c1c", bg: "rgba(220, 38, 38, 0.12)", border: "rgba(220, 38, 38, 0.25)" },
      transferred: isDark
        ? { text: "#d8b4fe", bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.3)" }
        : { text: "#6d28d9", bg: "rgba(124, 58, 237, 0.12)", border: "rgba(124, 58, 237, 0.25)" },
    },
  };
}

