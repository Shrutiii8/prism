"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, LANGUAGE_OPTIONS, Language } from "@/lib/i18n";

interface LanguageDropdownProps {
  className?: string;
}

export default function LanguageDropdown({ className = "" }: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { language, setLanguage, currentOption } = useLanguage();

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-mono text-canvas-muted hover:text-canvas-text px-2.5 py-1 rounded-full hover:bg-canvas-subtle transition-all cursor-pointer select-none border border-transparent hover:border-hairline"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-canvas-muted shrink-0" />
        <span className="font-medium">{currentOption.nativeLabel}</span>
        <ChevronDown
          className={`w-3 h-3 text-canvas-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-xl border border-hairline bg-canvas-card/95 backdrop-blur-md shadow-card p-1.5 z-50 space-y-0.5"
          >
            <div className="px-2.5 py-1 text-[10px] font-mono tracking-wider text-canvas-muted uppercase border-b border-hairline/60 mb-1">
              Language / भाषा / ভাষা
            </div>

            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-sans transition-colors ${
                    isSelected
                      ? "bg-canvas-text text-canvas font-semibold shadow-xs"
                      : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold opacity-75 uppercase">
                      {opt.code}
                    </span>
                    <span>{opt.nativeLabel}</span>
                    {opt.code !== "en" && (
                      <span className="text-[10px] text-canvas-muted/80">({opt.label})</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
