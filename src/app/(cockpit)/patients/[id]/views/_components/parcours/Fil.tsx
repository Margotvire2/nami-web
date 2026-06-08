"use client";

import { useRef, useEffect } from "react";

interface FilProps {
  /** Hauteur totale du fil en px — calculée dynamiquement par le parent */
  height?: number;
  className?: string;
}

export function Fil({ height = 0, className = "" }: FilProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el || height === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { el.style.strokeDashoffset = "0"; return; }
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.style.transition = "none";
    requestAnimationFrame(() => {
      el.style.transition = `stroke-dashoffset 900ms cubic-bezier(.16,1,.3,1)`;
      el.style.strokeDashoffset = "0";
    });
  }, [height]);

  if (height === 0) {
    return <div className={`fil-line ${className}`} style={{ minHeight: 40, alignSelf: "stretch" }} />;
  }

  return (
    <svg
      width="3"
      height={height}
      viewBox={`0 0 3 ${height}`}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="fil-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--violet)" />
          <stop offset="100%" stopColor="var(--teal)" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={`M1.5 0 L1.5 ${height}`}
        stroke="url(#fil-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
