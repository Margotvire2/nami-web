"use client";

import { useState } from "react";
import type { StepState, UnifiedStep } from "@/lib/parcours";
import { labelSpecialty } from "@/lib/pcr-labels";
import { BriefCard } from "./BriefCard";

const STATE_CFG: Record<StepState, { label: string; knotStyle: React.CSSProperties; labelColor: string }> = {
  done: {
    label: "Faite",
    knotStyle: { background: "var(--violet)", borderColor: "var(--violet)" },
    labelColor: "var(--ink-3)",
  },
  current: {
    label: "À proposer cette semaine",
    knotStyle: {
      background: "var(--surface)",
      borderColor: "var(--violet)",
      boxShadow: "0 0 0 3px rgba(91,78,196,0.18)",
    },
    labelColor: "var(--violet)",
  },
  upcoming: {
    label: "À planifier",
    knotStyle: { background: "var(--surface)", borderColor: "var(--line-2)" },
    labelColor: "var(--ink-faint)",
  },
  conditional: {
    label: "Si critère réuni",
    knotStyle: {
      background: "var(--surface)",
      borderColor: "var(--line-2)",
      borderStyle: "dashed",
    },
    labelColor: "var(--ink-faint)",
  },
};

const ACT_TYPE_FR: Record<string, string> = {
  CONSULTATION: "Consultation",
  BILAN: "Bilan",
  QUESTIONNAIRE: "Questionnaire",
  PRESCRIPTION: "Prescription",
  SUIVI: "Suivi",
  DOCUMENT: "Document",
  RCP: "RCP",
  PSYCHOTHERAPIE: "Psychothérapie",
  EDUCATION: "Éducation thérapeutique",
};

interface ConsultationRowProps {
  step: UnifiedStep;
  isLast: boolean;
}

export function ConsultationRow({ step, isLast }: ConsultationRowProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATE_CFG[step.state];
  const hasProtocol = !!step.protocolContent || step.state !== "done";
  const specialty = labelSpecialty(step.specialty);
  const actTypeLabel = ACT_TYPE_FR[step.clinicalActType] ?? step.clinicalActType;

  return (
    <div>
      <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
        {/* Fil column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
          {/* knot */}
          <div
            className="fil-knot"
            style={{
              ...cfg.knotStyle,
              marginTop: 14,
              transition: "border-color 260ms, box-shadow 260ms",
            }}
          />
          {/* fil segment below knot */}
          {!isLast && (
            <div
              className="fil-line"
              style={{ flex: 1, minHeight: 24, marginTop: 4 }}
            />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 4 }}>
          <button
            onClick={() => hasProtocol && setExpanded((v) => !v)}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "flex-start",
              gap: 10,
              background: "none",
              border: "none",
              cursor: hasProtocol ? "pointer" : "default",
              padding: "10px 0 6px",
              textAlign: "left",
            }}
            aria-expanded={expanded}
          >
            {/* Act badge */}
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "2px 7px",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line)",
              color: "var(--ink-3)",
              fontFamily: "var(--font-ui)",
              flexShrink: 0,
              marginTop: 1,
            }}>
              {actTypeLabel}
            </span>

            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                fontWeight: 700,
                color: step.state === "done" ? "var(--ink-3)" : "var(--ink)",
                margin: "0 0 2px",
                lineHeight: 1.3,
                textDecoration: step.state === "done" ? "line-through" : "none",
              }}>
                {step.actLabel}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {specialty !== "—" && (
                  <span style={{ fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--font-ui)" }}>
                    {specialty}
                  </span>
                )}
                {!step.isRequired && (
                  <span style={{ fontSize: 10.5, color: "var(--ink-faint)", fontStyle: "italic" }}>
                    Non automatique
                  </span>
                )}
              </div>
            </div>

            {/* State label */}
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-ui)",
              color: cfg.labelColor,
              flexShrink: 0,
              marginTop: 2,
              transition: "color 260ms",
            }}>
              {cfg.label}
            </span>

            {/* Chevron si expandable */}
            {hasProtocol && (
              <svg
                width="13"
                height="13"
                viewBox="0 0 14 14"
                fill="none"
                stroke="var(--ink-faint)"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 260ms cubic-bezier(.16,1,.3,1)",
                  flexShrink: 0,
                  marginTop: 3,
                }}
                aria-hidden
              >
                <polyline points="2 5 7 10 12 5" />
              </svg>
            )}
          </button>

          {/* Brief expanded in-place */}
          {expanded && (
            <BriefCard
              actLabel={step.actLabel}
              clinicalActType={step.clinicalActType}
              protocol={step.protocolContent}
            />
          )}
        </div>
      </div>
    </div>
  );
}
