"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_CONTENT } from "@/lib/landing-content";
import { Search, CheckCircle2, Clock, AlertTriangle, Building } from "lucide-react";

export default function TrackComplaintWidget() {
  const [caseInput, setCaseInput] = useState("");
  const [trackedCase, setTrackedCase] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = caseInput.trim().toUpperCase();

    if (!cleanId) {
      setErrorMsg("Please enter a valid Case ID or Reference Number.");
      triggerShake();
      return;
    }

    // Check mock cases or dynamically generate status for PRISM-2026-XXXXXX format
    const mockDb = LANDING_CONTENT.trackerMockCases as Record<string, any>;

    if (mockDb[cleanId]) {
      setTrackedCase(mockDb[cleanId]);
      setErrorMsg("");
    } else if (cleanId.startsWith("PRISM-2026-") || cleanId.startsWith("PGRC/") || cleanId.startsWith("RB/")) {
      // Dynamic fallback preview for standard formatted IDs
      setTrackedCase({
        caseId: cleanId,
        institution: "National College of Engineering and Technology",
        aicteId: "1-309481921",
        subject: "Faculty shortage and non-compliance with 7th Pay Commission",
        category: "Faculty Standards",
        bureau: "Regulation Bureau (RB)",
        dateReceived: "21 Oct 2026",
        currentStageIndex: 1,
        stages: [
          { label: "Received", date: "21 Oct 2026", done: true },
          { label: "Under Scrutiny", date: "26 Oct 2026", done: true, current: true },
          { label: "In Review / Panel", date: "Pending", done: false },
          { label: "Disposed / Regulatory Action", date: "Pending SLA", done: false },
        ],
        officerNote: "Assigned to regional scrutiny panel for qualification audit.",
      });
      setErrorMsg("");
    } else {
      setErrorMsg("Case ID not found in central registry. Example format: PGRC/2026/001023 or PRISM-2026-000042");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <section id="track" className="relative py-28 sm:py-36 border-b border-hairline overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="font-mono text-xs font-bold text-spectrum uppercase tracking-[0.25em]">
            PUBLIC TRANSPARENCY
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-canvas-text">
            Track a Grievance in Real-Time
          </h2>
          <p className="text-canvas-muted text-sm max-w-lg mx-auto font-normal">
            Enter your assigned Case ID or bureau reference code to inspect the live investigation stage and procedural timeline.
          </p>
        </div>

        {/* Input Bar Form */}
        <motion.form
          onSubmit={handleTrack}
          animate={{ x: isShaking ? [-8, 8, -6, 6, -3, 3, 0] : 0 }}
          transition={{ duration: 0.45 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative flex items-center bg-canvas-card border border-hairline focus-within:border-saffron/60 rounded-xl overflow-hidden p-1.5 shadow-card transition-all">
            <Search className="w-5 h-5 text-canvas-muted ml-3.5 shrink-0" />
            <input
              type="text"
              value={caseInput}
              onChange={(e) => {
                setCaseInput(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Enter Case ID (e.g. PGRC/2026/001023 or PRISM-2026-000042)"
              className="w-full bg-transparent text-canvas-text placeholder-canvas-muted font-mono text-xs sm:text-sm px-3 py-3 outline-none uppercase tracking-wider"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-canvas-text text-canvas font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 shadow-xs"
              data-cursor="SEARCH"
            >
              Track Case
            </button>
          </div>

          {/* Quick Demo Pre-fill Pills */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] text-canvas-faint">
            <span>Quick Demo:</span>
            <button
              type="button"
              onClick={() => {
                setCaseInput("PGRC/2026/001023");
                setErrorMsg("");
              }}
              className="text-canvas-muted hover:text-canvas-text underline"
            >
              PGRC/2026/001023
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setCaseInput("PRISM-2026-000042");
                setErrorMsg("");
              }}
              className="text-canvas-muted hover:text-canvas-text underline"
            >
              PRISM-2026-000042
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="mt-3 text-center text-xs text-rose-500 font-mono flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}
        </motion.form>

        {/* Dynamic Result Dossier & Animated Stepper */}
        <AnimatePresence>
          {trackedCase && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 bg-canvas-card dark:bg-[#0c0f16] border border-hairline-strong rounded-2xl p-6 sm:p-8 space-y-8 shadow-card text-canvas-text"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
                <div>
                  <span className="font-mono text-xs font-bold text-saffron px-2.5 py-0.5 rounded bg-saffron/10 border border-saffron/20">
                    {trackedCase.caseId}
                  </span>
                  <h3 className="text-xl font-bold text-canvas-text mt-2">{trackedCase.subject}</h3>
                  <div className="flex items-center gap-2 text-xs text-canvas-muted mt-1">
                    <Building className="w-3.5 h-3.5 text-canvas-faint" />
                    <span>{trackedCase.institution}</span>
                    <span className="text-canvas-faint">·</span>
                    <span className="font-mono text-[10px] text-canvas-faint">ID: {trackedCase.aicteId}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-xs space-y-1">
                  <div className="text-canvas-faint text-[10px] uppercase">Jurisdiction Bureau</div>
                  <div className="text-canvas-text font-bold">{trackedCase.bureau}</div>
                  <div className="text-canvas-muted text-[11px]">Received: {trackedCase.dateReceived}</div>
                </div>
              </div>

              {/* 4-Step Resolution Stepper */}
              <div className="space-y-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-canvas-faint block">
                  STATUTORY RESOLUTION PIPELINE
                </span>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trackedCase.stages.map((st: any, i: number) => {
                    return (
                      <div
                        key={st.label}
                        className={`p-4 rounded-xl border font-mono text-xs space-y-2 transition-all ${
                          st.current
                            ? "bg-canvas-subtle border-hairline-strong text-canvas-text shadow-soft ring-1 ring-saffron/30"
                            : st.done
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-300"
                            : "bg-canvas-subtle/50 border-hairline text-canvas-faint"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold">STAGE 0{i + 1}</span>
                          {st.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          ) : st.current ? (
                            <Clock className="w-4 h-4 text-saffron animate-spin" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-canvas-faint" />
                          )}
                        </div>
                        <div className="font-bold text-sm">{st.label}</div>
                        <div className="text-[10px] text-canvas-muted">{st.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Officer Note */}
              <div className="p-4 rounded-xl bg-canvas-subtle border border-hairline font-mono text-xs text-canvas-muted flex items-start gap-3">
                <span className="font-bold text-canvas-text uppercase text-[10px] px-2 py-0.5 rounded bg-canvas-card border border-hairline shrink-0">
                  Officer Note
                </span>
                <p className="font-sans text-xs leading-relaxed">{trackedCase.officerNote}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
