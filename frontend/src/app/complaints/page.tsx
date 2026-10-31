"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  Building2,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";

export default function ComplaintsDirectoryPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [bureauFilter, setBureauFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [overdueFilter, setOverdueFilter] = useState<string>("");
  const [closedFilter, setClosedFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 15;

  const [bureaus, setBureaus] = useState<any[]>([]);

  useEffect(() => {
    api.getBureaus().then(setBureaus).catch(() => {});
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({
        search,
        bureau_id: bureauFilter || undefined,
        severity: severityFilter || undefined,
        priority: priorityFilter || undefined,
        is_overdue: overdueFilter === "true" ? true : (overdueFilter === "false" ? false : undefined),
        is_closed: closedFilter === "true" ? true : (closedFilter === "false" ? false : undefined),
        skip: page * limit,
        limit,
      });
      setComplaints(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [search, bureauFilter, severityFilter, priorityFilter, overdueFilter, closedFilter, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          cueNumber="03"
          sectionLabel="COMPLAINTS REPOSITORY"
          title="Central Complaint Directory"
          accentWord="Directory"
          description="Statutory repository of institution-related grievances across all bureaus with immutable Case IDs and SLA timers."
          actions={
            <Link
              href="/complaints/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-colors shadow-soft"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>LODGE GRIEVANCE</span>
            </Link>
          }
        />

        {/* Search and Filters Strip */}
        <div className="rounded-2xl border border-hairline bg-canvas-card p-4 flex flex-wrap items-center justify-between gap-3 shadow-soft">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-canvas-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by Case ID, Subject, Institution Name, or External Ref..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-lg border border-hairline bg-canvas-card-subtle text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Bureau Filter */}
            <select
              value={bureauFilter}
              onChange={(e) => {
                setBureauFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-mono border border-hairline rounded-lg px-3 py-2 bg-canvas-surface text-canvas-text focus:outline-none focus:border-hairline-strong"
            >
              <option value="">ALL BUREAUS</option>
              {bureaus.map((b) => (
                <option key={b.id} value={b.id}>{b.code} — {b.name}</option>
              ))}
            </select>

            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-mono border border-hairline rounded-lg px-3 py-2 bg-canvas-surface text-canvas-text focus:outline-none focus:border-hairline-strong"
            >
              <option value="">SEVERITY (ALL)</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-mono border border-hairline rounded-lg px-3 py-2 bg-canvas-surface text-canvas-text focus:outline-none focus:border-hairline-strong"
            >
              <option value="">PRIORITY (ALL)</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            {/* Overdue */}
            <select
              value={overdueFilter}
              onChange={(e) => {
                setOverdueFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-mono border border-hairline rounded-lg px-3 py-2 bg-canvas-surface text-canvas-text focus:outline-none focus:border-hairline-strong"
            >
              <option value="">TIMELINE (ALL)</option>
              <option value="true">OVERDUE SLA</option>
              <option value="false">WITHIN SLA</option>
            </select>

            {/* Status */}
            <select
              value={closedFilter}
              onChange={(e) => {
                setClosedFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-mono border border-hairline rounded-lg px-3 py-2 bg-canvas-surface text-canvas-text focus:outline-none focus:border-hairline-strong"
            >
              <option value="">STATE (ALL)</option>
              <option value="false">ACTIVE / OPEN</option>
              <option value="true">CLOSED / RESOLVED</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-hairline bg-canvas-card-subtle text-[11px] font-mono text-canvas-muted uppercase tracking-wider">
                  <th className="py-3 px-4">CASE ID</th>
                  <th className="py-3 px-4">INSTITUTION</th>
                  <th className="py-3 px-4">GRIEVANCE SUBJECT</th>
                  <th className="py-3 px-4">BUREAU</th>
                  <th className="py-3 px-4">SEVERITY</th>
                  <th className="py-3 px-4">STAGE</th>
                  <th className="py-3 px-4">ASSIGNED OFFICER</th>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-canvas-muted font-mono">
                      <div className="inline-block w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin mr-2" />
                      FETCHING CASE RECORDS...
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-canvas-muted font-mono">
                      NO COMPLAINT RECORDS MATCH CURRENT CRITERIA.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-canvas-card-hover transition-colors group">
                      <td className="py-3 px-4 font-mono font-medium whitespace-nowrap">
                        <Link href={`/complaints/${c.id}`} className="text-canvas-text hover:text-saffron transition-colors">
                          <ScrambleId value={c.case_id} />
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/institutions/${c.institution_id}`}
                          className="font-medium text-canvas-text hover:text-saffron line-clamp-1 max-w-[200px] transition-colors"
                        >
                          {c.institution_name}
                        </Link>
                        <span className="text-[10px] text-canvas-faint font-mono block">
                          <ScrambleId value={c.aicte_id} />
                        </span>
                      </td>
                      <td className="py-3 px-4 font-normal text-canvas-text max-w-xs truncate">
                        {c.subject}
                      </td>
                      <td className="py-3 px-4 font-mono text-canvas-muted">{c.bureau_code}</td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={
                            c.severity === "CRITICAL"
                              ? "ESCALATED"
                              : c.severity === "HIGH"
                              ? "ACTION_REQUIRED"
                              : "UNDER_PROCESS"
                          }
                          label={c.severity}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-canvas-card-subtle border border-hairline text-canvas-text">
                          {c.stage_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-canvas-muted">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-canvas-faint" />
                          <span className="truncate max-w-[120px]">{c.assigned_officer_name || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                        {c.is_overdue && !c.is_closed ? (
                          <span className="inline-flex items-center text-rose-500 font-semibold gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            {c.due_date ? new Date(c.due_date).toLocaleDateString() : "OVERDUE"}
                          </span>
                        ) : (
                          <span className="text-canvas-muted">
                            {c.due_date ? new Date(c.due_date).toLocaleDateString() : "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/complaints/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-mono text-canvas-muted group-hover:text-canvas-text transition-colors"
                        >
                          <span>DOSSIER</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="bg-canvas-card-subtle px-4 py-3 border-t border-hairline flex items-center justify-between text-xs font-mono text-canvas-muted">
            <div>
              SHOWING <span className="text-canvas-text font-medium">{total > 0 ? page * limit + 1 : 0}</span> —{" "}
              <span className="text-canvas-text font-medium">{Math.min((page + 1) * limit, total)}</span> OF{" "}
              <span className="text-canvas-text font-medium">{total}</span> COMPLAINTS
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded-md border border-hairline text-canvas-muted hover:text-canvas-text hover:bg-canvas-card-hover disabled:opacity-20 disabled:pointer-events-none transition-colors shadow-soft"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-canvas-text font-medium">
                PAGE {page + 1} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded-md border border-hairline text-canvas-muted hover:text-canvas-text hover:bg-canvas-card-hover disabled:opacity-20 disabled:pointer-events-none transition-colors shadow-soft"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
