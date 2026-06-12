"use client";

import { AppointmentHeroCard } from "@/components/patient/AppointmentHeroCard";
import { getProviderName, getLocationLabel } from "@/lib/appointment-helpers";
import type { PatientAppointment } from "@/lib/api";

interface RdvHeroCardProps {
  appointment: PatientAppointment | null;
  onCancel: () => void;
}

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
  const whenLabel = `${capitalize(dateLabel)} à ${timeLabel.replace(":", "h")}`;

  return (
    <AppointmentHeroCard
      whenLabel={whenLabel}
      providerName={getProviderName(appointment)}
      consultationType={appointment.consultationType?.name}
      locationLabel={getLocationLabel(appointment)}
      detailHref={`/rendez-vous/${appointment.id}`}
      onCancel={onCancel}
    />
  );
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
