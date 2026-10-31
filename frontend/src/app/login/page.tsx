"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Sparkles, ArrowLeft } from "lucide-react";
import { api, setStoredToken } from "@/lib/api";
import PrismMark from "@/components/landing/PrismMark";
import ThemeToggle from "@/components/theme/ThemeToggle";

const PERSONAS = [
  { role: "Super Administrator", desc: "Full statutory oversight & governance", email: "superadmin@prism.gov.in" },
  { role: "Central Administrator", desc: "Inter-bureau case coordination", email: "centraladmin@prism.gov.in" },
  { role: "Regulation Bureau Head", desc: "Regulatory approvals & sanctions", email: "head.rb@prism.gov.in" },
  { role: "PGRC Case Officer", desc: "Grievance investigation & evidence", email: "officer.pgrc1@prism.gov.in" },
  { role: "Regional Officer (North)", desc: "Regional physical inspections", email: "ro.north@prism.gov.in" },
  { role: "Compliance Auditor", desc: "Immutable event audit trail", email: "auditor@prism.gov.in" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@prism.gov.in");
  const [password, setPassword] = useState("Prism@2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically unregister any stale service workers left from other localhost apps
  React.useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, password);
      setStoredToken(res.access_token, res.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("Prism@2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-canvas text-canvas-text flex flex-col justify-between relative overflow-hidden film-grain selection:bg-saffron/30 selection:text-white">
      {/* Tricolour Hairline at the very top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-saffron via-white to-emerald-500 sticky top-0 z-50 pointer-events-none" />

      {/* Background ambient glow blobs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] rounded-full bg-saffron/10 blur-[150px] pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="h-16 flex items-center justify-between px-6 lg:px-12 border-b border-hairline relative z-20 bg-canvas/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 text-xs font-mono text-canvas-muted hover:text-canvas-text transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO HOME</span>
        </Link>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-canvas-muted">PORTAL NODE:</span>
            <span className="text-canvas-text font-medium">AICTE CENTRAL AUTH</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Split Main Section */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 lg:px-12 py-10 lg:py-16 items-center gap-12 lg:gap-16 relative z-10">
        {/* Left Column: Brand & Refraction Visual */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-canvas-card text-[10px] font-mono tracking-widest text-canvas-muted uppercase mb-8 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-saffron" />
            <span>OFFICIAL AUTHORIZED ACCESS ONLY</span>
          </div>

          <div className="mb-6 flex justify-center lg:justify-start">
            <PrismMark variant="hero" size={200} showBeams={true} />
          </div>

          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-canvas-text leading-tight mb-4 max-w-lg">
            Transparent. <br />
            Coordinated. <br />
            <span className="font-serif italic text-spectrum font-normal">Timely</span> Resolution.
          </h1>

          <p className="text-sm text-canvas-muted font-light max-w-md leading-relaxed mb-6">
            Centralized institutional complaint monitoring and AI-assisted cross-bureau coordination platform for the All India Council for Technical Education.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-canvas-faint">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>ARGON2ID + AES-256</span>
            </span>
            <span>·</span>
            <span>DPDP ACT 2023 COMPLIANT</span>
            <span>·</span>
            <span>GIGW 3.0</span>
          </div>
        </div>

        {/* Right Column: Glass Login Card & Persona Selectors */}
        <div className="w-full max-w-md shrink-0">
          <div className="relative rounded-2xl border border-hairline bg-canvas-surface/95 dark:bg-[#0E1014]/90 backdrop-blur-xl p-7 sm:p-8 shadow-card">
            {/* Tricolour Accent Line inside card */}
            <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-saffron via-white to-emerald-500 rounded-full" />

            <div className="mb-6 text-center sm:text-left pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-saffron uppercase tracking-widest font-bold">
                  PRISM · GOV
                </span>
                <span className="text-[10px] font-mono text-canvas-muted bg-canvas-card px-2 py-0.5 rounded border border-hairline shadow-xs">
                  SECURE PROTOCOL
                </span>
              </div>
              <h2 className="text-xl font-light text-canvas-text tracking-tight mt-1.5">
                Officer Sign-In
              </h2>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-600 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase tracking-wider mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-canvas-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@prism.gov.in"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-hairline bg-canvas-card text-sm text-canvas-text placeholder-canvas-muted focus:outline-hidden focus:border-saffron/60 focus:ring-1 focus:ring-saffron/40 transition-colors font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-canvas-muted uppercase tracking-wider mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-canvas-muted" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-hairline bg-canvas-card text-sm text-canvas-text placeholder-canvas-muted focus:outline-hidden focus:border-saffron/60 focus:ring-1 focus:ring-saffron/40 transition-colors font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-medium text-xs font-sans tracking-wide text-canvas bg-canvas-text hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-soft hover:shadow-card disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Central Console</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Access Account Selector for Enterprise Demo */}
            <div className="mt-6 pt-5 border-t border-hairline">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-canvas-muted uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-saffron" />
                  <span>Select Authorized Role:</span>
                </span>
                <span className="text-[9px] font-mono text-saffron bg-saffron/10 px-1.5 py-0.2 rounded border border-saffron/20 font-medium">
                  DEMO PASS: Prism@2026!
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map((item) => {
                  const isSelected = email === item.email;
                  return (
                    <button
                      key={item.email}
                      type="button"
                      onClick={() => handleQuickSelect(item.email)}
                      className={`text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-canvas-card border-saffron/60 text-canvas-text shadow-soft"
                          : "bg-canvas-subtle border-hairline text-canvas-muted hover:text-canvas-text hover:bg-canvas-card"
                      }`}
                    >
                      <div className="font-medium text-xs truncate text-canvas-text">{item.role}</div>
                      <div className="text-[10px] font-mono text-canvas-muted truncate mt-0.5">
                        {item.email.split("@")[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="py-4 border-t border-hairline text-center text-xs font-mono text-canvas-faint relative z-10">
        <span>© 2026 PRISM · AICTE Coordination Platform</span>
      </footer>
    </div>
  );
}
