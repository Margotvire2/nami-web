"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PatientDocument } from "@/lib/api";
import { DocumentCard } from "./DocumentCard";

/**
 * Un sous-groupe d'echanges DM 1:1 avec un soignant donne. `otherPersonId`
 * peut etre null si on ne sait pas identifier formellement l'interlocuteur
 * (cas de fallback ou l'uploader est le seul indice).
 */
export interface DmGroup {
  /** Person.id de l'interlocuteur soignant (peut etre null si inconnu). */
  otherPersonId: string | null;
  /** Nom affichable de l'interlocuteur (prerempli cote page). */
  otherName: string;
  /** Tous les documents echanges en DM avec cet interlocuteur. */
  documents: PatientDocument[];
}

interface DocumentsDmSectionProps {
  /** Groupes par interlocuteur soignant (ordre = ordre d'affichage). */
  groups: DmGroup[];
}

/**
 * Section dediee aux documents echanges en DM 1:1 entre le patient et un
 * soignant (Document.directRecipientPersonId set, XOR avec careCaseId).
 *
 * Symetrique a la section channels DM cote messages (PR #130) : un
 * sous-groupe par soignant, pas de HubLinkButton (les DM ne sont pas
 * rattaches a un parcours).
 *
 * Wording MDR-safe : "Documents prives", "interlocuteur", aucun terme
 * clinique ou de surveillance.
 */
export function DocumentsDmSection({ groups }: DocumentsDmSectionProps) {
  const headerId = "documents-dm-title";
  const totalCount = groups.reduce((acc, g) => acc + g.documents.length, 0);

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
          Documents privés
        </h2>
        <span style={{ fontSize: 13, color: "#6B7280", flexShrink: 0 }}>
          {totalCount} document{totalCount > 1 ? "s" : ""}
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
        Échanges en privé avec un soignant en particulier (hors équipe).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {groups.map((group, gIdx) => {
          const subHeaderId = `documents-dm-${group.otherPersonId ?? `idx-${gIdx}`}-title`;
          const count = group.documents.length;
          return (
            <div
              key={group.otherPersonId ?? `dm-${gIdx}`}
              aria-labelledby={subHeaderId}
              role="group"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <h3
                  id={subHeaderId}
                  style={{
                    fontFamily:
                      'var(--font-jakarta), system-ui, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    letterSpacing: "-0.2px",
                  }}
                >
                  {group.otherName}
                </h3>
                <span style={{ fontSize: 12, color: "#6B7280", flexShrink: 0 }}>
                  {count} document{count > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.documents.map((doc, idx) => (
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
