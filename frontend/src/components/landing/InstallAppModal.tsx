"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Smartphone,
  Laptop,
  Share,
  PlusSquare,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
} from "lucide-react";
import Image from "next/image";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onInstallPromptSuccess?: () => void;
}

export default function InstallAppModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPromptSuccess,
}: InstallAppModalProps) {
  const [activeTab, setActiveTab] = useState<"desktop" | "ios" | "android">("desktop");
  const [copied, setCopied] = useState(false);
  const [installState, setInstallState] = useState<"idle" | "installing" | "installed">("idle");

  // Auto-detect user OS
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab("ios");
    } else if (/android/.test(ua)) {
      setActiveTab("android");
    } else {
      setActiveTab("desktop");
    }
  }, [isOpen]);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        setInstallState("installing");
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstallState("installed");
          if (onInstallPromptSuccess) onInstallPromptSuccess();
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setInstallState("idle");
        }
      } catch (err) {
        console.error("Installation error:", err);
        setInstallState("idle");
      }
    } else {
      // Trigger download of desktop shortcut file as a reliable universal fallback
      handleDownloadShortcut();
    }
  };

  const handleDownloadShortcut = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const shortcutContent = `[InternetShortcut]\nURL=${origin}/\nIconFile=${origin}/prism-logo.png\nIconIndex=0\n`;
    const blob = new Blob([shortcutContent], { type: "application/internet-shortcut" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PRISM-App.url";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setInstallState("installed");
    setTimeout(() => setInstallState("idle"), 3000);
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="relative w-full max-w-lg bg-canvas-card border border-hairline rounded-xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-canvas-muted hover:text-canvas-text rounded-md hover:bg-canvas-subtle transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with App Logo & Title */}
            <div className="flex items-center gap-4 pb-5 border-b border-hairline">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-hairline/80 shadow-md p-1 bg-black/40 flex items-center justify-center shrink-0">
                <Image
                  src="/prism-logo.png"
                  alt="PRISM Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-lg font-bold text-canvas-text">
                    Install PRISM App
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-saffron/15 text-saffron border border-saffron/30 font-bold">
                    PWA Ready
                  </span>
                </div>
                <p className="text-canvas-muted text-xs mt-0.5 leading-snug">
                  AICTE Centralized Regulatory Oversight Platform
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="py-5">
              <button
                onClick={handleNativeInstall}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-canvas-text text-canvas font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all hover:scale-[1.01] shadow-card group"
              >
                {installState === "installed" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>App Installed / Downloaded</span>
                  </>
                ) : deferredPrompt ? (
                  <>
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    <span>Install Directly in Browser</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    <span>Download Desktop App Launcher (.url)</span>
                  </>
                )}
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center border border-hairline rounded-lg p-1 bg-canvas-subtle/50 mb-4">
              <button
                onClick={() => setActiveTab("desktop")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-mono text-xs font-medium transition-all ${
                  activeTab === "desktop"
                    ? "bg-canvas-card text-canvas-text shadow-xs font-bold"
                    : "text-canvas-muted hover:text-canvas-text"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setActiveTab("ios")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-mono text-xs font-medium transition-all ${
                  activeTab === "ios"
                    ? "bg-canvas-card text-canvas-text shadow-xs font-bold"
                    : "text-canvas-muted hover:text-canvas-text"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iOS (Safari)</span>
              </button>
              <button
                onClick={() => setActiveTab("android")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-mono text-xs font-medium transition-all ${
                  activeTab === "android"
                    ? "bg-canvas-card text-canvas-text shadow-xs font-bold"
                    : "text-canvas-muted hover:text-canvas-text"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
            </div>

            {/* Tab Instruction Content */}
            <div className="bg-canvas-subtle/30 border border-hairline/60 rounded-lg p-4 text-xs space-y-3">
              {activeTab === "desktop" && (
                <div className="space-y-2 text-canvas-muted">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-saffron bg-saffron/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>
                      In Chrome, Edge, or Brave, click the{" "}
                      <strong className="text-canvas-text">Install Icon (⊞ / ⊕)</strong> in the right side of the address bar.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-saffron bg-saffron/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>
                      Or click the browser menu (<strong className="text-canvas-text">⋮</strong>) $\rightarrow${" "}
                      <strong className="text-canvas-text">"Install PRISM..."</strong> to place an icon on your desktop and taskbar.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "ios" && (
                <div className="space-y-2 text-canvas-muted">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-saffron bg-saffron/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>
                      Open in <strong className="text-canvas-text">Safari</strong>, then tap the{" "}
                      <strong className="text-canvas-text">Share</strong> button (
                      <Share className="w-3.5 h-3.5 inline-block text-saffron" />
                      ) in the bottom toolbar.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-saffron bg-saffron/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>
                      Scroll down and tap{" "}
                      <strong className="text-canvas-text">"Add to Home Screen"</strong> (
                      <PlusSquare className="w-3.5 h-3.5 inline-block text-saffron" />
                      ) to install PRISM.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "android" && (
                <div className="space-y-2 text-canvas-muted">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-saffron bg-saffron/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>
                      Tap the <strong className="text-canvas-text">three dots (⋮)</strong> menu in the upper-right corner of Chrome.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-saffron bg-saffron/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>
                      Tap <strong className="text-canvas-text">"Install App"</strong> or{" "}
                      <strong className="text-canvas-text">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-hairline text-center">
              <div className="p-2 rounded-md bg-canvas-subtle/30">
                <Zap className="w-4 h-4 mx-auto text-saffron mb-1" />
                <span className="font-mono text-[10px] text-canvas-muted block">Instant Launch</span>
              </div>
              <div className="p-2 rounded-md bg-canvas-subtle/30">
                <Layers className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                <span className="font-mono text-[10px] text-canvas-muted block">No Browser UI</span>
              </div>
              <div className="p-2 rounded-md bg-canvas-subtle/30">
                <ShieldCheck className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                <span className="font-mono text-[10px] text-canvas-muted block">Offline Cache</span>
              </div>
            </div>

            {/* Footer Copy Link */}
            <div className="mt-4 flex items-center justify-between pt-3 text-[11px] text-canvas-muted border-t border-hairline">
              <span>Share webapp URL:</span>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-saffron hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Link!" : "Copy Link"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

