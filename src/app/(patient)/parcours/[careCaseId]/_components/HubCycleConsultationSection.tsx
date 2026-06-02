"use client";

import type {
  PatientCareCaseHubAppointment,
  PatientCareCaseHubAppointmentToBook,
} from "@/lib/api";
import { RdvCycleCard } from "./RdvCycleCard";

interface HubCycleConsultationSectionProps {
  upcoming: PatientCareCaseHubAppointment[];
  toBook: PatientCareCaseHubAppointmentToBook[];
  careCaseId: string;
  patientId: string;
}

export function HubCycleConsultationSection({
  upcoming,
  toBook,
  careCaseId,
  patientId,
}: HubCycleConsultationSectionProps) {
  const headingId = "hub-cycle-consultation-heading";
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
    </section>
  );
}
