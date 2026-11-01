"use client";

import React from "react";
import { LANDING_CONTENT } from "@/lib/landing-content";
import { XCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function Cue05Impact() {
  const { cue05 } = LANDING_CONTENT;

  return (
    <section id="impact" className="relative py-20 sm:py-36 border-b border-hairline overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-spectrum uppercase tracking-[0.2em]">
                {cue05.tag}
              </span>
              <span className="text-canvas-faint font-mono text-xs">/</span>
              <span className="font-mono text-xs text-canvas-muted uppercase tracking-widest">
                SYSTEMIC TRANSFORMATION
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-canvas-text">
              {cue05.title}
            </h2>
          </div>
          <p className="text-canvas-muted text-sm max-w-md font-normal leading-relaxed">
            {cue05.subtitle}
          </p>
        </div>

        {/* Before vs After Comparison Grid */}
        <div className="border border-hairline rounded-2xl overflow-hidden divide-y divide-hairline bg-canvas-card shadow-card">
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hairline bg-canvas-subtle font-mono text-xs uppercase tracking-widest">
            <div className="p-4 sm:p-5 flex items-center gap-2 text-canvas-muted">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>STATUS QUO (FRAGMENTED)</span>
            </div>
            <div className="p-4 sm:p-5 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>WITH PRISM (CENTRALIZED)</span>
            </div>
          </div>

          {/* Comparison Rows */}
          {cue05.rows.map((row) => (
            <div
              key={row.aspect}
              className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hairline hover:bg-canvas-subtle transition-colors"
            >
              {/* Left: Status Quo (Dimmed) */}
              <div className="p-4 sm:p-7 space-y-1">
                <span className="font-mono text-[10px] uppercase text-canvas-faint block tracking-wider font-semibold">
                  {row.aspect}
                </span>
                <p className="text-sm text-canvas-muted leading-relaxed line-through decoration-rose-500/50">
                  {row.today}
                </p>
              </div>

              {/* Right: With PRISM (Vibrant / Clean) */}
              <div className="p-4 sm:p-7 space-y-1 bg-emerald-500/[0.03]">
                <span className="font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider font-bold">
                  PRISM RESOLUTION
                </span>
                <p className="text-sm text-canvas-text font-medium leading-relaxed flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{row.withPrism}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
