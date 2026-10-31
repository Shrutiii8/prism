"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_CONTENT } from "@/lib/landing-content";
import { Terminal } from "lucide-react";

export default function Cue02PlatformStages() {
  const { cue02 } = LANDING_CONTENT;
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const activeStage = cue02.stages[activeStageIndex];

  return (
    <section id="platform" className="relative py-28 sm:py-36 border-b border-hairline overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-spectrum uppercase tracking-[0.2em]">
                {cue02.tag}
              </span>
              <span className="text-canvas-faint font-mono text-xs">/</span>
              <span className="font-mono text-xs text-canvas-muted uppercase tracking-widest">
                ARCHITECTURE BLUEPRINT
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-canvas-text">
              {cue02.title}
            </h2>
          </div>
          <p className="text-canvas-muted text-sm max-w-md font-normal leading-relaxed">
            {cue02.subtitle}
          </p>
        </div>

        {/* Interactive Architecture Stage Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Stage Selector Column */}
          <div className="lg:col-span-5 space-y-2">
            {cue02.stages.map((stage, idx) => {
              const isActive = activeStageIndex === idx;
              return (
                <button
                  key={stage.step}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    isActive
                      ? "bg-canvas-card border-hairline-strong text-canvas-text shadow-soft"
                      : "bg-transparent border-transparent text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle"
                  }`}
                  data-cursor="SELECT"
                >
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      isActive
                        ? "bg-canvas-text text-canvas font-extrabold"
                        : "bg-canvas-subtle text-canvas-muted"
                    }`}
                  >
                    {stage.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold tracking-wide">{stage.title}</h3>
                    <p className="text-xs text-canvas-muted line-clamp-1 mt-0.5 font-normal">
                      {stage.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Dynamic Animated Visual Stage Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="bg-canvas-surface dark:bg-[#0c0e15] border border-hairline-strong rounded-2xl p-6 sm:p-8 space-y-6 shadow-card relative overflow-hidden text-canvas-text"
              >
                {/* Background Architectural Watermark */}
                <div className="absolute top-4 right-6 font-mono text-7xl font-black text-canvas-text opacity-[0.03] select-none pointer-events-none">
                  {activeStage.number}
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-canvas-text uppercase tracking-widest">
                      {activeStage.step}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-canvas-muted uppercase tracking-wider">
                    PRISM v1.0 PIPELINE
                  </span>
                </div>

                {/* Stage Title and Description */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-canvas-text tracking-tight">
                    {activeStage.title}
                  </h3>
                  <p className="text-canvas-muted text-sm mt-3 leading-relaxed font-normal">
                    {activeStage.description}
                  </p>
                </div>

                {/* Visual Architecture Box / Mock Console */}
                <div className="bg-canvas-card dark:bg-[#050608] border border-hairline rounded-xl p-4 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-canvas-faint text-[10px] pb-2 border-b border-hairline">
                    <span className="flex items-center gap-1.5 text-saffron">
                      <Terminal className="w-3.5 h-3.5" /> SYSTEM TELEMETRY
                    </span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold">STATUS: NOMINAL</span>
                  </div>

                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    &gt; {activeStage.highlightCode}
                  </div>

                  {/* Measured Specs Row */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {activeStage.specs.map((spec) => (
                      <div key={spec.label} className="bg-canvas-subtle p-2.5 rounded border border-hairline">
                        <span className="text-[9px] uppercase tracking-wider text-canvas-faint block">
                          {spec.label}
                        </span>
                        <span className="text-xs font-bold text-canvas-text mt-1 block">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Readout Measured Specs Bar Along Bottom */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 border border-hairline divide-x divide-hairline bg-canvas-card rounded-xl overflow-hidden shadow-soft">
          {cue02.readouts.map((item) => (
            <div key={item.label} className="p-5 flex flex-col justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-canvas-faint">
                {item.label}
              </span>
              <div className="mt-3">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-canvas-text">
                  {item.value}
                </span>
                <span className="font-mono text-[11px] text-canvas-muted block mt-0.5">
                  {item.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
