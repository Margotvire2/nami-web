"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PatientBilan } from "@/lib/api";
import { BilanCard } from "./BilanCard";

interface BilansOrphanSectionProps {
  bilans: PatientBilan[];
}

/**
 * Section pour les bilans qui ne sont rattachés à AUCUN CareCase actif
 * du patient (orphans). Utilisé en complément des BilansCareCaseSection.
 *
 * Cas d'usage : un bilan a été uploadé avant la création d'un parcours, ou
 * son CareCase a été clos (statut != ACTIVE) côté soignant.
 *
 * Wording MDR-safe : pas de "non rattaché", pas de "à vérifier" — on parle
 * uniquement de "hors parcours" (libellé administratif neutre).
 */
export function BilansOrphanSection({ bilans }: BilansOrphanSectionProps) {
  const headerId = "bilans-orphan-title";
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
          Bilans hors parcours
        </h2>
        <span style={{ fontSize: 13, color: "#6B7280", flexShrink: 0 }}>
          {count} bilan{count > 1 ? "s" : ""}
        </span>
      </div>

      <p
        style={{
          fontSize: 12,
          color: "#6B7280",
          lineHeight: 1.5,
          marginBottom: 4,
        }}
      >
        Ces bilans ne sont pas encore associés à un parcours spécifique.
      </p>

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
    </section>
  );
}
