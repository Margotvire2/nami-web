"use client";

import { use, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import {
  useOrgEvents,
  type EventStatus,
  type EventType,
  type EventVisibility,
} from "@/hooks/useOrgEvents";
import { EventCard } from "@/components/event/EventCard";
import { eventTypeLabel } from "@/components/event/EventTypeIcon";
import { ConsoleSidebar } from "@/components/structure/ConsoleSidebar";

// Console d'animation — Liste des Événements organisationnels (V3-C).
// Wedge phare INIT-377 axe C : RCP élargies, formations DPC, webinaires.
// Filtres status / type / visibility / upcoming en URL (pas de localStorage).

const STATUS_OPTIONS: { value: EventStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous statuts" },
  { value: "DRAFT", label: "Brouillons" },
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

const VISIBILITY_OPTIONS: { value: EventVisibility | "ALL"; label: string }[] = [
  { value: "ALL", label: "Toutes visibilités" },
  { value: "PUBLIC", label: "Public" },
  { value: "ORGANIZATION_MEMBERS", label: "Membres" },
  { value: "WORKING_GROUP", label: "Groupe de travail" },
];

export default function EventsListPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);

  const [status, setStatus] = useState<EventStatus | "ALL">("ALL");
  const [type, setType] = useState<EventType | "ALL">("ALL");
  const [visibility, setVisibility] = useState<EventVisibility | "ALL">("ALL");
  const [upcoming, setUpcoming] = useState<boolean>(false);

  const { events, isLoading, isError } = useOrgEvents(orgId, {
    status: status === "ALL" ? undefined : status,
    type: type === "ALL" ? undefined : type,
    visibility: visibility === "ALL" ? undefined : visibility,
    upcoming,
  });

  return (
    <div className="space-y-6">
      <ConsoleSidebar orgId={orgId} active="events" />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-xl font-bold text-[#0F172A] flex items-center gap-2"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <CalendarDays size={20} className="text-[#5B4EC4]" />
            Événements
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            RCP élargies, webinaires, formations DPC et groupes de travail.
          </p>
        </div>
        <Link
          href={`/structure/${orgId}/admin/evenements/nouveau`}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#5B4EC4] px-3 py-2 text-sm font-medium text-white hover:bg-[#4A3FB0]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          <Plus size={14} />
          Nouvel événement
        </Link>
      </header>

      <section
        aria-label="Filtres"
        className="rounded-xl border border-[#E8ECF4] bg-white p-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={status}
            onChange={(v) => setStatus(v as EventStatus | "ALL")}
            options={STATUS_OPTIONS}
            ariaLabel="Filtrer par statut"
          />
          <FilterSelect
            value={type}
            onChange={(v) => setType(v as EventType | "ALL")}
            options={TYPE_OPTIONS}
            ariaLabel="Filtrer par type"
          />
          <FilterSelect
            value={visibility}
            onChange={(v) => setVisibility(v as EventVisibility | "ALL")}
            options={VISIBILITY_OPTIONS}
            ariaLabel="Filtrer par visibilité"
          />
          <label
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-[#374151] cursor-pointer"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <input
              type="checkbox"
              checked={upcoming}
              onChange={(e) => setUpcoming(e.target.checked)}
            />
            À venir uniquement
          </label>
        </div>
      </section>

      <section aria-label="Liste des événements" className="space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-[#E8ECF4] bg-white px-5 py-8 text-center text-sm text-[#6B7280]">
            Chargement des événements…
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-5 py-6 text-center text-sm text-[#991B1B]">
            Impossible de charger les événements. Réessayer plus tard.
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-10 text-center">
            <CalendarDays size={24} className="mx-auto text-[#6B7280] mb-2" />
            <p className="text-sm font-medium text-[#0F172A]">
              Aucun événement pour le moment.
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              Planifiez votre première RCP élargie ou formation DPC.
            </p>
            <Link
              href={`/structure/${orgId}/admin/evenements/nouveau`}
              className="inline-flex items-center gap-1.5 mt-4 rounded-md bg-[#5B4EC4] px-3 py-2 text-xs font-medium text-white hover:bg-[#4A3FB0]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              <Plus size={12} />
              Créer un événement
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {events.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                href={`/structure/${orgId}/admin/evenements/${e.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-md border border-[#E8ECF4] bg-white px-3 py-1.5 text-xs text-[#374151]"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
