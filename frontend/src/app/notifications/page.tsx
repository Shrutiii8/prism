"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BrainCircuit,
  MessagesSquare,
  ShieldAlert,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/motion/PageTransition";
import PageHeader from "@/components/motion/PageHeader";

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications(unreadOnly);
      setNotifications(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "OVERDUE_WARNING":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "AI_MATCH_DETECTED":
        return <BrainCircuit className="w-4 h-4 text-indigo-400" />;
      case "ASSIGNMENT":
        return <FileText className="w-4 h-4 text-saffron" />;
      case "COORDINATION_REQ":
        return <MessagesSquare className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#8A8F98]" />;
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          cueNumber="09"
          sectionLabel="DISPATCH LOG & REAL-TIME ALERTS"
          title="Notification Stream"
          accentWord="Stream"
          description="Real-time telemetry on statutory deadline breaches, officer assignments, AI overlap detections, and inter-bureau messages."
          actions={
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shadow-xs ${
                  unreadOnly
                    ? "bg-canvas-text text-canvas font-semibold"
                    : "border border-hairline bg-canvas-card text-canvas-muted hover:text-canvas-text"
                }`}
              >
                {unreadOnly ? "UNREAD ONLY" : "ALL ALERTS"}
              </button>

              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-canvas-card text-xs font-mono text-canvas-muted hover:text-canvas-text transition-colors shadow-xs"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>ACKNOWLEDGE ALL</span>
              </button>
            </div>
          }
        />

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs">
              <div className="inline-block w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin mr-2" />
              POLLING NOTIFICATION STREAM...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center text-canvas-muted font-mono rounded-2xl border border-hairline bg-canvas-card text-xs">
              NO ACTIVE ALERTS IN NOTIFICATION QUEUE.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 ${
                  !n.is_read
                    ? "bg-canvas-card border-hairline-strong shadow-soft"
                    : "bg-canvas-surface border-hairline opacity-75"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-canvas border border-hairline shrink-0">
                    {getIcon(n.notification_type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xs font-medium text-canvas-text">{n.title}</h3>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" title="Unread" />
                      )}
                      <span className="text-[10px] font-mono text-canvas-muted uppercase">
                        {n.notification_type}
                      </span>
                    </div>
                    <p className="text-xs text-canvas-muted leading-relaxed font-normal">{n.message}</p>
                    <span className="text-[10px] font-mono text-canvas-faint block pt-0.5">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0 self-end sm:self-start font-mono text-xs">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-[11px] text-canvas-muted hover:text-canvas-text transition-colors"
                    >
                      ACKNOWLEDGE
                    </button>
                  )}
                  {n.reference_type === "COMPLAINT" && n.reference_id && (
                    <Link
                      href={`/complaints/${n.reference_id}`}
                      className="inline-flex items-center gap-1 text-canvas-text hover:text-saffron transition-colors"
                    >
                      <span>INSPECT</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  {n.reference_type === "AI_MATCH" && (
                    <Link
                      href="/ai-matching"
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:underline"
                    >
                      <span>REVIEW</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
