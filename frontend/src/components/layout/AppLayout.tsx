"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Search,
  Sparkles,
  Menu,
  X,
  Shield,
  Globe,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, getStoredUser, clearStoredSession, UserSession } from "@/lib/api";
import CommandPalette from "@/components/motion/CommandPalette";
import ThemeToggle from "@/components/theme/ThemeToggle";
import PrismMark from "@/components/landing/PrismMark";
import LanguageDropdown from "./LanguageDropdown";
import { useLanguage } from "@/lib/i18n";

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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click or route navigation
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const isPublicPage = pathname === "/" || pathname === "/login";

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
    api
      .getUnreadCount()
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

  const { t } = useLanguage();

  interface NavItem {
    label: string;
    href: string;
    icon: any;
    badge?: string;
  }

  // Primary 7 Navigation modules matching the reference horizontal capsule
  const primaryNavItems: NavItem[] = [
    { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("institutions"), href: "/institutions", icon: Building2 },
    { label: t("complaints"), href: "/complaints", icon: FileText },
    { label: t("intelligence"), href: "/ai-matching", icon: BrainCircuit, badge: "AI" },
    { label: t("relatedCases"), href: "/related-cases", icon: GitFork },
    { label: t("allocations"), href: "/allocation", icon: Users },
    { label: t("coordination"), href: "/coordination", icon: MessagesSquare },
  ];

  // Secondary items accessed via the "More" dropdown
  const secondaryNavItems: NavItem[] = [
    { label: t("workflows"), href: "/workflows", icon: GitPullRequest },
    { label: t("reports"), href: "/reports", icon: BarChart3 },
    { label: t("auditLogs"), href: "/audit", icon: ShieldCheck },
    { label: t("userManagement"), href: "/users", icon: UserCheck },
    { label: t("systemSettings"), href: "/settings", icon: Sliders },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];
  const isSecondaryActive = secondaryNavItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href)
  );

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-canvas-text selection:bg-saffron/30 selection:text-white film-grain">
      {/* Tricolour hairline banner at the absolute top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-saffron via-white to-emerald-500 sticky top-0 z-50 pointer-events-none" />

      {/* Floating Horizontal Navbar matching the reference design */}
      <header className="sticky top-[2px] z-40 w-full py-3 px-4 sm:px-6 lg:px-8 bg-canvas/80 backdrop-blur-md border-b border-hairline/60">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          {/* Left Island: Brand Pill */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-hairline bg-canvas-card text-canvas-text shadow-xs hover:border-hairline-strong transition-all shrink-0 select-none group"
          >
            <PrismMark size={24} variant="nav" />
            <span className="font-mono font-black text-sm tracking-wider text-canvas-text group-hover:text-saffron transition-colors">
              PRISM
            </span>
          </Link>

          {/* Center Island: Module Capsule Navigation */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full border border-hairline bg-canvas-card/90 dark:bg-canvas-card/90 shadow-xs backdrop-blur-md">
            {primaryNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all select-none flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-black dark:bg-white dark:text-black font-semibold shadow-xs"
                      : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle/80"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* "More" Dropdown for secondary platform tools */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all ${
                  isSecondaryActive
                    ? "bg-white text-black dark:bg-white dark:text-black font-semibold shadow-xs"
                    : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle/80"
                }`}
              >
                <span>{t("more")}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${moreMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-hairline bg-canvas-card/95 backdrop-blur-md shadow-card p-1.5 z-50 space-y-0.5"
                  >
                    {secondaryNavItems.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans transition-colors ${
                            isActive
                              ? "bg-canvas-text text-canvas font-semibold shadow-xs"
                              : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Island: Language, Theme, Notifications & User Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full border border-hairline bg-canvas-card text-canvas-text shadow-xs backdrop-blur-md shrink-0">
            {/* Search Platform Shortcut */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="p-1.5 text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle rounded-full transition-colors"
              title="Search platform (Ctrl+K)"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Workable Language Selector supporting English, Hindi (हिन्दी), and Bangla (বাংলা) */}
            <LanguageDropdown />

            {/* Theme Toggle (Sun / Moon) */}
            <div className="scale-90">
              <ThemeToggle />
            </div>

            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative p-1.5 text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle rounded-full transition-colors"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-saffron rounded-full ring-2 ring-canvas animate-pulse" />
              )}
            </Link>

            {/* User Avatar Circle */}
            <div
              className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-mono font-bold shadow-xs cursor-pointer select-none"
              title={`${user?.full_name} (${user?.role_display || user?.role})`}
            >
              {user?.full_name ? user.full_name[0] : "S"}
            </div>

            {/* Sign Out Action */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-canvas-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Mobile Hamburger Menu button on small screens */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle rounded-full"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Full Mobile Navigation Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-canvas-card border-l border-hairline shadow-2xl flex flex-col z-10 p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-hairline">
                <div className="flex items-center gap-2 font-mono">
                  <PrismMark size={20} variant="nav" />
                  <span className="font-bold text-sm">PRISM</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-canvas-muted hover:text-canvas-text rounded-lg hover:bg-canvas-subtle"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Identity Banner */}
              <div className="py-4 border-b border-hairline">
                <p className="text-xs font-semibold text-canvas-text">{user?.full_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-saffron bg-saffron/10 px-1.5 py-0.5 rounded border border-saffron/20 font-bold">
                    {user?.role_display || user?.role}
                  </span>
                  {user?.bureau_code && (
                    <span className="text-[10px] font-mono text-canvas-muted bg-canvas-subtle px-1.5 py-0.5 rounded">
                      {user.bureau_code}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Items List */}
              <nav className="py-4 space-y-1 flex-1">
                {allNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-sans transition-all ${
                        isActive
                          ? "bg-canvas-text text-canvas font-bold shadow-xs"
                          : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Logout Button */}
              <div className="pt-4 border-t border-hairline">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-hairline text-rose-500 hover:bg-rose-500/10 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("signOut")}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Page Content - Clean Full Width Container without Sidebar Indent */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
