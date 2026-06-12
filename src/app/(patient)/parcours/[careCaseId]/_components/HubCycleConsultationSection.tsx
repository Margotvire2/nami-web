"use client";

import type {
  PatientCareCaseHubAppointment,
  PatientCareCaseHubPastConsultation,
} from "@/lib/api";
import { useEntityHubControls } from "@/contexts/EntityHubContext";
import { AppointmentHeroCard } from "@/components/patient/AppointmentHeroCard";

interface HubCycleConsultationSectionProps {
  /**
   * Rendez-vous à venir de ce parcours (triés croissant côté backend).
   * Seul `upcoming[0]` est mis en avant via la card "Mon prochain RDV".
   * Les RDV suivants restent accessibles via l'onglet /rendez-vous global.
   */
  upcoming: PatientCareCaseHubAppointment[];
  /**
   * Consultations passées (clôturées) — V1.0c-B.
   * - `undefined` : loading (skeleton).
   * - `[]` : aucune consultation passée (empty state).
   * - `[...]` : items affichés (limit 10 côté backend).
   */
  pastConsultations?: PatientCareCaseHubPastConsultation[];
  careCaseId: string;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
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

function formatNextAppointmentLabel(iso: string): string {
  const d = new Date(iso);
  const datePart = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${capitalize(datePart)} à ${timePart.replace(":", "h")}`;
}

function formatLocationLabel(locationType: string): string {
  const map: Record<string, string> = {
    IN_PERSON: "En cabinet",
    REMOTE: "Téléconsultation",
    VIDEO: "Téléconsultation",
    PHONE: "Par téléphone",
    HOME: "À domicile",
  };
  return map[locationType] ?? "Modalité à confirmer";
}

function NextAppointmentHero({
  appointment,
}: {
  appointment: PatientCareCaseHubAppointment;
}) {
  return (
    <AppointmentHeroCard
      label="Mon prochain rendez-vous"
      whenLabel={formatNextAppointmentLabel(appointment.startAt)}
      providerName={`${appointment.provider.firstName} ${appointment.provider.lastName}`}
      consultationType={appointment.consultationTypeName ?? undefined}
      locationLabel={formatLocationLabel(appointment.locationType)}
      detailHref={`/rendez-vous/${appointment.id}`}
    />
  );
}

export function HubCycleConsultationSection({
  upcoming,
  pastConsultations,
  careCaseId,
}: HubCycleConsultationSectionProps) {
  const pastHeadingId = "hub-cycle-consultation-past-heading";
  const { openEntityHub } = useEntityHubControls();
  const nextAppointment = upcoming[0] ?? null;
  const isLoadingPast = pastConsultations === undefined;
  const hasPast = !isLoadingPast && pastConsultations.length > 0;

  return (
    <section
      aria-label="Mes rendez-vous de ce parcours"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {nextAppointment && <NextAppointmentHero appointment={nextAppointment} />}

      <div
        aria-labelledby={pastHeadingId}
        role="group"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(26,26,46,0.06)",
          borderRadius: 16,
          padding: "20px 24px",
        }}
      >
        <h2
          id={pastHeadingId}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1A1A2E",
            fontFamily: "var(--font-jakarta)",
            margin: "0 0 12px",
          }}
        >
          Consultations passées
        </h2>

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
