"use client";

import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

interface AppointmentHeroCardProps {
  label?: string;
  whenLabel: string;
  providerName: string;
  consultationType?: string;
  locationLabel?: string;
  detailHref: string;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function AppointmentHeroCard({
  label = "Prochain rendez-vous",
  whenLabel,
  providerName,
  consultationType,
  locationLabel,
  detailHref,
  onCancel,
  cancelLabel = "Annuler",
}: AppointmentHeroCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-7 md:p-8"
      style={{ background: "linear-gradient(135deg, #5B4EC4, #2BA89C)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/70">
          <Calendar size={14} aria-hidden="true" />
          <span>{label}</span>
        </div>

        <div className="space-y-1.5">
          <p className="text-xl font-bold text-white leading-tight">
            {whenLabel}
          </p>
          <p className="text-base text-white/80">
            avec <span className="font-semibold text-white">{providerName}</span>
          </p>
          {consultationType && (
            <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium text-white/90">
              {consultationType}
            </span>
          )}
        </div>

        {locationLabel && (
          <div className="flex items-start gap-2 text-sm text-white/80">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-white/60"
              aria-hidden="true"
            />
            <span>{locationLabel}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={detailHref}
            className="
              inline-flex items-center gap-2 rounded-xl
              bg-white px-5 py-2.5 text-sm font-medium text-[#5B4EC4]
              shadow-sm hover:bg-white/90
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50
              transition-colors
            "
          >
            Voir le détail
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="
                inline-flex items-center gap-2 rounded-xl
                border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium
                text-white hover:bg-white/20
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                transition-colors
              "
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
