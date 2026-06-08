"use client";

import { useState } from "react";
import { getPhaseLabel } from "@/lib/pathwayFamilyLabels";
import { toRoman } from "@/lib/parcours";
import type { PhaseGroup as PhaseGroupType } from "@/lib/parcours";
import { ConsultationRow } from "./ConsultationRow";

interface PhaseGroupProps {
  group: PhaseGroupType;
  phaseIndex: number;
  defaultOpen?: boolean;
}

export function PhaseGroup({ group, phaseIndex, defaultOpen = false }: PhaseGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const label = getPhaseLabel(group.label);
  const roman = toRoman(phaseIndex + 1);
  const doneCount = group.steps.filter((s) => s.state === "done").length;
  const total = group.steps.length;

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Phase header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px 0",
          textAlign: "left",
        }}
        aria-expanded={open}
      >
        {/* Roman numeral */}
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--violet)",
          letterSpacing: "0.04em",
          minWidth: 20,
          textAlign: "center",
          flexShrink: 0,
        }}>
          {roman}
        </span>

        {/* Phase label */}
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11.5,
          fontWeight: 800,
          color: "var(--ink-2)",
          textTransform: "uppercase",
          letterSpacing: "0.09em",
          flex: 1,
        }}>
          {label}
        </span>

        {/* Meta */}
        <span style={{
          fontSize: 11,
          color: "var(--ink-faint)",
          fontFamily: "var(--font-ui)",
          flexShrink: 0,
        }}>
          {doneCount}/{total}
        </span>

        {/* Chevron */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 260ms cubic-bezier(.16,1,.3,1)",
            flexShrink: 0,
          }}
          aria-hidden
        >
          <polyline points="2 5 7 10 12 5" />
        </svg>
      </button>

      {/* Steps */}
      {open && (
        <div style={{ paddingLeft: 4 }}>
          {group.steps.map((step, i) => (
            <ConsultationRow
              key={step.id}
              step={step}
              isLast={i === group.steps.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
