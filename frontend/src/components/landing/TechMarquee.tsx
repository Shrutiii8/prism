"use client";

import React from "react";
import { LANDING_CONTENT } from "@/lib/landing-content";

export default function TechMarquee() {
  const { techMarquee } = LANDING_CONTENT;
  const row1 = techMarquee;
  const row2 = [...techMarquee].reverse();

  return (
    <section className="relative py-16 border-b border-hairline overflow-hidden bg-canvas-surface dark:bg-[#060709] select-none">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-canvas-faint">
          ENTERPRISE ARCHITECTURAL SPECIFICATIONS & STACK
        </span>
      </div>

      {/* Row 1 - Leftward Flow */}
      <div className="flex overflow-hidden group mb-4">
        <div className="flex gap-8 whitespace-nowrap animate-marquee-left group-hover:[animation-play-state:paused]">
          {[...row1, ...row1, ...row1].map((item, idx) => (
            <div
              key={idx}
              className="font-mono text-xs text-canvas-muted font-semibold px-4 py-2 rounded-full border border-hairline bg-canvas-card flex items-center gap-2 hover:text-canvas-text hover:border-hairline-strong transition-colors shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-saffron" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 - Rightward Flow */}
      <div className="flex overflow-hidden group">
        <div className="flex gap-8 whitespace-nowrap animate-marquee-right group-hover:[animation-play-state:paused]">
          {[...row2, ...row2, ...row2].map((item, idx) => (
            <div
              key={idx}
              className="font-mono text-xs text-canvas-muted font-semibold px-4 py-2 rounded-full border border-hairline bg-canvas-card flex items-center gap-2 hover:text-canvas-text hover:border-hairline-strong transition-colors shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
