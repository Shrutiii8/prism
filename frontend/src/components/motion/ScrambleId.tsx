"use client";

import React, { useState, useEffect } from "react";

interface ScrambleIdProps {
  id?: string;
  value?: string;
  className?: string;
  triggerOnHover?: boolean;
}

const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&_/";

export default function ScrambleId({
  id,
  value,
  className = "",
  triggerOnHover = true,
}: ScrambleIdProps) {
  const targetText = String(id ?? value ?? "");
  const [displayText, setDisplayText] = useState(targetText);
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    setDisplayText(targetText);
  }, [targetText]);

  const runScramble = () => {
    if (!targetText || isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() =>
        targetText
          .split("")
          .map((char, index) => {
            if (char === "-" || char === "/" || char === " ") return char;
            if (index < iteration) {
              return targetText[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= targetText.length) {
        clearInterval(interval);
        setDisplayText(targetText);
        setIsScrambling(false);
      }
      iteration += 1.5;
    }, 28);
  };

  useEffect(() => {
    if (targetText) {
      runScramble();
    }
  }, [targetText]);

  if (!targetText) {
    return <span className={`font-mono text-xs text-[#8A8F98] ${className}`}>—</span>;
  }

  return (
    <span
      onMouseEnter={triggerOnHover ? runScramble : undefined}
      className={`font-mono text-xs tracking-wider select-all transition-colors hover:text-saffron cursor-pointer ${className}`}
      title="Hover to scramble / Select to copy"
    >
      {displayText}
    </span>
  );
}
