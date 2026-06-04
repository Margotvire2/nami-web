"use client";

import { useState, useMemo } from "react";
import { FileSignature, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  useSecretariatSignedDocs,
  type SecretariatSignedDocItem,
} from "@/hooks/useSecretariatSignedDocs";

/**
 * F-CROSS-GAP-Document-SIGNED-SECRETARIAT (audit cross-espaces §5.7).
 *
 * Section secrétariat : "Documents signés à transmettre".
 *
 *  - Source de vérité : endpoint backend `GET /secretary/signed-documents`
 *    livré dans PR #185 (scope DOCUMENTS sur les SecretariatLink ACTIVE).
 *  - Le bouton "Marquer comme envoyé" reste UI-only (state local).
 *    Sera connecté en V2 à une route POST /secretary/signed-documents/:id/mark-sent.
 *
 * Wording légal : strictement organisationnel, aucun mot clinique
 *  (pas "alerte", pas "à signer", pas "à valider").
 */

interface SectionProps {
  accessToken: string | null;
  userId: string | null;
}

interface RowProps {
  item: SecretariatSignedDocItem;
  isSent: boolean;
  onMarkSent: () => void;
}

function SignedDocRow({ item, isSent, onMarkSent }: RowProps) {
  return (
    <div
      data-testid={`signed-doc-row-${item.id}`}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 border-b border-[#E8ECF4] last:border-0 hover:bg-[#F5F3EF] transition-colors",
        isSent && "opacity-50",
      )}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "#EEEDFB" }}
      >
        <FileSignature size={14} style={{ color: "#5B4EC4" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[12px] font-semibold text-[#1A1A2E] truncate",
            isSent && "line-through",
          )}
        >
          {item.title}
        </p>
        <p className="text-[10px] text-[#374151] truncate">
          {item.patient.firstName} {item.patient.lastName}
        </p>
        <p className="text-[9px] text-[#6B7280] mt-0.5">
          Signé le{" "}
          {format(parseISO(item.signedAt), "d MMM yyyy 'à' HH:mm", {
            locale: fr,
          })}
        </p>
      </div>
      <button
        type="button"
        onClick={onMarkSent}
        disabled={isSent}
        aria-label={`Marquer "${item.title}" comme envoyé`}
        className={cn(
          "shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border transition-colors",
          isSent
            ? "border-[#E8ECF4] text-[#6B7280] cursor-default"
            : "border-[#5B4EC4] text-[#5B4EC4] hover:bg-[#EEEDFB]",
        )}
      >
        <CheckCircle2 size={11} />
        {isSent ? "Envoyé" : "Marquer envoyé"}
      </button>
    </div>
  );
}

export function SecretariatSignedDocsSection({
  accessToken,
  userId,
}: SectionProps) {
  const { data, isLoading } = useSecretariatSignedDocs({
    accessToken,
    userId,
  });

  // UI-only state V1 : aucune persistance backend.
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const visibleItems = useMemo(() => data, [data]);

  return (
    <section
      data-testid="secretariat-signed-docs-section"
      className="bg-white border border-[#E8ECF4] rounded-xl overflow-hidden shadow-sm"
      style={{ backgroundColor: "#F5F3EF" }}
    >
      <header
        className="px-4 py-3 border-b border-[#E8ECF4] bg-white flex items-center gap-2"
      >
        <FileSignature size={14} style={{ color: "#5B4EC4" }} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[#1A1A2E]">
            Documents signés à transmettre
          </p>
          <p className="text-[10px] text-[#6B7280] mt-0.5">
            Organisation du dossier — aucun contenu clinique
          </p>
        </div>
        {visibleItems.length > 0 && (
          <span
            data-testid="signed-docs-count-badge"
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "#EEEDFB", color: "#5B4EC4" }}
          >
            {visibleItems.length}
          </span>
        )}
      </header>

      <div className="bg-white max-h-80 overflow-y-auto">
        {isLoading ? (
          <p className="px-4 py-6 text-center text-[11px] text-[#6B7280]">
            Chargement…
          </p>
        ) : visibleItems.length === 0 ? (
          <p
            data-testid="signed-docs-empty-state"
            className="px-4 py-6 text-center text-[11px] text-[#6B7280]"
          >
            Aucune ordonnance signée à transmettre
          </p>
        ) : (
          visibleItems.map((item) => (
            <SignedDocRow
              key={item.id}
              item={item}
              isSent={sentIds.has(item.id)}
              onMarkSent={() =>
                setSentIds((prev) => {
                  const next = new Set(prev);
                  next.add(item.id);
                  return next;
                })
              }
            />
          ))
        )}
      </div>
    </section>
  );
}
