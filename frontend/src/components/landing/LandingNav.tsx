"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PrismMark from "./PrismMark";
import { Menu, X, ArrowUpRight } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface LandingNavProps {
  onRequestDemo?: () => void;
}

export default function LandingNav({ onRequestDemo }: LandingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Scroll section tracking to keep active nav selection synced
  useEffect(() => {
    const sectionIds = ["bureaus", "platform", "intelligence", "personas", "impact", "security", "track"];
    const handleScrollSections = () => {
      const scrollY = window.scrollY + 180;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && scrollY >= el.offsetTop) {
          setActiveIdx(i);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScrollSections, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSections);
  }, []);

  // Hide on scroll-down, reveal on scroll-up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { label: "Bureaus", href: "#bureaus" },
    { label: "Platform", href: "#platform" },
    { label: "Intelligence", href: "#intelligence" },
    { label: "Personas", href: "#personas" },
    { label: "Impact", href: "#impact" },
    { label: "Security", href: "#security" },
    { label: "Track", href: "#track" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled
            ? "bg-canvas/90 backdrop-blur-md border-b border-hairline shadow-xs"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Left: Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <PrismMark variant="nav" size={28} />
            <div className="flex flex-col">
              <span className="font-mono text-sm sm:text-base font-black tracking-wider text-canvas-text group-hover:text-saffron transition-colors">
                PRISM
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-canvas-muted">
                AICTE
              </span>
            </div>
          </Link>

          {/* Desktop Links with Rolling Ball / Gliding Pill Selection */}
          <nav
            onMouseLeave={() => setHoveredIdx(null)}
            className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-10"
          >
            {navLinks.map((link, idx) => {
              const isSelected = (hoveredIdx !== null ? hoveredIdx : activeIdx) === idx;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveIdx(idx)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  className="relative px-3.5 py-1.5 font-sans text-xs sm:text-[13px] tracking-wide transition-colors duration-200 select-none group"
                >
                  {/* Rolling Pill Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="nav-rolling-pill"
                      className="absolute inset-0 rounded-[4px] bg-white dark:bg-white shadow-card z-0"
                      transition={{
                        type: "spring",
                        stiffness: 480,
                        damping: 32,
                        mass: 0.5,
                      }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    <span
                      className={`transition-colors duration-150 ${
                        isSelected
                          ? "text-black dark:text-black font-semibold"
                          : "text-canvas-muted group-hover:text-canvas-text"
                      }`}
                    >
                      {link.label}
                    </span>
                    {/* Underline accent beneath the word inside the white pill matching reference */}
                    {isSelected ? (
                      <motion.span
                        layoutId="nav-pill-underline"
                        className="w-full h-[1.5px] bg-black dark:bg-black rounded-full mt-[2px]"
                        transition={{
                          type: "spring",
                          stiffness: 480,
                          damping: 32,
                        }}
                      />
                    ) : (
                      <span className="w-full h-[1.5px] bg-transparent mt-[2px]" />
                    )}
                  </div>
                </a>
              );
            })}
          </nav>

          {/* Right: Theme Toggle & CTAs */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Ghost Track CTA */}
            <a
              href="#track"
              className="hidden md:inline-flex items-center font-mono text-[11px] uppercase tracking-wider text-canvas-muted hover:text-canvas-text px-3 py-1.5 transition-colors"
            >
              Track Case
            </a>

            {/* Solid Official Login CTA */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-canvas-text text-canvas font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all hover:scale-[1.02] shadow-soft shrink-0"
              data-cursor="LOGIN"
            >
              <span>Official Login</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-canvas-muted hover:text-canvas-text"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Full-Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-canvas flex flex-col justify-between p-8 text-canvas-text"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PrismMark variant="nav" size={28} />
                <span className="font-mono text-base font-bold text-canvas-text tracking-widest">
                  PRISM
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-canvas-muted hover:text-canvas-text"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <nav className="flex flex-col gap-6 my-auto">
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="font-serif text-3xl text-canvas-text hover:text-saffron transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <div className="pt-6 border-t border-hairline flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-canvas-muted">Cursor Smoke</span>
                <div className="flex items-center gap-1 bg-canvas-card p-1 rounded-lg border border-hairline">
                  {(["on", "reduced", "off"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        try {
                          localStorage.setItem("prism_cursor_effects", m);
                          window.dispatchEvent(
                            new StorageEvent("storage", {
                              key: "prism_cursor_effects",
                              newValue: m,
                            })
                          );
                        } catch {}
                      }}
                      className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center font-mono text-xs font-bold uppercase tracking-wider bg-canvas-text text-canvas rounded-lg"
              >
                Enter Official Portal
              </Link>
              <p className="font-mono text-[10px] text-canvas-muted text-center">
                AICTE Centralized Regulatory Oversight Platform
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
