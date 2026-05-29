"use client";

import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";
import { getProviderName, getLocationLabel } from "@/lib/appointment-helpers";
import type { PatientAppointment } from "@/lib/api";

interface RdvHeroCardProps {
  appointment: PatientAppointment | null;
  onCancel: () => void;
}

/**
 * Hero card du prochain rendez-vous — affichée en tête de l'onglet "À venir".
 *
 * Style : panneau premium violet/teal sur fond crème, mise en avant du soignant,
 * date longue FR, lieu, CTA primaire vers le détail + secondaire d'annulation.
 *
 * Retourne null si aucun RDV à mettre en avant (laisse l'EmptyState s'afficher).
 */
export function RdvHeroCard({ appointment, onCancel }: RdvHeroCardProps) {
  if (!appointment) return null;

  const date = new Date(appointment.startAt);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  // "Mercredi 4 juin à 14h30" — la locale renvoie "14:30", on remplace par "14h30"
  const whenLabel = `${capitalize(dateLabel)} à ${timeLabel.replace(":", "h")}`;

  const providerName = getProviderName(appointment);
  const locationLabel = getLocationLabel(appointment);

  return (
    <GlassSurface
      variant="medium"
      className="
        relative overflow-hidden rounded-3xl p-7 md:p-8
        border border-[var(--nami-border)]
        bg-gradient-to-br from-[#EEEDFB] via-white to-[#E6F4F2]
      "
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--nami-primary)]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-[var(--nami-secondary)]/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--nami-primary)]">
          <Calendar size={14} aria-hidden="true" />
          <span>Prochain rendez-vous</span>
        </div>

        <div className="space-y-1.5">
          <p className="text-2xl md:text-3xl font-semibold text-[var(--nami-dark)] leading-tight">
            {whenLabel}
          </p>
          <p className="text-lg text-[var(--nami-text-body)]">
            avec <span className="font-medium text-[var(--nami-dark)]">{providerName}</span>
          </p>
          {appointment.consultationType?.name && (
            <p className="text-sm text-[var(--nami-text-muted)]">
              {appointment.consultationType.name}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 text-sm text-[var(--nami-text-body)]">
          <MapPin
            size={16}
            className="mt-0.5 shrink-0 text-[var(--nami-text-muted)]"
            aria-hidden="true"
          />
          <span>{locationLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={`/rendez-vous/${appointment.id}`}
            className="
              inline-flex items-center gap-2 rounded-xl
              bg-[var(--nami-primary)] px-5 py-2.5 text-sm font-medium text-white
              shadow-sm hover:bg-[var(--nami-primary-hover)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary)]/40
              transition-colors
            "
          >
            Voir le détail
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onCancel}
            className="
              inline-flex items-center gap-2 rounded-xl
              border border-[var(--nami-border)] bg-white/70 px-5 py-2.5 text-sm font-medium
              text-[var(--nami-text-body)] hover:bg-white
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary)]/30
              transition-colors
            "
          >
            Annuler
          </button>
        </div>
      </div>
    </GlassSurface>
  );
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
