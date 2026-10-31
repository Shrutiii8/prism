"use client";

import React from "react";

interface StatusBadgeProps {
  status?: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusBadge({
  status = "",
  label,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const displayLabel = label || status || "PENDING";
  const norm = String(status || label || "").toLowerCase();

  // Default: Process (Blue)
  let colorConfig = {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    border: "border-blue-500/25 dark:border-blue-400/30",
    text: "text-[#2F6FED] dark:text-blue-300",
    dot: "bg-[#2F6FED] dark:bg-blue-400",
  };

  if (
    norm.includes("disposed") ||
    norm.includes("resolved") ||
    norm.includes("approved") ||
    norm.includes("active") ||
    norm.includes("complete") ||
    norm.includes("success") ||
    norm.includes("verified")
  ) {
    colorConfig = {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "border-emerald-500/25 dark:border-emerald-400/30",
      text: "text-[#17803F] dark:text-emerald-300",
      dot: "bg-[#17803F] dark:bg-emerald-400",
    };
  } else if (
    norm.includes("overdue") ||
    norm.includes("escalated") ||
    norm.includes("rejected") ||
    norm.includes("critical") ||
    norm.includes("error") ||
    norm.includes("revoked")
  ) {
    colorConfig = {
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      border: "border-rose-500/25 dark:border-rose-400/30",
      text: "text-[#D92D20] dark:text-rose-300",
      dot: "bg-[#D92D20] dark:bg-rose-400",
    };
  } else if (
    norm.includes("action") ||
    norm.includes("scrutiny") ||
    norm.includes("hearing") ||
    norm.includes("notice") ||
    norm.includes("high")
  ) {
    colorConfig = {
      bg: "bg-orange-500/10 dark:bg-[#F28C28]/15",
      border: "border-orange-500/25 dark:border-[#F28C28]/35",
      text: "text-[#D9661F] dark:text-[#F28C28]",
      dot: "bg-[#D9661F] dark:bg-[#F28C28]",
    };
  } else if (
    norm.includes("pending") ||
    norm.includes("waiting") ||
    norm.includes("review") ||
    norm.includes("medium")
  ) {
    colorConfig = {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      border: "border-amber-500/25 dark:border-amber-400/30",
      text: "text-[#B7791F] dark:text-amber-300",
      dot: "bg-[#B7791F] dark:bg-amber-400",
    };
  } else if (
    norm.includes("transferred") ||
    norm.includes("forwarded") ||
    norm.includes("coordination") ||
    norm.includes("panel")
  ) {
    colorConfig = {
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
      border: "border-purple-500/25 dark:border-purple-400/30",
      text: "text-[#7A4FD6] dark:text-purple-300",
      dot: "bg-[#7A4FD6] dark:bg-purple-400",
    };
  } else if (
    norm.includes("process") ||
    norm.includes("investigation") ||
    norm.includes("intake") ||
    norm.includes("assigned")
  ) {
    colorConfig = {
      bg: "bg-cyan-500/10 dark:bg-cyan-500/15",
      border: "border-cyan-500/25 dark:border-cyan-400/30",
      text: "text-[#0284c7] dark:text-cyan-300",
      dot: "bg-[#0284c7] dark:bg-cyan-400",
    };
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium uppercase tracking-wider border backdrop-blur-xs ${colorConfig.bg} ${colorConfig.border} ${colorConfig.text} ${padding} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colorConfig.dot} animate-pulse`} />
      <span>{displayLabel}</span>
    </span>
  );
}
