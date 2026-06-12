"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PatientDocument } from "@/lib/api";
import { DocumentCard } from "./DocumentCard";

interface DocumentsOrphanSectionProps {
  documents: PatientDocument[];
}

/**
 * Section pour les documents qui ne sont rattaches a AUCUN CareCase actif
 * du patient ET qui ne sont pas non plus echanges en DM. Utilise en
 * complement des DocumentsCareCaseSection / DocumentsDmSection.
 *
 * Cas d'usage : un document a ete uploade avant la creation d'un parcours,
 * ou son CareCase a ete clos cote soignant (statut != ACTIVE).
 *
 * Wording MDR-safe : "hors parcours" est neutre administratif, on evite
 * "non rattache" / "a verifier" / "incomplet".
 */
export function DocumentsOrphanSection({
  documents,
}: DocumentsOrphanSectionProps) {
  const headerId = "documents-orphan-title";
  const count = documents.length;

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
              'var(--font-jakarta), system-ui, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: "#1A1A2E",
            letterSpacing: "-0.3px",
          }}
        >
          Documents hors parcours
        </h2>
        <span style={{ fontSize: 13, color: "#6B7280", flexShrink: 0 }}>
          {count} document{count > 1 ? "s" : ""}
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
        Ces documents ne sont pas encore associés à un parcours spécifique.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {documents.map((doc, idx) => (
          <ScrollReveal
            key={doc.id}
            variant="fade-up"
            delay={idx * 0.05}
            duration={0.45}
          >
            <DocumentCard doc={doc} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
