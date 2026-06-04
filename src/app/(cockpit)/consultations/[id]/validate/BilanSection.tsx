"use client";

/**
 * BilanSection — orchestre la génération + édition du bilan structuré
 * dans la page de validation de consultation.
 *
 * Trois états :
 *   1. Pas de transcription → call to action désactivé + message explicatif
 *   2. Transcription présente, pas de bilan → bouton "Générer le bilan"
 *   3. Bilan présent → <BilanEditor /> + actions modifier / valider / régénérer
 *
 * F-SOIGNANT-BILAN-VOXTRAL-TEMPLATES
 */

import { useState } from "react";
import { Sparkles, Loader2, FileAudio } from "lucide-react";
import type { ConsultationDetail } from "@/lib/api";
import { useGenerateBilan } from "@/hooks/useGenerateBilan";
import { BilanEditor } from "@/components/consultation/BilanEditor";

interface Props {
  consultation: ConsultationDetail;
  careCaseId: string;
}

export function BilanSection({ consultation, careCaseId }: Props) {
  const { generate, validate } = useGenerateBilan(careCaseId, consultation.id);
  const [feedback, setFeedback] = useState<string | null>(null);

  const hasTranscript = !!consultation.transcript && consultation.transcript.trim().length >= 20;
  const note = consultation.generatedNote;
  // Un "bilan structuré" est reconnaissable au disclaimer Brouillon généré
  // inséré par le service backend (bilanTemplate.service.ts). Les notes
  // créées par l'ancien flux aiSummary (CRSection) n'en ont pas, et seront
  // proposées à la "conversion" via le bouton "Générer le bilan".
  const hasBilan = !!note?.body && note.body.includes("Brouillon généré");

  // Cas 1 : aucune transcription
  if (!hasTranscript) {
    return (
      <section className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-3">
          <Sparkles size={15} className="text-[#5B4EC4]" />
          Bilan structuré
        </h2>
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <FileAudio size={14} className="shrink-0 mt-0.5" />
          <span>
            Aucune transcription audio disponible. Enregistrez et transcrivez la
            consultation pour générer un bilan structuré.
          </span>
        </div>
      </section>
    );
  }

  // Cas 2 : transcription dispo, pas de bilan
  if (!hasBilan) {
    return (
      <section
        data-testid="bilan-empty-state"
        className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-3">
          <Sparkles size={15} className="text-[#5B4EC4]" />
          Bilan structuré
        </h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          Nami peut générer un brouillon de bilan structuré à partir de votre
          transcription, en utilisant un template adapté à votre profession.
        </p>
        <button
          data-testid="bilan-generate"
          type="button"
          onClick={() =>
            generate.mutate(undefined, {
              onSuccess: () =>
                setFeedback("Brouillon de bilan généré — à vérifier ci-dessous."),
            })
          }
          disabled={generate.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4F44B0] transition-colors disabled:opacity-50"
        >
          {generate.isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Génération en cours…
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Générer le bilan
            </>
          )}
        </button>
        {generate.error && (
          <p className="mt-3 text-xs text-red-600">
            {(generate.error as Error).message ?? "Génération impossible. Réessayez."}
          </p>
        )}
        {feedback && (
          <p className="mt-3 text-xs text-[#059669]">{feedback}</p>
        )}
      </section>
    );
  }

  // Cas 3 : bilan présent
  const noteBody = note!.body;
  const profession = note!.templateProfession ?? null;
  const version = note!.templateVersion ?? 1;
  const reviewed = note!.reviewedByProvider ?? false;

  return (
    <BilanEditor
      initialMarkdown={noteBody}
      templateProfession={profession}
      templateVersion={version}
      reviewedByProvider={reviewed}
      isSaving={validate.isPending}
      isRegenerating={generate.isPending}
      errorMessage={
        (validate.error as Error | null)?.message ??
        (generate.error as Error | null)?.message ??
        null
      }
      onSave={async (markdown) => {
        await validate.mutateAsync(markdown);
        setFeedback("Bilan validé.");
      }}
      onRegenerate={async () => {
        await generate.mutateAsync();
        setFeedback("Bilan régénéré — à vérifier.");
      }}
    />
  );
}
