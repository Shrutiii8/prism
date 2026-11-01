"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ExternalLink } from "lucide-react";
import { LANDING_CONTENT } from "@/lib/landing-content";
import PrismMark from "./PrismMark";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export default function LandingFooter() {
  const { footer } = LANDING_CONTENT;
  const [istTime, setIstTime] = useState<string>("");

  useEffect(() => {
    function updateClock() {
      const formatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setIstTime(formatter.format(new Date()));
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-canvas-surface dark:bg-[#050608] border-t border-hairline pt-20 pb-12 overflow-hidden text-canvas-text">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-saffron/5 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Top Header Row with Logo, Mission & Clock */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-16 border-b border-hairline gap-8">
          <div className="flex items-center gap-4">
            <PrismMark variant="footer" size={56} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-light tracking-tight text-canvas-text font-sans">
                  PRISM
                </span>
                <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-canvas-card border border-hairline text-canvas-muted">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-canvas-muted max-w-sm font-light mt-0.5">
                AICTE Centralized Institution Complaint Monitoring & Cross-Bureau Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            {/* Live IST Clock */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline bg-canvas-card shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-canvas-muted">IST / NEW DELHI:</span>
              <span className="text-canvas-text font-medium tabular-nums tracking-wider">
                {istTime || "12:00:00"}
              </span>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline bg-canvas-card hover:bg-canvas-subtle transition-all text-canvas-muted hover:text-canvas-text shadow-xs"
            >
              <span>TOP OF PAGE</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4-Column Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 py-12 sm:py-16 border-b border-hairline">
          {(footer.columns as FooterColumn[]).map((column: FooterColumn, idx: number) => (
            <div key={idx} className="flex flex-col space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-canvas-muted flex items-center gap-1.5 font-bold">
                <span className="text-saffron">/</span>
                {column.title}
              </span>
              <ul className="space-y-2.5">
                {column.links.map((link: FooterLink, lIdx: number) => (
                  <li key={lIdx}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-canvas-muted hover:text-canvas-text transition-colors flex items-center gap-1 group font-light"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-canvas-muted hover:text-canvas-text transition-colors font-light block"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Giant Outlined PRISM Typography Watermark */}
        <div className="py-12 select-none pointer-events-none relative flex justify-center items-center overflow-hidden">
          <span className="text-[18vw] font-black tracking-tighter leading-none text-transparent stroke-text opacity-[0.08] uppercase">
            PRISM
          </span>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-canvas-surface dark:from-[#050608] to-transparent" />
        </div>

        {/* Bottom Bar / Regulatory Disclaimers & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 text-xs text-canvas-muted font-mono">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span>{footer.legal.copyright}</span>
            <span className="hidden sm:inline text-canvas-faint">|</span>
            <span className="text-saffron font-medium">{footer.legal.subline}</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-canvas-text transition-colors cursor-pointer">
              {footer.legal.privacy}
            </span>
            <span className="text-canvas-faint">·</span>
            <span className="hover:text-canvas-text transition-colors cursor-pointer">
              {footer.legal.terms}
            </span>
            <span className="text-canvas-faint">·</span>
            <span className="hover:text-canvas-text transition-colors cursor-pointer">
              {footer.legal.security}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
