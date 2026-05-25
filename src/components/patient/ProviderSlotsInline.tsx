"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface PublicSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  weekday: number;
  locationType: string;
  consultationType: { name: string; durationMinutes: number } | null;
  priority: "recommended" | "available";
}

interface ProviderSlotsInlineProps {
  providerId: string;
  providerFirstName: string;
  providerLastName: string;
  maxSlots?: number;
}

const WEEKDAYS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/**
 * Réplique la logique de génération de slug du backend `/providers/public`
 * (cf. backend src/routes/providers.ts, fonction de mapping payload).
 *
 * ⚠️ Décalage backend connu : `providerDirectoryApi.search()` (utilisé par
 * /trouver-un-soignant) retourne `PublicProvider` SANS le slug (juste id +
 * firstName + lastName). Le slug est calculé en runtime dans /providers/public.
 * On reproduit la même logique ici pour pouvoir builder les liens
 * `/soignants/[slug]?slot=...` qui matcheront la lookup `providers.find(p => p.slug === slug)`
 * dans /soignants/[slug]/page.tsx.
 *
 * Follow-up suggéré (hors scope strict de cette PR) : extraire cette logique
 * dans `src/lib/provider-slug.ts` partagé front + backend (DRY).
 */
function buildProviderSlug(firstName: string, lastName: string, id: string): string {
  return (
    `${firstName}-${lastName}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-") +
    `-${id.slice(-6)}`
  );
}

function formatSlotChip(slot: PublicSlot): string {
  const d = new Date(slot.date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slotDay = new Date(d);
  slotDay.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((slotDay.getTime() - today.getTime()) / 86_400_000);

  let datePart: string;
  if (diffDays === 0) datePart = "Aujourd'hui";
  else if (diffDays === 1) datePart = "Demain";
  else if (diffDays > 1 && diffDays < 7) datePart = WEEKDAYS_SHORT[d.getDay()];
  else datePart = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

  return `${datePart} · ${slot.startTime}`;
}

export function ProviderSlotsInline({
  providerId,
  providerFirstName,
  providerLastName,
  maxSlots = 5,
}: ProviderSlotsInlineProps) {
  const slug = buildProviderSlug(providerFirstName, providerLastName, providerId);

  const { data: slots, isLoading } = useQuery({
    queryKey: ["provider-public-slots", providerId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/appointment-requests/public-slots/${providerId}`
      );
      if (!res.ok) return [] as PublicSlot[];
      return (await res.json()) as PublicSlot[];
    },
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mt-3 text-xs text-[var(--nami-text-muted)]">
        <Loader2 size={12} className="animate-spin" />
        Chargement des créneaux…
      </div>
    );
  }

  const visibleSlots = (slots ?? []).slice(0, maxSlots);

  if (visibleSlots.length === 0) {
    return (
      <Link
        href={`/soignants/${slug}`}
        className="inline-flex items-center gap-1 mt-3 text-xs text-[var(--nami-primary)] hover:text-[var(--nami-primary-hover)] transition-colors font-medium"
        aria-label={`Pas de créneau en ligne pour ${providerFirstName} ${providerLastName} — demander un rendez-vous`}
      >
        Pas de créneau en ligne — demander un RDV
        <ChevronRight size={12} />
      </Link>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 mb-2 text-xs text-[var(--nami-text-muted)]">
        <Clock size={11} />
        <span>Prochains créneaux</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visibleSlots.map((slot) => (
          <Link
            key={slot.id}
            href={`/soignants/${slug}?slot=${slot.id}`}
            aria-label={`Réserver le créneau du ${formatSlotChip(slot)} avec ${providerFirstName} ${providerLastName}`}
            className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--nami-primary-light)] text-[var(--nami-primary)] text-xs font-semibold hover:bg-[rgba(91,78,196,0.15)] focus-visible:ring-2 focus-visible:ring-[var(--nami-primary)] focus-visible:outline-none transition-colors"
          >
            {formatSlotChip(slot)}
          </Link>
        ))}
        {slots && slots.length > maxSlots && (
          <Link
            href={`/soignants/${slug}`}
            className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[var(--nami-text-muted)] hover:text-[var(--nami-dark)] transition-colors"
            aria-label={`Voir tous les créneaux (${slots.length - maxSlots} de plus) avec ${providerFirstName} ${providerLastName}`}
          >
            +{slots.length - maxSlots}
            <ChevronRight size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}
