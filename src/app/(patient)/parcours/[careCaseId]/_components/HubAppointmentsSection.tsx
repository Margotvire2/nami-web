"use client";

import Link from "next/link";
import type {
  PatientCareCaseHubAppointment,
  PatientCareCaseHubAppointmentToBook,
} from "@/lib/api";

interface HubAppointmentsSectionProps {
  upcoming: PatientCareCaseHubAppointment[];
  toBook: PatientCareCaseHubAppointmentToBook[];
}

const LOCATION_LABEL: Record<string, string> = {
  IN_PERSON: "En cabinet",
  VIDEO: "Téléconsultation",
  PHONE: "Au téléphone",
};

function formatAppointmentDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatToBookDate(iso: string | null): string {
  if (!iso) return "Date à définir avec votre équipe";
  try {
    const d = new Date(iso);
    return `Vers le ${d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    })}`;
  } catch {
    return "";
  }
}

export function HubAppointmentsSection({
  upcoming,
  toBook,
}: HubAppointmentsSectionProps) {
  const headingId = "hub-appointments-heading";
  const hasContent = upcoming.length > 0 || toBook.length > 0;

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
          Mes rendez-vous
        </h2>
        <Link
          href="/rendez-vous"
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

      {!hasContent ? (
        <p
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Aucun rendez-vous planifié pour ce parcours.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* À venir */}
          {upcoming.length > 0 ? (
            <div>
              <h3
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  fontFamily: "var(--font-inter)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: "0 0 8px",
                }}
              >
                À venir
              </h3>
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
                {upcoming.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/rendez-vous/${a.id}`}
                      style={{
                        display: "block",
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "#FAFAF8",
                        textDecoration: "none",
                        color: "#1A1A2E",
                        transition:
                          "background-color 0.2s ease, transform 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "var(--font-jakarta)",
                          marginBottom: 4,
                        }}
                      >
                        {a.provider.firstName} {a.provider.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          fontFamily: "var(--font-inter)",
                        }}
                      >
                        {formatAppointmentDate(a.startAt)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginTop: 6,
                        }}
                      >
                        {a.consultationTypeName ? (
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
                            {a.consultationTypeName}
                          </span>
                        ) : null}
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
                          {LOCATION_LABEL[a.locationType] ?? a.locationType}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* À planifier */}
          {toBook.length > 0 ? (
            <div>
              <h3
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  fontFamily: "var(--font-inter)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: "0 0 8px",
                }}
              >
                À planifier prochainement
              </h3>
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
                {toBook.map((s) => (
                  <li
                    key={s.pathwayStepId}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "#FAFAF8",
                      border: "1px dashed rgba(91,78,196,0.25)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1A1A2E",
                        fontFamily: "var(--font-jakarta)",
                        marginBottom: 4,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {formatToBookDate(s.expectedDate)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
