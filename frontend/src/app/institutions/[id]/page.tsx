"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Activity,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";
import TiltCard from "@/components/motion/TiltCard";
import CountUp from "@/components/motion/CountUp";

export default function Institution360Page() {
  const params = useParams();
  const id = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getInstitution360(id)
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-canvas-muted tracking-widest uppercase">
          ASSEMBLING INSTITUTION 360° DOSSIER...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-4 shadow-soft">
        <p className="text-sm font-mono text-rose-500 dark:text-rose-300">{error || "Institution record not found."}</p>
        <Link
          href="/institutions"
          className="inline-flex items-center text-xs font-mono text-canvas-text hover:text-saffron transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>RETURN TO REGISTRY</span>
        </Link>
      </div>
    );
  }

  const inst = profile;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <Link
            href="/institutions"
            className="inline-flex items-center text-xs font-mono text-canvas-muted hover:text-canvas-text transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>RETURN TO INSTITUTION REGISTRY</span>
          </Link>
          <span className="text-[11px] font-mono text-canvas-faint">SYS_ID: {inst.id}</span>
        </div>

        {/* Main Institution Header Card */}
        <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden shadow-soft">
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-hairline to-transparent pointer-events-none" />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                AICTE ID: <ScrambleId id={inst.aicte_id} />
              </span>
              <StatusBadge status={inst.approval_status} />
              <span className="text-xs font-mono text-canvas-muted bg-canvas-card-subtle px-2.5 py-1 rounded-full border border-hairline">
                {inst.institution_type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-light text-canvas-text tracking-tight">
              {inst.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-canvas-muted pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-saffron" />
                <span>{inst.address}, {inst.city}, {inst.state} - {inst.pincode}</span>
              </div>
              {inst.contact_email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{inst.contact_email}</span>
                </div>
              )}
              {inst.contact_phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{inst.contact_phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link
              href={`/complaints/new?institution_id=${inst.id}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-all shadow-soft group"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Lodge Grievance Against Inst</span>
            </Link>
          </div>
        </div>

        {/* 360° Grievance Metrics Readout Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TiltCard className="group">
            <div className="flex items-center justify-between text-canvas-muted">
              <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">Total Complaints</span>
              <FileText className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-light text-canvas-text font-serif mt-2">
              <CountUp end={inst.total_complaints || 0} />
            </div>
            <p className="text-[10px] font-mono text-canvas-faint mt-1">Across all bureaus</p>
          </TiltCard>

          <TiltCard className="group">
            <div className="flex items-center justify-between text-canvas-muted">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">Active Open Cases</span>
              <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-light text-amber-500 font-serif mt-2">
              <CountUp end={inst.open_complaints || 0} />
            </div>
            <p className="text-[10px] font-mono text-canvas-faint mt-1">Under investigation / review</p>
          </TiltCard>

          <TiltCard className="group border-rose-500/30 bg-rose-500/[0.04]">
            <div className="flex items-center justify-between text-rose-500">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-500">Overdue Breaches</span>
              <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-light text-rose-500 font-serif mt-2">
              <CountUp end={inst.overdue_complaints || 0} />
            </div>
            <p className="text-[10px] font-mono text-rose-500/80 mt-1">SLA deadline exceeded</p>
          </TiltCard>

          <TiltCard className="group">
            <div className="flex items-center justify-between text-canvas-muted">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500">Resolved Cases</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-light text-emerald-500 font-serif mt-2">
              <CountUp end={inst.resolved_complaints || 0} />
            </div>
            <p className="text-[10px] font-mono text-canvas-faint mt-1">Disposed orders finalized</p>
          </TiltCard>
        </div>

        {/* Main Grid: Complaints & Chronological Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Complaints History & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md overflow-hidden shadow-soft">
              <div className="p-4 px-5 border-b border-hairline flex items-center justify-between bg-canvas-card-subtle">
                <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted">
                  Logged Complaint Records ({inst.recent_complaints?.length || 0})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-canvas-card-subtle text-[10px] font-mono font-medium text-canvas-muted uppercase tracking-wider border-b border-hairline">
                      <th className="py-3 px-4">Case ID</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Bureau</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline text-xs">
                    {!inst.recent_complaints || inst.recent_complaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-canvas-muted font-mono">
                          No complaint records registered for this institution.
                        </td>
                      </tr>
                    ) : (
                      inst.recent_complaints.map((c: any) => (
                        <tr key={c.id} className="hover:bg-canvas-card-hover transition-colors group">
                          <td className="py-3.5 px-4">
                            <ScrambleId id={c.case_id} className="text-cyan-500 font-semibold" />
                          </td>
                          <td className="py-3.5 px-4 font-medium text-canvas-text max-w-xs truncate">
                            {c.subject}
                          </td>
                          <td className="py-3.5 px-4 text-canvas-muted font-mono">{c.bureau}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                                c.severity === "CRITICAL"
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                                  : c.severity === "HIGH"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                                  : "bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {c.severity}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-canvas-muted">
                            <StatusBadge status={c.stage} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/complaints/${c.id}`}
                              className="inline-flex items-center text-xs font-mono text-saffron hover:underline transition-colors gap-1"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Severity & Bureau Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-5 shadow-soft">
                <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted block mb-3">
                  Severity Breakdown
                </span>
                <div className="space-y-2 text-xs font-mono">
                  {Object.entries(inst.severity_breakdown || {}).map(([sev, count]: any) => (
                    <div key={sev} className="flex items-center justify-between py-1 border-b border-hairline">
                      <span className="text-canvas-muted">{sev}</span>
                      <span className="font-semibold text-canvas-text px-2 py-0.5 rounded bg-canvas-card-subtle border border-hairline">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-5 shadow-soft">
                <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted block mb-3">
                  Complaints by Bureau
                </span>
                <div className="space-y-2 text-xs font-mono">
                  {Object.entries(inst.bureau_breakdown || {}).map(([bur, count]: any) => (
                    <div key={bur} className="flex items-center justify-between py-1 border-b border-hairline">
                      <span className="text-canvas-muted">{bur}</span>
                      <span className="font-semibold text-saffron px-2 py-0.5 rounded bg-saffron/10 border border-saffron/20">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chronological Institutional Activity Timeline */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-saffron" />
                <span className="text-xs font-mono uppercase tracking-wider text-canvas-text">
                  Chronological Timeline
                </span>
              </div>
              <span className="text-[10px] font-mono text-canvas-faint">EVENT HISTORY</span>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-hairline">
              {!inst.activity_timeline || inst.activity_timeline.length === 0 ? (
                <p className="text-xs font-mono text-canvas-muted py-4">No logged activity recorded.</p>
              ) : (
                inst.activity_timeline.map((item: any, idx: number) => (
                  <div key={idx} className="relative group">
                    <div
                      className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border border-canvas ${
                        item.type === "COMPLAINT_RESOLVED"
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : "bg-saffron shadow-[0_0_8px_rgba(242,140,40,0.5)]"
                      }`}
                    />
                    <div className="text-[10px] font-mono text-canvas-faint">
                      {item.date ? new Date(item.date).toLocaleDateString() : "Historical"}
                    </div>
                    <div className="text-xs font-medium text-canvas-text mt-0.5">
                      {item.title}
                    </div>
                    <p className="text-xs text-canvas-muted mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.case_id && (
                      <Link
                        href={`/complaints/${item.complaint_id}`}
                        className="inline-block text-[11px] font-mono text-saffron hover:underline mt-1"
                      >
                        View Case {item.case_id} →
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
