"use client";

import React, { useState, useEffect } from "react";
import { api, getStoredToken } from "@/lib/api";
import {
  FileText,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import CountUp from "@/components/motion/CountUp";

interface ReportMeta {
  id: string;
  title: string;
  category: string;
  description: string;
}

const REPORT_TYPES: ReportMeta[] = [
  {
    id: "institution_wise",
    title: "Institution Complaint Summary",
    category: "Institution Analysis",
    description: "Breakdown of total, open, closed, and overdue complaints by educational institution.",
  },
  {
    id: "bureau_wise",
    title: "Bureau-Wise Volume & Closure",
    category: "Operational",
    description: "Comparative complaint volume, resolution count, and average turnaround per bureau.",
  },
  {
    id: "regional",
    title: "Regional Office Distribution",
    category: "Geographic",
    description: "Regional distribution of active complaints, compliance rates, and regional jurisdiction.",
  },
  {
    id: "category",
    title: "Grievance Category Distribution",
    category: "Classification",
    description: "Distribution across approval, capitation, faculty, examination, and infra categories.",
  },
  {
    id: "severity",
    title: "Severity & Priority Matrix",
    category: "Risk Assessment",
    description: "Incident severity (Critical, High, Medium, Low) and associated regulatory urgency.",
  },
  {
    id: "officer_performance",
    title: "Officer Case Performance",
    category: "Workload",
    description: "Caseloads, average time-to-close, open assignments, and compliance ratings per officer.",
  },
  {
    id: "workload",
    title: "Bureau Workload Matrix",
    category: "Capacity",
    description: "Live distribution of assigned cases vs active capacity across operational bureaus.",
  },
  {
    id: "resolution_time",
    title: "Resolution Turnaround Metrics",
    category: "SLA Compliance",
    description: "Mean and median duration in days from receipt to official closure across bureaus.",
  },
  {
    id: "overdue",
    title: "Overdue Complaints & Escalations",
    category: "Compliance Risk",
    description: "Active complaints currently breaching standard SLA thresholds requiring immediate intervention.",
  },
  {
    id: "coordination",
    title: "Cross-Bureau Coordination Audit",
    category: "Inter-Agency",
    description: "Status and volume of inter-bureau collaboration, joint reviews, and information requests.",
  },
  {
    id: "related_cases",
    title: "AI-Detected Overlap Clusters",
    category: "Intelligence",
    description: "Clusters of correlated complaints linked to identical systemic institutional grievances.",
  },
  {
    id: "trends",
    title: "12-Month Inflow & Outflow Trends",
    category: "Longitudinal",
    description: "Historical trajectory of complaint intake volume versus official resolution completions.",
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("institution_wise");
  const [bureauFilter, setBureauFilter] = useState("");
  const [bureaus, setBureaus] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadBureaus();
  }, []);

  useEffect(() => {
    loadReport();
  }, [selectedReport, bureauFilter]);

  const loadBureaus = async () => {
    try {
      const data = await api.getBureaus();
      setBureaus(data || []);
    } catch (err) {
      console.error("Failed to load bureaus", err);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReport(selectedReport, bureauFilter || undefined);
      setReportData(data);
    } catch (err) {
      console.error("Failed to load report", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      const token = getStoredToken();
      const url = `${api.getReportExportUrl(selectedReport)}?${bureauFilter ? `bureau_id=${bureauFilter}` : ""}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `prism_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert("Failed to export report CSV. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const currentMeta = REPORT_TYPES.find((r) => r.id === selectedReport) || REPORT_TYPES[0];
  const tableData: any[] = reportData?.data || [];
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          cueNumber="10"
          sectionLabel="REGULATORY INTELLIGENCE & EXPORTS"
          title="Statutory Reports Engine"
          accentWord="Reports"
          description="Real-time multi-dimensional telemetry across institutional grievances, operational throughput, and SLA compliance."
          actions={
            <div className="flex items-center gap-2.5">
              <button
                onClick={loadReport}
                disabled={loading}
                className="p-2 border border-hairline bg-canvas-card rounded-lg hover:bg-canvas-card/80 text-canvas-muted hover:text-canvas-text transition-colors shadow-xs"
                title="Refresh Report Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-saffron" : ""}`} />
              </button>

              <button
                onClick={handleDownloadCsv}
                disabled={downloading || loading || tableData.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-canvas-text text-canvas text-xs font-mono font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-soft"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? "EXPORTING DATA..." : "EXPORT STATUTORY CSV"}</span>
              </button>
            </div>
          }
        />

        {/* Filters and Report Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Report Selector Navigation */}
          <div className="lg:col-span-1 rounded-2xl border border-hairline bg-canvas-surface p-5 space-y-5 shadow-soft">
            <div>
              <label className="text-[10px] font-mono text-canvas-muted uppercase tracking-wider block mb-2">
                BUREAU FILTER SCOPE
              </label>
              <select
                value={bureauFilter}
                onChange={(e) => setBureauFilter(e.target.value)}
                className="w-full text-xs font-mono border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
              >
                <option value="">ALL BUREAUS & CELLS</option>
                {bureaus.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bureau_code} — {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-canvas-muted uppercase tracking-wider block mb-2">
                STATUTORY REPORT SUITE
              </label>
              <div className="space-y-1">
                {REPORT_TYPES.map((rep) => {
                  const isSelected = selectedReport === rep.id;
                  return (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedReport(rep.id)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition flex flex-col ${
                        isSelected
                          ? "bg-canvas-card border border-hairline-strong text-canvas-text shadow-soft"
                          : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-card/50"
                      }`}
                    >
                      <span className="font-medium text-canvas-text">{rep.title}</span>
                      <span className="text-[10px] font-mono text-canvas-faint mt-0.5">
                        {rep.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Data Table Preview and Live Aggregate Metrics */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-hairline bg-canvas-card p-5 flex items-center justify-between shadow-soft">
                <div>
                  <p className="text-[10px] font-mono text-canvas-muted uppercase">RECORDS COMPILED</p>
                  <p className="text-2xl font-mono font-bold text-canvas-text mt-1">
                    <CountUp value={tableData.length} />
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-saffron">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-hairline bg-canvas-card p-5 flex items-center justify-between shadow-soft">
                <div>
                  <p className="text-[10px] font-mono text-canvas-muted uppercase">ACTIVE JURISDICTION</p>
                  <p className="text-sm font-medium text-canvas-text mt-1 truncate max-w-[160px]">
                    {bureauFilter
                      ? bureaus.find((b) => b.id === bureauFilter)?.bureau_code || "Target Unit"
                      : "All Operating Units"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building className="w-5 h-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-hairline bg-canvas-card p-5 flex items-center justify-between shadow-soft">
                <div>
                  <p className="text-[10px] font-mono text-canvas-muted uppercase">PIPELINE INTEGRITY</p>
                  <p className="text-sm font-mono text-emerald-600 dark:text-emerald-300 mt-1 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE DB SYNC
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-canvas-muted">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
              <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-canvas-surface/50">
                <h3 className="font-medium text-xs font-mono text-canvas-text flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-saffron" />
                  <span>PREVIEW: {currentMeta.title} ({tableData.length} records)</span>
                </h3>
                <span className="text-[10px] font-mono text-canvas-faint">
                  COMPILED AT {new Date().toLocaleTimeString()}
                </span>
              </div>

              {loading ? (
                <div className="p-16 text-center text-canvas-muted font-mono text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-saffron" />
                  <p>AGGREGATING REPOSITORY TELEMETRY...</p>
                </div>
              ) : tableData.length === 0 ? (
                <div className="p-16 text-center text-canvas-muted font-mono text-xs">
                  <p>NO TELEMETRY MATCHES THE SPECIFIED QUERY PARAMETERS.</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-canvas-surface text-canvas-muted uppercase tracking-wider sticky top-0 border-b border-hairline">
                      <tr>
                        {columns.map((col) => (
                          <th key={col} className="px-4 py-3 whitespace-nowrap text-[10px]">
                            {col.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline text-canvas-text">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-canvas-surface/60 transition-colors">
                          {columns.map((col) => {
                            const val = row[col];
                            return (
                              <td key={col} className="px-4 py-3 whitespace-nowrap text-[11px]">
                                {typeof val === "boolean"
                                  ? val
                                    ? "YES"
                                    : "NO"
                                  : val !== null && val !== undefined
                                  ? String(val)
                                  : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
