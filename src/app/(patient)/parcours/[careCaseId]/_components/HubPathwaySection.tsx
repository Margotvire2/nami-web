"use client";

import { useMemo, useState } from "react";
import type { PatientPathwaySummary } from "@/lib/api";
import {
  computeGlobalProgress,
  type ParcoursPhase as ParcoursPhaseType,
  type ParcoursStep,
  type PhaseStatus,
  type StepStatus,
} from "../../mock-data";
import { ParcoursPhase } from "../../ParcoursPhase";

interface HubPathwaySectionProps {
  pathway: PatientPathwaySummary | null;
}

// Adapter backend → UI types existants (même mapping que /parcours liste).
function mapStepStatus(s: PatientPathwaySummary["phases"][number]["steps"][number]["status"]): StepStatus {
  if (s === "completed") return "done";
  if (s === "in_progress") return "in_progress";
  return "pending";
}

function mapPhaseStatus(s: PatientPathwaySummary["phases"][number]["status"]): PhaseStatus {
  if (s === "completed") return "completed";
  if (s === "in_progress") return "active";
  return "upcoming";
}

function backendStepToUI(
  s: PatientPathwaySummary["phases"][number]["steps"][number],
): ParcoursStep {
  return {
    id: s.id,
    label: s.label,
    status: mapStepStatus(s.status),
    date: s.completedAt ?? undefined,
  };
}

function backendPhaseToUI(
  p: PatientPathwaySummary["phases"][number],
  index: number,
): ParcoursPhaseType {
  return {
    id: `phase-${index}`,
    title: p.label,
    status: mapPhaseStatus(p.status),
    steps: p.steps.map(backendStepToUI),
  };
}

export function HubPathwaySection({ pathway }: HubPathwaySectionProps) {
  const phases: ParcoursPhaseType[] = useMemo(
    () => (pathway ? pathway.phases.map(backendPhaseToUI) : []),
    [pathway],
  );

  const defaultOpenId = useMemo(
    () => phases.find((p) => p.status === "active")?.id ?? null,
    [phases],
  );
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(
    defaultOpenId,
  );

  const progress = useMemo(() => computeGlobalProgress(phases), [phases]);
  const togglePhase = (id: string) => {
    setExpandedPhaseId((prev) => (prev === id ? null : id));
  };

  const headingId = "hub-pathway-heading";

  if (!pathway || phases.length === 0) {
    return (
      <section
        aria-labelledby={headingId}
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(26,26,46,0.06)",
          borderRadius: 16,
          padding: "20px 24px",
        }}
      >
        <h2
          id={headingId}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1A1A2E",
            fontFamily: "var(--font-jakarta)",
            marginBottom: 12,
          }}
        >
          Étapes du parcours
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Aucune étape planifiée pour le moment.
        </p>
      </section>
    );
  }

  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <section
      aria-labelledby={headingId}
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h2
          id={headingId}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1A1A2E",
            fontFamily: "var(--font-jakarta)",
            margin: 0,
          }}
        >
          Étapes du parcours
        </h2>
        <span
          style={{
            fontSize: 12,
            color: "#5B4EC4",
            fontFamily: "var(--font-inter)",
            fontWeight: 600,
          }}
          aria-label={`Progression : ${progress.current} sur ${progress.total} phases`}
        >
          {progress.current}/{progress.total} · {percent}%
        </span>
      </div>

      {/* Barre de progression */}
      <div
        role="progressbar"
        aria-valuenow={progress.current}
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuetext={`${progress.current} sur ${progress.total} phases engagées`}
        style={{
          position: "relative",
          height: 6,
          background: "rgba(91,78,196,0.08)",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${percent}%`,
            background: "linear-gradient(90deg, #5B4EC4 0%, #7B6FD9 100%)",
            borderRadius: 999,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {phases.map((phase) => (
          <ParcoursPhase
            key={phase.id}
            phase={phase}
            isOpen={expandedPhaseId === phase.id}
            onToggle={() => togglePhase(phase.id)}
          />
        ))}
      </div>
    </section>
  );
}
