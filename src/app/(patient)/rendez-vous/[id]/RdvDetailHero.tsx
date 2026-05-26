"use client";

import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { STATUS_CFG, type AppointmentStatus } from "@/lib/appointment-status";
import type { PatientAppointmentDetail } from "@/lib/api";

interface RdvDetailHeroProps {
  appointment: PatientAppointmentDetail;
}

export function RdvDetailHero({ appointment }: RdvDetailHeroProps) {
  const cfg =
    STATUS_CFG[appointment.status as AppointmentStatus] ?? {
      label: appointment.status,
      badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
      dotColor: "bg-stone-400",
      isPast: false,
      canCancel: false,
    };

  const start = new Date(appointment.startAt);
  const end = new Date(appointment.endAt);
  const longDate = start.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = start.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const durationMin =
    appointment.consultationType?.durationMinutes ??
    Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

  return (
    <header className="space-y-4">
      <span
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full border ${cfg.badgeClass}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${cfg.dotColor}`}
          aria-hidden="true"
        />
        {cfg.label}
      </span>

      <h1
        className="text-2xl md:text-3xl font-bold tracking-tight"
        style={{ color: "#1A1A2E", letterSpacing: "-0.02em" }}
      >
        {capitalize(longDate)}
        <span className="block text-lg md:text-xl font-semibold mt-1" style={{ color: "#374151" }}>
          à {startTime}
        </span>
      </h1>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: "#6B7280" }}>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={14} aria-hidden="true" />
          {durationMin} min
        </span>
        {appointment.consultationType?.name && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon size={14} aria-hidden="true" />
            {appointment.consultationType.name}
          </span>
        )}
      </div>
    </header>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
