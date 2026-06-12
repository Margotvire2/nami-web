"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HubLinkButton } from "@/components/patient/HubLinkButton";
import type { PatientCareCaseSummary, PatientDocument } from "@/lib/api";
import { DocumentCard } from "./DocumentCard";
import { formatCareCaseLabel } from "@/lib/carecase-labels";

interface DocumentsCareCaseSectionProps {
  careCase: PatientCareCaseSummary;
  documents: PatientDocument[];
  /**
   * Libelle patient-facing alternatif (ex. `patientFacingTitle`) si
   * disponible plus tard cote backend. Fallback : `careCase.caseTitle`.
   */
  patientFacingTitle?: string | null;
}

/**
 * Section d'un CareCase pour la vue /mes-documents : header (titre du parcours
 * + count + HubLinkButton vers /parcours/[id]#documents) + liste compacte
 * des documents rattaches a ce parcours.
 *
 * Coherence Sprint V1.1 :
 *   - meme structure visuelle que `BilansCareCaseSection` (PR mes-bilans grouping)
 *     et `CareCaseSection` mes-soignants (PR #112)
 *   - HubLinkButton (PR #133) pour ramener au hub /parcours/[id]
 *   - aria-labelledby pour l'a11y
 *
 * Wording MDR-safe : "parcours" est un libelle administratif autorise. Aucun
 * terme clinique (suspicion, diagnostic, pathologie) n'apparait ici.
 */
export function DocumentsCareCaseSection({
  careCase,
  documents,
  patientFacingTitle,
}: DocumentsCareCaseSectionProps) {
  const headerId = `documents-care-case-${careCase.id}-title`;
  const count = documents.length;
  const title = patientFacingTitle ?? formatCareCaseLabel(careCase.caseTitle);

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
          {title}
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
              ? "Aucun document"
              : `${count} document${count > 1 ? "s" : ""}`}
          </span>
          <HubLinkButton
            careCaseId={careCase.id}
            careCaseLabel={title}
            sectionAnchor="documents"
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
          Aucun document n&apos;est rattaché à ce parcours pour le moment.
        </p>
      ) : (
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
      )}
    </section>
  );
}
