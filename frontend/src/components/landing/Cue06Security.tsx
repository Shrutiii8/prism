"use client";

import React from "react";
import { LANDING_CONTENT, SecurityTile } from "@/lib/landing-content";
import { Lock, Shield, FileText, Database, Server } from "lucide-react";

export default function Cue06Security() {
  const { cue06 } = LANDING_CONTENT;

  const getIcon = (iconName: SecurityTile["iconName"]) => {
    switch (iconName) {
      case "lock":
        return <Lock className="w-5 h-5 text-saffron" />;
      case "shield":
        return <Shield className="w-5 h-5 text-emerald-500" />;
      case "fileText":
        return <FileText className="w-5 h-5 text-amber-500" />;
      case "database":
        return <Database className="w-5 h-5 text-purple-500" />;
      case "server":
        return <Server className="w-5 h-5 text-cyan-500" />;
      default:
        return <Shield className="w-5 h-5 text-canvas-text" />;
    }
  };

  return (
    <section id="security" className="relative py-20 sm:py-36 border-b border-hairline overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-spectrum uppercase tracking-[0.2em]">
                {cue06.tag}
              </span>
              <span className="text-canvas-faint font-mono text-xs">/</span>
              <span className="font-mono text-xs text-canvas-muted uppercase tracking-widest">
                STATUTORY RIGOR
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-canvas-text">
              {cue06.title}
            </h2>
          </div>
          <p className="text-canvas-muted text-sm max-w-md font-normal leading-relaxed">
            {cue06.subtitle}
          </p>
        </div>

        {/* 5 Hairline Grid Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cue06.tiles.map((tile) => (
            <div
              key={tile.title}
              className="group bg-canvas-card dark:bg-[#0a0c12] border border-hairline hover:border-hairline-strong rounded-2xl p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-card"
              data-cursor="SECURITY"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-canvas-subtle border border-hairline flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(tile.iconName)}
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-canvas-muted bg-canvas-subtle border border-hairline px-2 py-0.5 rounded">
                    {tile.standard}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-canvas-text group-hover:text-saffron transition-colors">
                  {tile.title}
                </h3>

                <p className="text-xs text-canvas-muted leading-relaxed font-normal">
                  {tile.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-[10px] font-mono text-canvas-faint">
                <span>AUDIT STATUS</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold">COMPLIANT</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
