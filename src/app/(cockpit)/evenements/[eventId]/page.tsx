"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Building2,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Users as UsersIcon,
  Video,
} from "lucide-react";
import { useEventForProvider } from "@/hooks/useEventForProvider";
import { deriveEventUiStatus } from "@/hooks/useEvent";
import { EventStatusBadge } from "@/components/event/EventStatusBadge";
import { EventTypeIcon, eventTypeLabel } from "@/components/event/EventTypeIcon";
import { RSVPButton } from "@/components/event/RSVPButton";
import { SubmitPatientModal } from "@/components/event/SubmitPatientModal";

// /cockpit/evenements/[eventId] — détail consommable par un soignant.
//
// Affiche :
//  - header (titre + date + format + type + status badge)
//  - encart organisation
//  - RSVPButton (inscription / désinscription)
//  - Bouton "Soumettre un patient" si event.acceptsPatientSubmissions ET je suis
//    membre ACTIVE de l'org organisatrice (Pattern A.2 — Phase 0).
//  - Lien attestation DPC si la mienne existe (TODO V2 backend exposer ma propre
//    attestation depuis GET /events/:id/me — pour V1 on documente).

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatRange(startAt: string, endAt: string): string {
  const start = DATE_FMT.format(new Date(startAt));
  const end = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(endAt));
  return `${start} → ${end}`;
}

export default function CockpitEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const {
    event,
    isLoading,
    isError,
    error,
    canSubmitPatient,
    isMemberOfOrg,
    rsvp,
    isRsvping,
    unregister,
    isUnregistering,
    submitPatient,
    isSubmittingPatient,
  } = useEventForProvider(eventId);

  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        className="px-6 py-6 text-sm text-[#6B7280]"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        Chargement…
      </div>
    );
  }

  if (isError || !event) {
    const msg =
      error instanceof Error ? error.message : "Événement introuvable";
    return (
      <div
        className="px-6 py-6"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        <Link
          href="/evenements"
          className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#5B4EC4]"
        >
          <ArrowLeft size={12} />
          Retour à mes événements
        </Link>
        <div className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          {msg}
        </div>
      </div>
    );
  }

  const uiStatus = deriveEventUiStatus({
    status: event.status,
    startAt: event.startAt,
    endAt: event.endAt,
    maxParticipants: event.maxParticipants,
    participantsCount: event._count.participants,
  });

  const isFull =
    event.maxParticipants != null &&
    event._count.participants >= event.maxParticipants;

  return (
    <div
      className="px-6 py-6 space-y-6 max-w-4xl"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <Link
        href="/evenements"
        className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#5B4EC4]"
      >
        <ArrowLeft size={12} />
        Retour à mes événements
      </Link>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-[#6B7280]">
          <EventTypeIcon type={event.type} size={14} />
          <span className="text-[11px] font-medium uppercase tracking-wide">
            {eventTypeLabel(event.type)}
          </span>
          <EventStatusBadge status={uiStatus} />
          {event.isDpcEligible && (
            <span className="inline-flex items-center gap-1 rounded-md border border-[#FDE68A] bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-medium text-[#92400E]">
              <Award size={11} />
              Éligible DPC
              {event.dpcReferenceCode ? ` · ${event.dpcReferenceCode}` : ""}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A]">{event.title}</h1>
        {event.description && (
          <p className="whitespace-pre-line text-sm text-[#374151] leading-relaxed">
            {event.description}
          </p>
        )}
      </header>

      {/* Carte logistique */}
      <section
        data-testid="event-logistics-card"
        className="rounded-xl border border-[#E8ECF4] bg-white p-4 space-y-2.5"
      >
        <div className="flex items-start gap-2 text-sm text-[#374151]">
          <CalendarDays size={14} className="mt-0.5 text-[#6B7280] shrink-0" />
          <span>{formatRange(event.startAt, event.endAt)}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-[#374151]">
          {event.format === "VISIO" ? (
            <Video size={14} className="mt-0.5 text-[#6B7280] shrink-0" />
          ) : (
            <MapPin size={14} className="mt-0.5 text-[#6B7280] shrink-0" />
          )}
          <span>
            {event.format === "VISIO" && "Visio"}
            {event.format === "IN_PERSON" &&
              (event.locationLabel || "Présentiel")}
            {event.format === "HYBRID" &&
              (event.locationLabel
                ? `Hybride · ${event.locationLabel}`
                : "Hybride")}
            {event.visioUrl && (
              <>
                {" — "}
                <a
                  href={event.visioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#5B4EC4] hover:underline"
                >
                  Ouvrir le lien visio
                  <ExternalLink size={11} />
                </a>
              </>
            )}
          </span>
        </div>

        <div className="flex items-start gap-2 text-sm text-[#374151]">
          <UsersIcon size={14} className="mt-0.5 text-[#6B7280] shrink-0" />
          <span>
            {event._count.participants}
            {event.maxParticipants != null
              ? ` / ${event.maxParticipants}`
              : ""}{" "}
            inscription{event._count.participants > 1 ? "s" : ""}
            {event.acceptsPatientSubmissions && (
              <>
                {" · "}
                {event._count.patientSubmissions} dossier
                {event._count.patientSubmissions > 1 ? "s" : ""} soumis
              </>
            )}
          </span>
        </div>
      </section>

      {/* Carte organisation */}
      <section className="rounded-xl border border-[#E8ECF4] bg-white p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
          <Building2 size={14} className="text-[#5B4EC4]" />
          Organisation
        </div>
        <p className="mt-2 text-sm text-[#374151]">
          Organisé par la structure{" "}
          <span className="font-semibold text-[#0F172A]">
            {event.organizationId}
          </span>
          .
        </p>
        <p className="mt-1 text-[11px] text-[#6B7280]">
          Animé par{" "}
          <span className="font-medium">
            {event.createdBy.firstName} {event.createdBy.lastName}
          </span>
        </p>
      </section>

      {/* Actions soignant */}
      <section
        data-testid="event-actions"
        className="rounded-xl border border-[#E8ECF4] bg-[#FAFAF8] p-4 flex flex-wrap items-start gap-3"
      >
        <RSVPButton
          uiStatus={uiStatus}
          isFull={isFull}
          myStatus={null} // V1 — backend ne renvoie pas ma participation
          onRsvp={rsvp}
          onUnregister={unregister}
          isRsvping={isRsvping}
          isUnregistering={isUnregistering}
        />

        {canSubmitPatient && (
          <button
            type="button"
            onClick={() => setSubmitModalOpen(true)}
            data-testid="submit-patient-cta"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5B4EC4] bg-white px-4 py-2 text-sm font-semibold text-[#5B4EC4] hover:bg-[#EEEDFB] transition-colors"
          >
            <Mail size={14} />
            Soumettre un patient pour cette RCP
          </button>
        )}

        {!canSubmitPatient &&
          event.acceptsPatientSubmissions &&
          isMemberOfOrg === false && (
            <p className="text-[11px] text-[#6B7280]">
              Réservé aux membres actifs de l&apos;organisation organisatrice.
            </p>
          )}

        {uiStatus === "PAST" && event.isDpcEligible && (
          <p className="text-[11px] text-[#6B7280]">
            Une attestation DPC sera disponible une fois votre présence
            confirmée par l&apos;animateur. (Téléchargement disponible
            ultérieurement.)
          </p>
        )}
      </section>

      <SubmitPatientModal
        eventId={event.id}
        eventTitle={event.title}
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmit={async (input) => {
          const res = await submitPatient(input);
          return res;
        }}
        isSubmitting={isSubmittingPatient}
      />

      {/* Disclaimer MDR */}
      <p className="text-[10px] text-[#94A3B8]">
        Nami n&apos;est pas un dispositif médical. Indicateurs non cliniques
        destinés à l&apos;organisation du dossier.
      </p>
    </div>
  );
}
