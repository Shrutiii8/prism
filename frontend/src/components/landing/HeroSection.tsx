"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PrismMark from "./PrismMark";
import { LANDING_CONTENT } from "@/lib/landing-content";
import { ArrowUpRight, Search, ChevronDown, Download } from "lucide-react";
import InstallAppModal from "./InstallAppModal";
import { useLanguage } from "@/lib/i18n";

interface HeroSectionProps {
  onRequestDemo?: () => void;
}

export default function HeroSection({ onRequestDemo }: HeroSectionProps) {
  const { hero, liveStats } = LANDING_CONTENT;
  const { t, language } = useLanguage();
  const [istTime, setIstTime] = useState("");
  const [overlapCount, setOverlapCount] = useState(342);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Capture PWA install prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleDownloadClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === "accepted") {
          setDeferredPrompt(null);
        } else {
          setIsInstallModalOpen(true);
        }
      });
    } else {
      setIsInstallModalOpen(true);
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column (Headline, Copy, CTAs) */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-7">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-saffron shadow-[0_0_8px_#f28c28]" />
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-canvas-muted">
              {hero.eyebrow}
            </span>
          </motion.div>

          {/* Massive Display Headline */}
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl xl:text-[84px] font-black tracking-tight leading-[0.95] text-canvas-text break-words"
            >
              {language === "en" ? "Every complaint." : t("heroHeading1")}
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl xl:text-[84px] font-black tracking-tight leading-[0.95] text-canvas-text break-words"
            >
              {language === "en" ? "One institution." : t("heroHeading2")}
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl xl:text-[84px] font-serif italic tracking-tight leading-[0.95] text-spectrum break-words"
            >
              {language === "en" ? hero.accentWord : t("heroHeading3")}
            </motion.h1>
          </div>

          {/* Subheadline Body */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-canvas-muted text-sm sm:text-base md:text-lg max-w-xl font-normal leading-relaxed"
          >
            {language === "en" ? hero.subheadline : t("heroSubhead")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
          >
            {/* Primary Solid Button */}
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-md bg-canvas-text text-canvas font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all hover:scale-[1.02] shadow-soft"
              data-cursor="OPEN"
            >
              <span>{language === "en" ? hero.ctaPrimary : t("openDashboard")}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* Secondary Ghost Button */}
            <a
              href="#track"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-md border border-hairline bg-canvas-card text-canvas-muted font-mono text-xs uppercase tracking-wider hover:bg-canvas-subtle hover:text-canvas-text transition-all shadow-xs"
              data-cursor="TRACK"
            >
              <Search className="w-3.5 h-3.5 text-canvas-muted" />
              <span>{language === "en" ? hero.ctaSecondary : t("trackComplaint")}</span>
            </a>

            {/* Download App Action Button */}
            <button
              onClick={handleDownloadClick}
              className="group inline-flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-md border border-hairline hover:border-saffron/60 bg-canvas-card text-canvas-text font-mono text-xs font-bold uppercase tracking-wider hover:bg-canvas-subtle transition-all shadow-xs"
              data-cursor="DOWNLOAD"
            >
              <Download className="w-3.5 h-3.5 text-saffron group-hover:translate-y-0.5 transition-transform" />
              <span>{language === "en" ? "Download App" : t("downloadApp")}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>
          </motion.div>
        </div>

        {/* Right Column: Hero Crystalline Prism Mark & Light Refraction Simulation */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[300px] sm:min-h-[460px] max-w-full overflow-hidden">
          <PrismMark size={320} variant="hero" showBeams={true} />
        </div>
      </div>

      {/* Live Show-Control Stat Strip along Bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-10 sm:mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border border-hairline divide-y sm:divide-y-0 sm:divide-x divide-hairline bg-canvas-card/80 backdrop-blur-md rounded-xl overflow-hidden shadow-soft">
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

      {/* Install Web App Dialog */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallPromptSuccess={() => setDeferredPrompt(null)}
      />
    </section>
  );
}
