"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Sliders,
  Cpu,
  Clock,
  Bell,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import CountUp from "@/components/motion/CountUp";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Parsed Form States
  const [aiWeights, setAiWeights] = useState({
    institution: 0.4,
    semantic: 0.35,
    category: 0.15,
    context: 0.1,
  });

  const [aiThresholds, setAiThresholds] = useState({
    high: 0.75,
    medium: 0.45,
  });

  const [slaRules, setSlaRules] = useState({
    level1_days: 3,
    level2_supervisor_days: 3,
    level3_bureau_head_days: 7,
  });

  const [bannerConfig, setBannerConfig] = useState({
    enabled: true,
    text: "PRISM Central Coordination Platform — Official Regulatory Operations Environment",
    type: "info",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data || []);

      data.forEach((s: any) => {
        if (s.setting_key === "ai_matching_weights" && s.setting_value) {
          setAiWeights(s.setting_value);
        } else if (s.setting_key === "ai_similarity_thresholds" && s.setting_value) {
          setAiThresholds(s.setting_value);
        } else if (s.setting_key === "sla_escalation_rules" && s.setting_value) {
          setSlaRules(s.setting_value);
        } else if (s.setting_key === "system_banner" && s.setting_value) {
          setBannerConfig(s.setting_value);
        }
      });
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, val: any) => {
    setSavingKey(key);
    setStatusMessage(null);
    try {
      await api.updateSetting(key, val);
      setStatusMessage({ type: "success", text: `Successfully updated ${key}. System rules are active.` });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || `Failed to update ${key}.` });
    } finally {
      setSavingKey(null);
    }
  };

  const totalWeight = (
    aiWeights.institution +
    aiWeights.semantic +
    aiWeights.category +
    aiWeights.context
  ).toFixed(2);

  return (
    <PageTransition>
      <div className="space-y-6 sm:space-y-8 max-w-full">
        {/* Page Header */}
        <PageHeader
          cueNumber="13"
          sectionLabel="PLATFORM PARAMETERS & POLICY RULES"
          title="System Settings"
          accentWord="Settings"
          description="Configure multi-factor AI correlation weights, statutory SLA breach escalation rules, and portal telemetry."
          actions={
            <button
              onClick={loadSettings}
              disabled={loading}
              className="inline-flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 border border-hairline bg-canvas-card rounded-lg text-xs font-mono text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-saffron" : ""}`} />
              <span className="hidden sm:inline">RELOAD RULES</span>
            </button>
          }
        />

        {/* Top 4-card Telemetry Metrics / Policy Status Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>ALGORITHM ENGINE</span>
              <Cpu className="w-4 h-4 text-saffron" />
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-canvas-text flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
              <span>4-FACTOR LINEAR</span>
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Multi-task formulation
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>HIGH CONFIDENCE</span>
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              <CountUp value={Math.round(aiThresholds.high * 100)} suffix="%" />
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Primary overlap threshold
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>SLA CADENCE</span>
              <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-canvas-text mt-1">
              {slaRules.level1_days}d / {slaRules.level2_supervisor_days}d / {slaRules.level3_bureau_head_days}d
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              3-tier statutory escalation
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>PORTAL BROADCAST</span>
              <Bell className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-sm sm:text-base font-bold font-mono flex items-center gap-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  bannerConfig.enabled ? "bg-cyan-500 animate-pulse" : "bg-neutral-400"
                }`}
              />
              <span className={bannerConfig.enabled ? "text-cyan-600 dark:text-cyan-400 font-semibold" : "text-canvas-muted"}>
                {bannerConfig.enabled ? "ACTIVE BROADCAST" : "STANDBY"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Regulatory notice strip
            </span>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-mono transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/25"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/25"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* SECTION 1: AI Overlap Matching Engine Weights */}
        <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-hairline bg-canvas-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-saffron/10 border border-saffron/20 text-saffron">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-saffron text-xs font-bold">CUE 13.1</span>
                  <span className="text-canvas-muted">·</span>
                  <h3 className="text-canvas-text text-xs font-medium uppercase tracking-wider">
                    AI Overlap Matching Engine Weights
                  </h3>
                </div>
                <p className="text-[11px] text-canvas-muted font-sans font-normal mt-0.5">
                  Multi-factor linear formulation normalizing institutional grievance correlation.
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold border self-start sm:self-auto ${
                totalWeight === "1.00"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300"
              }`}
            >
              FORMULATION SUM: {totalWeight} / 1.00
            </span>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="space-y-2 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <div className="flex justify-between items-center">
                  <label className="text-canvas-muted uppercase text-[11px]">
                    Institution ID & Name Matching
                  </label>
                  <span className="text-canvas-text font-bold px-2 py-0.5 rounded bg-canvas border border-hairline">
                    {(aiWeights.institution * 100).toFixed(0)}% ({aiWeights.institution})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={aiWeights.institution}
                  onChange={(e) =>
                    setAiWeights({ ...aiWeights, institution: parseFloat(e.target.value) })
                  }
                  className="w-full accent-saffron cursor-pointer"
                />
                <span className="text-[10px] text-canvas-faint block">
                  Matches AICTE Permanent IDs, tokenized legal names, and alias records.
                </span>
              </div>

              <div className="space-y-2 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <div className="flex justify-between items-center">
                  <label className="text-canvas-muted uppercase text-[11px]">
                    Semantic Similarity (Embedding Cosine)
                  </label>
                  <span className="text-canvas-text font-bold px-2 py-0.5 rounded bg-canvas border border-hairline">
                    {(aiWeights.semantic * 100).toFixed(0)}% ({aiWeights.semantic})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={aiWeights.semantic}
                  onChange={(e) =>
                    setAiWeights({ ...aiWeights, semantic: parseFloat(e.target.value) })
                  }
                  className="w-full accent-saffron cursor-pointer"
                />
                <span className="text-[10px] text-canvas-faint block">
                  Correlates allegation narratives, courses, fees, and grievance patterns.
                </span>
              </div>

              <div className="space-y-2 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <div className="flex justify-between items-center">
                  <label className="text-canvas-muted uppercase text-[11px]">
                    Regulatory Category Alignment
                  </label>
                  <span className="text-canvas-text font-bold px-2 py-0.5 rounded bg-canvas border border-hairline">
                    {(aiWeights.category * 100).toFixed(0)}% ({aiWeights.category})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={aiWeights.category}
                  onChange={(e) =>
                    setAiWeights({ ...aiWeights, category: parseFloat(e.target.value) })
                  }
                  className="w-full accent-saffron cursor-pointer"
                />
                <span className="text-[10px] text-canvas-faint block">
                  Weights complaints sharing identical regulatory categories.
                </span>
              </div>

              <div className="space-y-2 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <div className="flex justify-between items-center">
                  <label className="text-canvas-muted uppercase text-[11px]">
                    Temporal & Jurisdiction Proximity
                  </label>
                  <span className="text-canvas-text font-bold px-2 py-0.5 rounded bg-canvas border border-hairline">
                    {(aiWeights.context * 100).toFixed(0)}% ({aiWeights.context})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={aiWeights.context}
                  onChange={(e) =>
                    setAiWeights({ ...aiWeights, context: parseFloat(e.target.value) })
                  }
                  className="w-full accent-saffron cursor-pointer"
                />
                <span className="text-[10px] text-canvas-faint block">
                  Rewards filings submitted in close chronological proximity.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline flex justify-end">
              <button
                onClick={() => handleSaveSetting("ai_matching_weights", aiWeights)}
                disabled={savingKey === "ai_matching_weights" || totalWeight !== "1.00"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-canvas-text text-canvas text-xs font-mono font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 shadow-soft"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingKey === "ai_matching_weights" ? "COMMITTING..." : "SAVE FORMULATION WEIGHTS"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Confidence Threshold Classification */}
        <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-hairline bg-canvas-surface/50 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">CUE 13.2</span>
                  <span className="text-canvas-muted">·</span>
                  <h3 className="text-canvas-text text-xs font-medium uppercase tracking-wider">
                    Confidence Tier Classification Thresholds
                  </h3>
                </div>
                <p className="text-[11px] text-canvas-muted font-sans font-normal mt-0.5">
                  Cutoffs categorizing algorithm matches into High, Medium, and Low tiers.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="space-y-2 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <div className="flex justify-between items-center">
                  <label className="text-canvas-muted uppercase text-[11px]">
                    High Confidence Threshold (≥)
                  </label>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {(aiThresholds.high * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={aiThresholds.high}
                  onChange={(e) =>
                    setAiThresholds({ ...aiThresholds, high: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-canvas-faint block">
                  Scores equal to or above this index trigger primary inter-bureau alerts.
                </span>
              </div>

              <div className="space-y-2 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <div className="flex justify-between items-center">
                  <label className="text-canvas-muted uppercase text-[11px]">
                    Medium Confidence Threshold (≥)
                  </label>
                  <span className="text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {(aiThresholds.medium * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.6"
                  step="0.05"
                  value={aiThresholds.medium}
                  onChange={(e) =>
                    setAiThresholds({ ...aiThresholds, medium: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-canvas-faint block">
                  Scores between Medium and High cutoffs are flagged for secondary review.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline flex justify-end">
              <button
                onClick={() => handleSaveSetting("ai_similarity_thresholds", aiThresholds)}
                disabled={savingKey === "ai_similarity_thresholds"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-canvas-text text-canvas text-xs font-mono font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 shadow-soft"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingKey === "ai_similarity_thresholds" ? "COMMITTING..." : "SAVE THRESHOLDS"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: SLA Escalation Cadence */}
        <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-hairline bg-canvas-surface/50 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-600 dark:text-rose-400 text-xs font-bold">CUE 13.3</span>
                  <span className="text-canvas-muted">·</span>
                  <h3 className="text-canvas-text text-xs font-medium uppercase tracking-wider">
                    SLA Escalation Timeline Cadence
                  </h3>
                </div>
                <p className="text-[11px] text-canvas-muted font-sans font-normal mt-0.5">
                  Automated statutory warning intervals when cases breach standard SLA targets.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="space-y-1.5 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <label className="text-canvas-muted uppercase text-[10px] block font-medium">
                  Level 1 Reminder (Days Before Due)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={slaRules.level1_days}
                  onChange={(e) =>
                    setSlaRules({ ...slaRules, level1_days: parseInt(e.target.value) || 1 })
                  }
                  className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                />
                <span className="text-[10px] text-canvas-faint block">Dispatches alert to assigned case officer.</span>
              </div>

              <div className="space-y-1.5 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <label className="text-canvas-muted uppercase text-[10px] block font-medium">
                  Level 2 Escalation (Days Overdue)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={slaRules.level2_supervisor_days}
                  onChange={(e) =>
                    setSlaRules({
                      ...slaRules,
                      level2_supervisor_days: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                />
                <span className="text-[10px] text-canvas-faint block">Escalates breach notice to Section Supervisor.</span>
              </div>

              <div className="space-y-1.5 bg-canvas-surface p-4 rounded-xl border border-hairline">
                <label className="text-canvas-muted uppercase text-[10px] block font-medium">
                  Level 3 Escalation (Days Overdue)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={slaRules.level3_bureau_head_days}
                  onChange={(e) =>
                    setSlaRules({
                      ...slaRules,
                      level3_bureau_head_days: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                />
                <span className="text-[10px] text-canvas-faint block">Dispatches formal escalation to Bureau Head.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline flex justify-end">
              <button
                onClick={() => handleSaveSetting("sla_escalation_rules", slaRules)}
                disabled={savingKey === "sla_escalation_rules"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-canvas-text text-canvas text-xs font-mono font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 shadow-soft"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingKey === "sla_escalation_rules" ? "COMMITTING..." : "SAVE SLA CADENCE"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: Portal Banner */}
        <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-hairline bg-canvas-surface/50 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold">CUE 13.4</span>
                  <span className="text-canvas-muted">·</span>
                  <h3 className="text-canvas-text text-xs font-medium uppercase tracking-wider">
                    Platform Broadcast Banner
                  </h3>
                </div>
                <p className="text-[11px] text-canvas-muted font-sans font-normal mt-0.5">
                  Display high-visibility statutory announcements across portal nodes.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-5 font-mono text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerConfig.enabled}
                  onChange={(e) =>
                    setBannerConfig({ ...bannerConfig, enabled: e.target.checked })
                  }
                  className="rounded border-hairline bg-canvas text-saffron w-4 h-4 focus:ring-saffron"
                />
                <span className="text-canvas-text">ENABLE PORTAL BROADCAST BANNER</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-canvas-muted uppercase text-[10px] block">Banner Announcement Text</label>
              <input
                type="text"
                value={bannerConfig.text}
                onChange={(e) =>
                  setBannerConfig({ ...bannerConfig, text: e.target.value })
                }
                className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
              />
            </div>

            <div className="pt-4 border-t border-hairline flex justify-end">
              <button
                onClick={() => handleSaveSetting("system_banner", bannerConfig)}
                disabled={savingKey === "system_banner"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-canvas-text text-canvas text-xs font-mono font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 shadow-soft"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingKey === "system_banner" ? "COMMITTING..." : "SAVE BANNER SETTINGS"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
