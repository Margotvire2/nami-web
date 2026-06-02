"use client";

import type {
  PatientCareCaseHubAppointment,
  PatientCareCaseHubAppointmentToBook,
  PatientCareCaseHubPastConsultation,
} from "@/lib/api";
import { useEntityHubControls } from "@/contexts/EntityHubContext";
import { RdvCycleCard } from "./RdvCycleCard";

interface HubCycleConsultationSectionProps {
  upcoming: PatientCareCaseHubAppointment[];
  toBook: PatientCareCaseHubAppointmentToBook[];
  /**
   * Consultations passées (clôturées) — V1.0c-B.
   * - `undefined` : loading (skeleton).
   * - `[]` : aucune consultation passée (empty state).
   * - `[...]` : items affichés (limit 10 côté backend).
   */
  pastConsultations?: PatientCareCaseHubPastConsultation[];
  careCaseId: string;
  patientId: string;
}

function formatPastConsultationDate(iso: string): string {
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

export function HubCycleConsultationSection({
  upcoming,
  toBook,
  pastConsultations,
  careCaseId,
  patientId,
}: HubCycleConsultationSectionProps) {
  const headingId = "hub-cycle-consultation-heading";
  const pastHeadingId = "hub-cycle-consultation-past-heading";
  const { openEntityHub } = useEntityHubControls();
  const hasContent = upcoming.length > 0 || toBook.length > 0;
  const isLoadingPast = pastConsultations === undefined;
  const hasPast = !isLoadingPast && pastConsultations.length > 0;

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
      <header style={{ marginBottom: 12 }}>
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
          Cycle de consultation
        </h2>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            color: "#6B7280",
            fontFamily: "var(--font-inter)",
          }}
        >
          Vos rendez-vous, comptes-rendus et documents.
        </p>
      </header>

      {!hasContent ? (
        <p
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Aucun rendez-vous prévu. Votre équipe construit votre parcours.
        </p>
      ) : (
        <div
          role="list"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {upcoming.map((appointment) => (
            <div role="listitem" key={`up-${appointment.id}`}>
              <RdvCycleCard
                data={{ mode: "UPCOMING", appointment }}
                careCaseId={careCaseId}
                patientId={patientId}
              />
            </div>
          ))}
          {toBook.map((step) => (
            <div role="listitem" key={`tb-${step.pathwayStepId}`}>
              <RdvCycleCard
                data={{ mode: "TO_BOOK", toBook: step }}
                careCaseId={careCaseId}
                patientId={patientId}
              />
            </div>
          ))}
        </div>
      )}

      <div
        aria-labelledby={pastHeadingId}
        role="group"
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid rgba(26,26,46,0.06)",
        }}
      >
        <h3
          id={pastHeadingId}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1A1A2E",
            fontFamily: "var(--font-jakarta)",
            margin: "0 0 12px",
          }}
        >
          Consultations passées
        </h3>

        {isLoadingPast ? (
          <div
            data-testid="past-consultations-skeleton"
            aria-busy="true"
            aria-live="polite"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={`sk-${i}`}
                style={{
                  height: 56,
                  borderRadius: 12,
                  background:
                    "linear-gradient(90deg, #F5F3EF 0%, #FAFAF8 50%, #F5F3EF 100%)",
                }}
              />
            ))}
          </div>
        ) : !hasPast ? (
          <p
            style={{
              fontSize: 13,
              color: "#9CA3AF",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Aucune consultation passée.
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
            {pastConsultations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() =>
                    openEntityHub({
                      type: "consultation",
                      careCaseId,
                      entityId: c.id,
                    })
                  }
                  aria-label={`Voir la fiche de la consultation du ${formatPastConsultationDate(c.dateISO)} avec ${c.providerName}`}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#FAFAF8",
                    border: "1px solid transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition:
                      "background 120ms ease, border-color 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(91,78,196,0.06)";
                    e.currentTarget.style.borderColor =
                      "rgba(91,78,196,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#FAFAF8";
                    e.currentTarget.style.borderColor = "transparent";
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
                      {formatPastConsultationDate(c.dateISO)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        fontFamily: "var(--font-inter)",
                        marginTop: 2,
                      }}
                    >
                      {c.providerName}
                    </div>
                    {(c.hasClinicalNote || c.hasDocuments) && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginTop: 6,
                        }}
                      >
                        {c.hasClinicalNote && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "3px 8px",
                              borderRadius: 8,
                              background: "rgba(91,78,196,0.10)",
                              color: "#5B4EC4",
                              fontSize: 11,
                              fontFamily: "var(--font-inter)",
                              fontWeight: 600,
                            }}
                          >
                            Compte-rendu
                          </span>
                        )}
                        {c.hasDocuments && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "3px 8px",
                              borderRadius: 8,
                              background: "rgba(43,168,156,0.10)",
                              color: "#2BA89C",
                              fontSize: 11,
                              fontFamily: "var(--font-inter)",
                              fontWeight: 600,
                            }}
                          >
                            Documents
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    aria-hidden="true"
                    style={{
                      color: "#9CA3AF",
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                  >
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
