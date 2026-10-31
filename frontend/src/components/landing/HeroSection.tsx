"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PrismMark from "./PrismMark";
import { LANDING_CONTENT } from "@/lib/landing-content";
import { ArrowUpRight, Search, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  onRequestDemo?: () => void;
}

export default function HeroSection({ onRequestDemo }: HeroSectionProps) {
  const { hero, liveStats } = LANDING_CONTENT;
  const [istTime, setIstTime] = useState("");
  const [overlapCount, setOverlapCount] = useState(342);

  // Live IST Clock
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
      setIstTime(timeStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo ticking counter for overlaps flagged
  useEffect(() => {
    const interval = setInterval(() => {
      setOverlapCount((prev) => prev + Math.floor(Math.random() * 2));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-28 pb-12 flex flex-col justify-between overflow-hidden border-b border-hairline">
      {/* 4-Column Thin Vertical Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 flex justify-between max-w-7xl mx-auto px-6 opacity-[0.04]">
        <div className="w-[1px] h-full bg-canvas-text" />
        <div className="w-[1px] h-full bg-canvas-text hidden sm:block" />
        <div className="w-[1px] h-full bg-canvas-text hidden md:block" />
        <div className="w-[1px] h-full bg-canvas-text" />
      </div>

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column (Headline, Copy, CTAs) */}
        <div className="lg:col-span-7 space-y-7">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-saffron shadow-[0_0_8px_#f28c28]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-canvas-muted">
              {hero.eyebrow}
            </span>
          </motion.div>

          {/* Massive Display Headline */}
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-7xl xl:text-[84px] font-black tracking-tight leading-[0.92] text-canvas-text"
            >
              Every complaint.
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-7xl xl:text-[84px] font-black tracking-tight leading-[0.92] text-canvas-text"
            >
              One institution.
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-7xl xl:text-[84px] font-serif italic tracking-tight leading-[0.92] text-spectrum"
            >
              {hero.accentWord}
            </motion.h1>
          </div>

          {/* Subheadline Body */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-canvas-muted text-base sm:text-lg max-w-xl font-normal leading-relaxed"
          >
            {hero.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            {/* Primary Solid Button */}
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-md bg-canvas-text text-canvas font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all hover:scale-[1.02] shadow-soft"
              data-cursor="OPEN"
            >
              <span>{hero.ctaPrimary}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* Secondary Ghost Button */}
            <a
              href="#track"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-md border border-hairline bg-canvas-card text-canvas-muted font-mono text-xs uppercase tracking-wider hover:bg-canvas-subtle hover:text-canvas-text transition-all shadow-xs"
              data-cursor="TRACK"
            >
              <Search className="w-3.5 h-3.5 text-canvas-muted" />
              <span>{hero.ctaSecondary}</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column: Hero Crystalline Prism Mark & Light Refraction Simulation */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[380px] sm:min-h-[460px]">
          <PrismMark size={340} variant="hero" showBeams={true} />
        </div>
      </div>

      {/* Live Show-Control Stat Strip along Bottom */}
      <div className="max-w-7xl mx-auto px-6 w-full mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 border border-hairline divide-x divide-hairline bg-canvas-card/80 backdrop-blur-md rounded-xl overflow-hidden shadow-soft">
          {/* Cell 1: Live Clock */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-canvas-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              YOUR CLOCK
            </span>
            <div className="mt-2 font-mono text-lg sm:text-xl font-bold text-canvas-text tracking-wider">
              {istTime || "12:00:00"} <span className="text-xs text-canvas-muted font-normal">IST</span>
            </div>
          </div>

          {/* Cell 2: Cases Tracked */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-canvas-muted">
              CASES TRACKED
            </span>
            <div className="mt-2 font-mono text-lg sm:text-xl font-bold text-canvas-text tracking-wider">
              1,248 <span className="text-xs text-emerald-500 dark:text-emerald-400 font-normal">Active</span>
            </div>
          </div>

          {/* Cell 3: Bureaus Connected */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-canvas-muted">
              BUREAUS CONNECTED
            </span>
            <div className="mt-2 font-mono text-lg sm:text-xl font-bold text-canvas-text tracking-wider">
              5 <span className="text-xs text-canvas-muted font-normal">+ Regional</span>
            </div>
          </div>

          {/* Cell 4: Overlaps Flagged (ticking) */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-canvas-muted flex items-center justify-between">
              <span>OVERLAPS FLAGGED</span>
              <span className="text-[9px] text-amber-500 uppercase tracking-normal">Demo</span>
            </span>
            <div className="mt-2 font-mono text-lg sm:text-xl font-bold text-canvas-text tracking-wider flex items-center gap-2">
              <span>{overlapCount}</span>
              <span className="text-xs text-amber-500 dark:text-amber-400 font-normal">Correlated</span>
            </div>
          </div>
        </div>

        {/* Bottom Meta Bar & Scroll Indicator */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-canvas-muted font-mono text-[10px] gap-2">
          <span>{hero.metaRow}</span>
          <a
            href="#statement"
            className="flex items-center gap-1.5 text-canvas-muted hover:text-canvas-text transition-colors uppercase tracking-widest"
          >
            <span>Scroll</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
