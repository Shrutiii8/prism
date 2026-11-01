
"use client";

import React, { useState } from "react";
import SmoothScroll from "@/components/landing/SmoothScroll";
import CustomCursor from "@/components/landing/CustomCursor";
import Preloader from "@/components/landing/Preloader";
import LandingNav from "@/components/landing/LandingNav";
import ScrollProgressRail from "@/components/landing/ScrollProgressRail";
import HeroSection from "@/components/landing/HeroSection";
import StatementSection from "@/components/landing/StatementSection";
import Cue01Bureaus from "@/components/landing/Cue01Bureaus";
import Cue02PlatformStages from "@/components/landing/Cue02PlatformStages";
import Cue03OverlapDemo from "@/components/landing/Cue03OverlapDemo";
import Cue04Personas from "@/components/landing/Cue04Personas";
import Cue05Impact from "@/components/landing/Cue05Impact";
import Cue06Security from "@/components/landing/Cue06Security";
import TechMarquee from "@/components/landing/TechMarquee";
import TrackComplaintWidget from "@/components/landing/TrackComplaintWidget";
import FinalCtaSection from "@/components/landing/FinalCtaSection";
import LandingFooter from "@/components/landing/LandingFooter";
import DemoModal from "@/components/landing/DemoModal";

export default function LandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-canvas text-canvas-text selection:bg-saffron/30 selection:text-white overflow-x-hidden film-grain">
        {/* 2.2s cinematic preloader with beam-strike and logo draw */}
        <Preloader onComplete={() => {}} />

        {/* Top navigation with ticking IST clock and CTAs */}
        <LandingNav onRequestDemo={() => setIsDemoModalOpen(true)} />

        {/* Vertical left-side rail tracking CUE 01 to CUE 06 */}
        <ScrollProgressRail />

        {/* Main page content sections */}
        <main className="relative z-10">
          {/* Hero section */}
          <HeroSection onRequestDemo={() => setIsDemoModalOpen(true)} />

          {/* Statement section */}
          <StatementSection />

          {/* CUE 01 — Bureaus we connect */}
          <Cue01Bureaus />

          {/* CUE 02 — The platform, end to end */}
          <Cue02PlatformStages />

          {/* CUE 03 — Overlap without deletion (Centerpiece) */}
          <Cue03OverlapDemo />

          {/* CUE 04 — Built for every stakeholder */}
          <Cue04Personas />

          {/* CUE 05 — Measurable transformation */}
          <Cue05Impact />

          {/* CUE 06 — Security & statutory governance */}
          <Cue06Security />

          {/* Infinite technical architecture marquee */}
          <TechMarquee />

          {/* Public complaint tracking lookup widget */}
          <TrackComplaintWidget />

          {/* Final Call to Action */}
          <FinalCtaSection onRequestDemo={() => setIsDemoModalOpen(true)} />
        </main>

        {/* Studio-grade 4-column footer */}
        <LandingFooter />

        {/* Enterprise Demo Request Modal */}
        <DemoModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
        />
      </div>
    </SmoothScroll>
  );
}
