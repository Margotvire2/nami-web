"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { STATUS_CFG, type AppointmentStatus } from "@/lib/appointment-status";
import { getProviderName, getLocationLabel } from "@/lib/appointment-helpers";
import type { PatientAppointment } from "@/lib/api";

interface AppointmentCardProps {
  appointment: PatientAppointment;
  onCancel?: () => void;
}

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  // Fallback safe si le backend renvoie un statut hors enum (typage `string`)
  const cfg = STATUS_CFG[appointment.status as AppointmentStatus] ?? {
    label: appointment.status,
    badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
    dotColor: "bg-stone-400",
    isPast: false,
    canCancel: false,
  };

  return (
    <GlassSurface
      variant="soft"
      className="
        rounded-2xl p-5
        hover:shadow-lg hover:shadow-[var(--nami-primary)]/10
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dotColor}`}
            aria-hidden="true"
          />
          <div className="flex-1 space-y-1 min-w-0">
            <span
              className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}
            >
              {cfg.label}
            </span>
            <p className="font-semibold text-[var(--nami-dark)] truncate">
              {getProviderName(appointment)}
            </p>
            <p className="text-sm text-[var(--nami-text-muted)]">
              {formatDateTime(appointment.startAt)} · {getLocationLabel(appointment)}
            </p>
            {appointment.consultationType?.name && (
              <p className="text-xs text-[var(--nami-text-muted)]/80">
                {appointment.consultationType.name}
              </p>
            )}
          </div>
        </div>

        {cfg.canCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="
              shrink-0 text-sm text-[var(--nami-primary)] hover:text-[var(--nami-primary-hover)]
              font-medium transition-colors
            "
          >
            Annuler ce RDV
          </button>
        )}
      </div>
    </GlassSurface>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
