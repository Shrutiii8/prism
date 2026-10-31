"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessagesSquare,
  Shield,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  ArrowRight,
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";

export default function CoordinationWorkspacePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  // Message sending
  const [newMsg, setNewMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Status update
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // New Request Modal
  const [showModal, setShowModal] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bureaus, setBureaus] = useState<any[]>([]);
  const [formSourceCompId, setFormSourceCompId] = useState("");
  const [formTargetBureauId, setFormTargetBureauId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getCoordinationRequests();
      setRequests(res.items);
      if (res.items.length > 0 && !selectedReq) {
        setSelectedReq(res.items[0]);
      } else if (selectedReq) {
        const updated = res.items.find((r: any) => r.id === selectedReq.id);
        if (updated) setSelectedReq(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    Promise.all([api.getComplaints({ limit: 100 }), api.getBureaus()]).then(([compRes, bRes]) => {
      setComplaints(compRes.items);
      setBureaus(bRes);
      if (compRes.items.length > 0) setFormSourceCompId(compRes.items[0].id);
      if (bRes.length > 0) setFormTargetBureauId(bRes[0].id);
    }).catch(() => {});
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !newMsg.trim()) return;
    setSendingMsg(true);
    try {
      await api.postCoordinationMessage(selectedReq.id, newMsg);
      setNewMsg("");
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedReq) return;
    setUpdatingStatus(true);
    try {
      await api.updateCoordinationStatus(selectedReq.id, newStatus, resolutionSummary || undefined);
      setResolutionSummary("");
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createCoordinationRequest({
        source_complaint_id: formSourceCompId,
        target_bureau_id: formTargetBureauId,
        title: formTitle,
        request_details: formDetails,
      });
      setShowModal(false);
      setFormTitle("");
      setFormDetails("");
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          cueNumber="07"
          sectionLabel="INTER-BUREAU COOPERATION PROTOCOL"
          title="Coordination Room"
          accentWord="Coordination"
          description="Direct inter-bureau communication threads, information queries, joint investigation hearings & shared evidentiary assets."
          actions={
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-canvas-text text-canvas text-xs font-mono font-medium hover:opacity-90 transition-all shadow-soft"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>INITIATE COORDINATION</span>
            </button>
          }
        />

        {/* Main Grid: Left Requests List, Right Message Thread & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Coordination Requests (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-canvas-muted px-1">
              <span>ACTIVE PROTOCOL THREADS ({requests.length})</span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs">
                <div className="inline-block w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin mr-2" />
                LOADING DISPATCH CHANNELS...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs">
                NO ACTIVE CROSS-BUREAU INQUIRY THREADS. CLICK ABOVE TO DISPATCH A REQUEST.
              </div>
            ) : (
              requests.map((r) => {
                const isSelected = selectedReq?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReq(r)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-canvas-card border-hairline-strong shadow-soft ring-1 ring-hairline-strong"
                        : "bg-canvas-surface border-hairline hover:border-hairline-strong hover:bg-canvas-card/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-canvas-text">
                        <ScrambleId value={r.source_case_id} />
                      </span>
                      <StatusBadge
                        status={
                          r.status === "ACCEPTED"
                            ? "UNDER_PROCESS"
                            : r.status === "COMPLETED"
                            ? "DISPOSED"
                            : "PENDING"
                        }
                        label={r.status}
                      />
                    </div>

                    <h3 className="font-medium text-xs text-canvas-text mt-2.5 line-clamp-1">{r.title}</h3>
                    <p className="text-[11px] text-canvas-muted mt-1 line-clamp-2 leading-relaxed">{r.request_details}</p>

                    <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between text-[10px] font-mono text-canvas-muted">
                      <span className="text-canvas-text">
                        {r.requesting_bureau_code} <span className="text-saffron">→</span> {r.target_bureau_code}
                      </span>
                      <span>{r.messages_count} ENTRIES</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Active Conversation & Resolution (7 Cols) */}
          <div className="lg:col-span-7">
            {selectedReq ? (
              <div className="rounded-2xl border border-hairline bg-canvas-surface overflow-hidden flex flex-col h-[650px] shadow-soft">
                {/* Header */}
                <div className="p-5 border-b border-hairline bg-canvas-card/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-canvas-text bg-canvas-card px-2.5 py-0.5 rounded-lg border border-hairline">
                        <ScrambleId value={selectedReq.source_case_id} />
                      </span>
                      <h2 className="text-sm font-medium text-canvas-text">{selectedReq.title}</h2>
                    </div>
                    <p className="text-[11px] font-mono text-canvas-muted mt-1">
                      DISPATCH: <strong className="text-canvas-text">{selectedReq.requesting_bureau_code}</strong> · TARGET: <strong className="text-canvas-text">{selectedReq.target_bureau_code}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedReq.status === "PENDING" && (
                      <button
                        onClick={() => handleStatusUpdate("ACCEPTED")}
                        disabled={updatingStatus}
                        className="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 rounded-lg text-xs font-mono font-medium hover:bg-emerald-500/25 transition-colors"
                      >
                        ACCEPT PROTOCOL
                      </button>
                    )}
                    {selectedReq.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleStatusUpdate("COMPLETED")}
                        disabled={updatingStatus}
                        className="px-3.5 py-1.5 bg-canvas-text text-canvas rounded-lg text-xs font-mono font-medium hover:opacity-90 transition-opacity"
                      >
                        SEAL INQUIRY
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Thread Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-canvas/40">
                  <div className="p-4 rounded-xl bg-canvas-card border border-hairline text-xs font-mono space-y-2">
                    <span className="text-[10px] tracking-widest text-saffron uppercase block font-semibold">
                      INITIAL DISPATCH REQUIREMENT
                    </span>
                    <p className="text-canvas-text font-sans font-normal leading-relaxed">{selectedReq.request_details}</p>
                    <span className="text-[10px] text-canvas-faint block pt-1">
                      COMMITTED BY {selectedReq.requested_by_name} ({new Date(selectedReq.created_at).toLocaleString()})
                    </span>
                  </div>

                  {(selectedReq.messages || []).map((m: any) => (
                    <div key={m.id} className="p-4 bg-canvas-card rounded-xl border border-hairline text-xs space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between font-mono text-canvas-muted">
                        <span className="font-semibold text-canvas-text">
                          {m.sender_name} <span className="text-saffron">({m.bureau_code})</span>
                        </span>
                        <span className="text-[10px] text-canvas-muted">{new Date(m.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-canvas-text font-sans font-normal leading-relaxed">{m.message}</p>
                    </div>
                  ))}
                </div>

                {/* Message Input Footer */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-hairline bg-canvas-surface flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Enter inter-bureau dispatch, evidentiary clarification, or finding notes..."
                    className="flex-1 text-xs rounded-lg border border-hairline bg-canvas-card px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-muted focus:outline-none focus:border-canvas-text/30"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-canvas-text text-canvas rounded-lg text-xs font-mono font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-soft"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingMsg ? "DISPATCHING..." : "SEND"}</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs">
                SELECT A PROTOCOL THREAD ON THE LEFT TO INSPECT DISPATCH TIMELINE AND JOINT ASSETS.
              </div>
            )}
          </div>
        </div>

        {/* New Coordination Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-canvas-surface rounded-2xl border border-hairline-strong max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col text-xs font-mono shadow-card relative">
              <div className="h-[2px] w-full bg-gradient-to-r from-saffron via-white to-emerald-500 shrink-0" />
              <div className="flex items-center justify-between border-b border-hairline p-5 bg-canvas-card/50">
                <span className="text-xs font-mono tracking-wider text-canvas-text uppercase font-bold">
                  INITIATE INTER-BUREAU COORDINATION
                </span>
                <button onClick={() => setShowModal(false)} className="text-canvas-muted hover:text-canvas-text p-1">✕</button>
              </div>

              <form onSubmit={handleCreateRequest} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">Source Complaint Case *</label>
                  <select
                    required
                    value={formSourceCompId}
                    onChange={(e) => setFormSourceCompId(e.target.value)}
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                  >
                    {complaints.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.case_id} — {c.subject.slice(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">Target Bureau *</label>
                  <select
                    required
                    value={formTargetBureauId}
                    onChange={(e) => setFormTargetBureauId(e.target.value)}
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                  >
                    {bureaus.map((b) => (
                      <option key={b.id} value={b.id}>{b.code} — {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">Purpose / Subject *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Joint Scrutiny on Unapproved Branch Operations"
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text placeholder:text-canvas-muted focus:outline-none focus:border-canvas-text/30"
                  />
                </div>

                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">Inquiry Details *</label>
                  <textarea
                    required
                    rows={3}
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder="Specify documentary proof or field report required from target bureau..."
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text placeholder:text-canvas-muted focus:outline-none focus:border-canvas-text/30"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3.5 py-2 border border-hairline rounded-lg text-canvas-muted hover:text-canvas-text transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-canvas-text text-canvas rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {creating ? "DISPATCHING..." : "DISPATCH INQUIRY"}
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
