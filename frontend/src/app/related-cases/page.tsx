"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GitFork,
  Building2,
  FileText,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";

export default function RelatedCaseGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Group creation modal
  const [showModal, setShowModal] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInstId, setSelectedInstId] = useState("");
  const [instComplaints, setInstComplaints] = useState<any[]>([]);
  const [selectedComplaintIds, setSelectedComplaintIds] = useState<string[]>([]);
  const [commonIssue, setCommonIssue] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.getRelatedGroups();
      setGroups(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    api.getInstitutions({ limit: 100 }).then((res) => setInstitutions(res.items)).catch(() => {});
  }, []);

  const handleInstChange = async (instId: string) => {
    setSelectedInstId(instId);
    setSelectedComplaintIds([]);
    if (!instId) {
      setInstComplaints([]);
      return;
    }
    const res = await api.getComplaints({ institution_id: instId, limit: 50 });
    setInstComplaints(res.items);
  };

  const handleToggleComplaint = (id: string) => {
    if (selectedComplaintIds.includes(id)) {
      setSelectedComplaintIds(selectedComplaintIds.filter((cid) => cid !== id));
    } else {
      setSelectedComplaintIds([...selectedComplaintIds, id]);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedComplaintIds.length < 2) {
      alert("Please select at least 2 complaints to form a related-case group.");
      return;
    }
    setCreating(true);
    try {
      await api.createRelatedGroup({
        institution_id: selectedInstId,
        common_issue_description: commonIssue,
        complaint_ids: selectedComplaintIds,
      });
      setShowModal(false);
      setCommonIssue("");
      setSelectedComplaintIds([]);
      fetchGroups();
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
          cueNumber="05"
          sectionLabel="CROSS-BUREAU CASE CLUSTERS"
          title="Related Case Clusters"
          accentWord="Clusters"
          description="Consolidated tracking for correlated grievances addressing common systemic defects without merging independent statutory records."
          actions={
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-colors shadow-soft"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>FORM CASE CLUSTER</span>
            </button>
          }
        />

        {/* Groups Listing */}
        <div className="space-y-6">
          {loading ? (
            <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card shadow-soft">
              <div className="inline-block w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin mr-2" />
              LOADING CASE CLUSTERS...
            </div>
          ) : groups.length === 0 ? (
            <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs shadow-soft">
              NO RELATED-CASE CLUSTERS FORMED YET. USE AI WORKSPACE TO SCAN CANDIDATES OR FORM ONE MANUALLY.
            </div>
          ) : (
            groups.map((grp) => (
              <div key={grp.id} className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
                <div className="bg-canvas-card-subtle p-5 sm:p-6 border-b border-hairline flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-canvas-text bg-canvas-surface px-3 py-1 rounded-lg border border-hairline">
                      <ScrambleId value={grp.group_code} />
                    </span>
                    <div>
                      <Link
                        href={`/institutions/${grp.institution_id}`}
                        className="font-medium text-canvas-text text-sm hover:text-saffron transition-colors"
                      >
                        {grp.institution_name}
                      </Link>
                      <p className="text-xs text-canvas-muted mt-0.5">{grp.common_issue_description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono text-canvas-faint uppercase">BUREAUS:</span>
                    {(grp.participating_bureaus || []).map((b: string) => (
                      <span key={b} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-canvas-surface border border-hairline text-canvas-text">
                        {b}
                      </span>
                    ))}
                    <StatusBadge
                      status={grp.verification_status === "VERIFIED" ? "DISPOSED" : "ACTION_REQUIRED"}
                      label={grp.verification_status}
                    />
                  </div>
                </div>

                {/* Group Cases Table */}
                <div className="p-4 sm:p-6 overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-canvas-muted text-[10px] uppercase tracking-wider border-b border-hairline pb-3">
                        <th className="pb-3 px-2">CASE ID</th>
                        <th className="pb-3 px-2">BUREAU</th>
                        <th className="pb-3 px-2">GRIEVANCE SUBJECT</th>
                        <th className="pb-3 px-2">SEVERITY</th>
                        <th className="pb-3 px-2 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {(grp.cases || []).map((c: any) => (
                        <tr key={c.id} className="hover:bg-canvas-card-hover transition-colors group">
                          <td className="py-3 px-2 font-bold text-canvas-text whitespace-nowrap">
                            <ScrambleId value={c.case_id} />
                          </td>
                          <td className="py-3 px-2 text-canvas-muted">{c.bureau}</td>
                          <td className="py-3 px-2 font-sans font-normal text-canvas-text max-w-md truncate">{c.subject}</td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-canvas-card-subtle border border-hairline text-canvas-muted">
                              {c.severity}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Link href={`/complaints/${c.id}`} className="text-canvas-muted hover:text-canvas-text transition-colors">
                              DOSSIER →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Group Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-canvas-surface rounded-2xl border border-hairline-strong max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col text-xs font-mono shadow-card relative">
              <div className="h-[2px] w-full bg-gradient-to-r from-saffron via-white to-emerald-500 shrink-0" />
              <div className="flex items-center justify-between border-b border-hairline p-5 bg-canvas-card-subtle">
                <span className="text-xs font-mono tracking-wider text-canvas-text uppercase font-bold">
                  CONSOLIDATE CASE CLUSTER
                </span>
                <button onClick={() => setShowModal(false)} className="text-canvas-muted hover:text-canvas-text p-1">✕</button>
              </div>

              <form onSubmit={handleCreateGroup} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">Target Institution *</label>
                  <select
                    required
                    value={selectedInstId}
                    onChange={(e) => handleInstChange(e.target.value)}
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas-card text-canvas-text focus:outline-none"
                  >
                    <option value="">-- CHOOSE INSTITUTION --</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>{i.name} ({i.aicte_id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">Common Underlying Issue *</label>
                  <input
                    type="text"
                    required
                    value={commonIssue}
                    onChange={(e) => setCommonIssue(e.target.value)}
                    placeholder="e.g. Unapproved polytechnic branches running without council sanction"
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas-card-subtle text-canvas-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-canvas-muted uppercase mb-1.5">
                    Connect Complaints (Min. 2) *
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-hairline rounded-xl p-3 space-y-2 bg-canvas-card">
                    {instComplaints.length === 0 ? (
                      <p className="text-canvas-faint p-2">Select an institution above to list available grievances.</p>
                    ) : (
                      instComplaints.map((c) => (
                        <label key={c.id} className="flex items-start gap-2.5 p-2 hover:bg-canvas-card-hover rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedComplaintIds.includes(c.id)}
                            onChange={() => handleToggleComplaint(c.id)}
                            className="mt-0.5 rounded border-hairline text-saffron"
                          />
                          <div className="truncate">
                            <span className="font-bold text-canvas-text mr-2">{c.case_id}</span>
                            <span className="text-canvas-text font-sans">{c.subject}</span>
                            <span className="text-[10px] text-canvas-muted block">Bureau: {c.bureau_code}</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3.5 py-2 border border-hairline rounded-lg text-canvas-muted hover:text-canvas-text"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={creating || selectedComplaintIds.length < 2}
                    className="px-4 py-2 bg-canvas-text text-canvas rounded-lg font-medium hover:opacity-90 disabled:opacity-50 shadow-soft"
                  >
                    {creating ? "FORMING CLUSTER..." : "COMMIT CLUSTER"}
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
