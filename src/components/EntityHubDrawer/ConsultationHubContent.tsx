"use client";

import type { EntityHubConsultation } from "@/lib/api";
import { useEntityHubControls } from "@/contexts/EntityHubContext";
import {
  EmptyLine,
  HubCard,
  SectionLabel,
  documentTypeLabel,
  formatDate,
  formatDateTime,
  locationLabel,
} from "./_shared";

interface Props {
  data: EntityHubConsultation;
  careCaseId: string;
}

function formatObservationValue(o: EntityHubConsultation["observations"][number]): string {
  if (o.valueNumeric !== null) {
    return `${o.valueNumeric}${o.unit ? ` ${o.unit}` : ""}`;
  }
  if (o.valueText !== null && o.valueText.length > 0) {
    return o.valueText;
  }
  if (o.valueBoolean !== null) {
    return o.valueBoolean ? "Oui" : "Non";
  }
  return "—";
}

export function ConsultationHubContent({ data, careCaseId }: Props) {
  const { openEntityHub } = useEntityHubControls();
  const {
    consultation,
    clinicalNote,
    documents,
    observations,
    nextAppointment,
    prescriptions,
  } = data;

  return (
    <div className="space-y-5">
      <section>
        <SectionLabel>Consultation</SectionLabel>
        <HubCard>
          <div className="text-sm font-medium text-[#1A1A2E]">
            {formatDateTime(consultation.startedAt)}
          </div>
          <button
            type="button"
            onClick={() =>
              openEntityHub({
                type: "provider",
                careCaseId,
                entityId: consultation.provider.id,
              })
            }
            className="mt-2 text-xs text-[#5B4EC4] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded"
            aria-label={`Voir la fiche du soignant ${consultation.provider.firstName} ${consultation.provider.lastName}`}
          >
            {consultation.provider.firstName} {consultation.provider.lastName}
            {consultation.provider.specialty
              ? ` · ${consultation.provider.specialty}`
              : ""}
            {" → Voir la fiche"}
          </button>
        </HubCard>
      </section>

      <section>
        <SectionLabel>Compte-rendu</SectionLabel>
        {clinicalNote === null ? (
          <HubCard>
            <p className="text-xs text-[#6B7280] italic m-0">
              Compte-rendu non partagé. Votre soignant n&apos;a pas rendu cette
              note visible côté patient.
            </p>
          </HubCard>
        ) : (
          <HubCard>
            <p className="text-sm text-[#374151] whitespace-pre-wrap m-0">
              {clinicalNote.body}
            </p>
            <div className="text-[10px] text-[#9CA3AF] mt-3">
              Rédigé le {formatDate(clinicalNote.createdAt)}
            </div>
          </HubCard>
        )}
      </section>

      {clinicalNote !== null && (
        <section>
          <SectionLabel>Indicateurs extraits</SectionLabel>
          {observations.length === 0 ? (
            <EmptyLine>Aucun indicateur extrait de cette consultation.</EmptyLine>
          ) : (
            <div className="space-y-2">
              {observations.map((o) => (
                <HubCard key={o.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs text-[#6B7280]">
                      {o.metricLabel}
                    </span>
                    <span className="text-sm font-semibold text-[#1A1A2E]">
                      {formatObservationValue(o)}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] mt-1">
                    {formatDate(o.effectiveAt)}
                  </div>
                </HubCard>
              ))}
            </div>
          )}
        </section>
      )}

      {prescriptions.length > 0 && (
        <section>
          <SectionLabel>Ordonnances</SectionLabel>
          <div className="space-y-2">
            {prescriptions.map((p) => (
              <HubCard
                key={p.id}
                onClick={() =>
                  openEntityHub({
                    type: "document",
                    careCaseId,
                    entityId: p.id,
                  })
                }
                ariaLabel={`Voir la fiche de l'ordonnance ${p.title}`}
              >
                <div className="text-sm font-medium text-[#1A1A2E] truncate">
                  {p.title}
                </div>
                <div className="text-[10px] text-[#9CA3AF] mt-1">
                  {formatDate(p.createdAt)}
                </div>
              </HubCard>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionLabel>Documents générés</SectionLabel>
        {documents.length === 0 ? (
          <EmptyLine>Aucun document associé à cette consultation.</EmptyLine>
        ) : (
          <div className="space-y-2">
            {documents.map((d) => (
              <HubCard
                key={d.id}
                onClick={() =>
                  openEntityHub({
                    type: "document",
                    careCaseId,
                    entityId: d.id,
                  })
                }
                ariaLabel={`Voir la fiche du document ${d.title}`}
              >
                <div className="text-sm font-medium text-[#1A1A2E] truncate">
                  {d.title}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F5F3EF] text-[10px] text-[#6B7280] font-medium">
                    {documentTypeLabel(d.documentType)}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF]">
                    {formatDate(d.createdAt)}
                  </span>
                </div>
              </HubCard>
            ))}
          </div>
        )}
      </section>

      {nextAppointment && (
        <section>
          <SectionLabel>Rendez-vous suivant</SectionLabel>
          <HubCard>
            <div className="text-sm font-medium text-[#1A1A2E]">
              {formatDateTime(nextAppointment.startAt)}
            </div>
            <div className="text-xs text-[#6B7280] mt-1">
              {locationLabel(nextAppointment.locationType)}
            </div>
          </HubCard>
        </section>
      )}
    </div>
  );
}
