"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Building2,
  FileText,
  BrainCircuit,
  GitFork,
  Users,
  MessagesSquare,
  GitPullRequest,
  Bell,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Sliders,
  X,
  ArrowRight,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULES = [
  { label: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard, category: "Core Operations" },
  { label: "Institution Master Registry", href: "/institutions", icon: Building2, category: "Registry" },
  { label: "Central Complaint Directory", href: "/complaints", icon: FileText, category: "Grievances" },
  { label: "Register New Grievance", href: "/complaints/new", icon: FileText, category: "Grievances" },
  { label: "AI Overlap Engine", href: "/ai-matching", icon: BrainCircuit, category: "Intelligence" },
  { label: "Related Cases Topology", href: "/related-cases", icon: GitFork, category: "Intelligence" },
  { label: "Workload Case Allocation", href: "/allocation", icon: Users, category: "Coordination" },
  { label: "Inter-Bureau Coordination", href: "/coordination", icon: MessagesSquare, category: "Coordination" },
  { label: "Stage-Based Workflows", href: "/workflows", icon: GitPullRequest, category: "Governance" },
  { label: "Notifications & Alerts", href: "/notifications", icon: Bell, category: "System" },
  { label: "Statutory Regulatory Reports", href: "/reports", icon: BarChart3, category: "Governance" },
  { label: "Immutable Audit Logs", href: "/audit", icon: ShieldCheck, category: "Security" },
  { label: "Officer & Role Management", href: "/users", icon: UserCheck, category: "Administration" },
  { label: "Platform System Settings", href: "/settings", icon: Sliders, category: "Administration" },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener for ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = MODULES.filter((m) =>
    m.label.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Glass Search Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl border border-hairline-strong bg-canvas-surface/95 dark:bg-[#0E1014]/95 backdrop-blur-xl shadow-card overflow-hidden text-canvas-text z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-hairline">
          <Search className="w-4 h-4 text-saffron mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a module, case ID, or regulatory command..."
            className="w-full bg-transparent text-sm text-canvas-text placeholder-canvas-muted focus:outline-hidden font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-canvas-muted hover:text-canvas-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-hairline">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-canvas-muted">
              No PRISM regulatory module matches &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-canvas-subtle transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-hairline bg-canvas-card flex items-center justify-center text-canvas-muted group-hover:text-saffron group-hover:border-saffron/40 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-canvas-text group-hover:text-saffron transition-colors">
                        {item.label}
                      </p>
                      <span className="text-[10px] font-mono uppercase text-canvas-muted">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-canvas-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-canvas-subtle border-t border-hairline flex items-center justify-between text-[11px] font-mono text-canvas-muted">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-canvas-card border border-hairline text-canvas-text font-medium">ESC</span>
            <span>to close</span>
          </div>
          <span>PRISM ENTERPRISE SEARCH</span>
        </div>
      </div>
    </div>
  );
}
