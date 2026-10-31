import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import PrismMark from "@/components/landing/PrismMark";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-canvas-text flex flex-col justify-between p-6 sm:p-12 text-center relative overflow-hidden film-grain selection:bg-saffron/20 selection:text-canvas-text">
      {/* Top subtle tricolour hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-saffron via-white to-emerald-500 fixed top-0 inset-x-0 z-50 pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/10 dark:bg-purple-600/10 blur-[150px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-12">
        <div className="mb-6 flex justify-center">
          <PrismMark variant="hero" size={140} showBeams={true} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-hairline bg-canvas-card text-[10px] font-mono tracking-widest text-canvas-muted uppercase mb-4 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-saffron" />
          <span>STATUTORY SYSTEM EXCEPTION // 404</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-canvas-text mb-4">
          File or Node <span className="font-serif italic text-spectrum font-normal">Not Found</span>
        </h1>

        <p className="text-sm text-canvas-muted max-w-md font-light leading-relaxed mb-8">
          The regulatory dossier, case identifier, or platform endpoint you requested has been sealed, relocated, or does not exist in the PRISM central registry.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-canvas-text text-canvas font-mono text-xs font-medium uppercase tracking-wider hover:opacity-90 transition-opacity shadow-soft"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO DASHBOARD</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-hairline bg-canvas-card text-canvas-text font-mono text-xs uppercase tracking-wider hover:bg-canvas-card/80 transition-colors shadow-xs"
          >
            <span>PORTAL HOMEPAGE</span>
          </Link>
        </div>
      </div>

      <div className="text-[11px] font-mono text-canvas-faint relative z-10">
        PRISM CENTRAL STATUTORY SYSTEM · AICTE 2026
      </div>
    </div>
  );
}
