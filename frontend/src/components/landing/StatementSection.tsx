"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LANDING_CONTENT } from "@/lib/landing-content";

export default function StatementSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const words = LANDING_CONTENT.statement.split(" ");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"],
  });

  return (
    <section
      id="statement"
      ref={containerRef}
      className="relative py-28 sm:py-36 border-b border-hairline overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-canvas-muted mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-saffron" />
          <span>STATUTORY PHILOSOPHY</span>
        </div>

        <p className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.18] tracking-tight text-canvas-text flex flex-wrap gap-x-3 gap-y-1">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            // Word opacity based on scroll
            return (
              <Word key={i} word={word} progress={scrollYProgress} range={[start, end]} />
            );
          })}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4 text-canvas-muted font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-canvas-card border border-hairline shadow-xs font-medium">
            PRISM CORE PROTOCOL
          </span>
          <span>Zero Automatic Record Merging · Independent Ownership Preserved</span>
        </div>
      </div>
    </section>
  );
}

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: any;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  const isKey =
    word.toLowerCase().includes("institution") ||
    word.toLowerCase().includes("owner") ||
    word.toLowerCase().includes("clock,");

  return (
    <motion.span
      style={{ opacity }}
      className={`transition-colors ${isKey ? "text-canvas-text font-semibold" : "text-canvas-muted"}`}
    >
      {word}
    </motion.span>
  );
}
