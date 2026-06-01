"use client";

import { HubLinkButton } from "@/components/patient/HubLinkButton";
import { AppointmentCard } from "@/components/patient/AppointmentCard";
import type { PatientAppointment, PatientCareCaseSummary } from "@/lib/api";

interface AppointmentsCareCaseSectionProps {
  careCase: PatientCareCaseSummary;
  /** Tous les RDV rattachés à ce CareCase, déjà filtrés côté page. */
  appointments: PatientAppointment[];
  /** RDV à venir (status non terminal, startAt >= now), pour le sous-bloc "À venir". */
  upcoming: PatientAppointment[];
  /** RDV passés (effectifs, startAt < now), pour le sous-bloc "Passés". */
  past: PatientAppointment[];
  /** RDV annulés (statuts CANCELLED*), pour le sous-bloc "Annulés". */
  cancelled: PatientAppointment[];
  /** Handler optionnel pour l'annulation depuis la liste (réutilisé sur l'ensemble). */
  onCancel?: (appointment: PatientAppointment) => void;
}

/**
 * Section d'un CareCase : header (titre parcours + HubLinkButton) + 3 sous-blocs
 * d'appointments (À venir / Passés / Annulés).
 *
 * Cohérence Sprint V1.1 : 3e vue flat groupée par parcours (après /mes-soignants
 * PR #112 et /mes-bilans). Le `HubLinkButton` ramène vers /parcours/[id] avec
 * l'ancre #rendez-vous.
 *
 * Wording MDR-safe : "parcours" est un libellé administratif autorisé. Aucun
 * terme clinique n'apparaît ici (pas de "suivi", "vigilance", "prise en charge").
 *
 * Sous-blocs : on n'affiche que ceux qui ont au moins un RDV. Si la section
 * complète est vide (cas où on a un CareCase mais 0 RDV), on affiche un
 * placeholder interne neutre.
 */
export function AppointmentsCareCaseSection({
  careCase,
  appointments,
  upcoming,
  past,
  cancelled,
  onCancel,
}: AppointmentsCareCaseSectionProps) {
  const headerId = `appointments-care-case-${careCase.id}-title`;
  const total = appointments.length;

  return (
    <section aria-labelledby={headerId} className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id={headerId}
          className="text-lg md:text-xl font-semibold text-[#1A1A2E] tracking-tight"
        >
          {careCase.caseTitle}
        </h2>
        <div className="flex items-baseline gap-4 shrink-0">
          <span className="text-sm text-[#6B7280]">
            {total === 0
              ? "Aucun rendez-vous"
              : `${total} rendez-vous`}
          </span>
          <HubLinkButton
            careCaseId={careCase.id}
            careCaseLabel={careCase.caseTitle}
            sectionAnchor="rendez-vous"
          />
        </div>
      </div>

      {total === 0 ? (
        <p className="text-sm text-[#6B7280] bg-white border border-[rgba(26,26,46,0.08)] rounded-xl p-5">
          Aucun rendez-vous pour ce parcours.
        </p>
      ) : (
        <div className="space-y-5">
          {upcoming.length > 0 && (
            <SubGroup label="À venir" items={upcoming} onCancel={onCancel} />
          )}
          {past.length > 0 && (
            <SubGroup label="Passés" items={past} />
          )}
          {cancelled.length > 0 && (
            <SubGroup label="Annulés" items={cancelled} />
          )}
        </div>
      )}
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
