"use client";

import { useState } from "react";
import type { EntityHubConsultation } from "@/lib/api";
import { useEntityHubControls } from "@/contexts/EntityHubContext";
import {
  DOCUMENT_TYPE_DISPLAY_ORDER,
  EmptyLine,
  HubCard,
  SectionLabel,
  documentTypeEmoji,
  documentTypePluralLabel,
  formatDate,
  formatDateTime,
  locationLabel,
} from "./_shared";
import { UploadToConsultationDialog } from "./UploadToConsultationDialog";

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

/**
 * Trie les clés de documentsByType selon DOCUMENT_TYPE_DISPLAY_ORDER. Les
 * types inconnus (ajoutés backend sans màj front) sont append à la fin.
 * On exclut PRESCRIPTION du groupe (déjà rendu dans sa propre section).
 */
function sortedDocumentTypeKeys(
  documentsByType: EntityHubConsultation["documentsByType"],
): string[] {
  const keys = Object.keys(documentsByType).filter(
    (k) => k !== "PRESCRIPTION" && documentsByType[k] && documentsByType[k]!.length > 0,
  );
  return keys.sort((a, b) => {
    const ia = DOCUMENT_TYPE_DISPLAY_ORDER.indexOf(a);
    const ib = DOCUMENT_TYPE_DISPLAY_ORDER.indexOf(b);
    const na = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
    const nb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
    return na - nb;
  });
}

export function ConsultationHubContent({ data, careCaseId }: Props) {
  const { openEntityHub } = useEntityHubControls();
  const [uploadOpen, setUploadOpen] = useState(false);
  const {
    consultation,
    clinicalNote,
    documentsByType,
    observations,
    nextAppointment,
    prescriptions,
  } = data;

  const providerFullName =
    `${consultation.provider.firstName} ${consultation.provider.lastName}`.trim();
  const otherDocTypeKeys = sortedDocumentTypeKeys(documentsByType);
  const hasOtherDocuments = otherDocTypeKeys.length > 0;

  return (
    <div className="space-y-5 pb-24">
      <section>
        <SectionLabel>Votre consultation</SectionLabel>
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
            aria-label={`Voir la fiche du soignant ${providerFullName}`}
          >
            Avec {providerFullName}
            {consultation.provider.specialty
              ? `, ${consultation.provider.specialty}`
              : ""}
            {" · Voir la fiche du soignant"}
          </button>
        </HubCard>
      </section>

      <section>
        <SectionLabel>Compte-rendu</SectionLabel>
        {clinicalNote === null ? (
          <HubCard>
            <p className="text-xs text-[#6B7280] italic m-0">
              Votre soignant n&apos;a pas encore partagé son compte-rendu pour
              cette consultation.
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
          <SectionLabel>Ce qui a été noté</SectionLabel>
          {observations.length === 0 ? (
            <EmptyLine>
              Aucune mesure n&apos;a été notée pendant cette consultation.
            </EmptyLine>
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
          <SectionLabel>
            <span aria-hidden="true">💊 </span>Ordonnances
          </SectionLabel>
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
        <SectionLabel>Documents de cette consultation</SectionLabel>
        {!hasOtherDocuments ? (
          <EmptyLine>
            Aucun autre document n&apos;est encore lié à cette consultation.
          </EmptyLine>
        ) : (
          <div className="space-y-4">
            {otherDocTypeKeys.map((type) => {
              const docs = documentsByType[type] ?? [];
              return (
                <div key={type}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    <span aria-hidden="true">
                      {documentTypeEmoji(type)}
                    </span>{" "}
                    {documentTypePluralLabel(type)}
                  </div>
                  <div className="space-y-2">
                    {docs.map((d) => (
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
                        <div className="text-[10px] text-[#9CA3AF] mt-1.5">
                          {formatDate(d.createdAt)}
                        </div>
                      </HubCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {nextAppointment && (
        <section>
          <SectionLabel>Votre prochain rendez-vous</SectionLabel>
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

      {/* CTA sticky bas : transmettre un document à ce soignant. Pré-rempli
          avec careCaseId + providerId du drawer. */}
      <div className="fixed bottom-0 right-0 w-[480px] max-w-[100vw] bg-white border-t border-[#1A1A2E]/06 px-6 py-3 z-10">
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="w-full py-2.5 rounded-xl bg-[#5B4EC4] hover:bg-[#4A3FA8] text-white text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
          aria-label={`Transmettre un document à ${providerFullName}`}
        >
          <span aria-hidden="true">📤 </span>Transmettre un document
        </button>
      </div>

      <UploadToConsultationDialog
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        careCaseId={careCaseId}
        consultationId={consultation.id}
        providerId={consultation.provider.id}
        providerName={providerFullName}
      />
    </div>
  );
}
