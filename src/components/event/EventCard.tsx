"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users as UsersIcon, Award } from "lucide-react";
import type { EventListItem } from "@/hooks/useOrgEvents";
import { deriveEventUiStatus } from "@/hooks/useEvent";
import { EventStatusBadge } from "./EventStatusBadge";
import { EventTypeIcon, eventTypeLabel } from "./EventTypeIcon";

interface EventCardProps {
  event: EventListItem;
  href?: string;
  /** Si false, la carte est rendue comme div non cliquable. Utile dans le dashboard cockpit. */
  asLink?: boolean;
}

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
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

function formatLocation(event: EventListItem): string {
  if (event.format === "VISIO") return "Visio";
  if (event.format === "HYBRID") {
    return event.locationLabel
      ? `Hybride · ${event.locationLabel}`
      : "Hybride";
  }
  return event.locationLabel ?? "Présentiel";
}

export function EventCard({ event, href, asLink = true }: EventCardProps) {
  const uiStatus = deriveEventUiStatus({
    status: event.status,
    startAt: event.startAt,
    endAt: event.endAt,
    maxParticipants: event.maxParticipants,
    participantsCount: event._count.participants,
  });

  const capacityHint =
    event.maxParticipants != null
      ? `${event._count.participants}/${event.maxParticipants}`
      : `${event._count.participants}`;

  const content = (
    <article
      data-testid="event-card"
      data-event-id={event.id}
      className="group rounded-xl border border-[#E8ECF4] bg-white p-4 transition-all hover:border-[#5B4EC4]/40 hover:shadow-[0_8px_24px_rgba(91,78,196,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <EventTypeIcon type={event.type} size={14} />
            <span
              className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              {eventTypeLabel(event.type)}
            </span>
          </div>
          <h3
            className="text-sm font-semibold text-[#0F172A] truncate"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {event.title}
          </h3>
        </div>
        <EventStatusBadge status={uiStatus} />
      </div>

      <div className="mt-3 grid gap-1.5 text-xs text-[#374151]">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={12} className="text-[#6B7280] shrink-0" />
          <span className="truncate">{formatRange(event.startAt, event.endAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-[#6B7280] shrink-0" />
          <span className="truncate">{formatLocation(event)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <UsersIcon size={12} className="text-[#6B7280] shrink-0" />
          <span>{capacityHint} inscription{event._count.participants > 1 ? "s" : ""}</span>
          {event.acceptsPatientSubmissions && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-[#2BA89C]">
              {event._count.patientSubmissions} dossier
              {event._count.patientSubmissions > 1 ? "s" : ""} soumis
            </span>
          )}
        </div>
        {event.isDpcEligible && (
          <div className="flex items-center gap-1.5 text-[#D97706]">
            <Award size={12} className="shrink-0" />
            <span className="text-[11px] font-medium">
              Éligible DPC{event.dpcReferenceCode ? ` · ${event.dpcReferenceCode}` : ""}
            </span>
          </div>
        )}
      </div>
    </article>
  );

  if (!asLink || !href) return content;

  return (
    <Link
      href={href}
      aria-label={`Ouvrir l'événement ${event.title}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4] rounded-xl"
    >
      {content}
    </Link>
  );
}
