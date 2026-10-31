"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  GitFork,
  UserPlus,
  Stamp,
  MessagesSquare,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { useThemeTokens } from "@/lib/useThemeTokens";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import TiltCard from "@/components/motion/TiltCard";
import CountUp from "@/components/motion/CountUp";

const SPECTRUM_CHART_COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#f97316"];
const SEV_COLORS: Record<string, string> = {
  LOW: "#10b981",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  CRITICAL: "#ef4444",
};

export default function DashboardPage() {
  const tokens = useThemeTokens();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBureau, setSelectedBureau] = useState<string>("");
  const [bureaus, setBureaus] = useState<any[]>([]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboard(selectedBureau || undefined);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load executive statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getBureaus().then(setBureaus).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [selectedBureau]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-canvas-muted tracking-widest uppercase">
          QUERYING PRISM CENTRAL DATABASE...
        </p>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Page Title & Operational Controls */}
        <PageHeader
          cue="CUE 01 — CENTRAL REGULATORY TELEMETRY"
          title="Executive Operations Dashboard"
          accentWord="Operations"
          description="Real-time grievance telemetry, institutional regulatory compliance monitoring & cross-bureau coordination status."
          actions={
            <div className="flex items-center gap-3">
              {/* Bureau Filter */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-hairline bg-canvas-card text-xs font-mono shadow-soft">
                <Filter className="w-3.5 h-3.5 text-saffron shrink-0" />
                <select
                  value={selectedBureau}
                  onChange={(e) => setSelectedBureau(e.target.value)}
                  className="bg-transparent text-xs text-canvas-text focus:outline-hidden cursor-pointer"
                >
                  <option value="" className="bg-canvas-surface text-canvas-text">All Bureaus & Cells</option>
                  {bureaus.map((b) => (
                    <option key={b.id} value={b.id} className="bg-canvas-surface text-canvas-text">
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboard}
                title="Refresh Data"
                className="p-2.5 rounded-xl border border-hairline bg-canvas-card text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-colors shadow-soft"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          }
        />

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* AI Overlap Alert Banner */}
        {kpis.potential_related_groups > 0 && (
          <div className="relative rounded-2xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-md p-4 sm:p-5 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-purple-400 tracking-wider uppercase font-semibold">
                    AI Correlation Alert
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-400 border border-purple-400/30">
                    {kpis.potential_related_groups} Potential Groups Flagged
                  </span>
                </div>
                <p className="text-xs text-canvas-muted mt-0.5">
                  Multi-factor semantic analysis detected possible related allegations across independent bureau records.
                </p>
              </div>
            </div>
            <Link
              href="/ai-matching"
              className="px-4 py-2 rounded-xl bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-all flex items-center gap-2 shrink-0 group shadow-soft"
            >
              <span>Review Intelligence</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* PRIMARY KPI METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Institutions */}
          <Link href="/institutions">
            <TiltCard className="h-full group">
              <div className="flex items-center justify-between text-canvas-muted">
                <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                  Institutions
                </span>
                <Building2 className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-light text-canvas-text font-serif tracking-tight">
                  <CountUp end={kpis.total_institutions || 0} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-canvas-faint group-hover:text-cyan-500 transition-colors" />
              </div>
              <p className="text-[10px] font-mono text-canvas-faint mt-1.5 truncate">
                Central Registry
              </p>
            </TiltCard>
          </Link>

          {/* Total Complaints */}
          <Link href="/complaints">
            <TiltCard className="h-full group">
              <div className="flex items-center justify-between text-canvas-muted">
                <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                  Complaints
                </span>
                <FileText className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-light text-canvas-text font-serif tracking-tight">
                  <CountUp end={kpis.total_complaints || 0} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-canvas-faint group-hover:text-purple-500 transition-colors" />
              </div>
              <p className="text-[10px] font-mono text-canvas-faint mt-1.5 truncate">
                Registered Inflow
              </p>
            </TiltCard>
          </Link>

          {/* Open Cases */}
          <Link href="/complaints?is_closed=false">
            <TiltCard className="h-full group">
              <div className="flex items-center justify-between text-canvas-muted">
                <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                  Open Cases
                </span>
                <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-light text-amber-500 font-serif tracking-tight">
                  <CountUp end={kpis.open_complaints || 0} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-canvas-faint group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="text-[10px] font-mono text-canvas-faint mt-1.5 truncate">
                Under Inquiry
              </p>
            </TiltCard>
          </Link>

          {/* Overdue */}
          <Link href="/complaints?is_overdue=true&is_closed=false">
            <TiltCard className="h-full group border-rose-500/30 bg-rose-500/[0.04]">
              <div className="flex items-center justify-between text-rose-500">
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-500">
                  Overdue
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-light text-rose-500 font-serif tracking-tight">
                  <CountUp end={kpis.overdue_complaints || 0} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-canvas-faint group-hover:text-rose-500 transition-colors" />
              </div>
              <p className="text-[10px] font-mono text-rose-500/80 mt-1.5 truncate">
                SLA Statutory Breach
              </p>
            </TiltCard>
          </Link>

          {/* Urgent Priority */}
          <Link href="/complaints?priority=URGENT">
            <TiltCard className="h-full group">
              <div className="flex items-center justify-between text-canvas-muted">
                <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                  High / Urgent
                </span>
                <ShieldAlert className="w-4 h-4 text-saffron group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-light text-saffron font-serif tracking-tight">
                  <CountUp end={kpis.high_priority_complaints || 0} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-canvas-faint group-hover:text-saffron transition-colors" />
              </div>
              <p className="text-[10px] font-mono text-canvas-faint mt-1.5 truncate">
                Priority Review
              </p>
            </TiltCard>
          </Link>

          {/* Resolved Complaints */}
          <Link href="/complaints?is_closed=true">
            <TiltCard className="h-full group">
              <div className="flex items-center justify-between text-canvas-muted">
                <span className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                  Resolved
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-light text-emerald-500 font-serif tracking-tight">
                  <CountUp end={kpis.resolved_complaints || 0} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-canvas-faint group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-[10px] font-mono text-canvas-faint mt-1.5 truncate">
                Disposed Orders
              </p>
            </TiltCard>
          </Link>
        </div>

        {/* SECONDARY OPERATIONAL METRICS READOUT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/ai-matching"
            className="rounded-xl border border-hairline bg-canvas-card p-4 flex items-center justify-between hover:bg-canvas-card-hover hover:border-hairline-strong transition-all group shadow-soft"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                Potential Overlap Groups
              </p>
              <p className="text-2xl font-light font-serif text-canvas-text mt-1">
                <CountUp end={kpis.potential_related_groups || 0} />
              </p>
            </div>
            <GitFork className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </Link>

          <Link
            href="/allocation"
            className="rounded-xl border border-hairline bg-canvas-card p-4 flex items-center justify-between hover:bg-canvas-card-hover hover:border-hairline-strong transition-all group shadow-soft"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                Unassigned Complaints
              </p>
              <p className="text-2xl font-light font-serif text-amber-500 mt-1">
                <CountUp end={kpis.unassigned_complaints || 0} />
              </p>
            </div>
            <UserPlus className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </Link>

          <Link
            href="/complaints?stage_code=AWAITING_APPROVAL"
            className="rounded-xl border border-hairline bg-canvas-card p-4 flex items-center justify-between hover:bg-canvas-card-hover hover:border-hairline-strong transition-all group shadow-soft"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                Awaiting Bureau Approval
              </p>
              <p className="text-2xl font-light font-serif text-cyan-500 mt-1">
                <CountUp end={kpis.awaiting_approval || 0} />
              </p>
            </div>
            <Stamp className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
          </Link>

          <Link
            href="/coordination"
            className="rounded-xl border border-hairline bg-canvas-card p-4 flex items-center justify-between hover:bg-canvas-card-hover hover:border-hairline-strong transition-all group shadow-soft"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-canvas-muted">
                Inter-Bureau Requests
              </p>
              <p className="text-2xl font-light font-serif text-saffron mt-1">
                <CountUp end={kpis.cross_bureau_coordination_requests || 0} />
              </p>
            </div>
            <MessagesSquare className="w-4 h-4 text-saffron group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        {/* 8 INTERACTIVE CHARTS GRID */}
        <div key={tokens.resolvedTheme} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Complaints Received Over Time */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted">
                1. Complaints Inflow Telemetry (Time-Series)
              </span>
              <span className="text-[10px] font-mono text-canvas-faint">DAILY RATE</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.complaints_over_time || []}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={tokens.saffron} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={tokens.saffron} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chartGrid} />
                  <XAxis dataKey="name" stroke={tokens.muted} fontSize={11} tickLine={false} fontStretch="semi-condensed" />
                  <YAxis stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.chartTooltipBg,
                      borderRadius: "12px",
                      border: `1px solid ${tokens.chartTooltipBorder}`,
                      color: tokens.chartTooltipText,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: tokens.chartTooltipText }}
                    labelStyle={{ color: tokens.chartTooltipText }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={tokens.saffron}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTime)"
                    name="Complaints Received"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Complaints by Bureau */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted">
                2. Complaint Load by Bureau
              </span>
              <span className="text-[10px] font-mono text-canvas-faint">VOLUME</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.complaints_by_bureau || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chartGrid} />
                  <XAxis dataKey="name" stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <YAxis stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.chartTooltipBg,
                      borderRadius: "12px",
                      border: `1px solid ${tokens.chartTooltipBorder}`,
                      color: tokens.chartTooltipText,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: tokens.chartTooltipText }}
                    labelStyle={{ color: tokens.chartTooltipText }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Total Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Complaints by Current Workflow Status */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted">
                3. Complaints by Workflow Pipeline Stage
              </span>
              <span className="text-[10px] font-mono text-canvas-faint">STAGES</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.complaints_by_status || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={tokens.chartGrid} />
                  <XAxis type="number" stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={tokens.muted}
                    fontSize={10}
                    width={130}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.chartTooltipBg,
                      borderRadius: "12px",
                      border: `1px solid ${tokens.chartTooltipBorder}`,
                      color: tokens.chartTooltipText,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: tokens.chartTooltipText }}
                    labelStyle={{ color: tokens.chartTooltipText }}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Case Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Top Institutions by Complaint Volume */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted">
                4. Highest Volume Institutions
              </span>
              <span className="text-[10px] font-mono text-canvas-faint">CONCENTRATION</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.institution_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chartGrid} />
                  <XAxis
                    dataKey="name"
                    stroke={tokens.muted}
                    fontSize={9}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tickLine={false}
                    height={50}
                  />
                  <YAxis stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.chartTooltipBg,
                      borderRadius: "12px",
                      border: `1px solid ${tokens.chartTooltipBorder}`,
                      color: tokens.chartTooltipText,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: tokens.chartTooltipText }}
                    labelStyle={{ color: tokens.chartTooltipText }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Severity Distribution */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted">
                5. Case Severity Classification
              </span>
              <span className="text-[10px] font-mono text-canvas-faint">TIERS</span>
            </div>
            <div className="h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.severity_distribution || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(data?.severity_distribution || []).map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SEV_COLORS[entry.name] || tokens.chartColors[index % tokens.chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.chartTooltipBg,
                      borderRadius: "12px",
                      border: `1px solid ${tokens.chartTooltipBorder}`,
                      color: tokens.chartTooltipText,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: tokens.chartTooltipText }}
                    labelStyle={{ color: tokens.chartTooltipText }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", color: tokens.muted }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Monthly Resolution Trends */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted">
                6. Resolution Velocity Trends
              </span>
              <span className="text-[10px] font-mono text-canvas-faint">DISPOSAL</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthly_resolution_trends || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chartGrid} />
                  <XAxis dataKey="name" stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <YAxis stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.chartTooltipBg,
                      borderRadius: "12px",
                      border: `1px solid ${tokens.chartTooltipBorder}`,
                      color: tokens.chartTooltipText,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: tokens.chartTooltipText }}
                    labelStyle={{ color: tokens.chartTooltipText }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} name="Resolved Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 7: Overdue Cases by Bureau */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-500">
                7. Statutory SLA Overdue Breaches
              </span>
              <span className="text-[10px] font-mono text-rose-500">CRITICAL</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.overdue_by_bureau || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chartGrid} />
                  <XAxis dataKey="name" stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <YAxis stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.chartTooltipBg,
                      borderRadius: "12px",
                      border: `1px solid ${tokens.chartTooltipBorder}`,
                      color: tokens.chartTooltipText,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: tokens.chartTooltipText }}
                    labelStyle={{ color: tokens.chartTooltipText }}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} name="Overdue Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 8: Officer Workload Distribution */}
          <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-canvas-muted">
                8. Active Officer Workload Allocation
              </span>
              <span className="text-[10px] font-mono text-canvas-faint">EQUITY</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.workload_distribution || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={tokens.chartGrid} />
                  <XAxis type="number" stroke={tokens.muted} fontSize={11} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={tokens.muted}
                    fontSize={10}
                    width={130}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.chartTooltipBg,
                      borderRadius: "12px",
                      border: `1px solid ${tokens.chartTooltipBorder}`,
                      color: tokens.chartTooltipText,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: tokens.chartTooltipText }}
                    labelStyle={{ color: tokens.chartTooltipText }}
                  />
                  <Bar dataKey="value" fill="#14b8a6" radius={[0, 6, 6, 0]} name="Assigned Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
