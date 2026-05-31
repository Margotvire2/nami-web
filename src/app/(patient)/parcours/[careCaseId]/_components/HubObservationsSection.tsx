"use client";

import Link from "next/link";
import type { PatientCareCaseHubObservation } from "@/lib/api";

interface HubObservationsSectionProps {
  observations: PatientCareCaseHubObservation[];
}

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

function formatValue(value: number, unit: string): string {
  const rounded =
    Math.abs(value) >= 100
      ? Math.round(value)
      : Math.round(value * 10) / 10;
  return unit ? `${rounded} ${unit}` : String(rounded);
}

export function HubObservationsSection({
  observations,
}: HubObservationsSectionProps) {
  const headingId = "hub-observations-heading";

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
          Mes mesures récentes
        </h2>
        <Link
          href="/suivi"
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

      {observations.length === 0 ? (
        <p
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Aucune mesure enregistrée sur les 90 derniers jours.
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
          {observations.map((o) => (
            <li
              key={`${o.metricKey}-${o.effectiveAt}`}
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
                  }}
                >
                  {o.metricLabel}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    fontFamily: "var(--font-inter)",
                    marginTop: 2,
                  }}
                >
                  Mesurée le {formatDate(o.effectiveAt)}
                </div>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  fontFamily: "var(--font-inter)",
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatValue(o.valueNumeric, o.unit)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "#9CA3AF",
          fontFamily: "var(--font-inter)",
          lineHeight: 1.5,
        }}
      >
        Ces mesures sont enregistrées par votre équipe pour organiser votre
        suivi. Elles ne remplacent pas un avis médical.
      </p>
    </section>
  );
}
