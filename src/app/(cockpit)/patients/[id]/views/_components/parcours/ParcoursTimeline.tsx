"use client";

import type { PathwayNode, PathwayTemplateStep } from "@/lib/api";
import { buildUnifiedSteps, groupStepsByPhase } from "@/lib/parcours";
import { PhaseGroup } from "./PhaseGroup";
import { ParcoursHeader } from "./ParcoursHeader";

interface CareCasePathwayMeta {
  pathway: {
    id: string;
    key: string;
    label: string;
    family: string;
  } | null;
  startedAt: string | null;
  dayInPathway: number;
  summary: {
    total: number;
    completed: number;
    overdue: number;
    inWindow: number;
    skipped: number;
    pending: number;
  } | null;
}

interface ParcoursTimelineProps {
  meta: CareCasePathwayMeta;
  templateSteps: PathwayTemplateStep[];
  nodes: PathwayNode[];
  selectedStepId?: string | null;
  onSelectStep?: (id: string) => void;
}

export function ParcoursTimeline({ meta, templateSteps, nodes, selectedStepId, onSelectStep }: ParcoursTimelineProps) {
  const isBlueprint = !meta.startedAt || nodes.length === 0;
  const unifiedSteps = buildUnifiedSteps(templateSteps, nodes);
  const phases = groupStepsByPhase(unifiedSteps);

  const pathway = meta.pathway;
  if (!pathway || templateSteps.length === 0) {
    return (
      <div
        className="card"
        style={{ padding: "32px 24px", textAlign: "center" }}
      >
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--ink-2)", margin: "0 0 8px" }}>
          Aucun parcours configuré
        </h3>
        <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
          Associez un template de parcours à ce dossier pour visualiser les étapes.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ParcoursHeader
        pathwayLabel={pathway.label}
        pathwayFamily={pathway.family}
        startedAt={meta.startedAt}
        dayInPathway={meta.dayInPathway}
        summary={meta.summary}
        isBlueprint={isBlueprint}
        totalSteps={templateSteps.length}
      />

      {/* Phases */}
      <div className="card" style={{ padding: "12px 20px" }}>
        {phases.length === 0 ? (
          <EmptyPhases />
        ) : (
          phases.map((group, idx) => (
            <PhaseGroup
              key={group.label}
              group={group}
              phaseIndex={idx}
              defaultOpen={idx === 0}
              selectedStepId={selectedStepId}
              onSelectStep={onSelectStep}
            />
          ))
        )}

        {/* Footer légal */}
        <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <p className="legal" style={{ textAlign: "center" }}>
            Outil de coordination · Non dispositif médical · Conforme RGPD
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyPhases() {
  return (
    <div className="empty" style={{ padding: "24px 0", textAlign: "center" }}>
      <h4 style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--ink-2)", margin: "0 0 6px" }}>
        Protocole en attente de validation
      </h4>
      <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
        Cette consultation sera enrichie après revue clinique.
      </p>
    </div>
  );
}
