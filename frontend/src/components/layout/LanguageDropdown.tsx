"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, LANGUAGE_OPTIONS, Language } from "@/lib/i18n";

interface LanguageDropdownProps {
  className?: string;
}

export default function LanguageDropdown({ className = "" }: LanguageDropdownProps) {
  const { language, setLanguage, currentOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button matching reference screenshot */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-mono text-canvas-muted hover:text-canvas-text px-2 sm:px-2.5 py-1 rounded-full hover:bg-canvas-subtle transition-all cursor-pointer select-none border border-transparent hover:border-hairline"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-canvas-muted shrink-0" />
        <span className="font-medium tracking-wide">{currentOption.nativeLabel}</span>
        <ChevronDown
          className={`w-3 h-3 text-canvas-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-hairline bg-canvas-card/95 backdrop-blur-md shadow-card p-1.5 z-50 space-y-0.5"
          >
            <div className="px-2.5 py-1 text-[10px] font-mono tracking-wider text-canvas-muted uppercase">
              Select Language / भाषा
            </div>

            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-sans transition-colors text-left ${
                    isSelected
                      ? "bg-canvas-text text-canvas font-semibold shadow-xs"
                      : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-subtle"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium leading-tight">{opt.nativeLabel}</span>
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? "text-canvas/80" : "text-canvas-muted/70"
                      }`}
                    >
                      {opt.label}
                    </span>
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
