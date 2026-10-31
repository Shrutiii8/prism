"use client";

import React from "react";

export interface ReadoutItem {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: string;
  trendPositive?: boolean;
}

interface ReadoutStripProps {
  items: ReadoutItem[];
  className?: string;
}

export default function ReadoutStrip({ items, className = "" }: ReadoutStripProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-hairline bg-canvas-card backdrop-blur-md rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-hairline overflow-hidden shadow-soft ${className}`}
    >
      {items.map((item, idx) => (
        <div key={idx} className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-canvas-subtle transition-colors">
          <span className="text-[10px] font-mono tracking-widest text-canvas-muted uppercase block mb-1.5">
            {item.label}
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-xl sm:text-2xl font-light text-canvas-text font-mono tracking-tight">
              {item.value}
            </div>
            {item.trend && (
              <span
                className={`text-[10px] font-mono font-medium ${
                  item.trendPositive ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"
                }`}
              >
                {item.trend}
              </span>
            )}
          </div>
          {item.hint && (
            <span className="text-[10px] font-mono text-canvas-faint mt-1 truncate">
              {item.hint}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
