"use client";

import Link from "next/link";
import type { PatientCareCaseOrganization, PatientOrganizationType } from "@/lib/api";

const VISIBLE_KINDS = new Set<PatientOrganizationType>(["NETWORK", "FEDERATION", "CPTS"]);

const KIND_LABEL: Partial<Record<PatientOrganizationType, string>> = {
  NETWORK: "le réseau",
  FEDERATION: "la fédération",
  CPTS: "la CPTS",
};

interface NetworkAwarenessBadgeProps {
  organization: PatientCareCaseOrganization | null | undefined;
}

export function NetworkAwarenessBadge({ organization }: NetworkAwarenessBadgeProps) {
  if (!organization || !VISIBLE_KINDS.has(organization.type)) {
    return null;
  }

  const kindLabel = KIND_LABEL[organization.type] ?? "la structure";

  return (
    <div
      role="note"
      aria-label="Structure de coordination de votre parcours"
      style={{
        marginBottom: 24,
        padding: "16px 18px",
        borderRadius: 16,
        background: "var(--nami-card)",
        border: "1px solid rgba(91,78,196,0.18)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {organization.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={organization.logoUrl}
            alt=""
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid var(--nami-border)",
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(91,78,196,0.16), rgba(43,168,156,0.16))",
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, color: "var(--nami-dark)", lineHeight: 1.45, margin: 0 }}>
            Votre parcours est coordonné via {kindLabel}{" "}
            <strong style={{ fontWeight: 700 }}>{organization.name}</strong>.
          </p>
          <p style={{ fontSize: 12, color: "var(--nami-text-muted)", marginTop: 4, marginBottom: 0 }}>
            Votre équipe soignante échange dans le cadre de cette structure de coordination.
          </p>
          <Link
            href={`/structures/${organization.id}`}
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--nami-primary)",
              marginTop: 8,
              textDecoration: "none",
            }}
          >
            En savoir plus →
          </Link>
        </div>
      </div>
    </div>
  );
}
