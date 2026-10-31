"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { LANDING_CONTENT } from "@/lib/landing-content";
import PrismMark from "./PrismMark";

interface FinalCtaSectionProps {
  onRequestDemo: () => void;
}

export default function FinalCtaSection({ onRequestDemo }: FinalCtaSectionProps) {
  const content = LANDING_CONTENT.finalCta;

  return (
    <section className="relative py-32 md:py-48 px-6 lg:px-16 overflow-hidden border-t border-hairline bg-canvas">
      {/* Background ambient refraction glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-saffron/10 via-cyan-500/10 to-purple-600/10 blur-[140px] opacity-70" />
      </div>

      {/* Decorative hairline grid lines */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-6 opacity-[0.03]">
        <div className="border-r border-canvas-text h-full" />
        <div className="border-r border-canvas-text h-full" />
        <div className="border-r border-canvas-text h-full" />
        <div className="border-r border-canvas-text h-full" />
        <div className="border-r border-canvas-text h-full" />
      </div>

      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Monospace System Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline bg-canvas-card text-[11px] font-mono tracking-widest text-canvas-muted uppercase mb-10 shadow-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>NATIONAL REGULATORY MATRIX READY</span>
          <span className="text-canvas-faint">|</span>
          <span className="text-saffron font-bold">AICTE STANDARDS</span>
        </motion.div>

        {/* Prism Mark Centered Accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <PrismMark variant="hero" size={200} />
        </motion.div>

        {/* Display Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-canvas-text max-w-3xl leading-[1.05] mb-6"
        >
          Tell us the institution. <br className="hidden sm:inline" />
          <span className="font-serif italic text-spectrum font-normal">PRISM</span> finds the rest.
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-canvas-muted max-w-2xl font-light leading-relaxed mb-12"
        >
          {content.subheadline}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-canvas-text text-canvas font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 group shadow-card"
          >
            <span>{content.primaryButton}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={onRequestDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-hairline bg-canvas-card hover:bg-canvas-subtle text-canvas-text font-medium text-sm transition-all flex items-center justify-center gap-2.5 backdrop-blur-sm shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-saffron" />
            <span>{content.secondaryButton}</span>
          </button>
        </motion.div>

        {/* Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 inline-flex items-center gap-2 text-xs font-mono text-canvas-muted"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{content.footnote}</span>
        </motion.div>
      </div>
    </section>
  );
}
