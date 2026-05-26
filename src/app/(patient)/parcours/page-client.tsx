"use client";

import { useMemo, useState } from "react";
import {
  MOCK_PARCOURS,
  computeGlobalProgress,
  type ParcoursPhase as ParcoursPhaseType,
} from "./mock-data";
import { ParcoursHero } from "./ParcoursHero";
import { ParcoursPhase } from "./ParcoursPhase";
import { ParcoursEmptyState } from "./ParcoursEmptyState";

export function ParcoursPageClient() {
  const phases: ParcoursPhaseType[] = MOCK_PARCOURS;

  // Phase active ouverte par défaut
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

  if (phases.length === 0) {
    return (
      <main
        aria-label="Mon parcours de soins"
        style={{ maxWidth: 720, margin: "0 auto", padding: "32px 0 96px" }}
      >
        {/* Banner V1 — transparence dev, pas de promesse, pas de DGCCRF */}
        <div
          role="note"
          aria-label="Information version d'aperçu"
          style={{
            background: "rgba(91,78,196,0.08)",
            border: "1px solid rgba(91,78,196,0.2)",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 13,
            color: "#374151",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ fontWeight: 600, color: "#1A1A2E" }}>
            Aperçu de votre parcours
          </strong>{" "}
          — cette page affiche un aperçu de l&apos;expérience, la connexion à
          votre suivi réel arrive très bientôt.
        </div>
        <ParcoursEmptyState />
      </main>
    );
  }

  return (
    <main
      aria-label="Mon parcours de soins"
      style={{ maxWidth: 720, margin: "0 auto", padding: "32px 0 96px" }}
    >
      {/* Banner V1 — transparence dev, pas de promesse, pas de DGCCRF */}
      <div
        role="note"
        aria-label="Information version d'aperçu"
        style={{
          background: "rgba(91,78,196,0.08)",
          border: "1px solid rgba(91,78,196,0.2)",
          borderRadius: 12,
          padding: "10px 16px",
          fontSize: 13,
          color: "#374151",
          marginBottom: 24,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ fontWeight: 600, color: "#1A1A2E" }}>
          Aperçu de votre parcours
        </strong>{" "}
        — cette page affiche un aperçu de l&apos;expérience, la connexion à
        votre suivi réel arrive très bientôt.
      </div>

      <ParcoursHero current={progress.current} total={progress.total} />

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
    </main>
  );
}
