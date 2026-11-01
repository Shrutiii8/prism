"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Briefcase,
  Shield,
  Building,
  MapPin,
  Edit2,
  X,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";
import StatusBadge from "@/components/motion/StatusBadge";
import CountUp from "@/components/motion/CountUp";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [bureaus, setBureaus] = useState<any[]>([]);
  const [regionalOffices, setRegionalOffices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [bureauFilter, setBureauFilter] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
    bureau_id: "",
    regional_office_id: "",
    is_active: true,
  });

  useEffect(() => {
    loadMetadata();
    loadUsers();
  }, [roleFilter, bureauFilter]);

  const loadMetadata = async () => {
    try {
      const [r, b, ro] = await Promise.all([
        api.getRoles(),
        api.getBureaus(),
        api.getRegionalOffices(),
      ]);
      setRoles(r || []);
      setBureaus(b || []);
      setRegionalOffices(ro || []);
    } catch (err) {
      console.error("Failed to load metadata", err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(bureauFilter || undefined, roleFilter || undefined);
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      full_name: "",
      email: "",
      password: "",
      phone: "",
      role_id: roles[0]?.id || "",
      bureau_id: "",
      regional_office_id: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: any) => {
    setEditingUser(u);
    setFormData({
      full_name: u.full_name || "",
      email: u.email || "",
      password: "",
      phone: u.phone || "",
      role_id: u.role_id || "",
      bureau_id: u.bureau_id || "",
      regional_office_id: u.regional_office_id || "",
      is_active: u.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await api.updateUser(user.id, { is_active: !user.is_active });
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        const updatePayload: any = {
          full_name: formData.full_name,
          phone: formData.phone || null,
          role_id: formData.role_id || null,
          bureau_id: formData.bureau_id || null,
          regional_office_id: formData.regional_office_id || null,
          is_active: formData.is_active,
        };
        await api.updateUser(editingUser.id, updatePayload);
      } else {
        if (!formData.password) {
          alert("Password is required for new accounts.");
          setSubmitting(false);
          return;
        }
        await api.createUser({
          ...formData,
          bureau_id: formData.bureau_id || null,
          regional_office_id: formData.regional_office_id || null,
        });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role_name?.toLowerCase().includes(term) ||
      u.role_display?.toLowerCase().includes(term)
    );
  });

  // Calculate telemetry metrics
  const activeCount = users.filter((u) => u.is_active).length;
  const totalCaseload = users.reduce((acc, u) => acc + (u.active_cases_count || 0), 0);
  const avgCaseload = activeCount > 0 ? (totalCaseload / activeCount).toFixed(1) : "0.0";
  const rolesCount = roles.length || 5;

  return (
    <PageTransition>
      <div className="space-y-6 sm:space-y-8 max-w-full">
        {/* Page Header */}
        <PageHeader
          cueNumber="12"
          sectionLabel="IDENTITY & ACCESS GOVERNANCE"
          title="Personnel Directory"
          accentWord="Directory"
          description="Role-based access governance, bureau postings, active caseload thresholds, and statutory credential provisioning."
          actions={
            <div className="flex items-center gap-2.5">
              <button
                onClick={loadUsers}
                className="inline-flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 border border-hairline bg-canvas-card rounded-lg hover:bg-canvas-card/80 text-canvas-muted hover:text-canvas-text transition-colors shadow-xs"
                title="Refresh Directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-saffron" : ""}`} />
                <span className="hidden sm:inline text-xs font-mono">REFRESH</span>
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-canvas-text text-canvas text-xs font-mono font-medium rounded-lg hover:opacity-90 transition-all shadow-soft"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>PROVISION PERSONNEL</span>
              </button>
            </div>
          }
        />

        {/* Top 4-card Telemetry Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>TOTAL PERSONNEL</span>
              <Users className="w-4 h-4 text-saffron" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-canvas-text">
              <CountUp value={users.length} />
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Registered platform actors
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>ACTIVE OFFICERS</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CountUp value={activeCount} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Authorized login status
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>SYSTEM CASELOAD</span>
              <Briefcase className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-canvas-text">
              <CountUp value={totalCaseload} suffix=" Cases" />
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Avg {avgCaseload} cases/officer
            </span>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas-card p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-canvas-muted mb-2 font-mono text-[10px] uppercase">
              <span>GOVERNANCE ROLES</span>
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-canvas-text">
              <CountUp value={rolesCount} />
            </div>
            <span className="text-[10px] font-mono text-canvas-faint mt-1 block">
              Statutory RBAC tiers
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="rounded-2xl border border-hairline bg-canvas-surface p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono shadow-soft">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-canvas-faint" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-hairline rounded-lg bg-canvas-card text-canvas-text placeholder:text-canvas-muted focus:outline-none focus:border-canvas-text/30"
            />
          </div>

          <div>
            <select
              value={bureauFilter}
              onChange={(e) => setBureauFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-hairline rounded-lg bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
            >
              <option value="">ALL BUREAUS & CELLS</option>
              {bureaus.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bureau_code} — {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-hairline rounded-lg bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
            >
              <option value="">ALL GOVERNANCE ROLES</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name} ({r.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-hairline bg-canvas-card overflow-hidden shadow-soft">
          <div className="px-5 py-4 border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-canvas-surface/50 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-saffron">CUE 12.1</span>
              <span className="text-canvas-muted">·</span>
              <span className="text-canvas-muted uppercase">
                REGISTERED REGULATORY ACTORS ({filteredUsers.length} total)
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeCount} ACTIVE AUTHORIZED ACCOUNTS</span>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-canvas-muted font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-saffron" />
              <p>QUERYING REGULATORY PERSONNEL DIRECTORY...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-canvas-muted font-mono text-xs">
              <p>NO PERSONNEL MATCHED SPECIFIED FILTER CONDITIONS.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="border-b border-hairline bg-canvas-surface text-[10px] font-mono text-canvas-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">OFFICER NAME & CONTACT</th>
                    <th className="px-4 py-3">SECURITY ROLE</th>
                    <th className="px-4 py-3">BUREAU / POSTING</th>
                    <th className="px-4 py-3 text-center">ACTIVE LOAD</th>
                    <th className="px-4 py-3 text-center">STATUS</th>
                    <th className="px-5 py-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-canvas-text">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-canvas-surface/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-canvas-text text-sm">{u.full_name}</div>
                        <div className="flex flex-wrap items-center gap-3 text-canvas-muted font-mono text-[11px] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-canvas-faint" /> {u.email}
                          </span>
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-canvas-faint" /> {u.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-canvas-surface border border-hairline text-canvas-text">
                          {u.role_display || u.role_name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-canvas-text text-xs">
                          {u.bureau_name ? `${u.bureau_code} — ${u.bureau_name}` : "Central Bureau"}
                        </div>
                        {u.regional_office_name && (
                          <div className="text-[11px] font-mono text-canvas-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-canvas-faint" /> {u.regional_office_name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                            u.active_cases_count > 10
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20"
                              : u.active_cases_count > 5
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20"
                          }`}
                        >
                          <CountUp value={u.active_cases_count || 0} suffix=" Cases" />
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-colors ${
                            u.is_active
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span>{u.is_active ? "ACTIVE" : "SUSPENDED"}</span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="px-2.5 py-1 text-canvas-muted hover:text-canvas-text rounded-lg border border-hairline bg-canvas hover:border-hairline-strong text-xs font-mono transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>EDIT</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Provision / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4">
            <div className="bg-canvas-surface rounded-2xl border border-hairline-strong max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col font-mono text-xs shadow-card relative">
              {/* Top Tricolour hairline */}
              <div className="h-[2px] w-full bg-gradient-to-r from-saffron via-white to-emerald-500 shrink-0" />

              <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-canvas-card/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-saffron" />
                  <span className="text-canvas-text text-xs font-bold uppercase tracking-wider">
                    {editingUser ? "MODIFY PERSONNEL CREDENTIALS" : "PROVISION STATUTORY PERSONNEL"}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-canvas-muted hover:text-canvas-text p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-canvas-muted uppercase mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                  />
                </div>

                <div>
                  <label className="block text-canvas-muted uppercase mb-1">Official Gov Email *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30 disabled:opacity-50"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-canvas-muted uppercase mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-canvas-muted uppercase mb-1">Official Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-canvas-muted uppercase mb-1">Role Authority *</label>
                    <select
                      value={formData.role_id}
                      onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                      className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-canvas-muted uppercase mb-1">Bureau Posting</label>
                    <select
                      value={formData.bureau_id}
                      onChange={(e) => setFormData({ ...formData, bureau_id: e.target.value })}
                      className="w-full border border-hairline rounded-lg p-2.5 bg-canvas text-canvas-text focus:outline-none focus:border-canvas-text/30"
                    >
                      <option value="">CENTRAL / UNASSIGNED</option>
                      {bureaus.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bureau_code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-hairline bg-canvas text-saffron focus:ring-saffron"
                    />
                    <span className="text-canvas-text">ACCOUNT AUTHORIZED & ACTIVE</span>
                  </label>
                </div>

                <div className="px-0 pt-4 border-t border-hairline flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 border border-hairline rounded-lg text-canvas-muted hover:text-canvas-text transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-canvas-text text-canvas text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {submitting ? "COMMITTING..." : editingUser ? "UPDATE RECORD" : "CREATE USER"}
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
