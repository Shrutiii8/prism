"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, ChevronDown, Check } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showDropdown?: boolean;
  variant?: "pill" | "icon" | "nav";
}

export default function ThemeToggle({
  className = "",
  showDropdown = true,
  variant = "pill",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const changeThemeWithTransition = (newTheme: string, e: React.MouseEvent) => {
    setIsOpen(false);

    // If reduced motion is requested or view transitions are not supported, change instantly
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Check if View Transitions API is available
    if (
      !document.startViewTransition ||
      prefersReducedMotion ||
      typeof document === "undefined"
    ) {
      setTheme(newTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 550,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const handleQuickToggle = (e: React.MouseEvent) => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    changeThemeWithTransition(nextTheme, e);
  };

  if (!mounted) {
    // Avoid hydration mismatch before mount
    return (
      <div className={`w-8 h-8 rounded-lg border border-hairline bg-canvas-card ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {variant === "icon" ? (
        <button
          onClick={handleQuickToggle}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className="p-2 rounded-lg border border-hairline bg-canvas-card text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-all duration-200 group relative"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-saffron group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      ) : (
        <div className="flex items-center">
          <button
            onClick={handleQuickToggle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-lg border border-hairline bg-canvas-card text-canvas-muted hover:text-canvas-text hover:border-hairline-strong text-xs font-mono transition-all duration-200 group shadow-xs"
            title={`Active: ${theme?.toUpperCase()}. Click to switch to ${isDark ? "Light" : "Dark"}`}
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-saffron group-hover:-rotate-12 transition-transform" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-saffron group-hover:rotate-45 transition-transform" />
            )}
            <span className="hidden sm:inline capitalize font-medium">{resolvedTheme}</span>
          </button>

          {showDropdown && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-r-lg border-y border-r border-hairline bg-canvas-card text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-all duration-200"
              title="Theme Selection Menu"
              aria-expanded={isOpen}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      )}

      {/* Dropdown Menu (Light / Dark / System) */}
      {showDropdown && isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-hairline-strong bg-canvas-surface/95 backdrop-blur-xl shadow-card p-1.5 z-50 text-xs font-mono space-y-0.5">
          <button
            onClick={(e) => changeThemeWithTransition("light", e)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              theme === "light"
                ? "bg-canvas-card font-medium text-canvas-text"
                : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-card/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === "light" && <Check className="w-3.5 h-3.5 text-saffron" />}
          </button>

          <button
            onClick={(e) => changeThemeWithTransition("dark", e)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              theme === "dark"
                ? "bg-canvas-card font-medium text-canvas-text"
                : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-card/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dark</span>
            </div>
            {theme === "dark" && <Check className="w-3.5 h-3.5 text-saffron" />}
          </button>

          <button
            onClick={(e) => changeThemeWithTransition("system", e)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              theme === "system"
                ? "bg-canvas-card font-medium text-canvas-text"
                : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-card/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-purple-400" />
              <span>System</span>
            </div>
            {theme === "system" && <Check className="w-3.5 h-3.5 text-saffron" />}
          </button>
        </div>
      )}
    </div>
  );
}

