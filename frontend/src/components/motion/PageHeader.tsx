"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  cue?: string;
  cueNumber?: string;
  sectionLabel?: string;
  title: string;
  accentWord?: string;
  description: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PageHeader({
  cue,
  cueNumber,
  sectionLabel,
  title = "",
  accentWord,
  description,
  actions,
  breadcrumbs = [{ label: "PRISM", href: "/dashboard" }],
}: PageHeaderProps) {
  const displayCue =
    cue ||
    (cueNumber && sectionLabel
      ? `CUE ${cueNumber} — ${sectionLabel}`
      : cueNumber
      ? `CUE ${cueNumber}`
      : sectionLabel || "CUE 00");

  const titleStr = String(title || "");
  let titleBefore = titleStr;
  let titleAfter = "";

  if (accentWord && titleStr.includes(accentWord)) {
    const parts = titleStr.split(accentWord);
    titleBefore = parts[0];
    titleAfter = parts.slice(1).join(accentWord);
  }

  return (
    <div className="relative pb-8 mb-8 border-b border-hairline">
      {/* Top subtle tricolour hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent pointer-events-none" />

      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-mono text-canvas-muted mb-3">
        {breadcrumbs.map((b, idx) => (
          <React.Fragment key={idx}>
            {b.href ? (
              <Link href={b.href} className="hover:text-canvas-text transition-colors">
                {b.label}
              </Link>
            ) : (
              <span>{b.label}</span>
            )}
            <ChevronRight className="w-3 h-3 text-canvas-faint" />
          </React.Fragment>
        ))}
        <span className="text-canvas-text font-medium">{titleStr}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          {/* Cue Section Label */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-hairline bg-canvas-card text-[10px] font-mono tracking-widest text-canvas-muted uppercase mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" />
            <span>{displayCue}</span>
          </div>

          {/* Display Title with Accent Word in Italic Serif Spectrum */}
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-canvas-text leading-tight">
            {titleBefore}
            {accentWord && (
              <span className="font-serif italic text-spectrum font-normal mx-1.5">
                {accentWord}
              </span>
            )}
            {titleAfter}
          </h1>

          {/* Muted One-line Subtitle */}
          <p className="text-sm text-canvas-muted max-w-3xl font-light mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Right-aligned action buttons */}
        {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
