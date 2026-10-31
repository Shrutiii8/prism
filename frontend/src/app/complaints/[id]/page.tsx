"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileText,
  Building2,
  ArrowLeft,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  GitFork,
  MessageSquare,
  Upload,
  Download,
  Shield,
  Layers,
  ChevronRight,
  Send,
  Plus,
  Sparkles,
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const currentUser = getStoredUser();

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow transition
  const [selectedStage, setSelectedStage] = useState("");
  const [transitionRemarks, setTransitionRemarks] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  // Assignment
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Comments
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  // Evidence Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState("SUPPORTING_EVIDENCE");
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaintDetail(id);
      setDetail(res);
      if (res.permitted_transitions?.length > 0) {
        setSelectedStage(res.permitted_transitions[0].to_stage_id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchDetail();
    api.getUsers().then((users) => {
      setOfficers(users.filter((u: any) => u.role_name === "CASE_OFFICER" || u.role_name === "BUREAU_HEAD"));
    }).catch(() => {});
  }, [id]);

  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage) return;
    setTransitioning(true);
    try {
      await api.transitionStage(id, selectedStage, transitionRemarks);
      setTransitionRemarks("");
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTransitioning(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    setAssigning(true);
    try {
      await api.assignOfficer(id, selectedOfficer, "Reassigned via Case Detail console");
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      await api.addComment(id, newComment);
      setNewComment("");
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCommenting(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      await api.uploadEvidence(id, uploadFile, docCategory);
      setShowUploadModal(false);
      setUploadFile(null);
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 font-mono">
        <div className="w-6 h-6 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-canvas-muted">DECODING CASE DOSSIER...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 rounded-2xl border border-hairline bg-canvas-card text-center space-y-4 shadow-soft">
        <p className="text-sm font-mono text-rose-500 dark:text-rose-400">{error || "Case record not found in repository."}</p>
        <Link
          href="/complaints"
          className="inline-flex items-center gap-2 text-xs font-mono text-canvas-muted hover:text-canvas-text"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO DIRECTORY</span>
        </Link>
      </div>
    );
  }

  const c = detail;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Navigation & Header */}
        <PageHeader
          cueNumber="03"
          sectionLabel="STATUTORY CASE DOSSIER"
          title={c.case_id}
          accentWord="Dossier"
          description={`Comprehensive regulatory record for ${c.institution_name} received via ${c.bureau_name}.`}
          actions={
            <div className="flex items-center gap-2.5">
              <Link
                href="/complaints"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-canvas-card text-xs font-mono text-canvas-muted hover:text-canvas-text transition-colors shadow-soft"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>DIRECTORY</span>
              </Link>
              <Link
                href="/coordination"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-hairline bg-canvas-card text-xs font-mono text-canvas-text hover:border-hairline-strong transition-colors shadow-soft"
              >
                <Shield className="w-3.5 h-3.5 text-saffron" />
                <span>COORDINATION ROOM</span>
              </Link>
            </div>
          }
        />

        {/* Case Top Overview Card */}
        <div className="rounded-2xl border border-hairline bg-canvas-card p-6 sm:p-8 space-y-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-lg font-mono font-bold text-canvas-text px-3.5 py-1 rounded-lg border border-hairline bg-canvas-card-subtle">
                <ScrambleId value={c.case_id} />
              </span>
              <StatusBadge
                status={
                  c.severity === "CRITICAL"
                    ? "ESCALATED"
                    : c.severity === "HIGH"
                    ? "ACTION_REQUIRED"
                    : "UNDER_PROCESS"
                }
                label={`${c.severity} SEVERITY`}
              />
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-canvas-card-subtle border border-hairline text-canvas-muted">
                PRIORITY: {c.priority}
              </span>
              {c.is_overdue && !c.is_closed && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  OVERDUE SLA
                </span>
              )}
              {c.is_closed && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  CLOSED / RESOLVED
                </span>
              )}
            </div>

            <div className="text-xs font-mono text-canvas-muted">
              RECEIVED: <span className="text-canvas-text font-medium">{new Date(c.received_date).toLocaleDateString()}</span>
              {c.due_date && (
                <> · SLA DUE: <span className="text-canvas-text font-medium">{new Date(c.due_date).toLocaleDateString()}</span></>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-light text-canvas-text tracking-tight">{c.subject}</h1>
            <p className="text-xs text-canvas-muted mt-3 leading-relaxed bg-canvas-card-subtle p-4 rounded-xl border border-hairline font-normal">
              {c.description}
            </p>
          </div>

          {/* Quick 4-box Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 text-xs">
            <div className="rounded-xl border border-hairline bg-canvas-card-subtle p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted block">TARGET INSTITUTION</span>
              <Link
                href={`/institutions/${c.institution_id}`}
                className="font-medium text-canvas-text hover:text-saffron block truncate transition-colors"
              >
                {c.institution_name}
              </Link>
              <span className="text-[10px] font-mono text-canvas-faint block">
                <ScrambleId value={c.aicte_id} />
              </span>
            </div>

            <div className="rounded-xl border border-hairline bg-canvas-card-subtle p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted block">RECEIVING BUREAU</span>
              <span className="font-medium text-canvas-text block truncate">{c.bureau_name} ({c.bureau_code})</span>
              <span className="text-[10px] font-mono text-canvas-faint block">CAT: {c.category_name}</span>
            </div>

            <div className="rounded-xl border border-hairline bg-canvas-card-subtle p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted block">ASSIGNED OFFICER</span>
              <span className="font-medium text-canvas-text block truncate">{c.assigned_officer_name || "Unassigned"}</span>
              <span className="text-[10px] font-mono text-canvas-faint block">JURIS: {c.regional_office_name || "Central Bureau"}</span>
            </div>

            <div className="rounded-xl border border-hairline bg-canvas-card-subtle p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted block">CURRENT STAGE</span>
              <span className="font-mono text-saffron block truncate">{c.stage_name}</span>
              <span className="text-[10px] font-mono text-canvas-faint block">STATE: {c.is_closed ? "Finalized" : "Active Scrutiny"}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Column Workflow & Comments; Right Column Actions & Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Workflow Stage Transition Box */}
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 space-y-5 shadow-soft">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-saffron" />
                  <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                    STAGE TRANSITION PROTOCOL
                  </span>
                </div>
                <span className="text-[10px] font-mono text-canvas-faint uppercase">AUTHORIZED ACTION</span>
              </div>

              {c.permitted_transitions && c.permitted_transitions.length > 0 ? (
                <form onSubmit={handleTransition} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                        Target Workflow Stage *
                      </label>
                      <select
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none focus:border-hairline-strong"
                      >
                        {c.permitted_transitions.map((t: any) => (
                          <option key={t.to_stage_id} value={t.to_stage_id}>
                            {t.to_stage_name} ({t.description || "Advance stage"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                        Statutory Remarks / Inquiry Findings *
                      </label>
                      <input
                        type="text"
                        required
                        value={transitionRemarks}
                        onChange={(e) => setTransitionRemarks(e.target.value)}
                        placeholder="Official justification for stage transition..."
                        className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={transitioning}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-colors disabled:opacity-50 shadow-soft"
                    >
                      <span>{transitioning ? "COMMITTING TRANSITION..." : "EXECUTE STAGE ADVANCE"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs font-mono text-canvas-muted bg-canvas-card-subtle p-4 rounded-xl border border-hairline">
                  No permissible transitions available for current user credentials, or case file is sealed.
                </p>
              )}
            </div>

            {/* Chronological Status History */}
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                  CHRONOLOGICAL AUDIT TIMELINE ({c.status_history?.length || 0})
                </span>
                <span className="text-[10px] font-mono text-canvas-faint uppercase">IMMUTABLE LOG</span>
              </div>

              <div className="space-y-3">
                {!c.status_history || c.status_history.length === 0 ? (
                  <p className="text-xs font-mono text-canvas-faint">No transition events logged.</p>
                ) : (
                  c.status_history.map((sh: any) => (
                    <div key={sh.id} className="p-4 rounded-xl bg-canvas-card-subtle border border-hairline text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-canvas-text font-medium">
                          {sh.from_stage ? `${sh.from_stage} → ${sh.to_stage}` : `Initial Intake: ${sh.to_stage}`}
                        </span>
                        <span className="text-[10px] text-canvas-muted">{new Date(sh.created_at).toLocaleString()}</span>
                      </div>
                      {sh.remarks && <p className="text-canvas-muted text-xs italic font-serif">"{sh.remarks}"</p>}
                      <div className="text-[10px] font-mono text-canvas-faint">
                        OFFICER: <span className="text-canvas-muted">{sh.changed_by || "SYSTEM"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Investigation Notes & Internal Comments Thread */}
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 space-y-5 shadow-soft">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-saffron" />
                  <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                    OFFICIAL DISPATCH & INQUIRY CORRESPONDENCE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-canvas-faint uppercase">CONFIDENTIAL</span>
              </div>

              <div className="space-y-3">
                {!c.comments || c.comments.length === 0 ? (
                  <p className="text-xs font-mono text-canvas-faint py-2">No inquiry correspondence recorded yet.</p>
                ) : (
                  c.comments.map((comm: any) => (
                    <div key={comm.id} className="p-4 bg-canvas-card-subtle rounded-xl border border-hairline text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-canvas-text font-medium">{comm.user_name} ({comm.user_role || "Officer"})</span>
                        <span className="text-[10px] text-canvas-muted">{new Date(comm.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-canvas-text leading-relaxed">{comm.comment_text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="pt-2 space-y-3">
                <textarea
                  required
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Record confidential investigation note or officer dispatch..."
                  className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle p-3 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={commenting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-canvas-card border border-hairline text-xs font-mono text-canvas-text hover:bg-canvas-card-hover transition-colors disabled:opacity-50 shadow-soft"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{commenting ? "TRANSMITTING..." : "RECORD ENTRY"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column (1 Col): Evidence, Allocation, Related Cases */}
          <div className="space-y-8">
            {/* Officer Assignment Control */}
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                  CASE OFFICER DEPUTATION
                </span>
                <User className="w-3.5 h-3.5 text-canvas-muted" />
              </div>

              <div className="text-xs space-y-1">
                <span className="text-[10px] font-mono text-canvas-muted uppercase">CURRENT ASSIGNEE:</span>
                <p className="text-sm font-medium text-canvas-text">{c.assigned_officer_name || "Unassigned"}</p>
              </div>

              {currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "CENTRAL_ADMIN" || currentUser?.role === "BUREAU_HEAD" ? (
                <form onSubmit={handleAssign} className="pt-3 border-t border-hairline space-y-3">
                  <label className="block text-[10px] font-mono text-canvas-muted uppercase">REASSIGN OFFICER:</label>
                  <select
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3 py-2 text-canvas-text focus:outline-none"
                  >
                    <option value="">-- SELECT OFFICER --</option>
                    {officers.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.full_name} ({off.bureau_code || "Officer"})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={assigning || !selectedOfficer}
                    className="w-full py-2 rounded-lg bg-canvas-card border border-hairline text-xs font-mono text-canvas-text hover:bg-canvas-card-hover transition-colors disabled:opacity-40 shadow-soft"
                  >
                    {assigning ? "DEPUTING..." : "UPDATE ASSIGNMENT"}
                  </button>
                </form>
              ) : null}
            </div>

            {/* Evidence & Supporting Documents */}
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                  EVIDENCE VAULT ({c.evidence_files?.length || 0})
                </span>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-saffron hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>UPLOAD</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {!c.evidence_files || c.evidence_files.length === 0 ? (
                  <p className="text-xs font-mono text-canvas-faint py-2">No documents deposited in vault.</p>
                ) : (
                  c.evidence_files.map((ev: any) => (
                    <div key={ev.id} className="p-3 rounded-xl bg-canvas-card-subtle border border-hairline flex items-center justify-between group">
                      <div className="truncate mr-2">
                        <p className="font-medium text-canvas-text truncate">{ev.original_file_name}</p>
                        <span className="text-[10px] text-canvas-muted font-mono block">
                          {(ev.file_size_bytes / 1024).toFixed(1)} KB · {ev.document_category}
                        </span>
                      </div>
                      <a
                        href={api.getDownloadUrl(ev.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-hairline bg-canvas-card text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-colors shadow-soft"
                        title="Download Asset"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Verified Related Cases & AI Inter-Case Links */}
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-indigo-500" />
                  <span>LINKED CASES ({c.related_cases?.length || 0})</span>
                </span>
                <Link href="/ai-matching" className="text-[10px] font-mono text-indigo-500 hover:underline">
                  AI WORKSPACE →
                </Link>
              </div>

              <div className="space-y-2.5 text-xs">
                {!c.related_cases || c.related_cases.length === 0 ? (
                  <div className="text-canvas-faint py-3 text-center font-mono">
                    <p>No confirmed cross-case links.</p>
                    <Link href="/ai-matching" className="text-saffron font-medium text-xs mt-1.5 inline-block hover:underline">
                      Scan overlap matrix →
                    </Link>
                  </div>
                ) : (
                  c.related_cases.map((rel: any) => (
                    <div key={rel.relationship_id} className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-1.5">
                      <div className="flex items-center justify-between font-mono">
                        <Link href={`/complaints/${rel.complaint_id}`} className="text-indigo-600 dark:text-indigo-300 font-bold hover:underline">
                          <ScrambleId value={rel.case_id} />
                        </Link>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                          {rel.verification_status} ({Math.round(rel.confidence_score * 100)}%)
                        </span>
                      </div>
                      <p className="font-medium text-canvas-text line-clamp-1">{rel.subject}</p>
                      <p className="text-[11px] text-canvas-muted line-clamp-2">{rel.explanation}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Complainant Privacy Info */}
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 space-y-3 text-xs font-mono shadow-soft">
              <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase block border-b border-hairline pb-3">
                COMPLAINANT IDENTITY (PROTECTED)
              </span>
              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-canvas-faint">NAME:</span>
                  <span className="text-canvas-text font-medium">{c.complainant_name || "[REDACTED]"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-canvas-faint">EMAIL:</span>
                  <span className="text-canvas-text font-medium">{c.complainant_email || "[REDACTED]"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-canvas-faint">PHONE:</span>
                  <span className="text-canvas-text font-medium">{c.complainant_phone || "[REDACTED]"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Evidence Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-canvas-surface rounded-2xl max-w-md w-full p-6 border border-hairline-strong space-y-5 shadow-card">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-xs font-mono tracking-wider text-canvas-text uppercase font-semibold">
                  DEPOSIT CASE EVIDENCE
                </span>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-canvas-muted hover:text-canvas-text font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">Document Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas-card text-canvas-text focus:outline-none"
                  >
                    <option value="INVESTIGATION_REPORT">Investigation Report</option>
                    <option value="OFFICIAL_MEMO">Official Memo / Notice</option>
                    <option value="SITE_INSPECTION">Site Inspection Photographs</option>
                    <option value="FINANCIAL_AUDIT">Financial Audit / Receipts</option>
                    <option value="AFFIDAVIT">Student / Faculty Affidavit</option>
                    <option value="SUPPORTING_EVIDENCE">Supporting Evidence / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">Document File (PDF, PNG, JPG, CSV)</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-canvas-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-canvas-card file:text-canvas-text file:font-mono file:text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-3.5 py-2 border border-hairline rounded-lg text-canvas-muted hover:text-canvas-text"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="px-4 py-2 bg-canvas-text text-canvas rounded-lg font-medium hover:opacity-90 disabled:opacity-50 shadow-soft"
                  >
                    {uploading ? "HASHING..." : "COMMIT ASSET"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
