"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, type PrescriptionDraft } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Pill, Loader2, Send, ChevronDown, ChevronRight, X, FileCheck2 } from "lucide-react";

type Props = {
  careCaseId: string;
  clinicalNoteId: string | null;
};

export function PrescriptionSection({ careCaseId, clinicalNoteId }: Props) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const { data, isLoading, error } = useQuery({
    queryKey: ["prescriptionDrafts", careCaseId],
    queryFn: () => api.prescriptionDrafts.list(careCaseId),
    enabled: !!accessToken && !!careCaseId,
  });

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-3">
          <Pill size={15} className="text-[#5B4EC4]" />
          Brouillon d&apos;ordonnance
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Chargement…
        </div>
      </section>
    );
  }

  if (error) {
    const status = (error as { status?: number })?.status;
    if (status === 403) {
      // Provider non prescripteur — ne pas afficher la section
      return null;
    }
    return (
      <section className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6">
        <p className="text-sm text-gray-500">
          Impossible de charger les brouillons d&apos;ordonnance.
        </p>
      </section>
    );
  }

  const drafts = (data?.drafts ?? []).filter(
    (d) => clinicalNoteId === null || d.clinicalNoteId === clinicalNoteId,
  );

  if (drafts.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-3">
          <Pill size={15} className="text-[#5B4EC4]" />
          Brouillon d&apos;ordonnance
        </h2>
        <p className="text-sm text-gray-500">
          Aucune ordonnance détectée pour cette consultation.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {drafts.map((draft) => (
        <DraftCard key={draft.id} draft={draft} careCaseId={careCaseId} />
      ))}
    </section>
  );
}

function DraftCard({ draft, careCaseId }: { draft: PrescriptionDraft; careCaseId: string }) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const api = apiWithToken(accessToken!);

  const [open, setOpen] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);

  const sign = useMutation({
    mutationFn: async () => api.prescriptionDrafts.sign(draft.id),
    onSuccess: (res) => {
      setSignedAt(res.signedAt);
      setConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ["prescriptionDrafts", careCaseId] });
    },
  });

  const isSigned = draft.status === "SIGNED" || !!signedAt;
  const medCount = draft.content.medications?.length ?? 0;
  const actCount = draft.content.complementaryActs?.length ?? 0;
  const warnings = draft.content.warnings ?? [];

  return (
    <section
      data-testid="prescription-draft-card"
      className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
          <Pill size={15} className="text-[#5B4EC4]" />
          Brouillon d&apos;ordonnance
          <span className="ml-2 text-xs px-2 py-0.5 bg-[#EEEDFB] text-[#5B4EC4] rounded-full border border-[#5B4EC4]/20 font-medium">
            Brouillon IA — à vérifier
          </span>
        </span>
        <span className="flex items-center gap-3 text-xs text-gray-500">
          <span>{medCount} médicament{medCount > 1 ? "s" : ""}</span>
          {actCount > 0 && <span>• {actCount} acte{actCount > 1 ? "s" : ""}</span>}
          {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </span>
      </button>

      {open && (
        <div className="px-6 pb-5 border-t border-gray-100">
          {medCount > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Médicaments</h3>
              <ul className="space-y-2">
                {draft.content.medications.map((m, i) => (
                  <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    <div className="font-semibold text-[#1A1A2E]">
                      {m.name}
                      {m.dosage ? ` — ${m.dosage}` : ""}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {[m.form, m.route, m.frequency, m.duration].filter(Boolean).join(" • ")}
                    </div>
                    {m.instructions && (
                      <div className="text-xs text-gray-600 mt-1 italic">{m.instructions}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {actCount > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Actes complémentaires</h3>
              <ul className="space-y-1">
                {draft.content.complementaryActs.map((a, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{a.type}</span> — {a.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Points de vigilance</h3>
              <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {!isSigned ? (
            <div className="mt-5 flex gap-2 flex-wrap">
              <button
                data-testid="prescription-sign"
                onClick={() => setConfirmOpen(true)}
                disabled={sign.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4F44B0] transition-colors disabled:opacity-50"
              >
                {sign.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Valider et envoyer au patient
              </button>
              <p className="text-xs text-gray-500 self-center">
                Vous signez en tant que prescripteur — le PDF sera mis à disposition du patient.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 text-sm text-[#059669]">
              <FileCheck2 size={15} />
              Ordonnance signée — disponible côté patient.
            </div>
          )}

          {sign.error && (
            <p className="mt-2 text-xs text-red-600">{(sign.error as Error).message}</p>
          )}
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 cockpit-glass-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-3 gap-3">
              <h3 className="font-semibold text-[#1A1A2E]">Signer cette ordonnance ?</h3>
              <button onClick={() => setConfirmOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              La signature crée un PDF horodaté et le partage avec le patient et l&apos;équipe.
              Cette action est irréversible.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                data-testid="prescription-sign-confirm"
                onClick={() => sign.mutate()}
                disabled={sign.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4F44B0] disabled:opacity-50"
              >
                {sign.isPending && <Loader2 size={14} className="animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
