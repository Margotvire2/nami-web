"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { ParcoursStep, StepStatus } from "./mock-data";

interface ParcoursStepsListProps {
  steps: ParcoursStep[];
}

const STEP_STATUS_CONFIG: Record<
  StepStatus,
  {
    label: string;
    color: string;
    icon: typeof CheckCircle2;
  }
> = {
  done: {
    label: "Étape terminée",
    color: "#065F46",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "Étape en cours",
    color: "#5B4EC4",
    icon: Loader2,
  },
  pending: {
    label: "Étape à venir",
    color: "#9CA3AF",
    icon: Circle,
  },
};

function formatStepDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function ParcoursStepsList({ steps }: ParcoursStepsListProps) {
  if (steps.length === 0) {
    return (
      <p
        style={{
          fontSize: 13,
          color: "#9CA3AF",
          fontStyle: "italic",
          margin: 0,
        }}
      >
        Aucune étape pour le moment.
      </p>
    );
  }

  return (
    <ul
      role="list"
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {steps.map((step) => {
        const config = STEP_STATUS_CONFIG[step.status];
        const StepIcon = config.icon;
        const dateFormatted = formatStepDate(step.date);
        const ariaLabel = dateFormatted
          ? `${step.label} — ${config.label} — ${dateFormatted}`
          : `${step.label} — ${config.label}`;

        return (
          <li
            key={step.id}
            aria-label={ariaLabel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 0",
            }}
          >
            <span
              role="status"
              aria-label={config.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: config.color,
                flexShrink: 0,
              }}
            >
              <StepIcon size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 14,
                color: step.status === "pending" ? "#6B7280" : "#1A1A2E",
                fontFamily: "var(--font-inter)",
              }}
            >
              {step.label}
            </span>
            {dateFormatted ? (
              <span
                aria-hidden="true"
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  fontFamily: "var(--font-inter)",
                  flexShrink: 0,
                }}
              >
                {dateFormatted}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
