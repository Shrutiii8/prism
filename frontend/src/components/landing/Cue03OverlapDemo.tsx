"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LANDING_CONTENT } from "@/lib/landing-content";
import { Check, X, Cpu, Building } from "lucide-react";

export default function Cue03OverlapDemo() {
  const { cue03 } = LANDING_CONTENT;
  const [sliderVal, setSliderVal] = useState(78); // Default 78%
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>("pgrc-node");

  // Determine current tier from slider
  const getTier = (val: number) => {
    if (val >= 80) {
      return {
        label: "HIGH CONFIDENCE OVERLAP",
        status: "Potential systemic overlap identified across bureaus",
        color: "text-emerald-600 dark:text-emerald-400",
        badgeBg: "bg-emerald-500/10 border-emerald-500/30",
        borderColor: "border-emerald-500",
      };
    }
    if (val >= 50) {
      return {
        label: "MEDIUM CONFIDENCE MATCH",
        status: "Possible correlation — requires mandatory human verification",
        color: "text-amber-600 dark:text-amber-400",
        badgeBg: "bg-amber-500/10 border-amber-500/30",
        borderColor: "border-amber-500",
      };
    }
    return {
      label: "LOW CONFIDENCE",
      status: "Independent isolated incident — no correlation flagged",
      color: "text-canvas-muted",
      badgeBg: "bg-canvas-subtle border-hairline",
      borderColor: "border-hairline",
    };
  };

  const currentTier = getTier(sliderVal);

  const handleConfirm = () => {
    setIsConfirmed(true);
    setIsRejected(false);
  };

  const handleReject = () => {
    setIsRejected(true);
    setIsConfirmed(false);
  };

  return (
    <section id="intelligence" className="relative py-20 sm:py-36 border-b border-hairline overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-spectrum uppercase tracking-[0.2em]">
                {cue03.tag}
              </span>
              <span className="text-canvas-faint font-mono text-xs">/</span>
              <span className="font-mono text-xs text-canvas-muted uppercase tracking-widest">
                AI MATCHING ENGINE
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-canvas-text">
              {cue03.title}
            </h2>
          </div>
          <p className="text-canvas-muted text-sm max-w-md font-normal leading-relaxed">
            {cue03.subtitle}
          </p>
        </div>

        {/* Interactive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Orbital Node Diagram */}
          <div className="lg:col-span-7 bg-canvas-card dark:bg-[#0a0c12] border border-hairline rounded-2xl p-4 sm:p-10 relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center overflow-hidden shadow-card">
            {/* Background Radial Graph */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center scale-[0.68] xs:scale-[0.80] sm:scale-100 origin-center">
              {/* Orbit rings */}
              <div className="absolute w-72 h-72 rounded-full border border-hairline pointer-events-none animate-pulse-slow" />
              <div className="absolute w-[420px] h-[420px] rounded-full border border-dashed border-hairline pointer-events-none" />

              {/* Central Institution Hub Node */}
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="relative z-20 bg-canvas-surface dark:bg-[#121622] border-2 border-hairline-strong p-4 sm:p-5 rounded-2xl text-center shadow-card max-w-xs"
              >
                <div className="w-10 h-10 rounded-full bg-saffron/15 text-saffron border border-saffron/30 flex items-center justify-center mx-auto mb-2">
                  <Building className="w-5 h-5" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-canvas-muted block font-medium">
                  TARGET INSTITUTION
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-canvas-text mt-1 leading-snug">
                  {cue03.institution.name}
                </h4>
                <span className="font-mono text-[10px] text-saffron block mt-1 font-semibold">
                  ID: {cue03.institution.aicteId}
                </span>
              </motion.div>

              {/* Orbiting Case Nodes */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {cue03.nodes.map((node, i) => {
                  const isSelected = activeNodeId === node.id;
                  // Position calculations around center
                  const angles = [-45, 45, 145];
                  const angle = angles[i] * (Math.PI / 180);
                  const radius = 175;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.div
                      key={node.id}
                      onClick={() => setActiveNodeId(node.id)}
                      animate={{
                        scale: isSelected ? 1.08 : 1,
                      }}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                      className={`pointer-events-auto absolute p-3 rounded-xl bg-canvas-surface dark:bg-[#0f1420] border text-left cursor-pointer transition-all w-48 shadow-card ${
                        isSelected
                          ? "border-saffron/80 ring-2 ring-saffron/30"
                          : "border-hairline hover:border-hairline-strong"
                      }`}
                      data-cursor="NODE"
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] mb-1">
                        <span className="font-bold text-canvas-text px-1.5 py-0.5 rounded bg-canvas-subtle border border-hairline">
                          {node.code}
                        </span>
                        <span style={{ color: node.color }} className="font-bold">
                          {(node.similarity * 100).toFixed(0)}% MATCH
                        </span>
                      </div>
                      <div className="font-mono text-[11px] font-bold text-canvas-text truncate">
                        {node.caseId}
                      </div>
                      <div className="text-[10px] text-canvas-muted line-clamp-1 mt-0.5">
                        {node.category}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Confidence Controls & Factor Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            {/* Interactive Confidence Slider Box */}
            <div className="bg-canvas-card dark:bg-[#0c0e15] border border-hairline rounded-2xl p-6 space-y-4 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-canvas-muted flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-saffron" />
                  CONFIDENCE CUTOFF SLIDER
                </span>
                <span className="font-mono text-xl font-extrabold text-canvas-text">
                  {sliderVal}%
                </span>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={(e) => {
                  setSliderVal(parseInt(e.target.value));
                  setIsConfirmed(false);
                  setIsRejected(false);
                }}
                className="w-full accent-saffron h-1.5 bg-canvas-subtle rounded-lg cursor-pointer"
              />

              {/* Tier Status Badge */}
              <div className={`p-3 rounded-lg border ${currentTier.badgeBg} flex items-center justify-between`}>
                <div>
                  <span className={`font-mono text-xs font-bold ${currentTier.color}`}>
                    {currentTier.label}
                  </span>
                  <p className="text-[11px] text-canvas-muted mt-0.5">{currentTier.status}</p>
                </div>
              </div>
            </div>

            {/* Factor Breakdown Bars */}
            <div className="bg-canvas-card dark:bg-[#0c0e15] border border-hairline rounded-2xl p-6 space-y-3.5 shadow-soft">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-canvas-muted block pb-1 border-b border-hairline">
                SCORING FACTOR DECOMPOSITION
              </span>

              {cue03.similarityBreakdown.map((item) => (
                <div key={item.factor} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-canvas-text font-medium">{item.factor}</span>
                    <span className="font-mono font-bold text-canvas-text">{item.weight}</span>
                  </div>
                  <div className="w-full h-1.5 bg-canvas-subtle rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-saffron to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Human Verification Action Pair */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={isConfirmed}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                    isConfirmed
                      ? "bg-emerald-600 text-white shadow-soft"
                      : "bg-canvas-card text-canvas-text hover:bg-emerald-500/15 border border-hairline hover:border-emerald-500/40"
                  }`}
                  data-cursor="CONFIRM"
                >
                  <Check className="w-4 h-4" />
                  {isConfirmed ? "Overlap Linked" : "Confirm Overlap"}
                </button>

                <button
                  onClick={handleReject}
                  disabled={isRejected}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                    isRejected
                      ? "bg-rose-600 text-white shadow-soft"
                      : "bg-canvas-card text-canvas-text hover:bg-rose-500/15 border border-hairline hover:border-rose-500/40"
                  }`}
                  data-cursor="REJECT"
                >
                  <X className="w-4 h-4" />
                  {isRejected ? "Match Rejected" : "Reject Match"}
                </button>
              </div>

              <p className="text-[11px] text-canvas-muted font-mono text-center">
                {cue03.caption}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
