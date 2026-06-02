"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  PatientCareCaseHubAppointment,
  PatientCareCaseHubAppointmentToBook,
} from "@/lib/api";
import { SlotPicker } from "./SlotPicker";

export type RdvCycleCardData =
  | { mode: "TO_BOOK"; toBook: PatientCareCaseHubAppointmentToBook }
  | { mode: "UPCOMING"; appointment: PatientCareCaseHubAppointment }
  | {
      mode: "PAST";
      appointment: PatientCareCaseHubAppointment;
      hasClinicalNote?: boolean;
      hasPrescription?: boolean;
    };

interface RdvCycleCardProps {
  data: RdvCycleCardData;
  careCaseId: string;
  patientId: string;
}

const LOCATION_LABEL: Record<string, string> = {
  IN_PERSON: "En cabinet",
  VIDEO: "Téléconsultation",
  PHONE: "Au téléphone",
};

const CARD_STYLE = {
  background: "#FFFFFF",
  border: "1px solid rgba(26,26,46,0.06)",
  borderRadius: 16,
  padding: "16px 18px",
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};

const PILL_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 8,
  background: "#F5F3EF",
  color: "#6B7280",
  fontSize: 11,
  fontFamily: "var(--font-inter)",
  fontWeight: 500,
};

const BADGE_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: 8,
  background: "rgba(91,78,196,0.08)",
  color: "#5B4EC4",
  fontSize: 11,
  fontFamily: "var(--font-inter)",
  fontWeight: 600,
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

function formatPastDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatExpectedDate(iso: string | null): string {
  if (!iso) return "Date à définir avec votre équipe";
  try {
    const d = new Date(iso);
    return `Vers le ${d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    })}`;
  } catch {
    return "Date à définir avec votre équipe";
  }
}

function StepLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        color: "#5B4EC4",
        fontFamily: "var(--font-inter)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        margin: 0,
        fontSize: 15,
        fontWeight: 600,
        color: "#1A1A2E",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      {children}
    </h3>
  );
}

function ProviderLine({
  firstName,
  lastName,
  specialty,
}: {
  firstName: string;
  lastName: string;
  specialty?: string;
}) {
  const fullName = `${firstName} ${lastName}`.trim();
  return (
    <p
      style={{
        margin: 0,
        fontSize: 13,
        color: "#374151",
        fontFamily: "var(--font-inter)",
      }}
    >
      {fullName}
      {specialty ? (
        <span style={{ color: "#6B7280" }}> · {specialty}</span>
      ) : null}
    </p>
  );
}

export function RdvCycleCard({ data, careCaseId, patientId }: RdvCycleCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  if (data.mode === "TO_BOOK") {
    const { toBook } = data;
    const attribution = toBook.providerAttribution;
    return (
      <article aria-label={`Rendez-vous à programmer : ${toBook.label}`} style={CARD_STYLE}>
        <StepLabel>Premiers échanges</StepLabel>
        <CardTitle>{toBook.label}</CardTitle>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#6B7280",
            fontFamily: "var(--font-inter)",
          }}
        >
          {formatExpectedDate(toBook.expectedDate)}
        </p>
        {attribution ? (
          <ProviderLine
            firstName={attribution.firstName}
            lastName={attribution.lastName}
            specialty={attribution.specialty}
          />
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#6B7280",
              fontStyle: "italic",
              fontFamily: "var(--font-inter)",
            }}
          >
            Soignant à confirmer avec votre équipe.
          </p>
        )}
        {attribution ? (
          <div>
            {pickerOpen ? (
              <SlotPicker
                providerId={attribution.personId}
                careCaseId={careCaseId}
                patientId={patientId}
                expectedDate={toBook.expectedDate}
                onClose={() => setPickerOpen(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                style={{
                  marginTop: 4,
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "#5B4EC4",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-jakarta)",
                  cursor: "pointer",
                }}
              >
                Réserver un créneau
              </button>
            )}
          </div>
        ) : null}
      </article>
    );
  }

  if (data.mode === "UPCOMING") {
    const { appointment } = data;
    return (
      <Link
        href={`/rendez-vous/${appointment.id}`}
        style={{ textDecoration: "none" }}
        aria-label={`Rendez-vous à venir le ${formatAppointmentDate(appointment.startAt)}`}
      >
        <article style={CARD_STYLE}>
          <StepLabel>Rendez-vous à venir</StepLabel>
          <CardTitle>{formatAppointmentDate(appointment.startAt)}</CardTitle>
          <ProviderLine
            firstName={appointment.provider.firstName}
            lastName={appointment.provider.lastName}
            specialty={appointment.provider.specialties[0]}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {appointment.consultationTypeName ? (
              <span style={PILL_STYLE}>{appointment.consultationTypeName}</span>
            ) : null}
            <span style={PILL_STYLE}>
              {LOCATION_LABEL[appointment.locationType] ?? appointment.locationType}
            </span>
          </div>
          <span
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#5B4EC4",
              fontWeight: 600,
              fontFamily: "var(--font-inter)",
            }}
          >
            Voir détails →
          </span>
        </article>
      </Link>
    );
  }

  // PAST
  const { appointment, hasClinicalNote, hasPrescription } = data;
  return (
    <Link
      href={`/rendez-vous/${appointment.id}`}
      style={{ textDecoration: "none" }}
      aria-label={`Rendez-vous passé du ${formatPastDate(appointment.startAt)}`}
    >
      <article style={CARD_STYLE}>
        <StepLabel>Après le rendez-vous</StepLabel>
        <CardTitle>{formatPastDate(appointment.startAt)}</CardTitle>
        <ProviderLine
          firstName={appointment.provider.firstName}
          lastName={appointment.provider.lastName}
          specialty={appointment.provider.specialties[0]}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {hasClinicalNote ? (
            <span style={BADGE_STYLE}>Compte-rendu disponible</span>
          ) : null}
          {hasPrescription ? (
            <span style={BADGE_STYLE}>Ordonnance</span>
          ) : null}
        </div>
        <span
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#5B4EC4",
            fontWeight: 600,
            fontFamily: "var(--font-inter)",
          }}
        >
          Voir tous les documents →
        </span>
      </article>
    </Link>
  );
}
