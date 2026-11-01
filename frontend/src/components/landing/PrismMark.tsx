"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useThemeTokens } from "@/lib/useThemeTokens";

interface PrismMarkProps {
  size?: number;
  variant?: "preloader" | "hero" | "nav" | "footer";
  className?: string;
  showBeams?: boolean;
}

const INCOMING_BEAMS_DARK = [
  { label: "PGRC", yOffset: 12, color: "#60a5fa", delay: 0 },
  { label: "RB", yOffset: 28, color: "#f59e0b", delay: 0.2 },
  { label: "ACADEMIC", yOffset: 44, color: "#10b981", delay: 0.4 },
  { label: "APPROVAL", yOffset: 60, color: "#8b5cf6", delay: 0.6 },
  { label: "REGIONAL", yOffset: 76, color: "#06b6d4", delay: 0.8 },
  { label: "OTHERS", yOffset: 92, color: "#ec4899", delay: 1.0 },
];

const INCOMING_BEAMS_LIGHT = [
  { label: "PGRC", yOffset: 12, color: "#2563eb", delay: 0 },
  { label: "RB", yOffset: 28, color: "#d97706", delay: 0.2 },
  { label: "ACADEMIC", yOffset: 44, color: "#059669", delay: 0.4 },
  { label: "APPROVAL", yOffset: 60, color: "#7c3aed", delay: 0.6 },
  { label: "REGIONAL", yOffset: 76, color: "#0284c7", delay: 0.8 },
  { label: "OTHERS", yOffset: 92, color: "#db2777", delay: 1.0 },
];

export default function PrismMark({
  size = 320,
  variant = "hero",
  className = "",
  showBeams = true,
}: PrismMarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { isDark } = useThemeTokens();

  // Mouse tilt for hero variant
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (variant !== "hero" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = (e.clientX - rect.left) / width - 0.5;
    const mouseYPos = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseXPos);
    y.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const incomingBeams = isDark ? INCOMING_BEAMS_DARK : INCOMING_BEAMS_LIGHT;

  // Minimal versions for Nav and Footer
  if (variant === "nav") {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className={`absolute inset-0 rounded-full blur-md ${isDark ? "bg-blue-500/20" : "bg-saffron/15"}`} />
        <Image
          src="/prism-logo.png"
          alt="PRISM Mark"
          width={size}
          height={size}
          className={`relative z-10 object-contain ${
            isDark
              ? "drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
              : "drop-shadow-[0_2px_8px_rgba(11,13,18,0.15)]"
          }`}
          priority
        />
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/15 via-cyan-500/15 to-amber-500/15 blur-xl rounded-full" />
        <Image
          src="/prism-logo.png"
          alt="PRISM Footer Mark"
          width={size}
          height={size}
          className={`relative z-10 object-contain opacity-95 ${
            isDark
              ? "drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              : "drop-shadow-[0_8px_24px_rgba(11,13,18,0.12)]"
          }`}
        />
      </div>
    );
  }

  // Hero variant with full multi-beam light refraction
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* Ambient Spectrum Aura Behind the Mark */}
      <motion.div
        animate={{
          scale: isHovered ? 1.15 : [1, 1.06, 1],
          opacity: isHovered ? 0.75 : [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute w-[80%] h-[80%] rounded-full blur-3xl pointer-events-none ${
          isDark
            ? "bg-[radial-gradient(circle,rgba(59,130,246,0.35)_0%,rgba(168,85,247,0.25)_35%,rgba(6,182,212,0.2)_65%,transparent_85%)]"
            : "bg-[radial-gradient(circle,rgba(224,123,20,0.15)_0%,rgba(37,99,235,0.1)_35%,rgba(124,58,237,0.08)_65%,transparent_85%)]"
        }`}
      />

      {/* SVG Light Beam Simulation (Incoming parallel bureau streams -> Outgoing single unified beam) */}
      {showBeams && variant === "hero" && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden sm:overflow-visible z-0"
          viewBox="0 0 600 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Spectral Outgoing Gradient */}
            <linearGradient id="spectrumBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isDark ? "#ffffff" : "#0B0D12"} stopOpacity="0.95" />
              <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#a855f7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Incoming Beams (Left -> Logo Center) */}
          {incomingBeams.map((beam, idx) => {
            const startY = 140 + (idx - 2.5) * 26;
            const targetY = 190 + (idx - 2.5) * 8;
            return (
              <g key={beam.label} className="opacity-75 hover:opacity-100 transition-opacity">
                {/* Ray line */}
                <motion.line
                  x1="-60"
                  y1={startY}
                  x2="245"
                  y2={targetY}
                  stroke={beam.color}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: [100, 0] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: beam.delay,
                  }}
                  filter={isDark ? "url(#glowFilter)" : undefined}
                  opacity={isDark ? 0.8 : 0.9}
                />
                {/* Bureau source indicator tag */}
                <text
                  x="-50"
                  y={startY - 6}
                  fill={beam.color}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  letterSpacing="0.1em"
                  opacity={isDark ? 0.85 : 0.95}
                >
                  {beam.label}
                </text>
              </g>
            );
          })}

          {/* Outgoing Unified Spectrum Beam (Right Facet -> Right Exit) */}
          <g filter={isDark ? "url(#glowFilter)" : undefined}>
            {/* Outer soft glow beam */}
            <line
              x1="355"
              y1="190"
              x2="680"
              y2="190"
              stroke="url(#spectrumBeam)"
              strokeWidth="10"
              strokeLinecap="round"
              opacity={isDark ? "0.3" : "0.15"}
            />
            {/* Main focused core beam */}
            <motion.line
              x1="355"
              y1="190"
              x2="680"
              y2="190"
              stroke="url(#spectrumBeam)"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 50 }}
              animate={{ strokeDashoffset: [50, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
            {/* Label over unified beam */}
            <text
              x="400"
              y="176"
              fill={isDark ? "#ffffff" : "#0B0D12"}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.15em"
              opacity={0.9}
            >
              ONE INSTITUTION · ONE CASE
            </text>
          </g>
        </svg>
      )}

      {/* The 3D Responsive Triangular Crystalline Prism Logo */}
      <motion.div
        style={{
          rotateX: variant === "hero" ? rotateX : 0,
          rotateY: variant === "hero" ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative z-10 flex items-center justify-center cursor-pointer"
        data-cursor="PRISM"
      >
        <Image
          src="/prism-logo.png"
          alt="PRISM Official Logo Mark"
          width={size}
          height={size}
          style={{ width: "auto", height: "auto" }}
          className={`object-contain max-w-[75vw] sm:max-w-none filter ${
            isDark
              ? "drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] brightness-105 contrast-110"
              : "drop-shadow-[0_12px_28px_rgba(11,13,18,0.18)] brightness-100 contrast-105"
          }`}
          priority
        />
      </motion.div>
    </div>
  );
}
