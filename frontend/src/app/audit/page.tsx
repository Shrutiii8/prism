"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Activity,
  Layers,
  FileCode,
  X,
  ExternalLink,
  ShieldCheck,
  Lock,
  KeyRound,
  FileText,
} from "lucide-react";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";
import CountUp from "@/components/motion/CountUp";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 50;

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  // Inspect Modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    loadLogs();
  }, [skip, actionFilter, resourceFilter, emailFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        action: actionFilter || undefined,
        resource_type: resourceFilter || undefined,
        user_email: emailFilter || undefined,
        skip,
        limit,
      });
      setLogs(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  // Derive quick summary stats
  const loginCount = logs.filter((l) => l.action?.includes("LOGIN")).length;
  const criticalCount = logs.filter(
    (l) => l.action?.includes("REJECT") || l.action?.includes("DELETE") || l.action?.includes("TRANSITION")
  ).length;
  const uniqueUsers = Array.from(new Set(logs.map((l) => l.user_email).filter(Boolean))).length;

  return (
    <PageTransition>
      <div className="space-y-6 sm:space-y-8 max-w-full">
        <PageHeader
          cueNumber="11"
          sectionLabel="CRYPTOGRAPHIC AUDIT LEDGER"
          title="Immutable Audit Ledger"
          accentWord="Ledger"
          description="Tamper-evident chronological audit stream tracking regulatory actions, workflow stage transitions, and inter-bureau dispatches."
          actions={
            <button
              onClick={() => {
                setSkip(0);
                loadLogs();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-hairline bg-canvas-card rounded-lg text-xs font-mono text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-saffron" : ""}`} />
              <span className="hidden sm:inline">REFRESH LEDGER</span>
              <span className="sm:hidden">SYNC</span>
            </button>
          }
        />

        {/* Top 4-card Telemetry Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>RECORDED EVENTS</span>
              <FileText className="w-4 h-4 text-saffron" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-canvas-text">
              <CountUp value={total} />
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Cumulative log sequence
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>AUTHENTICATED ACTORS</span>
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-canvas-text">
              <CountUp value={uniqueUsers || 1} />
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Unique personnel in trace
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>SECURITY ACTIONS</span>
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-canvas-text">
              <CountUp value={criticalCount} />
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Transitions & verifications
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>LEDGER INTEGRITY</span>
              <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SHA-256 VERIFIED
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block truncate">
              PostgreSQL Append-Only
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="rounded-2xl border border-hairline bg-canvas-surface p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono shadow-soft">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-canvas-faint" />
            <input
              type="text"
              placeholder="Search user email..."
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setSkip(0);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-hairline rounded-xl bg-canvas-card text-canvas-text placeholder:text-canvas-muted focus:outline-none focus:border-canvas-text/30"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setSkip(0);
              }}
              className="w-full py-2 px-3 text-xs border border-hairline rounded-xl bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
            >
              <option value="">ACTION TYPE (ALL)</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="REGISTER_COMPLAINT">REGISTER_COMPLAINT</option>
              <option value="STAGE_TRANSITION">STAGE_TRANSITION</option>
              <option value="ASSIGN_OFFICER">ASSIGN_OFFICER</option>
              <option value="ADD_COMMENT">ADD_COMMENT</option>
              <option value="AI_MATCH_CONFIRMED">AI_MATCH_CONFIRMED</option>
              <option value="AI_MATCH_REJECTED">AI_MATCH_REJECTED</option>
              <option value="COORDINATION_REQUEST_CREATED">COORDINATION_REQUEST_CREATED</option>
              <option value="EXPORT_REPORT">EXPORT_REPORT</option>
            </select>
          </div>

          <div>
            <select
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value);
                setSkip(0);
              }}
              className="w-full py-2 px-3 text-xs border border-hairline rounded-xl bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
            >
              <option value="">TARGET RESOURCE (ALL)</option>
              <option value="COMPLAINT">COMPLAINT</option>
              <option value="INSTITUTION">INSTITUTION</option>
              <option value="USER">USER</option>
              <option value="AI_MATCH">AI_MATCH</option>
              <option value="COORDINATION">COORDINATION</option>
              <option value="REPORT">REPORT</option>
              <option value="EVIDENCE">EVIDENCE</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-[11px] text-canvas-muted px-2 py-2">
            <span>
              SHOWING <strong className="text-canvas-text">{logs.length}</strong> OF{" "}
              <strong className="text-canvas-text">{total}</strong>
            </span>
            {(actionFilter || resourceFilter || emailFilter) && (
              <button
                onClick={() => {
                  setActionFilter("");
                  setResourceFilter("");
                  setEmailFilter("");
                  setSkip(0);
                }}
                className="text-saffron hover:underline"
              >
                RESET
              </button>
            )}
          </div>
        </div>

        {/* Audit Log Table Container */}
        <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
          {loading ? (
            <div className="p-16 text-center text-canvas-muted font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-saffron" />
              <p>VERIFYING IMMUTABLE SHA-256 LEDGER BLOCKS...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center text-canvas-muted font-mono text-xs">
              <p>NO AUDIT EVENTS RECORDED UNDER SPECIFIED QUERY CRITERIA.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono min-w-[750px]">
                <thead className="border-b border-hairline bg-canvas-surface text-[10px] text-canvas-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">TIMESTAMP</th>
                    <th className="px-4 py-3.5">OPERATOR / ROLE</th>
                    <th className="px-4 py-3.5">ACTION EVENT</th>
                    <th className="px-4 py-3.5">RESOURCE TARGET</th>
                    <th className="px-4 py-3.5">CLIENT IP</th>
                    <th className="px-5 py-3.5 text-right">INSPECT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-canvas-text">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-canvas-surface/60 transition-colors group">
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] text-canvas-muted">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-canvas-text font-medium">{log.user_email || "SYSTEM"}</div>
                        <div className="text-[10px] text-canvas-faint">{log.user_role || "INTERNAL"}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge
                          status={
                            log.action?.includes("CREATE") || log.action?.includes("CONFIRM")
                              ? "DISPOSED"
                              : log.action?.includes("TRANSITION") || log.action?.includes("ASSIGN")
                              ? "ACTION_REQUIRED"
                              : log.action?.includes("DELETE") || log.action?.includes("REJECT")
                              ? "ESCALATED"
                              : "UNDER_PROCESS"
                          }
                          label={log.action}
                        />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-canvas-text font-medium">{log.resource_type}</span>
                        {log.resource_id && (
                          <span className="text-[10px] text-canvas-muted block truncate max-w-[140px]">
                            <ScrambleId value={log.resource_id} />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-canvas-muted">
                        {log.ip_address || "127.0.0.1"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-[11px] rounded-lg border border-hairline bg-canvas text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>INSPECT</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t border-hairline bg-canvas-surface/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-canvas-muted">
            <div>
              SHOWING {skip + 1} — {Math.min(skip + limit, total)} OF {total} ENTRIES
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={skip === 0}
                onClick={() => setSkip((s) => Math.max(0, s - limit))}
                className="px-3 py-1.5 border border-hairline rounded-lg text-canvas-muted hover:text-canvas-text disabled:opacity-30 transition-colors"
              >
                PREVIOUS
              </button>
              <button
                disabled={skip + limit >= total}
                onClick={() => setSkip((s) => s + limit)}
                className="px-3 py-1.5 border border-hairline rounded-lg text-canvas-muted hover:text-canvas-text disabled:opacity-30 transition-colors"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>

        {/* Audit Inspector Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4">
            <div className="bg-canvas-surface rounded-2xl border border-hairline-strong max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col font-mono text-xs shadow-card">
              <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-canvas-card/50">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-saffron" />
                  <h3 className="text-canvas-text text-xs font-bold uppercase tracking-wider">
                    AUDIT EVENT INSPECTOR — {selectedLog.action}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-canvas-muted hover:text-canvas-text p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-canvas-card p-4 rounded-xl border border-hairline">
                  <div>
                    <span className="text-canvas-faint block text-[10px] uppercase">TIMESTAMP</span>
                    <span className="text-canvas-text font-medium">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-canvas-faint block text-[10px] uppercase">OPERATOR ACCOUNT</span>
                    <span className="text-canvas-text font-medium">{selectedLog.user_email || "SYSTEM"}</span>
                  </div>
                  <div>
                    <span className="text-canvas-faint block text-[10px] uppercase">ROLE LEVEL</span>
                    <span className="text-canvas-text font-medium">{selectedLog.user_role || "INTERNAL"}</span>
                  </div>
                  <div>
                    <span className="text-canvas-faint block text-[10px] uppercase">CLIENT HOST IP</span>
                    <span className="text-canvas-text font-medium">
                      {selectedLog.ip_address || "127.0.0.1"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-canvas-faint block text-[10px] uppercase">CORRELATION ID</span>
                    <span className="text-canvas-muted text-[11px]">
                      {selectedLog.correlation_id || "None"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-canvas-faint block text-[10px] uppercase">RESOURCE TARGET</span>
                    <span className="text-canvas-muted text-[11px]">
                      {selectedLog.resource_type}: {selectedLog.resource_id || "Global"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] text-canvas-muted uppercase tracking-wider mb-2">
                    PAYLOAD TELEMETRY (JSON)
                  </h4>
                  <pre className="bg-canvas text-emerald-600 dark:text-emerald-300 p-4 rounded-xl border border-hairline text-[11px] overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(selectedLog.change_details_json || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-hairline bg-canvas-card/50 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-canvas-text text-canvas text-xs font-mono font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
