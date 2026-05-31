"use client";

import { AppointmentCard } from "@/components/patient/AppointmentCard";
import type { PatientAppointment } from "@/lib/api";

interface AppointmentsOrphanSectionProps {
  /** Tous les RDV sans CareCase (careCaseId IS NULL), déjà filtrés côté page. */
  appointments: PatientAppointment[];
  upcoming: PatientAppointment[];
  past: PatientAppointment[];
  cancelled: PatientAppointment[];
  onCancel?: (appointment: PatientAppointment) => void;
}

/**
 * Section pour les RDV sans CareCase rattaché (carecaseId IS NULL).
 *
 * Exemples : RDV créés avant la mise en place d'un parcours administratif,
 * RDV ponctuels hors parcours, RDV importés sans rattachement.
 *
 * Wording MDR-safe : "hors parcours" est un libellé administratif. Pas de
 * lien hub (pas de CareCase cible), seul le wording diffère.
 */
export function AppointmentsOrphanSection({
  appointments,
  upcoming,
  past,
  cancelled,
  onCancel,
}: AppointmentsOrphanSectionProps) {
  const headerId = "appointments-orphan-title";
  const total = appointments.length;

  if (total === 0) return null;

  return (
    <section aria-labelledby={headerId} className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id={headerId}
          className="text-lg md:text-xl font-semibold text-[#1A1A2E] tracking-tight"
        >
          Rendez-vous hors parcours
        </h2>
        <span className="text-sm text-[#6B7280] shrink-0">
          {total} rendez-vous
        </span>
      </div>

      <div className="space-y-5">
        {upcoming.length > 0 && (
          <SubGroup label="À venir" items={upcoming} onCancel={onCancel} />
        )}
        {past.length > 0 && <SubGroup label="Passés" items={past} />}
        {cancelled.length > 0 && (
          <SubGroup label="Annulés" items={cancelled} />
        )}
      </div>
    </section>
  );
}

interface SubGroupProps {
  label: string;
  items: PatientAppointment[];
  onCancel?: (appointment: PatientAppointment) => void;
}

function SubGroup({ label, items, onCancel }: SubGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
        {label}
      </h3>
      <div className="space-y-3">
        {items.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            onCancel={onCancel ? () => onCancel(appt) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
