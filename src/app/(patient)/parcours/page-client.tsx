"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  computeGlobalProgress,
  type ParcoursPhase as ParcoursPhaseType,
  type ParcoursStep,
  type PhaseStatus,
  type StepStatus,
} from "./mock-data";
import { ParcoursHero } from "./ParcoursHero";
import { ParcoursPhase } from "./ParcoursPhase";
import { ParcoursEmptyState } from "./ParcoursEmptyState";
import { ParcoursCareCaseCard } from "./ParcoursCareCaseCard";
import { usePatientPathway } from "@/hooks/usePatientPathway";
import type {
  PatientPathwayPhase,
  PatientPathwayStep,
  PatientPathwayStepStatus,
  PatientPathwaySummary,
} from "@/lib/api";

// ─── Adapter backend → types UI existants ────────────────────────────────────
// Backend retourne `'completed' | 'in_progress' | 'upcoming'` côté step et phase.
// L'UI existante utilise `'done' | 'in_progress' | 'pending'` pour les steps et
// `'completed' | 'active' | 'upcoming'` pour les phases. On adapte ici plutôt que
// refactor les composants — pattern minimum-touch /suivi (PR #110).

function mapStepStatus(s: PatientPathwayStepStatus): StepStatus {
  if (s === "completed") return "done";
  if (s === "in_progress") return "in_progress";
  return "pending";
}

function mapPhaseStatus(s: PatientPathwayStepStatus): PhaseStatus {
  if (s === "completed") return "completed";
  if (s === "in_progress") return "active";
  return "upcoming";
}

function backendStepToUI(s: PatientPathwayStep): ParcoursStep {
  return {
    id: s.id,
    label: s.label,
    status: mapStepStatus(s.status),
    date: s.completedAt ?? undefined,
  };
}

function backendPhaseToUI(
  p: PatientPathwayPhase,
  index: number,
): ParcoursPhaseType {
  return {
    id: `phase-${index}`,
    title: p.label,
    status: mapPhaseStatus(p.status),
    steps: p.steps.map(backendStepToUI),
  };
}

const PAGE_LAYOUT = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "32px 0 96px",
} as const;

export function ParcoursPageClient() {
  const { data, isLoading, error } = usePatientPathway();
  const searchParams = useSearchParams();
  const careCaseQuery = searchParams.get("careCase");

  // Concept multi-CareCase acté 30/05 : un patient peut avoir N parcours
  // actifs simultanés. Trois branches :
  //   a) 0 parcours → ParcoursEmptyState
  //   b) 1 parcours (ou ?careCase=<id> qui matche) → vue phases (mode unique)
  //   c) N parcours sans sélection → liste de cartes "Mes parcours"
  const pathways: PatientPathwaySummary[] = useMemo(
    () => data ?? [],
    [data],
  );

  const selectedPathway = useMemo<PatientPathwaySummary | null>(() => {
    if (pathways.length === 0) return null;
    if (careCaseQuery) {
      const match = pathways.find((p) => p.careCaseId === careCaseQuery);
      if (match) return match;
    }
    if (pathways.length === 1) return pathways[0];
    return null;
  }, [pathways, careCaseQuery]);

  const phases: ParcoursPhaseType[] = useMemo(
    () => (selectedPathway ? selectedPathway.phases.map(backendPhaseToUI) : []),
    [selectedPathway],
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

  if (isLoading) {
    return (
      <main aria-label="Mon parcours de soins" style={PAGE_LAYOUT}>
        <p
          role="status"
          aria-live="polite"
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "#6B7280",
            fontSize: 14,
          }}
        >
          Chargement de votre parcours…
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main aria-label="Mon parcours de soins" style={PAGE_LAYOUT}>
        <p
          role="alert"
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "#6B7280",
            fontSize: 14,
          }}
        >
          Impossible de charger votre parcours pour le moment. Réessayez plus
          tard.
        </p>
      </main>
    );
  }

  // Branche A — 0 parcours actif
  if (pathways.length === 0) {
    return (
      <main aria-label="Mon parcours de soins" style={PAGE_LAYOUT}>
        <ParcoursEmptyState />
      </main>
    );
  }

  // Branche C — N parcours, pas de sélection : liste de cartes
  if (!selectedPathway) {
    return (
      <main aria-label="Mes parcours" style={PAGE_LAYOUT}>
        <ParcoursHero
          title="Mes parcours"
          subtitle={`Vous avez ${pathways.length} suivis actifs avec différentes équipes.`}
        />

        <section
          aria-label="Liste de mes parcours"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 16,
          }}
        >
          {pathways.map((pw) => (
            <ParcoursCareCaseCard key={pw.careCaseId} pathway={pw} />
          ))}
        </section>

        {/* Footer MDR obligatoire — Nami n'est pas un dispositif médical */}
        <p
          style={{
            marginTop: 48,
            fontSize: 12,
            color: "#9CA3AF",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Nami n&apos;est pas un dispositif médical. Les étapes ci-dessus
          reflètent l&apos;organisation de votre dossier de coordination.
        </p>
      </main>
    );
  }

  // Branche B — pathway unique : phases (avec progression)
  if (phases.length === 0) {
    return (
      <main aria-label="Mon parcours de soins" style={PAGE_LAYOUT}>
        <ParcoursEmptyState />
      </main>
    );
  }

  return (
    <main aria-label={selectedPathway.careCaseTitle} style={PAGE_LAYOUT}>
      <ParcoursHero
        title={selectedPathway.careCaseTitle}
        current={progress.current}
        total={progress.total}
      />

      <section
        aria-label="Phases du parcours"
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {phases.map((phase) => (
          <ParcoursPhase
            key={phase.id}
            phase={phase}
            isOpen={expandedPhaseId === phase.id}
            onToggle={() => togglePhase(phase.id)}
          />
        ))}
      </section>

      {/* Footer MDR obligatoire — Nami n'est pas un dispositif médical */}
      <p
        style={{
          marginTop: 48,
          fontSize: 12,
          color: "#9CA3AF",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Nami n&apos;est pas un dispositif médical. Les étapes ci-dessus reflètent
        l&apos;organisation de votre dossier de coordination.
      </p>
    </main>
  );
}
