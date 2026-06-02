"use client";

import { useMemo, useState } from "react";
import { Loader2, Search, UserPlus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { ApiError, careCasesApi, type CareCase } from "@/lib/api";

// SubmitPatientModal — Pattern A.2 : un soignant SOUMET un dossier patient
// (CareCase) pour discussion lors d'une RCP élargie.
//
// Le backend (events.ts:649) impose :
//  - event.acceptsPatientSubmissions === true
//  - submitter est membre ACTIVE de l'org organisatrice
//  - submitter est membre ACTIVE du CareCase (statusV2='ACTIVE')
//
// L'UI :
//  - liste les CareCase où je suis membre (GET /care-cases?status=ACTIVE)
//  - recherche locale (titre + type)
//  - saisie justification clinique multi-ligne (obligatoire)
//  - submit → callback parent.
//
// V1 — pas de CareCasePicker partagé dans la codebase ; on inline ici.
// Si un picker partagé est créé plus tard → refactoriser.

interface SubmitPatientModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    careCaseId: string;
    reasonForSubmission: string;
  }) => Promise<{ id: string; status: string }>;
  isSubmitting?: boolean;
}

export function SubmitPatientModal(props: SubmitPatientModalProps) {
  // Si fermé → ne rien rendre du tout. Pas de useEffect reset : la modale
  // est démontée puis remontée, ce qui réinitialise le state local proprement.
  if (!props.isOpen) return null;
  return <SubmitPatientModalInner {...props} />;
}

function SubmitPatientModalInner({
  eventTitle,
  onClose,
  onSubmit,
  isSubmitting = false,
}: SubmitPatientModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [search, setSearch] = useState("");
  const [selectedCareCaseId, setSelectedCareCaseId] = useState<string | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch mes CareCases (ACTIVE uniquement — backend filtre déjà sur membership)
  const { data: careCases = [], isLoading } = useQuery({
    queryKey: ["care-cases", "mine", "ACTIVE"],
    queryFn: async (): Promise<CareCase[]> => {
      if (!accessToken) return [];
      return careCasesApi.list(accessToken, { status: "ACTIVE" });
    },
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return careCases;
    return careCases.filter((cc) => {
      const title = cc.caseTitle?.toLowerCase() ?? "";
      const type = cc.caseType?.toLowerCase() ?? "";
      const patient = `${cc.patient.firstName} ${cc.patient.lastName}`.toLowerCase();
      return title.includes(q) || type.includes(q) || patient.includes(q);
    });
  }, [careCases, search]);

  async function handleSubmit() {
    setErrorMsg(null);
    if (!selectedCareCaseId) {
      setErrorMsg("Sélectionnez un dossier patient");
      return;
    }
    const trimmed = reason.trim();
    if (trimmed.length === 0) {
      setErrorMsg("Précisez la justification clinique");
      return;
    }
    if (trimmed.length > 50_000) {
      setErrorMsg("Justification trop longue (max 50 000 caractères)");
      return;
    }

    try {
      await onSubmit({
        careCaseId: selectedCareCaseId,
        reasonForSubmission: trimmed,
      });
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg("Erreur inattendue");
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-patient-modal-title"
      data-testid="submit-patient-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E8ECF4] px-6 py-4">
          <div>
            <h2
              id="submit-patient-modal-title"
              className="text-base font-bold text-[#0F172A]"
            >
              Soumettre un dossier pour discussion
            </h2>
            <p className="mt-1 text-xs text-[#6B7280]">
              Événement : <span className="font-medium">{eventTitle}</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="rounded-md p-1 text-[#6B7280] hover:bg-[#F5F3EF] hover:text-[#0F172A]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Picker CareCase */}
        <div className="px-6 py-4 space-y-3">
          <div>
            <label
              htmlFor="case-search"
              className="text-xs font-semibold text-[#0F172A]"
            >
              Sélectionner un dossier patient
            </label>
            <div className="relative mt-1.5">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              />
              <input
                id="case-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, type, titre…"
                className="w-full rounded-lg border border-[#E8ECF4] bg-white py-2 pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20"
              />
            </div>
          </div>

          <div
            data-testid="care-case-picker-list"
            className="max-h-[260px] overflow-y-auto rounded-lg border border-[#E8ECF4]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-[#6B7280]">
                <Loader2 size={14} className="animate-spin" />
                Chargement des dossiers…
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-[#6B7280]">
                {careCases.length === 0
                  ? "Aucun dossier patient actif à votre nom."
                  : "Aucun dossier ne correspond à votre recherche."}
              </div>
            ) : (
              <ul className="divide-y divide-[#F1F5F9]">
                {filteredCases.map((cc) => {
                  const selected = cc.id === selectedCareCaseId;
                  return (
                    <li key={cc.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCareCaseId(cc.id)}
                        data-testid={`care-case-picker-item-${cc.id}`}
                        aria-pressed={selected}
                        className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                          selected
                            ? "bg-[#EEEDFB]"
                            : "hover:bg-[#F5F3EF]"
                        }`}
                      >
                        <div
                          className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${
                            selected
                              ? "border-[#5B4EC4] bg-[#5B4EC4]"
                              : "border-[#CBD5E1]"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#0F172A] truncate">
                            {cc.caseTitle}
                          </p>
                          <p className="text-[11px] text-[#6B7280] truncate">
                            {cc.patient.firstName} {cc.patient.lastName} ·{" "}
                            <span className="font-medium">{cc.caseType}</span>
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Justification */}
          <div>
            <label
              htmlFor="reason"
              className="text-xs font-semibold text-[#0F172A]"
            >
              Justification clinique <span className="text-[#991B1B]">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Pourquoi ce dossier mérite-t-il d'être discuté en RCP ?"
              className="mt-1.5 w-full rounded-lg border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20"
            />
            <p className="mt-1 text-[10px] text-[#6B7280]">
              Ce contenu sera relu par l&apos;animateur de la RCP. Évitez les
              données identifiantes inutiles.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]"
            >
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#E8ECF4] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-[#E8ECF4] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] hover:border-[#CBD5E1] disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting || !selectedCareCaseId || reason.trim().length === 0
            }
            data-testid="submit-patient-confirm"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B4EC4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4F43AC] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UserPlus size={14} />
            )}
            Soumettre le dossier
          </button>
        </div>
      </div>
    </div>
  );
}
