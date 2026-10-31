"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowRight,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import ScrambleId from "@/components/motion/ScrambleId";
import StatusBadge from "@/components/motion/StatusBadge";

export default function InstitutionsDirectoryPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 15;

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await api.getInstitutions({
        search,
        state: stateFilter || undefined,
        institution_type: typeFilter || undefined,
        approval_status: statusFilter || undefined,
        skip: page * limit,
        limit,
      });
      setInstitutions(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [search, stateFilter, typeFilter, statusFilter, page]);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const token = localStorage.getItem("prism_token");
      const formData = new FormData();
      formData.append("file", importFile);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiBase}/institutions/import/csv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setImportResult(data);
      fetchInstitutions();
    } catch (err: any) {
      setImportResult({ status: "error", message: err.message });
    } finally {
      setImporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          cue="CUE 02 — PERMANENT INSTITUTION MASTER"
          title="Centralized Institution Registry"
          accentWord="Registry"
          description="Official centralized repository of approved educational institutions, regulatory status & permanent identifiers."
          actions={
            <div className="flex items-center gap-3">
              <a
                href={api.getInstitutionsExportUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-xl border border-hairline bg-canvas-card text-xs font-mono text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-all shadow-soft"
              >
                <Download className="w-3.5 h-3.5 mr-2 text-saffron" />
                Export CSV
              </a>

              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-4 py-2 rounded-xl border border-hairline bg-canvas-card text-xs font-mono text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-all shadow-soft"
              >
                <Upload className="w-3.5 h-3.5 mr-2 text-cyan-500" />
                Import CSV
              </button>

              <Link
                href="/institutions/new"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-canvas-text text-canvas text-xs font-medium hover:opacity-90 transition-all shadow-soft group"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span>Register Institution</span>
              </Link>
            </div>
          }
        />

        {/* Filter and Search Bar */}
        <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md p-4 flex flex-wrap items-center justify-between gap-3 shadow-soft">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-canvas-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by Institution Name, AICTE Permanent ID, City, or University..."
              className="w-full pl-10 pr-4 py-2 text-xs font-sans rounded-xl border border-hairline bg-canvas-card-subtle text-canvas-text placeholder:text-canvas-faint focus:outline-hidden focus:border-saffron/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* State Filter */}
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-mono rounded-xl border border-hairline bg-canvas-card text-canvas-text px-3 py-2 focus:outline-hidden cursor-pointer"
            >
              <option value="" className="bg-canvas-surface text-canvas-text">All States</option>
              {[
                "Delhi",
                "Maharashtra",
                "Karnataka",
                "Tamil Nadu",
                "Uttar Pradesh",
                "West Bengal",
                "Telangana",
                "Gujarat",
                "Rajasthan",
                "Kerala",
              ].map((st) => (
                <option key={st} value={st} className="bg-canvas-surface text-canvas-text">
                  {st}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-mono rounded-xl border border-hairline bg-canvas-card text-canvas-text px-3 py-2 focus:outline-hidden cursor-pointer"
            >
              <option value="" className="bg-canvas-surface text-canvas-text">All Types</option>
              <option value="Technical Institute" className="bg-canvas-surface text-canvas-text">Technical Institute</option>
              <option value="Engineering College" className="bg-canvas-surface text-canvas-text">Engineering College</option>
              <option value="Management Institute" className="bg-canvas-surface text-canvas-text">Management Institute</option>
              <option value="Polytechnic College" className="bg-canvas-surface text-canvas-text">Polytechnic College</option>
              <option value="Pharmacy College" className="bg-canvas-surface text-canvas-text">Pharmacy College</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-mono rounded-xl border border-hairline bg-canvas-card text-canvas-text px-3 py-2 focus:outline-hidden cursor-pointer"
            >
              <option value="" className="bg-canvas-surface text-canvas-text">All Statuses</option>
              <option value="Approved" className="bg-canvas-surface text-canvas-text">Approved</option>
              <option value="Under Scrutiny" className="bg-canvas-surface text-canvas-text">Under Scrutiny</option>
              <option value="Deficient" className="bg-canvas-surface text-canvas-text">Deficient</option>
              <option value="Suspended" className="bg-canvas-surface text-canvas-text">Suspended</option>
            </select>
          </div>
        </div>

        {/* Institution Data Table */}
        <div className="rounded-2xl border border-hairline bg-canvas-card backdrop-blur-md overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-canvas-card-subtle border-b border-hairline text-[10px] font-mono font-medium text-canvas-muted uppercase tracking-wider">
                  <th className="py-3.5 px-5">Permanent AICTE ID</th>
                  <th className="py-3.5 px-5">Institution Profile</th>
                  <th className="py-3.5 px-5">Discipline Type</th>
                  <th className="py-3.5 px-5">Jurisdiction</th>
                  <th className="py-3.5 px-5">Affiliated Body</th>
                  <th className="py-3.5 px-5">Regulatory Status</th>
                  <th className="py-3.5 px-5 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-canvas-muted">
                      <div className="inline-block w-6 h-6 border-2 border-saffron border-t-transparent rounded-full animate-spin mr-3 align-middle" />
                      <span className="font-mono text-xs tracking-wider">FETCHING INSTITUTION DOSSIERS...</span>
                    </td>
                  </tr>
                ) : institutions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-canvas-muted font-mono">
                      No registered institutions match the specified criteria.
                    </td>
                  </tr>
                ) : (
                  institutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-canvas-card-hover transition-colors group">
                      <td className="py-4 px-5">
                        <ScrambleId id={inst.aicte_id} className="text-cyan-500 font-semibold" />
                      </td>
                      <td className="py-4 px-5">
                        <Link
                          href={`/institutions/${inst.id}`}
                          className="font-medium text-canvas-text group-hover:text-saffron transition-colors block text-sm"
                        >
                          {inst.name}
                        </Link>
                        <p className="text-[10px] font-mono text-canvas-faint truncate max-w-xs mt-0.5">
                          {inst.address}
                        </p>
                      </td>
                      <td className="py-4 px-5 text-canvas-muted">{inst.institution_type}</td>
                      <td className="py-4 px-5 text-canvas-muted">
                        <div className="text-canvas-text">{inst.city}, {inst.state}</div>
                        <span className="text-[10px] font-mono text-canvas-faint">PIN: {inst.pincode}</span>
                      </td>
                      <td className="py-4 px-5 text-canvas-muted truncate max-w-[180px]">
                        {inst.affiliated_university || "Autonomous / Direct"}
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={inst.approval_status} />
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/institutions/${inst.id}`}
                          className="inline-flex items-center text-xs font-mono text-saffron hover:underline transition-colors gap-1"
                        >
                          <span>360° Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="bg-canvas-card-subtle px-5 py-4 border-t border-hairline flex items-center justify-between text-xs font-mono text-canvas-muted">
            <div>
              Showing <span className="text-canvas-text font-medium">{total > 0 ? page * limit + 1 : 0}</span> to{" "}
              <span className="text-canvas-text font-medium">{Math.min((page + 1) * limit, total)}</span> of{" "}
              <span className="text-canvas-text font-medium">{total}</span> institutions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-hairline bg-canvas-card text-canvas-muted hover:text-canvas-text hover:border-hairline-strong disabled:opacity-30 disabled:pointer-events-none transition-all shadow-soft"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg border border-hairline bg-canvas-card text-canvas-text">
                Page {page + 1} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-hairline bg-canvas-card text-canvas-muted hover:text-canvas-text hover:border-hairline-strong disabled:opacity-30 disabled:pointer-events-none transition-all shadow-soft"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl border border-hairline-strong bg-canvas-surface shadow-2xl max-w-md w-full p-6 text-canvas-text">
              <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
                <span className="text-xs font-mono text-saffron uppercase tracking-widest font-semibold">
                  Bulk Ingestion // CSV Upload
                </span>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1 rounded text-canvas-muted hover:text-canvas-text transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <p className="text-xs text-canvas-muted leading-relaxed">
                  Upload official institution CSV file containing columns: <code className="text-canvas-text font-mono bg-canvas-card px-1 rounded border border-hairline">AICTE Permanent ID</code>, <code className="text-canvas-text font-mono bg-canvas-card px-1 rounded border border-hairline">Institution Name</code>, <code className="text-canvas-text font-mono bg-canvas-card px-1 rounded border border-hairline">State</code>, <code className="text-canvas-text font-mono bg-canvas-card px-1 rounded border border-hairline">City</code>, <code className="text-canvas-text font-mono bg-canvas-card px-1 rounded border border-hairline">Type</code>.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-canvas-muted font-mono file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-hairline file:text-xs file:font-mono file:bg-canvas-card file:text-canvas-text hover:file:bg-canvas-card-hover file:cursor-pointer"
                />
                {importResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-mono ${
                      importResult.status === "success"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    <p className="font-semibold">
                      Import Result: {importResult.imported_count || 0} imported, {importResult.skipped_count || 0} skipped.
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-3 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 border border-hairline text-xs font-mono rounded-xl text-canvas-muted hover:text-canvas-text hover:bg-canvas-card-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importing || !importFile}
                    className="px-5 py-2 bg-canvas-text text-canvas text-xs font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {importing ? "Processing..." : "Import File"}
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
