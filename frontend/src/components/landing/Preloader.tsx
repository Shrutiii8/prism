"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useThemeTokens } from "@/lib/useThemeTokens";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { isDark } = useThemeTokens();

  useEffect(() => {
    // Check if user already saw preloader in this session
    const hasSeen = sessionStorage.getItem("prism_preloader_seen");
    if (hasSeen === "true") {
      setIsVisible(false);
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            sessionStorage.setItem("prism_preloader_seen", "true");
            setIsVisible(false);
            onComplete();
          }, 450);
          return 100;
        }
        return prev + 2;
      });
    }, 28);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    sessionStorage.setItem("prism_preloader_seen", "true");
    setIsVisible(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[10000] bg-canvas flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-8 font-mono text-[11px] uppercase tracking-widest text-canvas-muted hover:text-canvas-text border border-hairline px-3 py-1.5 rounded-full transition-colors z-20 shadow-xs"
          >
            Skip [ESC]
          </button>

          {/* Central Beam & Prism Sequence */}
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Incoming Light Beam */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "160px", opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`absolute left-[-160px] h-[2px] bg-gradient-to-r from-transparent ${
                isDark
                  ? "to-white shadow-[0_0_12px_#ffffff]"
                  : "to-[#0B0D12] shadow-[0_0_12px_rgba(11,13,18,0.25)]"
              }`}
            />

            {/* Glowing Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "brightness(0.5)" }}
              animate={{ scale: 1, opacity: 1, filter: "brightness(1.15)" }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`relative z-10 ${
                isDark
                  ? "drop-shadow-[0_0_35px_rgba(59,130,246,0.5)]"
                  : "drop-shadow-[0_10px_25px_rgba(11,13,18,0.15)]"
              }`}
            >
              <Image
                src="/prism-logo.png"
                alt="PRISM Preloader Logo"
                width={140}
                height={140}
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Outgoing Fanning Spectral Rays */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: [0, 0.85, 0.4], scaleX: 1 }}
              transition={{ delay: 0.7, duration: 1.0, ease: "easeOut" }}
              className="absolute right-[-140px] w-36 h-28 pointer-events-none origin-left flex flex-col justify-around"
            >
              <div
                className={`h-[2px] w-full bg-gradient-to-r from-saffron via-cyan-400 to-transparent rotate-[-12deg]`}
              />
              <div
                className={`h-[2px] w-full bg-gradient-to-r from-saffron via-emerald-400 to-transparent rotate-[-4deg]`}
              />
              <div
                className={`h-[2px] w-full bg-gradient-to-r from-saffron via-purple-400 to-transparent rotate-[6deg]`}
              />
              <div
                className={`h-[2px] w-full bg-gradient-to-r from-saffron via-amber-400 to-transparent rotate-[14deg]`}
              />
            </motion.div>
          </div>

          {/* Monospace Numerical Progress & Status Readout */}
          <div className="flex flex-col items-center mt-6 z-10">
            <span className="font-mono text-3xl font-light text-canvas-text tracking-widest tabular-nums">
              {progress.toString().padStart(2, "0")}
              <span className="text-saffron text-sm ml-1 font-bold">%</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-canvas-muted mt-2">
              INITIALISING UNIFIED REGISTRY
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
