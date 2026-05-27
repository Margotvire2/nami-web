"use client";

import { ChevronDown, CheckCircle2, Circle, Clock } from "lucide-react";
import type { ParcoursPhase as ParcoursPhaseType, PhaseStatus } from "./mock-data";
import { ParcoursStepsList } from "./ParcoursStepsList";

interface ParcoursPhaseProps {
  phase: ParcoursPhaseType;
  isOpen: boolean;
  onToggle: () => void;
}

const STATUS_CONFIG: Record<
  PhaseStatus,
  {
    label: string;
    color: string;
    background: string;
    border: string;
    icon: typeof CheckCircle2;
  }
> = {
  completed: {
    label: "Terminée",
    color: "#065F46",
    background: "rgba(6,95,70,0.06)",
    border: "rgba(6,95,70,0.18)",
    icon: CheckCircle2,
  },
  active: {
    label: "En cours",
    color: "#5B4EC4",
    background: "rgba(91,78,196,0.08)",
    border: "rgba(91,78,196,0.25)",
    icon: Clock,
  },
  upcoming: {
    label: "À venir",
    color: "#6B7280",
    background: "rgba(107,114,128,0.06)",
    border: "rgba(107,114,128,0.18)",
    icon: Circle,
  },
};

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function ParcoursPhase({ phase, isOpen, onToggle }: ParcoursPhaseProps) {
  const config = STATUS_CONFIG[phase.status];
  const StatusIcon = config.icon;
  const startedAtFormatted = formatDate(phase.startedAt);
  const stepsRegionId = `phase-${phase.id}-steps`;
  const headerId = `phase-${phase.id}-header`;

  return (
    <article
      aria-labelledby={headerId}
      style={{
        background: "#FFFFFF",
        border: `1px solid ${isOpen ? config.border : "rgba(26,26,46,0.06)"}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "border-color 0.2s ease",
        boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
      }}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={stepsRegionId}
        onClick={onToggle}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "#1A1A2E",
        }}
      >
        {/* Icône statut */}
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: config.background,
            color: config.color,
            flexShrink: 0,
          }}
        >
          <StatusIcon size={18} strokeWidth={2} />
        </span>

        {/* Titre + meta */}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontSize: 16,
              fontWeight: 600,
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              marginBottom: 2,
            }}
          >
            {phase.title}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: "#6B7280",
              fontFamily: "var(--font-inter)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: 999,
                background: config.background,
                color: config.color,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {config.label}
            </span>
            {startedAtFormatted ? (
              <span>Démarrée le {startedAtFormatted}</span>
            ) : null}
          </span>
        </span>

        {/* Chevron */}
        <ChevronDown
          size={20}
          strokeWidth={2}
          aria-hidden="true"
          style={{
            color: "#6B7280",
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Région steps */}
      <div
        id={stepsRegionId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isOpen}
        style={{
          borderTop: isOpen
            ? "1px solid rgba(26,26,46,0.06)"
            : "none",
          padding: isOpen ? "16px 20px 20px" : 0,
        }}
      >
        {isOpen ? <ParcoursStepsList steps={phase.steps} /> : null}
      </div>
    </article>
  );
}
