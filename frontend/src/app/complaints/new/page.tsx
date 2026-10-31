"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowLeft, Building2, Shield, User, Save, Lock, Sparkles, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";

export default function NewComplaintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedInstId = searchParams?.get("institution_id") || "";

  const [institutions, setInstitutions] = useState<any[]>([]);
  const [bureaus, setBureaus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    institution_id: preselectedInstId,
    subject: "",
    description: "",
    receiving_bureau_id: "",
    category_id: "",
    subcategory: "",
    severity: "MEDIUM",
    priority: "MEDIUM",
    is_anonymous: false,
    complainant_name: "",
    complainant_email: "",
    complainant_phone: "",
    reference_number: "",
    assigned_officer_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getInstitutions({ limit: 100 }),
      api.getBureaus(),
      api.getCategories(),
      api.getUsers(),
    ])
      .then(([instRes, bRes, catRes, userRes]) => {
        setInstitutions(instRes.items);
        setBureaus(bRes);
        setCategories(catRes);
        setOfficers(userRes.filter((u: any) => u.role_name === "CASE_OFFICER" || u.role_name === "BUREAU_HEAD"));
        
        if (bRes.length > 0 && !formData.receiving_bureau_id) {
          setFormData((prev) => ({ ...prev, receiving_bureau_id: bRes[0].id }));
        }
        if (catRes.length > 0 && !formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: catRes[0].id }));
        }
      })
      .catch((err) => console.error("Failed loading dropdowns", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institution_id) {
      setError("Please select an institution from the registry.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res: any = await api.createComplaint(formData);
      router.push(`/complaints/${res.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to register complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          cueNumber="03"
          sectionLabel="GRIEVANCE INTAKE"
          title="Lodge Institutional Grievance"
          accentWord="Grievance"
          description="Register formal complaint record into PRISM with automated Case ID generation and AI overlap correlation."
          actions={
            <Link
              href="/complaints"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-hairline bg-canvas-card text-xs font-mono text-canvas-muted hover:text-canvas-text transition-colors shadow-soft"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO REPOSITORY</span>
            </Link>
          }
        />

        {error && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 dark:text-rose-300 text-xs font-mono flex items-start gap-2.5 shadow-soft">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">REGISTRATION REJECTED</p>
              <p className="text-rose-500/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-hairline bg-canvas-card p-6 sm:p-8 space-y-8 shadow-soft">
          {/* Section 1: Target Institution */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                01. TARGET INSTITUTION ENROLLMENT
              </span>
              <span className="text-[10px] font-mono text-saffron uppercase">REQUIRED FIELD</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                Select Institution from Central Registry *
              </label>
              <select
                required
                value={formData.institution_id}
                onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
              >
                <option value="">-- CHOOSE TARGET INSTITUTION --</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.aicte_id}) — {i.city}, {i.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Narrative & Allegations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                02. GRIEVANCE NARRATIVE & STATUTORY DETAILS
              </span>
              <span className="text-[10px] font-mono text-canvas-muted uppercase">AI-INDEXED TEXT</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Complaint Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Concise, specific summary of the statutory violation or grievance..."
                  className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Detailed Complaint Narrative & Evidentiary Synopsis *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail dates, faculty names, capitation demands, course names, or unapproved infrastructure. This description will be converted into high-dimensional semantic embeddings by the PRISM AI engine for cross-bureau overlap detection..."
                  className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle p-3.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                    Primary Statutory Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none focus:border-hairline-strong"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.default_sla_days}D SLA)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                    Specific Subcategory / Matter Tag
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. Unapproved Intake, Excess Capitation, Ghost Faculty"
                    className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Bureau Routing & Severity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                03. BUREAU ROUTING & ALLOCATION
              </span>
              <span className="text-[10px] font-mono text-canvas-muted uppercase">TRIAGE METRICS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Receiving Bureau *
                </label>
                <select
                  required
                  value={formData.receiving_bureau_id}
                  onChange={(e) => setFormData({ ...formData, receiving_bureau_id: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none"
                >
                  {bureaus.map((b) => (
                    <option key={b.id} value={b.id}>{b.code} — {b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Severity Level *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none font-semibold"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Priority Tier *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none font-semibold"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Case Officer (Optional)
                </label>
                <select
                  value={formData.assigned_officer_id}
                  onChange={(e) => setFormData({ ...formData, assigned_officer_id: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none"
                >
                  <option value="">-- UNASSIGNED --</option>
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.full_name} ({off.bureau_code || "Officer"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Complainant Privacy & Whistleblower Protection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                04. COMPLAINANT PRIVACY & SAFEGUARDS
              </span>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  className="rounded border-hairline bg-canvas-card text-saffron focus:ring-saffron/40 h-4 w-4"
                />
                <span className="text-xs font-mono text-canvas-text flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-saffron" />
                  WHISTLEBLOWER CONFIDENTIALITY
                </span>
              </label>
            </div>

            {!formData.is_anonymous ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.complainant_name}
                    onChange={(e) => setFormData({ ...formData, complainant_name: e.target.value })}
                    placeholder="Complainant legal name"
                    className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    value={formData.complainant_email}
                    onChange={(e) => setFormData({ ...formData, complainant_email: e.target.value })}
                    placeholder="complainant@domain.in"
                    className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.complainant_phone}
                    onChange={(e) => setFormData({ ...formData, complainant_phone: e.target.value })}
                    placeholder="+91-XXXXXXXXXX"
                    className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-hairline bg-canvas-card-subtle text-xs font-mono text-canvas-muted space-y-1">
                <p className="text-canvas-text font-medium flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-saffron" />
                  WHISTLEBLOWER PROTOCOL ACTIVE
                </p>
                <p>Complainant identity will be cryptographically redacted from public views and general dashboards.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-hairline">
            <Link
              href="/complaints"
              className="px-4 py-2 rounded-lg border border-hairline bg-canvas-card-subtle text-xs font-mono text-canvas-muted hover:text-canvas-text transition-colors"
            >
              CANCEL
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-colors disabled:opacity-50 shadow-soft"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? "INITIALIZING CASE FILE..." : "SUBMIT & TRIGGER AI ANALYSIS"}</span>
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
