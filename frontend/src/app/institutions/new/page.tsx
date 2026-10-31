"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Save, Building2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";

export default function NewInstitutionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    aicte_id: "",
    name: "",
    institution_type: "Technical Institute",
    address: "",
    state: "Delhi",
    district: "New Delhi",
    city: "New Delhi",
    pincode: "110001",
    affiliated_university: "State Technological University",
    approval_status: "Approved",
    approval_details: "Council Extension of Approval (EoA) sanctioned.",
    contact_email: "",
    contact_phone: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any[]>([]);

  const handleDuplicateCheck = async () => {
    if (!formData.aicte_id && !formData.name) return;
    try {
      const res = await api.checkInstitutionDuplicate(
        formData.aicte_id,
        formData.name,
        formData.state
      );
      if (res.has_duplicate) {
        setDuplicateWarning(res.matches);
      } else {
        setDuplicateWarning([]);
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const inst = await api.createInstitution(formData);
      router.push(`/institutions/${inst.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to register institution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          cueNumber="02"
          sectionLabel="INSTITUTION ONBOARDING"
          title="Register New Institution"
          accentWord="Institution"
          description="Provision a verified educational institution profile into PRISM's centralized statutory registry."
          actions={
            <Link
              href="/institutions"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-hairline bg-canvas-card text-xs font-mono text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-colors shadow-soft"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO REGISTRY</span>
            </Link>
          }
        />

        {error && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 dark:text-rose-300 text-xs font-mono flex items-start gap-2.5 shadow-soft">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">REGISTRATION FAILED</p>
              <p className="text-rose-500/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {duplicateWarning.length > 0 && (
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300 text-xs font-mono space-y-2 shadow-soft">
            <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>POTENTIAL DUPLICATE RECORDS DETECTED IN CENTRAL REGISTRY</span>
            </div>
            <div className="space-y-1 pl-6">
              {duplicateWarning.map((m, idx) => (
                <p key={idx} className="text-amber-600 dark:text-amber-300/80">
                  • <span className="text-canvas-text font-medium">{m.name}</span> ({m.aicte_id}) — {m.reason}
                </p>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-hairline bg-canvas-card p-6 sm:p-8 space-y-8 shadow-soft">
          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                01. STATUTORY IDENTIFIERS & CATEGORY
              </span>
              <span className="text-[10px] font-mono text-saffron uppercase">REQUIRED SECTION</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  AICTE Permanent Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={formData.aicte_id}
                  onBlur={handleDuplicateCheck}
                  onChange={(e) => setFormData({ ...formData, aicte_id: e.target.value })}
                  placeholder="e.g. 1-1009845321"
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
                <span className="text-[10px] font-mono text-canvas-faint mt-1 block">Unique statutory portal key</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Institution Type *
                </label>
                <select
                  value={formData.institution_type}
                  onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                >
                  <option value="Technical Institute">Technical Institute</option>
                  <option value="Engineering College">Engineering College</option>
                  <option value="Management Institute">Management Institute</option>
                  <option value="Polytechnic College">Polytechnic College</option>
                  <option value="Pharmacy College">Pharmacy College</option>
                </select>
                <span className="text-[10px] font-mono text-canvas-faint mt-1 block">Programmatic classification</span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Full Registered Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onBlur={handleDuplicateCheck}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Delhi Institute of Technology & Advanced Research"
                  className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                02. LOCATION & JURISDICTION
              </span>
              <span className="text-[10px] font-mono text-canvas-muted uppercase">TERRITORIAL ALIGNMENT</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                >
                  {["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Telangana", "Gujarat", "Rajasthan", "Kerala"].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">City / District *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value, district: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">Campus Physical Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Plot/Sector number, Institutional Area, Road name"
                  className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <span className="text-[11px] font-mono tracking-widest text-canvas-muted uppercase">
                03. REGULATORY STATUS & COMMUNICATIONS
              </span>
              <span className="text-[10px] font-mono text-canvas-muted uppercase">OFFICIAL CHANNELS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Approval Status *
                </label>
                <select
                  value={formData.approval_status}
                  onChange={(e) => setFormData({ ...formData, approval_status: e.target.value })}
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-surface px-3.5 py-2.5 text-canvas-text focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                >
                  <option value="Approved">Approved</option>
                  <option value="Under Scrutiny">Under Scrutiny</option>
                  <option value="Deficient">Deficient</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Affiliated University
                </label>
                <input
                  type="text"
                  value={formData.affiliated_university}
                  onChange={(e) => setFormData({ ...formData, affiliated_university: e.target.value })}
                  className="w-full text-xs rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Registrar / Principal Official Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="registrar@institute.edu.in"
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase mb-1.5">
                  Official Phone Contact
                </label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+91-XXXXXXXXXX"
                  className="w-full text-xs font-mono rounded-lg border border-hairline bg-canvas-card-subtle px-3.5 py-2.5 text-canvas-text placeholder:text-canvas-faint focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-saffron/40"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-hairline">
            <Link
              href="/institutions"
              className="px-4 py-2 rounded-lg border border-hairline bg-canvas-card-subtle text-xs font-mono text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-colors"
            >
              CANCEL
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-colors disabled:opacity-50 shadow-soft"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? "ENROLLING RECORD..." : "COMMIT TO REGISTRY"}</span>
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
