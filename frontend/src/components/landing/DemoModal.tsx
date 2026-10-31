"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Send, Building2 } from "lucide-react";
import { z } from "zod";

const demoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  designation: z.string().min(2, "Designation is required"),
  organization: z.string().min(2, "Institution or agency name is required"),
  email: z.string().email("Please enter a valid official email address"),
  message: z.string().min(10, "Please provide a brief inquiry description (min 10 characters)"),
});

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "",
    organization: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = demoSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate enterprise inquiry dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({
          fullName: "",
          designation: "",
          organization: "",
          email: "",
          message: "",
        });
      }, 2500);
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg bg-[#0d1017] border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Inquiry Dispatched
                </h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto font-normal">
                  Thank you. An official PRISM demonstration coordinator will reach out to schedule an executive walkthrough.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    EXECUTIVE BRIEFING
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                    Request an Enterprise Walkthrough
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-1">
                    Experience real-time AI overlap clustering and multi-bureau workflows for your regulatory agency.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full bg-[#07090e] border border-white/10 focus:border-white/40 rounded-lg p-2.5 text-white outline-none"
                    />
                    {errors.fullName && <p className="text-rose-400 text-[10px] mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Official Designation *</label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. Bureau Director"
                        className="w-full bg-[#07090e] border border-white/10 focus:border-white/40 rounded-lg p-2.5 text-white outline-none"
                      />
                      {errors.designation && <p className="text-rose-400 text-[10px] mt-1">{errors.designation}</p>}
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Organization *</label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="e.g. AICTE / Ministry"
                        className="w-full bg-[#07090e] border border-white/10 focus:border-white/40 rounded-lg p-2.5 text-white outline-none"
                      />
                      {errors.organization && <p className="text-rose-400 text-[10px] mt-1">{errors.organization}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. officer@aicte.gov.in"
                      className="w-full bg-[#07090e] border border-white/10 focus:border-white/40 rounded-lg p-2.5 text-white outline-none"
                    />
                    {errors.email && <p className="text-rose-400 text-[10px] mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Inquiry Context / Department *</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Brief details regarding regulatory jurisdiction and current grievance volume..."
                      className="w-full bg-[#07090e] border border-white/10 focus:border-white/40 rounded-lg p-2.5 text-white outline-none resize-none font-sans"
                    />
                    {errors.message && <p className="text-rose-400 text-[10px] mt-1">{errors.message}</p>}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-white text-black font-bold uppercase rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Official Request"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

