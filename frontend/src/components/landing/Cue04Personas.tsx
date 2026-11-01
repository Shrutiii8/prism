"use client";

import React from "react";
import { motion } from "framer-motion";
import { LANDING_CONTENT } from "@/lib/landing-content";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Cue04Personas() {
  const { cue04 } = LANDING_CONTENT;

  return (
    <section id="personas" className="relative py-20 sm:py-36 border-b border-hairline overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-spectrum uppercase tracking-[0.2em]">
                {cue04.tag}
              </span>
              <span className="text-canvas-faint font-mono text-xs">/</span>
              <span className="font-mono text-xs text-canvas-muted uppercase tracking-widest">
                USER ARCHETYPES
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-canvas-text">
              {cue04.title}
            </h2>
          </div>
          <p className="text-canvas-muted text-sm max-w-md font-normal leading-relaxed">
            {cue04.subtitle}
          </p>
        </div>

        {/* 3 Large Persona Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {cue04.personas.map((persona) => (
            <motion.div
              key={persona.role}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-canvas-card dark:bg-[#0c0e15] border border-hairline hover:border-hairline-strong rounded-2xl p-5 sm:p-7 flex flex-col justify-between overflow-hidden shadow-card"
              data-cursor="PERSONA"
            >
              {/* Subtle Spectrum Top Border on Hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[10px] font-bold text-saffron uppercase tracking-widest">
                    {persona.tag}
                  </span>
                  <h3 className="text-2xl font-bold text-canvas-text mt-1 group-hover:text-saffron transition-colors">
                    {persona.title}
                  </h3>
                  <p className="text-xs text-canvas-muted font-mono mt-0.5">{persona.role}</p>
                </div>

                <p className="text-sm text-canvas-muted leading-relaxed font-normal">
                  {persona.description}
                </p>

                {/* Feature Bullet List */}
                <div className="space-y-2.5 pt-2">
                  {persona.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-canvas-text">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Interactive UI Snippet */}
              <div className="mt-8 pt-5 border-t border-hairline">
                <div className="bg-canvas-subtle dark:bg-[#05060a] border border-hairline rounded-xl p-3.5 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-canvas-muted">
                    <span className="truncate">{persona.mockUiHeader}</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold shrink-0">● LIVE</span>
                  </div>
                  <div className="text-xs font-bold text-canvas-text">{persona.mockUiStat}</div>
                  <div className="text-[10px] text-saffron flex items-center justify-between pt-1 font-semibold">
                    <span>{persona.mockUiAction}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
