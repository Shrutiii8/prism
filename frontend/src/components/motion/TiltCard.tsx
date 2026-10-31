"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverGlow?: boolean;
}

export default function TiltCard({
  children,
  className = "",
  onClick,
  hoverGlow = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), {
    damping: 20,
    stiffness: 250,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), {
    damping: 20,
    stiffness: 250,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-xl border border-hairline bg-canvas-card backdrop-blur-md p-5 transition-all duration-300 hover:border-hairline-strong shadow-soft dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Dynamic Cursor Spectrum Glow (Subtle in light, luminous in dark) */}
      {hoverGlow && isHovered && (
        <div
          className="absolute inset-0 -z-10 rounded-xl opacity-40 blur-xl transition-opacity pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(242,140,40,0.12), rgba(59,130,246,0.08), transparent 70%)",
          }}
        />
      )}

      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent pointer-events-none" />

      {children}
    </motion.div>
  );
}
