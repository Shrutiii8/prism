"use client";

import React, { useEffect, useState } from "react";
import {
  GitPullRequest,
  CheckCircle,
  Clock,
  Shield,
  ArrowRight,
  Layers,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";

export default function WorkflowConfigurationPage() {
  const [stages, setStages] = useState<any[]>([]);
  const [transitions, setTransitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStages(), api.getTransitions()])
      .then(([sRes, tRes]) => {
        setStages(sRes);
        setTransitions(tRes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          cueNumber="08"
          sectionLabel="STATUTORY STATE MACHINE"
          title="Workflow Engine Configuration"
          accentWord="Engine"
          description="Statutory stage definitions, default SLA benchmarks, and role-authorized status transition state machine matrix."
        />

        {loading ? (
          <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs">
            <div className="inline-block w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin mr-2" />
            LOADING WORKFLOW SPECIFICATIONS...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Visual Sequential Stages Pipeline */}
            <div className="rounded-2xl border border-hairline bg-canvas-card p-6 sm:p-8 space-y-6 shadow-soft">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                  10-STAGE GRIEVANCE RESOLUTION LIFECYCLE
                </span>
                <span className="text-[10px] font-mono text-canvas-faint uppercase">DETERMINISTIC PIPELINE</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="p-4 rounded-xl border border-hairline bg-canvas-surface hover:bg-canvas-card/80 transition-colors space-y-2 relative shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-canvas border border-hairline text-canvas-text font-mono font-bold flex items-center justify-center text-[10px]">
                        {stage.stage_order}
                      </span>
                      {stage.requires_approval && (
                        <span className="text-[9px] font-mono text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.2 rounded">
                          APPROVAL REQ
                        </span>
                      )}
                      {stage.is_initial && (
                        <span className="text-[9px] font-mono text-canvas-text bg-canvas border border-hairline px-1.5 py-0.2 rounded">
                          INTAKE
                        </span>
                      )}
                      {stage.is_final && (
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          FINAL
                        </span>
                      )}
                    </div>

                    <h3 className="font-medium text-xs text-canvas-text pt-1">{stage.name}</h3>
                    <div className="text-[10px] text-canvas-muted font-mono">ID: {stage.code}</div>
                    <div className="text-[10px] text-canvas-muted font-mono flex items-center gap-1.5 pt-2 border-t border-hairline">
                      <Clock className="w-3 h-3 text-canvas-faint" />
                      <span>SLA: <strong className="text-canvas-text">{stage.sla_days} DAYS</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permitted Transition Matrix Table */}
            <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
              <div className="p-5 border-b border-hairline flex items-center justify-between font-mono text-xs">
                <span className="text-[11px] uppercase tracking-wider text-canvas-muted">
                  PERMITTED STATE TRANSITION RULES ({transitions.length})
                </span>
                <span className="text-[10px] text-canvas-faint uppercase">ENFORCED AT DATABASE BOUNDARY</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono min-w-[700px]">
                  <thead>
                    <tr className="border-b border-hairline bg-canvas-surface text-[10px] text-canvas-muted uppercase tracking-wider">
                      <th className="py-3 px-4">SOURCE STAGE</th>
                      <th className="py-3 px-1"></th>
                      <th className="py-3 px-4">DESTINATION STAGE</th>
                      <th className="py-3 px-4">AUTHORIZED ROLES</th>
                      <th className="py-3 px-4">TRANSITION RATIONALE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {transitions.map((t) => (
                      <tr key={t.id} className="hover:bg-canvas-surface/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-canvas-text">{t.from_stage_name}</td>
                        <td className="py-3 px-1 text-saffron text-center">→</td>
                        <td className="py-3 px-4 font-semibold text-canvas-text">{t.to_stage_name}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(t.allowed_roles || []).map((r: string) => (
                              <span key={r} className="px-2 py-0.5 rounded-full text-[10px] bg-canvas-surface border border-hairline text-canvas-text">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-sans text-xs text-canvas-muted">{t.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
