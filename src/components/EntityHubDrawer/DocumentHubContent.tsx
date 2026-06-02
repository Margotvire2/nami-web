"use client";

import { useCallback, useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import type { EntityHubDocument } from "@/lib/api";
import { useEntityHubControls } from "@/contexts/EntityHubContext";
import {
  EmptyLine,
  HubCard,
  SectionLabel,
  documentTypeLabel,
  formatDate,
} from "./_shared";

interface Props {
  data: EntityHubDocument;
  careCaseId: string;
  /** Appelé pour rafraîchir la signed URL si expirée (TTL 15min). */
  onRefetch: () => void;
}

const SIGNED_URL_TTL_MS = 15 * 60 * 1000;

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DocumentHubContent({ data, careCaseId, onRefetch }: Props) {
  const { openEntityHub } = useEntityHubControls();
  const { document, source, consultation, observations, sharing } = data;
  // Date.now() pendant le render = impure (react-hooks/purity). On capture
  // l'instant d'arrivée du payload via un effet pour rester deterministe en SSR.
  const issuedAtRef = useRef<number>(0);
  useEffect(() => {
    issuedAtRef.current = Date.now();
  }, [data.document.id, data.document.fileUrl]);

  const openSignedUrl = useCallback(() => {
    const stale =
      issuedAtRef.current > 0 &&
      Date.now() - issuedAtRef.current > SIGNED_URL_TTL_MS;
    if (stale) {
      issuedAtRef.current = Date.now();
      onRefetch();
      return;
    }
    window.open(document.fileUrl, "_blank", "noopener,noreferrer");
  }, [document.fileUrl, onRefetch]);

  const sourceLabel = (() => {
    if (source.uploadedBy === "me") return "Envoyé par vous";
    if (source.uploadedBy === "provider") {
      return `${source.firstName} ${source.lastName}${source.specialty ? ` · ${source.specialty}` : ""}`;
    }
    // RGPD : Person sans ProviderProfile — pas d'identité exposée.
    return "Source non précisée";
  })();

  return (
    <div className="space-y-5">
      <section>
        <SectionLabel>Document</SectionLabel>
        <HubCard>
          <div className="text-sm font-semibold text-[#1A1A2E]">
            {document.title}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F5F3EF] text-[10px] text-[#6B7280] font-medium">
              {documentTypeLabel(document.documentType)}
            </span>
            <span className="text-[10px] text-[#9CA3AF]">
              {humanFileSize(document.sizeBytes)} · {formatDate(document.createdAt)}
            </span>
          </div>
          <button
            type="button"
            onClick={openSignedUrl}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B4EC4] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#4c44b0] transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
          >
            <ExternalLink size={14} aria-hidden />
            Ouvrir le document
          </button>
        </HubCard>
      </section>

      <section>
        <SectionLabel>Origine</SectionLabel>
        {source.uploadedBy === "provider" ? (
          <HubCard
            onClick={() =>
              openEntityHub({
                type: "provider",
                careCaseId,
                entityId: source.providerId,
              })
            }
            ariaLabel={`Voir la fiche du soignant ${source.firstName} ${source.lastName}`}
          >
            <div className="text-sm text-[#1A1A2E]">{sourceLabel}</div>
            <div className="text-[10px] text-[#5B4EC4] mt-1 font-medium">
              Voir la fiche →
            </div>
          </HubCard>
        ) : (
          <HubCard>
            <div className="text-sm text-[#374151]">{sourceLabel}</div>
          </HubCard>
        )}
      </section>

      {consultation && (
        <section>
          <SectionLabel>Consultation liée</SectionLabel>
          <HubCard
            onClick={() =>
              openEntityHub({
                type: "consultation",
                careCaseId,
                entityId: consultation.id,
              })
            }
            ariaLabel="Voir la fiche de la consultation liée"
          >
            <div className="text-sm font-medium text-[#1A1A2E]">
              {formatDate(consultation.startedAt)}
            </div>
            <div className="text-[10px] text-[#5B4EC4] mt-1 font-medium">
              Voir la fiche →
            </div>
          </HubCard>
        </section>
      )}

      <section>
        <SectionLabel>Indicateurs extraits</SectionLabel>
        {observations.length === 0 ? (
          <EmptyLine>Aucun indicateur extrait de ce document.</EmptyLine>
        ) : (
          <div className="space-y-2">
            {observations.map((o) => (
              <HubCard key={o.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-[#6B7280]">{o.metricLabel}</span>
                  <span className="text-sm font-semibold text-[#1A1A2E]">
                    {o.valueNumeric !== null
                      ? `${o.valueNumeric}${o.unit ? ` ${o.unit}` : ""}`
                      : o.valueText !== null && o.valueText.length > 0
                        ? o.valueText
                        : o.valueBoolean !== null
                          ? o.valueBoolean
                            ? "Oui"
                            : "Non"
                          : "—"}
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

      {sharing.isSharedWithTeam && (
        <section>
          <SectionLabel>Soignants ayant accès</SectionLabel>
          {sharing.teamMembers.length === 0 ? (
            <EmptyLine>
              Personne d&apos;autre que vous pour le moment.
            </EmptyLine>
          ) : (
            <div className="space-y-2">
              {sharing.teamMembers.map((m) => (
                <HubCard
                  key={m.providerId}
                  onClick={() =>
                    openEntityHub({
                      type: "provider",
                      careCaseId,
                      entityId: m.providerId,
                    })
                  }
                  ariaLabel={`Voir la fiche du soignant ${m.firstName} ${m.lastName}`}
                >
                  <div className="text-sm font-medium text-[#1A1A2E]">
                    {m.firstName} {m.lastName}
                  </div>
                  {m.specialty && (
                    <div className="text-xs text-[#6B7280] mt-0.5">
                      {m.specialty}
                    </div>
                  )}
                </HubCard>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
