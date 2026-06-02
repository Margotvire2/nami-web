"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, type ConsultationDetail, type FinalizeConsultationResult } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Sparkles, Loader2, CheckCircle2, Pencil, Send, X } from "lucide-react";

type Props = {
  consultation: ConsultationDetail;
  careCaseId: string;
};

export function CRSection({ consultation, careCaseId }: Props) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const api = apiWithToken(accessToken!);

  const note = consultation.generatedNote;
  const [isEditing, setIsEditing] = useState(false);
  const [draftBody, setDraftBody] = useState(note?.body ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);

  const patchNote = useMutation({
    mutationFn: async (body: string) => {
      if (!note) throw new Error("Aucun compte-rendu à modifier");
      return api.notes.patch(careCaseId, note.id, { body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation", consultation.id] });
      setIsEditing(false);
      setFeedback("Compte-rendu enregistré.");
    },
  });

  const finalize = useMutation({
    mutationFn: async () => api.consultations.finalize(careCaseId, consultation.id),
    onSuccess: (result: FinalizeConsultationResult) => {
      queryClient.invalidateQueries({ queryKey: ["consultation", consultation.id] });
      const count = result.distribution.notificationsCreated;
      setFeedback(
        count === 0
          ? "Compte-rendu validé. Aucun membre de l'équipe à notifier."
          : `Compte-rendu validé. ${count} membre${count > 1 ? "s" : ""} de l'équipe notifié${count > 1 ? "s" : ""}.`,
      );
    },
  });

  if (!note?.body) {
    return (
      <section className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-3">
          <Sparkles size={15} className="text-[#5B4EC4]" />
          Compte-rendu structuré
        </h2>
        <p className="text-sm text-gray-500">
          Aucun compte-rendu n&apos;a été généré pour cette consultation.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
          <Sparkles size={15} className="text-[#5B4EC4]" />
          Compte-rendu structuré
        </h2>
        <span className="text-xs px-2 py-0.5 bg-[#EEEDFB] text-[#5B4EC4] rounded-full border border-[#5B4EC4]/20 font-medium">
          Brouillon IA — à vérifier
        </span>
      </div>

      {isEditing ? (
        <>
          <textarea
            data-testid="cr-editor"
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            className="w-full min-h-[280px] text-sm text-gray-800 leading-relaxed border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 font-jakarta"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => patchNote.mutate(draftBody)}
              disabled={patchNote.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4F44B0] transition-colors disabled:opacity-50"
            >
              {patchNote.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Enregistrer
            </button>
            <button
              onClick={() => {
                setDraftBody(note.body);
                setIsEditing(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
              Annuler
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {note.body}
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setDraftBody(note.body);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} />
              Modifier
            </button>
            <button
              data-testid="cr-finalize"
              onClick={() => finalize.mutate()}
              disabled={finalize.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4F44B0] transition-colors disabled:opacity-50"
            >
              {finalize.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Valider et partager à l&apos;équipe
            </button>
          </div>
        </>
      )}

      {(patchNote.error || finalize.error) && (
        <p className="mt-3 text-xs text-red-600">
          {(patchNote.error as Error)?.message ?? (finalize.error as Error)?.message}
        </p>
      )}
      {feedback && !patchNote.isPending && !finalize.isPending && (
        <p className="mt-3 text-xs text-[#059669]">{feedback}</p>
      )}
    </section>
  );
}
