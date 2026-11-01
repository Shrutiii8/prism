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
  const [istTime, setIstTime] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real-time ticking clock in Asia/Kolkata time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setIstTime(`IST ${timeStr}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
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
            ? "bg-canvas/85 backdrop-blur-md border-b border-hairline shadow-xs"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Left: Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <PrismMark variant="nav" size={28} />
            <div className="flex flex-col">
              <span className="font-mono text-base font-black tracking-wider text-canvas-text group-hover:text-saffron transition-colors">
                PRISM
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-canvas-muted">
                AICTE
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-widest text-canvas-muted hover:text-canvas-text transition-colors relative py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Center/Right: Live Ticking Chip & CTAs */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live IST clock chip */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-card border border-hairline font-mono text-[10px] text-canvas-muted shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{istTime || "IST --:--:--"}</span>
              <span className="text-canvas-faint">·</span>
              <span className="text-canvas-text font-semibold">v1.0</span>
            </div>

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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-canvas-text text-canvas font-mono text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all hover:scale-[1.02] shadow-soft"
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

            <div className="pt-8 border-t border-hairline flex flex-col gap-4">
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
