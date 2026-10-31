"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_CONTENT, BureauItem } from "@/lib/landing-content";
import { ArrowUpRight } from "lucide-react";

export default function Cue01Bureaus() {
  const { cue01 } = LANDING_CONTENT;
  const [hoveredBureau, setHoveredBureau] = useState<BureauItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section
      id="bureaus"
      onMouseMove={handleMouseMove}
      className="relative py-28 sm:py-36 border-b border-hairline overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-spectrum uppercase tracking-[0.2em]">
                {cue01.tag}
              </span>
              <span className="text-canvas-faint font-mono text-xs">/</span>
              <span className="font-mono text-xs text-canvas-muted uppercase tracking-widest">
                INTER-BUREAU COUPLING
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-canvas-text">
              {cue01.title}
            </h2>
          </div>
          <p className="text-canvas-muted text-sm max-w-md font-normal leading-relaxed">
            {cue01.subtitle}
          </p>
        </div>

        {/* List-style Rows */}
        <div className="divide-y divide-hairline border-t border-b border-hairline">
          {cue01.bureaus.map((bureau) => {
            const isHovered = hoveredBureau?.id === bureau.id;
            const isDimmed = hoveredBureau !== null && !isHovered;

            return (
              <div
                key={bureau.id}
                onMouseEnter={() => setHoveredBureau(bureau)}
                onMouseLeave={() => setHoveredBureau(null)}
                className={`group py-8 sm:py-10 transition-all duration-300 cursor-pointer ${
                  isDimmed ? "opacity-35" : "opacity-100"
                }`}
                data-cursor="EXPAND"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Number + Bureau Code + Title */}
                  <div className="flex items-start sm:items-center gap-6 sm:gap-10">
                    <span className="font-mono text-xs font-bold text-canvas-faint w-8">
                      {bureau.cueNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded bg-canvas-subtle text-canvas-text border border-hairline">
                          {bureau.code}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-canvas-text group-hover:text-saffron transition-colors">
                          {bureau.name}
                        </h3>
                      </div>
                      <p className="text-xs text-canvas-muted mt-1 font-mono uppercase tracking-wider">
                        {bureau.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Center: Short description */}
                  <p className="text-sm text-canvas-muted max-w-md font-normal leading-relaxed lg:px-4">
                    {bureau.description}
                  </p>

                  {/* Right: Tag chips + Arrow */}
                  <div className="flex items-center justify-between lg:justify-end gap-6">
                    <div className="flex flex-wrap gap-1.5">
                      {bureau.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] text-canvas-muted bg-canvas-card border border-hairline px-2 py-0.5 rounded shadow-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center text-canvas-muted group-hover:text-canvas-text group-hover:border-hairline-strong transition-colors shrink-0 shadow-xs">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Hover Preview Card (Follows cursor on desktop) */}
        <AnimatePresence>
          {hoveredBureau && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="hidden lg:block fixed pointer-events-none z-50 p-4 rounded-xl bg-canvas-surface/95 dark:bg-[#0e121a]/95 border border-hairline-strong shadow-card backdrop-blur-md w-72"
              style={{
                left: mousePos.x + 24,
                top: mousePos.y - 48,
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono border-b border-hairline pb-2 mb-2">
                <span className="text-canvas-muted uppercase">Live Queue Preview</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-xs font-bold text-canvas-text">
                  {hoveredBureau.sampleCaseId}
                </div>
                <div className="text-[11px] text-saffron font-medium">
                  {hoveredBureau.sampleCategory}
                </div>
                <div className="text-[10px] text-canvas-muted font-mono mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{hoveredBureau.sampleStatus}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
