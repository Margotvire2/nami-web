"use client";

import Link from "next/link";
import type { PatientCareCaseHubDocument } from "@/lib/api";

interface HubDocumentsSectionProps {
  documents: PatientCareCaseHubDocument[];
}

const DOC_TYPE_LABEL: Record<string, string> = {
  PRESCRIPTION: "Ordonnance",
  REPORT: "Compte-rendu",
  BIOLOGICAL_REPORT: "Bilan biologique",
  IMAGING: "Imagerie",
  CERTIFICATE: "Certificat",
  CONSENT: "Consentement",
  OTHER: "Document",
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function HubDocumentsSection({ documents }: HubDocumentsSectionProps) {
  const headingId = "hub-documents-heading";

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
          Mes documents
        </h2>
        <Link
          href="/mes-documents"
          style={{
            fontSize: 12,
            color: "#5B4EC4",
            fontFamily: "var(--font-inter)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Voir tout
        </Link>
      </div>

      {documents.length === 0 ? (
        <p
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Aucun document partagé pour ce parcours.
        </p>
      ) : (
        <ul
          role="list"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {documents.map((d) => (
            <li
              key={d.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: "#FAFAF8",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1A1A2E",
                    fontFamily: "var(--font-jakarta)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 8px",
                      borderRadius: 8,
                      background: "#F5F3EF",
                      color: "#6B7280",
                      fontSize: 11,
                      fontFamily: "var(--font-inter)",
                      fontWeight: 500,
                    }}
                  >
                    {DOC_TYPE_LABEL[d.documentType] ?? d.documentType}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      fontFamily: "var(--font-inter)",
                      alignSelf: "center",
                    }}
                  >
                    Ajouté le {formatDate(d.createdAt)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
