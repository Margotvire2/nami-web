"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Filter } from "lucide-react";
import { useMyEvents, type MyEventListItem } from "@/hooks/useMyEvents";
import { deriveEventUiStatus } from "@/hooks/useEvent";
import {
  type EventType,
  type EventStatus,
  type EventFormat,
} from "@/hooks/useOrgEvents";
import { EventCard } from "@/components/event/EventCard";
import { eventTypeLabel } from "@/components/event/EventTypeIcon";

// /cockpit/evenements — "Mes événements"
// Liste les events des organisations dans lesquelles je suis OrganizationMember.status=ACTIVE.
// Filtres : ma participation (toutes | upcoming | passés), status, type, format.
// Vue par défaut : upcoming = true (events à venir).

type ParticipationFilter = "ALL" | "UPCOMING" | "PAST";

const PARTICIPATION_OPTIONS: { value: ParticipationFilter; label: string }[] = [
  { value: "UPCOMING", label: "À venir" },
  { value: "PAST", label: "Passés" },
  { value: "ALL", label: "Tous" },
];

const STATUS_OPTIONS: { value: EventStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous statuts" },
  { value: "PUBLISHED", label: "Publiés" },
  { value: "CANCELLED", label: "Annulés" },
  { value: "COMPLETED", label: "Terminés" },
];

const TYPE_OPTIONS: { value: EventType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous types" },
  { value: "WEBINAR", label: eventTypeLabel("WEBINAR") },
  { value: "RCP_ELARGIE", label: eventTypeLabel("RCP_ELARGIE") },
  { value: "FORMATION_DPC", label: eventTypeLabel("FORMATION_DPC") },
  { value: "WORKING_GROUP_MEET", label: eventTypeLabel("WORKING_GROUP_MEET") },
  { value: "GENERAL", label: eventTypeLabel("GENERAL") },
];

const FORMAT_OPTIONS: { value: EventFormat | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous formats" },
  { value: "VISIO", label: "Visio" },
  { value: "IN_PERSON", label: "Présentiel" },
  { value: "HYBRID", label: "Hybride" },
];

export default function CockpitEvenementsPage() {
  const [participation, setParticipation] = useState<ParticipationFilter>(
    "UPCOMING",
  );
  const [status, setStatus] = useState<EventStatus | "ALL">("ALL");
  const [type, setType] = useState<EventType | "ALL">("ALL");
  const [format, setFormat] = useState<EventFormat | "ALL">("ALL");

  // useMyEvents fait le fan-out organizationsApi.mine → /organizations/:id/events.
  // upcoming=true côté backend filtre déjà sur startAt >= now.
  const { events, isLoading, isError } = useMyEvents({
    status: status === "ALL" ? undefined : status,
    type: type === "ALL" ? undefined : type,
    upcoming: participation === "UPCOMING",
  });

  // Filtres locaux non gérés côté backend.
  const filtered = useMemo<MyEventListItem[]>(() => {
    const now = Date.now();
    return events.filter((evt) => {
      if (format !== "ALL" && evt.format !== format) return false;
      if (participation === "PAST") {
        const endAt = new Date(evt.endAt).getTime();
        if (endAt > now && evt.status !== "COMPLETED") return false;
      }
      return true;
    });
  }, [events, format, participation]);

  // Comptes pour les pills
  const counts = useMemo(() => {
    const now = Date.now();
    let upcoming = 0;
    let past = 0;
    for (const evt of events) {
      const endAt = new Date(evt.endAt).getTime();
      if (endAt > now && evt.status !== "COMPLETED" && evt.status !== "CANCELLED")
        upcoming++;
      else past++;
    }
    return { upcoming, past, all: events.length };
  }, [events]);

  return (
    <div
      className="px-6 py-6 space-y-6"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <header>
        <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
          <CalendarDays size={20} className="text-[#5B4EC4]" />
          Mes événements
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          RCP, webinaires, formations DPC et groupes de travail
          organisés par les structures dont je suis membre.
        </p>
      </header>

      {/* Tabs participation */}
      <div
        className="flex items-center gap-1 border-b border-[#E8ECF4]"
        role="tablist"
        aria-label="Filtrer ma participation"
      >
        {PARTICIPATION_OPTIONS.map((opt) => {
          const isActive = participation === opt.value;
          const count =
            opt.value === "UPCOMING"
              ? counts.upcoming
              : opt.value === "PAST"
                ? counts.past
                : counts.all;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setParticipation(opt.value)}
              data-testid={`participation-tab-${opt.value}`}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-[#5B4EC4]"
                  : "text-[#6B7280] hover:text-[#0F172A]"
              }`}
            >
              {opt.label}{" "}
              <span className="text-[10px] text-[#94A3B8]">({count})</span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 bottom-[-1px] h-[2px] rounded-full bg-[#5B4EC4]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Filtres secondaires */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Filter size={12} />
          Filtrer :
        </div>
        <Select
          value={status}
          onChange={(v) => setStatus(v as EventStatus | "ALL")}
          options={STATUS_OPTIONS}
          aria-label="Filtrer par statut"
        />
        <Select
          value={type}
          onChange={(v) => setType(v as EventType | "ALL")}
          options={TYPE_OPTIONS}
          aria-label="Filtrer par type"
        />
        <Select
          value={format}
          onChange={(v) => setFormat(v as EventFormat | "ALL")}
          options={FORMAT_OPTIONS}
          aria-label="Filtrer par format"
        />
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="rounded-xl border border-[#E8ECF4] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
          Chargement…
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-6 py-4 text-sm text-[#991B1B]">
          Impossible de charger vos événements. Réessayez plus tard.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
          Aucun événement à afficher avec ces filtres.
        </div>
      ) : (
        <div
          data-testid="cockpit-events-list"
          className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((evt) => (
            <article key={evt.id} className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                {evt.organizationName}
              </p>
              <EventCard event={evt} href={`/evenements/${evt.id}`} />
            </article>
          ))}
        </div>
      )}

      {/* Hint MDR */}
      <p className="text-[10px] text-[#94A3B8]">
        Indicateurs non cliniques destinés à l&apos;organisation du dossier.
      </p>
    </div>
  );
}

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

function Select<T extends string>({
  value,
  onChange,
  options,
  ...rest
}: {
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  // Ne pas spread ces props depuis rest pour éviter conflit
  const { value: _v, onChange: _oc, ...rest2 } = rest as { value?: unknown; onChange?: unknown };
  void _v;
  void _oc;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-md border border-[#E8ECF4] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F172A] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20"
      {...rest2}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Helper exporté pour les tests : on dérive le label tab du statut UI
// (non utilisé dans la page actuellement, mais branchable au cas où).
export function getParticipationLabel(uiStatus: ReturnType<typeof deriveEventUiStatus>): string {
  if (uiStatus === "PAST") return "Passé";
  if (uiStatus === "CANCELLED") return "Annulé";
  return "À venir";
}
