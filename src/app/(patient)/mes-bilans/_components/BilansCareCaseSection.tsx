"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HubLinkButton } from "@/components/patient/HubLinkButton";
import type { PatientBilan, PatientCareCaseSummary } from "@/lib/api";
import { BilanCard } from "./BilanCard";

interface BilansCareCaseSectionProps {
  careCase: PatientCareCaseSummary;
  bilans: PatientBilan[];
}

/**
 * Section d'un CareCase pour la vue /mes-bilans : header (titre + HubLinkButton
 * vers /parcours/[id]#bilans) + liste compacte des bilans rattachés.
 *
 * Cohérence Sprint V1.1 :
 *   - réutilise le pattern PR #112 (mes-soignants CareCaseSection)
 *   - réutilise HubLinkButton (PR #133) pour ramener au hub /parcours/[id]
 *
 * Wording MDR-safe : "parcours de soins" est autorisé (libellé administratif).
 * On évite tout terme clinique (suspicion, diagnostic, pathologie, etc.).
 */
export function BilansCareCaseSection({
  careCase,
  bilans,
}: BilansCareCaseSectionProps) {
  const headerId = `bilans-care-case-${careCase.id}-title`;
  const count = bilans.length;

  return (
    <section
      aria-labelledby={headerId}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <h2
          id={headerId}
          style={{
            fontFamily:
              '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: "#1A1A2E",
            letterSpacing: "-0.3px",
          }}
        >
          {careCase.caseTitle}
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            {count === 0
              ? "Aucun bilan"
              : `${count} bilan${count > 1 ? "s" : ""}`}
          </span>
          <HubLinkButton
            careCaseId={careCase.id}
            careCaseLabel={careCase.caseTitle}
            sectionAnchor="bilans"
          />
        </div>
      </div>

      {count === 0 ? (
        <p
          style={{
            fontSize: 13,
            color: "#6B7280",
            background: "#FFFFFF",
            border: "1px solid rgba(26,26,46,0.06)",
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          Aucun bilan n&apos;est rattaché à ce parcours pour le moment.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bilans.map((bilan, idx) => (
            <ScrollReveal
              key={bilan.id}
              variant="fade-up"
              delay={idx * 0.05}
              duration={0.45}
            >
              <BilanCard bilan={bilan} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </section>
  );
}
