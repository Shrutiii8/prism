"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  GitFork,
  ArrowRight,
  Layers,
  Scale,
  Building2,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";
import CountUp from "@/components/motion/CountUp";

export default function AIMatchingWorkspacePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [classificationFilter, setClassificationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("UNREVIEWED");
  const [scanning, setScanning] = useState(false);

  // Selected match for side-by-side inspection
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.getAIMatches(
        classificationFilter || undefined,
        statusFilter || undefined
      );
      setMatches(res.items);
      setTotal(res.total);
      if (res.items.length > 0 && !selectedMatch) {
        setSelectedMatch(res.items[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [classificationFilter, statusFilter]);

  const handleScanAll = async () => {
    setScanning(true);
    try {
      await api.triggerFullScan();
      fetchMatches();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleReview = async (action: "CONFIRM" | "REJECT" | "DISMISS") => {
    if (!selectedMatch) return;
    setReviewing(true);
    try {
      await api.reviewAIMatch(selectedMatch.id, action, reviewComments);
      setReviewComments("");
      fetchMatches();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          cueNumber="04"
          sectionLabel="MULTI-FACTOR OVERLAP INTELLIGENCE"
          title="AI Overlap Intelligence"
          accentWord="Intelligence"
          description="High-dimensional semantic embeddings and entity graph matching correlating cross-bureau institutional complaints."
          actions={
            <button
              onClick={handleScanAll}
              disabled={scanning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-colors disabled:opacity-50 shadow-soft"
            >
              <Sparkles className="w-3.5 h-3.5 text-saffron" />
              <span>{scanning ? "SCANNING CORPUS..." : "EXECUTE EMBEDDING SCAN"}</span>
            </button>
          }
        />

        {/* Filter and Toggles */}
        <div className="rounded-2xl border border-hairline bg-canvas-card p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-canvas-muted uppercase">CONFIDENCE TIER:</span>
            {["", "HIGH", "MEDIUM", "LOW"].map((cls) => (
              <button
                key={cls}
                onClick={() => setClassificationFilter(cls)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  classificationFilter === cls
                    ? "bg-canvas-text text-canvas font-semibold shadow-soft"
                    : "bg-canvas-card-subtle text-canvas-muted hover:text-canvas-text hover:bg-canvas-card-hover border border-hairline"
                }`}
              >
                {cls || "ALL TIERS"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-canvas-muted uppercase">REVIEW AUDIT:</span>
            {["UNREVIEWED", "CONFIRMED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  statusFilter === st
                    ? "bg-canvas-text text-canvas font-semibold shadow-soft"
                    : "bg-canvas-card-subtle text-canvas-muted hover:text-canvas-text border border-hairline"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Main Matching Grid: Left Matches List, Right Side-by-Side Review Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Match Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-canvas-muted px-1">
              <span>DETECTED CANDIDATES ({total})</span>
              <span>CONFIDENCE RANKED</span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card shadow-soft">
                <div className="inline-block w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin mr-2" />
                CORRELATING COMPLAINT VECTORS...
              </div>
            ) : matches.length === 0 ? (
              <div className="p-12 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs shadow-soft">
                NO CORRELATION CANDIDATES MATCH FILTER CONDITIONS.
              </div>
            ) : (
              matches.map((m) => {
                const isSelected = selectedMatch?.id === m.id;
                const pct = Math.round(m.overall_score * 100);
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatch(m)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-canvas-card border-saffron shadow-card ring-1 ring-saffron/30"
                        : "bg-canvas-card border-hairline hover:border-hairline-strong hover:bg-canvas-card-hover shadow-soft"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                          m.classification === "HIGH"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                            : m.classification === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {m.classification} OVERLAP ({pct}%)
                      </span>
                      <span className="text-[10px] font-mono text-canvas-muted">
                        STATE: <strong className="text-canvas-text">{m.status}</strong>
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between font-mono text-xs font-bold text-canvas-text">
                      <span><ScrambleId value={m.source_case_id} /></span>
                      <span className="text-saffron font-mono text-xs">⇄</span>
                      <span><ScrambleId value={m.target_case_id} /></span>
                    </div>

                    <p className="text-xs font-medium text-canvas-text mt-2 line-clamp-1">
                      {m.source_subject}
                    </p>

                    <p className="text-[11px] text-canvas-muted mt-1 line-clamp-2 leading-relaxed">
                      {m.explanation_json?.summary_explanation}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between text-[10px] font-mono text-canvas-faint">
                      <span className="truncate max-w-[200px]">INST: {m.source_institution_name}</span>
                      <span>BUREAUS: {m.source_bureau_code} & {m.target_bureau_code}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Side-by-Side Comparison & Human Verification (7 Cols) */}
          <div className="lg:col-span-7">
            {selectedMatch ? (
              <div className="rounded-2xl border border-hairline bg-canvas-card p-6 sm:p-8 space-y-6 sticky top-24 shadow-soft">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-saffron block">
                      OFFICER CORRELATION VERIFICATION
                    </span>
                    <h2 className="text-base font-medium text-canvas-text tracking-tight mt-0.5">
                      Cross-Case Overlap Audit & Link Authorization
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-mono font-bold text-canvas-text">
                      <CountUp value={Math.round(selectedMatch.overall_score * 100)} suffix="%" />
                    </span>
                    <span className="block text-[10px] font-mono text-canvas-muted">CONFIDENCE INDEX</span>
                  </div>
                </div>

                {/* Side-by-Side Comparison Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Case A */}
                  <div className="p-4 rounded-xl bg-canvas-card-subtle border border-hairline space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-canvas-text font-bold text-xs">
                        <ScrambleId value={selectedMatch.source_case_id} />
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-canvas-surface border border-hairline text-canvas-text">
                        {selectedMatch.source_bureau_code}
                      </span>
                    </div>
                    <p className="font-normal font-sans text-canvas-text text-xs">{selectedMatch.source_subject}</p>
                    <p className="text-[11px] text-canvas-muted font-sans">
                      Institution: <span className="text-canvas-text">{selectedMatch.source_institution_name}</span>
                    </p>
                    <div className="text-[10px] text-canvas-faint">
                      STAGE: <span className="text-canvas-muted">{selectedMatch.source_status}</span>
                    </div>
                    <Link
                      href={`/complaints/${selectedMatch.source_complaint_id}`}
                      className="inline-flex items-center gap-1 text-[11px] text-saffron hover:underline pt-1"
                    >
                      <span>INSPECT CASE A</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Case B */}
                  <div className="p-4 rounded-xl bg-canvas-card-subtle border border-hairline space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-canvas-text font-bold text-xs">
                        <ScrambleId value={selectedMatch.target_case_id} />
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-canvas-surface border border-hairline text-canvas-text">
                        {selectedMatch.target_bureau_code}
                      </span>
                    </div>
                    <p className="font-normal font-sans text-canvas-text text-xs">{selectedMatch.target_subject}</p>
                    <p className="text-[11px] text-canvas-muted font-sans">
                      Institution: <span className="text-canvas-text">{selectedMatch.target_institution_name}</span>
                    </p>
                    <div className="text-[10px] text-canvas-faint">
                      STAGE: <span className="text-canvas-muted">{selectedMatch.target_status}</span>
                    </div>
                    <Link
                      href={`/complaints/${selectedMatch.target_complaint_id}`}
                      className="inline-flex items-center gap-1 text-[11px] text-saffron hover:underline pt-1"
                    >
                      <span>INSPECT CASE B</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Explainable Matching Score Breakdown */}
                <div className="p-5 rounded-xl bg-canvas-card-subtle border border-hairline text-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-saffron" />
                    <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                      EXPLAINABLE ALGORITHM FACTOR BREAKDOWN
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center font-mono">
                    <div className="bg-canvas-surface p-3 rounded-lg border border-hairline">
                      <span className="text-[10px] text-canvas-muted block">INSTITUTION (40%)</span>
                      <span className="font-bold text-canvas-text text-sm">
                        <CountUp value={Math.round((selectedMatch.institution_score || 0) * 100)} suffix="%" />
                      </span>
                    </div>
                    <div className="bg-canvas-surface p-3 rounded-lg border border-hairline">
                      <span className="text-[10px] text-canvas-muted block">SEMANTIC (35%)</span>
                      <span className="font-bold text-canvas-text text-sm">
                        <CountUp value={Math.round((selectedMatch.semantic_score || 0) * 100)} suffix="%" />
                      </span>
                    </div>
                    <div className="bg-canvas-surface p-3 rounded-lg border border-hairline">
                      <span className="text-[10px] text-canvas-muted block">CATEGORY (15%)</span>
                      <span className="font-bold text-canvas-text text-sm">
                        <CountUp value={Math.round((selectedMatch.category_score || 0) * 100)} suffix="%" />
                      </span>
                    </div>
                    <div className="bg-canvas-surface p-3 rounded-lg border border-hairline">
                      <span className="text-[10px] text-canvas-muted block">CONTEXT (10%)</span>
                      <span className="font-bold text-canvas-text text-sm">
                        <CountUp value={Math.round((selectedMatch.context_score || 0) * 100)} suffix="%" />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-mono text-canvas-muted uppercase">MATCH JUSTIFICATION SIGNALS:</p>
                    <ul className="list-disc pl-5 text-[11px] text-canvas-text space-y-1">
                      {(selectedMatch.explanation_json?.factors || []).map((f: string, idx: number) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Human Verification Action Form */}
                <div className="space-y-4 pt-2 border-t border-hairline text-xs">
                  <label className="block font-mono text-[11px] text-canvas-muted uppercase">
                    Officer Verification Findings / Statutory Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Record regulatory basis (e.g., 'Both cases investigate unapproved course offerings in 2026 academic calendar')..."
                    className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle p-3 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] font-mono text-canvas-faint max-w-sm">
                      Mandate: Never auto-merge records. Linking creates a formal correlation pointer; records remain independent.
                    </span>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        disabled={reviewing}
                        onClick={() => handleReview("REJECT")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-rose-500/30 rounded-lg font-mono text-xs text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 transition-colors shadow-soft"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>REJECT MATCH</span>
                      </button>

                      <button
                        type="button"
                        disabled={reviewing}
                        onClick={() => handleReview("CONFIRM")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-mono text-xs hover:bg-emerald-500/30 transition-colors shadow-soft font-medium"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{reviewing ? "CONFIRMING..." : "CONFIRM & LINK CASES"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs shadow-soft">
                SELECT A CORRELATION CANDIDATE FROM THE LEFT PANE TO REVIEW SIDE-BY-SIDE NARRATIVES.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
