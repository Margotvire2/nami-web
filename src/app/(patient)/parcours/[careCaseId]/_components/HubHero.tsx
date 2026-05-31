"use client";

import type { PatientCareCaseHubInfo } from "@/lib/api";

interface HubHeroProps {
  careCase: PatientCareCaseHubInfo;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Suivi en cours",
  CLOSED: "Suivi terminé",
  ARCHIVED: "Archivé",
  ON_HOLD: "En pause",
};

export function HubHero({ careCase }: HubHeroProps) {
  const startedAt = formatDate(careCase.startDate);
  const statusLabel = STATUS_LABEL[careCase.status] ?? careCase.status;

  return (
    <header style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#1A1A2E",
          letterSpacing: "-0.02em",
          marginBottom: 8,
          fontFamily: "var(--font-jakarta)",
          lineHeight: 1.2,
        }}
      >
        {careCase.patientFacingTitle}
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "#6B7280",
          lineHeight: 1.5,
          marginBottom: 16,
        }}
      >
        Toutes les informations de ce parcours, organisées au même endroit
        pour vous et votre équipe.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
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
          {statusLabel}
        </span>
        {startedAt ? (
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
            Commencé le {startedAt}
          </span>
        ) : null}
        {careCase.organizationName ? (
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
            {careCase.organizationName}
          </span>
        ) : null}
      </div>
    </header>
  );
}
