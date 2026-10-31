"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
  LogOut,
  ChevronRight,
  Search,
  Sparkles,
  Command,
  Menu,
  X,
} from "lucide-react";
import { api, getStoredUser, clearStoredSession, UserSession } from "@/lib/api";
import PrismMark from "@/components/landing/PrismMark";
import CommandPalette from "@/components/motion/CommandPalette";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [istTime, setIstTime] = useState("");

  // Load persisted sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("prism_sidebar_collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("prism_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Live ticking IST clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setIstTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Unregister any stale legacy service workers on localhost
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
    }

    const isPublicPage = pathname === "/" || pathname === "/login";

    // If on public page (landing or login), do not require auth or render app layout
    if (isPublicPage) {
      setLoading(false);
      return;
    }

    const sessionUser = getStoredUser();
    if (!sessionUser) {
      router.push("/login");
      return;
    }
    setUser(sessionUser);
    setLoading(false);

    // Fetch unread count
    api.getUnreadCount()
      .then((res) => setUnreadCount(res.unread_count))
      .catch(() => {});
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    clearStoredSession();
    router.push("/login");
  };

  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas text-canvas-text film-grain">
        <div className="flex flex-col items-center space-y-4">
          <PrismMark size={48} variant="nav" />
          <div className="flex items-center gap-2 text-xs font-mono text-canvas-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" />
            <span>VERIFYING PRISM SECURITY SESSION...</span>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Institutions", href: "/institutions", icon: Building2 },
    { label: "Complaints", href: "/complaints", icon: FileText },
    { label: "AI Intelligence", href: "/ai-matching", icon: BrainCircuit, badge: "AI" },
    { label: "Related Cases", href: "/related-cases", icon: GitFork },
    { label: "Case Allocation", href: "/allocation", icon: Users },
    { label: "Coordination", href: "/coordination", icon: MessagesSquare },
    { label: "Workflows", href: "/workflows", icon: GitPullRequest },
    { label: "Notifications", href: "/notifications", icon: Bell, count: unreadCount },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Audit Logs", href: "/audit", icon: ShieldCheck },
    { label: "User Management", href: "/users", icon: UserCheck },
    { label: "System Settings", href: "/settings", icon: Sliders },
  ];

  // Derive breadcrumbs
  const pathParts = pathname.split("/").filter(Boolean);
  const breadcrumb = pathParts.length > 0 ? pathParts[0].replace("-", " ") : "Dashboard";

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-canvas-text selection:bg-saffron/30 selection:text-white film-grain">
      {/* Tricolour hairline at the absolute top of the shell */}
      <div className="h-[2px] w-full bg-gradient-to-r from-saffron via-white to-emerald-500 sticky top-0 z-50 pointer-events-none" />

      <div className="flex-1 flex relative">
        {/* Ambient spectrum blur in corner (adapts for light and dark) */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/5 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none" />

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Editorial Shell with Hairline Borders */}
        <aside
          className={`bg-[#FBFAF7] dark:bg-[#0A0C0F] text-canvas-muted flex flex-col fixed inset-y-0 top-[2px] z-50 border-r border-hairline backdrop-blur-md transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "lg:w-[72px]" : "lg:w-64"
          } w-64 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Brand Header */}
          <div
            className={`h-16 flex items-center border-b border-hairline bg-[#F5F4F0] dark:bg-[#07090C] transition-all duration-300 ${
              sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
            }`}
          >
            <Link href="/" className="flex items-center gap-3 group overflow-hidden">
              <PrismMark size={sidebarCollapsed ? 28 : 32} variant="nav" />
              {!sidebarCollapsed && (
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-light tracking-tight text-canvas-text text-base">
                      PRISM
                    </span>
                    <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.2 rounded-full border border-hairline text-canvas-muted bg-canvas-card group-hover:border-saffron/40 transition-colors">
                      GOV
                    </span>
                  </div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-canvas-muted/70 truncate">
                    COORDINATION PLATFORM
                  </p>
                </div>
              )}
            </Link>

            {/* Mobile close toggle */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-canvas-muted hover:text-canvas-text rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
            {!sidebarCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-canvas-faint uppercase">
                PLATFORM MODULES
              </div>
            )}
            {sidebarCollapsed && (
              <div className="pb-2 flex justify-center">
                <div className="w-4 h-px bg-hairline" />
              </div>
            )}
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`relative flex items-center rounded-xl text-xs font-sans transition-all duration-200 group ${
                    sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
                  } ${
                    isActive
                      ? "bg-canvas-card text-canvas-text border border-hairline shadow-soft"
                      : "text-canvas-muted hover:bg-canvas-subtle hover:text-canvas-text hover:translate-x-0.5 border border-transparent"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {/* Active Spectrum Left Edge Indicator */}
                  {isActive && (
                    <div className="absolute left-0 inset-y-2 w-1 rounded-r-full bg-gradient-to-b from-purple-500 via-cyan-400 to-saffron" />
                  )}

                  <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
                    <Icon
                      className={`w-4 h-4 transition-colors shrink-0 ${
                        isActive
                          ? "text-saffron drop-shadow-[0_0_8px_rgba(242,140,40,0.5)]"
                          : "text-canvas-muted group-hover:text-canvas-text"
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-medium tracking-wider px-1.5 py-0.5 rounded-full border border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                      <Sparkles className="w-2.5 h-2.5 text-purple-500 dark:text-purple-300 animate-pulse" />
                      {item.badge}
                    </span>
                  )}

                  {!sidebarCollapsed && typeof item.count === "number" && item.count > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                      {item.count}
                    </span>
                  )}

                  {/* Collapsed dot indicators */}
                  {sidebarCollapsed && typeof item.count === "number" && item.count > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-canvas animate-pulse" />
                  )}
                  {sidebarCollapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}

                  {/* Floating tooltip on hover when collapsed */}
                  {sidebarCollapsed && (
                    <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-canvas-card border border-hairline-strong rounded-lg text-xs font-mono text-canvas-text shadow-card whitespace-nowrap z-50 items-center gap-2 pointer-events-none">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {item.badge}
                        </span>
                      )}
                      {typeof item.count === "number" && item.count > 0 && (
                        <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {item.count}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Status Footer */}
          <div className="p-3 border-t border-hairline bg-[#F5F4F0] dark:bg-[#07090C]">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-hairline bg-canvas-card text-saffron flex items-center justify-center text-xs font-mono font-bold shadow-xs cursor-default"
                  title={`${user?.full_name} (${user?.role_display || user?.role})`}
                >
                  {user?.full_name ? user.full_name[0] : "P"}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-canvas-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg border border-hairline bg-canvas-card">
                <div className="truncate mr-2">
                  <p className="text-xs font-medium text-canvas-text truncate">
                    {user?.full_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px]">
                    <span className="text-saffron bg-saffron/10 px-1 py-0.2 rounded border border-saffron/20 font-medium">
                      {user?.role_display || user?.role}
                    </span>
                    {user?.bureau_code && (
                      <span className="text-canvas-muted bg-canvas-subtle px-1 py-0.2 rounded">
                        {user.bureau_code}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-canvas-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area - Full width on mobile, padded for desktop */}
        <div
          className={`flex-1 flex flex-col min-h-[calc(100vh-2px)] w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
          }`}
        >
          {/* Top Header Bar */}
          <header className="h-16 bg-canvas/80 dark:bg-[#08090B]/80 backdrop-blur-md border-b border-hairline flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-[2px] z-30 shadow-xs">
            {/* Left: 3-line Hamburger Menu Toggle (Mobile + Desktop) + Search / Breadcrumbs */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setMobileMenuOpen((prev) => !prev);
                  } else {
                    toggleSidebar();
                  }
                }}
                className="p-2 -ml-2 text-canvas-muted hover:text-canvas-text hover:bg-canvas-card rounded-lg border border-transparent hover:border-hairline transition-all shadow-xs"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label="Toggle navigation sidebar"
              >
                <Menu className="w-5 h-5 text-canvas-text" />
              </button>

              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-hairline bg-canvas-card text-xs font-mono text-canvas-muted hover:text-canvas-text hover:border-hairline-strong transition-all group shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-saffron" />
                <span className="hidden sm:inline">Search platform...</span>
                <span className="sm:hidden text-[10px]">Search</span>
                <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-canvas-subtle text-[10px] text-canvas-muted font-mono">
                  <Command className="w-2.5 h-2.5" /> K
                </span>
              </button>

              <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-canvas-muted">
                <span>PRISM</span>
                <ChevronRight className="w-3 h-3 text-canvas-faint" />
                <span className="text-canvas-text capitalize">{breadcrumb}</span>
              </div>
            </div>

            {/* Right: Live IST Clock + Theme Toggle + Notification Bell + Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3.5">
              {/* Live IST Clock */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-hairline bg-canvas-card text-[11px] font-mono shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span className="text-canvas-muted">IST:</span>
                <span className="text-canvas-text tabular-nums tracking-wider font-medium">
                  {istTime || "12:00:00"}
                </span>
              </div>

              {/* Status Badge */}
              <div className="hidden md:block">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-saffron bg-saffron/10 border border-saffron/20 px-2 py-0.5 rounded-full font-medium">
                  AICTE SECURE NODE
                </span>
              </div>

              {/* Theme Toggle (Light / Dark / System with Circular Reveal) */}
              <ThemeToggle />

              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-2 text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-saffron rounded-full ring-2 ring-canvas animate-pulse" />
                )}
              </Link>

              <div className="h-5 w-px bg-hairline hidden sm:block" />

              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg border border-hairline bg-canvas-card text-saffron flex items-center justify-center text-xs font-mono font-bold shadow-xs">
                  {user?.full_name ? user.full_name[0] : "P"}
                </div>
                <div className="hidden xl:block text-xs">
                  <span className="font-medium text-canvas-text block leading-tight">
                    {user?.full_name}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">{children}</main>
        </div>
      </div>

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
