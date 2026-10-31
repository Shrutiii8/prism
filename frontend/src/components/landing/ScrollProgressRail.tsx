"use client";

import React, { useEffect, useState } from "react";

const CUES = [
  { id: "bureaus", label: "01", name: "Bureaus" },
  { id: "platform", label: "02", name: "Platform" },
  { id: "intelligence", label: "03", name: "Overlap" },
  { id: "personas", label: "04", name: "Personas" },
  { id: "impact", label: "05", name: "Impact" },
  { id: "security", label: "06", name: "Security" },
];

export default function ScrollProgressRail() {
  const [activeCue, setActiveCue] = useState<string>("bureaus");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const cue of CUES) {
        const el = document.getElementById(cue.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCue(cue.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center select-none pointer-events-auto">
      {/* Top Label */}
      <span className="font-mono text-[9px] uppercase tracking-widest text-canvas-faint mb-3 -rotate-90 origin-bottom">
        CUE RAIL
      </span>

      {/* Rail Dots and Labels */}
      <div className="relative flex flex-col items-center gap-6 py-2">
        {/* Background Track Line */}
        <div className="absolute top-0 bottom-0 w-[1px] bg-hairline" />

        {CUES.map((cue) => {
          const isActive = activeCue === cue.id;
          return (
            <a
              key={cue.id}
              href={`#${cue.id}`}
              className="group relative flex items-center justify-center py-1"
              title={`Jump to CUE ${cue.label}: ${cue.name}`}
            >
              {/* Dot */}
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 z-10 ${
                  isActive
                    ? "bg-canvas-text scale-125 shadow-soft"
                    : "bg-canvas-muted/40 group-hover:bg-canvas-muted scale-100"
                }`}
              />

              {/* Tooltip on hover */}
              <span className="absolute left-6 font-mono text-[9px] tracking-widest uppercase text-canvas-muted group-hover:text-canvas-text transition-opacity opacity-0 group-hover:opacity-100 whitespace-nowrap bg-canvas-card px-2 py-0.5 rounded border border-hairline shadow-soft">
                CUE {cue.label} — {cue.name}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

