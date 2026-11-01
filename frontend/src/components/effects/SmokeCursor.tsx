"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SmokeFluidEngine } from "@/lib/smoke-fluid-engine";
import { SMOKE_CONFIG } from "@/lib/smoke-config";
import { useThemeTokens } from "@/lib/useThemeTokens";

interface SmokeCursorProps {
  className?: string;
}

export default function SmokeCursor({ className = "" }: SmokeCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SmokeFluidEngine | null>(null);
  const pathname = usePathname();
  const { isDark } = useThemeTokens();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check touch device or reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || isReducedMotion) {
      return;
    }

    // Initialize fluid engine
    const engine = new SmokeFluidEngine(canvas);
    engineRef.current = engine;
    engine.setTheme(isDark);

    // Suppression detection over dense tables, forms, modals
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isDense = Boolean(
        target.closest(
          "table, input, textarea, select, [role='dialog'], [data-suppress-smoke='true'], .recharts-surface, .monaco-editor"
        )
      );
      engine.setSuppressed(isDense);
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Listen to user setting updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "prism_cursor_effects" && e.newValue) {
        engine.setUserSetting(e.newValue as "on" | "reduced" | "off");
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("storage", handleStorageChange);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync theme changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTheme(isDark);
    }
  }, [isDark]);

  // Sync route intensity
  useEffect(() => {
    if (!engineRef.current) return;

    if (pathname === "/") {
      engineRef.current.setRouteIntensity(SMOKE_CONFIG.intensityByRoute.home);
    } else if (pathname === "/login") {
      engineRef.current.setRouteIntensity(SMOKE_CONFIG.intensityByRoute.login);
    } else {
      engineRef.current.setRouteIntensity(SMOKE_CONFIG.intensityByRoute.app);
    }
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-[2] select-none ${className}`}
      style={{
        // Screen blend in dark mode, multiply in light mode
        mixBlendMode: isDark ? "screen" : "multiply",
      }}
    />
  );
}

