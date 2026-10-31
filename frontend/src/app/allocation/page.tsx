"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";
import CountUp from "@/components/motion/CountUp";

export default function CaseAllocationPage() {
  const [officers, setOfficers] = useState<any[]>([]);
  const [bureaus, setBureaus] = useState<any[]>([]);
  const [selectedBureau, setSelectedBureau] = useState("");
  const [loading, setLoading] = useState(true);

  // Unassigned complaints list
  const [unassignedCases, setUnassignedCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workloadRes, bureauRes, compRes] = await Promise.all([
        api.getOfficerWorkload(selectedBureau || undefined),
        api.getBureaus(),
        api.getComplaints({ is_closed: false, limit: 100 }),
      ]);
      setOfficers(workloadRes);
      setBureaus(bureauRes);
      const unassigned = (compRes.items || []).filter((c: any) => !c.assigned_officer_id || c.assigned_officer_name === "Unassigned");
      setUnassignedCases(unassigned);
      if (unassigned.length > 0 && !selectedCaseId) {
        setSelectedCaseId(unassigned[0].id);
      }
      if (workloadRes.length > 0 && !assigneeId) {
        const recommended = workloadRes.find((o: any) => o.availability_status === "AVAILABLE") || workloadRes[0];
        setAssigneeId(recommended.officer_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBureau]);

  const handleExecuteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !assigneeId) return;
    setAssigning(true);
    try {
      await api.assignOfficer(selectedCaseId, assigneeId, "Assigned via Case Allocation Workload Engine");
      fetchData();
      alert("Case successfully assigned with notification dispatched to officer.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          cueNumber="06"
          sectionLabel="PERSONNEL CAPACITY ALLOCATION"
          title="Workload & Case Allocation"
          accentWord="Allocation"
          description="Real-time capacity tracking, officer load monitoring, and dynamic grievance allocation based on statutory quotas."
          actions={
            <div className="flex items-center gap-2 bg-canvas-card border border-hairline rounded-lg px-3 py-1.5 shadow-soft">
              <Filter className="w-3.5 h-3.5 text-canvas-muted" />
              <select
                value={selectedBureau}
                onChange={(e) => setSelectedBureau(e.target.value)}
                className="bg-transparent text-xs font-mono text-canvas-text focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-canvas-surface text-canvas-text">ALL BUREAUS</option>
                {bureaus.map((b) => (
                  <option key={b.id} value={b.id} className="bg-canvas-surface text-canvas-text">{b.code} — {b.name}</option>
                ))}
              </select>
            </div>
          }
        />

        {/* Main Grid: Left Officer Workload Matrix, Right Instant Allocation Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Officer Workload Cards (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-canvas-muted px-1">
              <span>PERSONNEL CAPACITY TELEMETRY ({officers.length})</span>
              <span>15 CONCURRENT CEILING</span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs shadow-soft">
                <div className="inline-block w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin mr-2" />
                CALCULATING CASELOAD DYNAMICS...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officers.map((off) => (
                  <div
                    key={off.officer_id}
                    className="rounded-2xl border border-hairline bg-canvas-card p-5 space-y-4 hover:border-hairline-strong transition-colors shadow-soft"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-canvas-text text-sm">{off.name}</h3>
                        <p className="text-xs font-mono text-canvas-muted">{off.email}</p>
                      </div>
                      <StatusBadge
                        status={
                          off.availability_status === "AVAILABLE"
                            ? "DISPOSED"
                            : off.availability_status === "OPTIMAL"
                            ? "UNDER_PROCESS"
                            : "ESCALATED"
                        }
                        label={off.availability_status}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-canvas-muted">
                      <span className="bg-canvas-card-subtle border border-hairline px-2 py-0.5 rounded text-[10px] text-canvas-text">
                        {off.bureau_code || "Central"}
                      </span>
                      <span>·</span>
                      <span className="truncate max-w-[150px]">{off.role}</span>
                    </div>

                    {/* Caseload breakdown */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-hairline text-center font-mono">
                      <div className="bg-canvas-card-subtle p-2.5 rounded-xl border border-hairline">
                        <span className="text-[10px] text-canvas-muted block">ASSIGNED</span>
                        <span className="font-bold text-canvas-text text-sm"><CountUp value={off.total_assigned} /></span>
                      </div>
                      <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        <span className="text-[10px] text-amber-600 dark:text-amber-300/80 block">ACTIVE</span>
                        <span className="font-bold text-amber-600 dark:text-amber-300 text-sm"><CountUp value={off.currently_open} /></span>
                      </div>
                      <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                        <span className="text-[10px] text-rose-600 dark:text-rose-300/80 block">OVERDUE</span>
                        <span className="font-bold text-rose-600 dark:text-rose-300 text-sm"><CountUp value={off.overdue} /></span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-canvas-muted uppercase">CAPACITY CONSUMED</span>
                        <span className="text-canvas-text font-bold">{off.capacity_percent}%</span>
                      </div>
                      <div className="w-full bg-canvas-card-subtle h-1.5 rounded-full overflow-hidden border border-hairline">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            off.capacity_percent >= 80
                              ? "bg-rose-500"
                              : off.capacity_percent >= 50
                              ? "bg-saffron"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, off.capacity_percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Allocation Console (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 space-y-5 sticky top-24 shadow-soft">
              <div className="border-b border-hairline pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-saffron block">
                  DYNAMIC DISPATCH
                </span>
                <h2 className="text-sm font-medium text-canvas-text tracking-tight mt-0.5">
                  Instant Workload-Aware Assignment
                </h2>
              </div>

              {unassignedCases.length === 0 ? (
                <p className="text-xs font-mono text-canvas-muted bg-canvas-card-subtle p-4 rounded-xl border border-hairline text-center">
                  All active registered complaints are currently assigned to case officers.
                </p>
              ) : (
                <form onSubmit={handleExecuteAssignment} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-canvas-muted uppercase mb-1.5">
                      Unassigned Case ({unassignedCases.length} pending) *
                    </label>
                    <select
                      required
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="w-full border border-hairline rounded-lg p-2.5 bg-canvas-surface text-canvas-text focus:outline-none"
                    >
                      {unassignedCases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.case_id} — {c.subject.slice(0, 30)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-canvas-muted uppercase mb-1.5">
                      Target Case Officer *
                    </label>
                    <select
                      required
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full border border-hairline rounded-lg p-2.5 bg-canvas-surface text-canvas-text focus:outline-none"
                    >
                      {officers.map((o) => (
                        <option key={o.officer_id} value={o.officer_id}>
                          {o.name} ({o.bureau_code}) — {o.currently_open} Active ({o.availability_status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={assigning || !selectedCaseId || !assigneeId}
                      className="w-full py-2.5 bg-canvas-text text-canvas rounded-lg font-medium hover:opacity-90 transition-colors shadow-soft disabled:opacity-50"
                    >
                      {assigning ? "DEPUTING..." : "DISPATCH ASSIGNMENT"}
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-3 border-t border-hairline text-[10px] font-mono text-canvas-faint space-y-1">
                <p>• Statutory threshold: 15 active inquiries per officer.</p>
                <p>• Assignments log immutable audit trails and dispatch notifications.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
