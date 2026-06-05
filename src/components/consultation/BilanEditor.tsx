"use client";

/**
 * BilanEditor — éditeur Markdown du bilan structuré généré post-Voxtral.
 *
 * Pas d'éditeur WYSIWYG (KISS V1) : textarea Markdown + preview live des
 * sections. Disclaimer obligatoire en haut. Actions save / discard / validate.
 *
 * F-SOIGNANT-BILAN-VOXTRAL-TEMPLATES
 */

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Pencil, Sparkles, X, AlertTriangle } from "lucide-react";
import type { BilanProfession } from "@/lib/api";

interface Props {
  initialMarkdown: string;
  templateProfession: BilanProfession | null;
  templateVersion: number;
  reviewedByProvider: boolean;
  onSave: (markdown: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
  isSaving?: boolean;
  isRegenerating?: boolean;
  errorMessage?: string | null;
}

const PROFESSION_LABEL: Record<BilanProfession, string> = {
  MEDECIN: "Médecin",
  DIETICIEN: "Diététicien",
  KINE: "Kinésithérapeute",
  IDE: "Infirmier",
  SAGE_FEMME: "Sage-femme",
  PSY: "Psychologue",
  OSTEO: "Ostéopathe",
  PHARMA: "Pharmacien",
  ORTHOPHONISTE: "Orthophoniste",
  PEDICURE: "Pédicure-podologue",
  ERGO: "Ergothérapeute",
  AIDE_SOIGNANT: "Aide-soignant",
};

function professionBadge(p: BilanProfession | null): string {
  if (!p) return "Bilan générique";
  return `Bilan · ${PROFESSION_LABEL[p]}`;
}

export function BilanEditor({
  initialMarkdown,
  templateProfession,
  templateVersion,
  reviewedByProvider,
  onSave,
  onRegenerate,
  isSaving = false,
  isRegenerating = false,
  errorMessage = null,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialMarkdown);

  useEffect(() => {
    setDraft(initialMarkdown);
  }, [initialMarkdown]);

  const charCount = useMemo(() => draft.length, [draft]);

  return (
    <section
      data-testid="bilan-editor"
      className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6"
    >
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
          <Sparkles size={15} className="text-[#5B4EC4]" />
          Bilan structuré
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-[#EEEDFB] text-[#5B4EC4] rounded-full border border-[#5B4EC4]/20 font-medium">
            {professionBadge(templateProfession)}
          </span>
          {reviewedByProvider ? (
            <span className="text-xs px-2 py-0.5 bg-[#ECFDF5] text-[#047857] rounded-full border border-[#047857]/20 font-medium">
              Validé
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">
              Brouillon
            </span>
          )}
          <span className="text-[10px] text-gray-400" aria-label="version template">
            v{templateVersion}
          </span>
        </div>
      </div>

      {/* Disclaimer obligatoire MDR */}
      <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        <span>
          Brouillon généré à partir de votre transcription audio.{" "}
          <strong>À vérifier et valider</strong> avant tout partage avec l&apos;équipe ou le patient.
        </span>
      </div>

      {isEditing ? (
        <>
          <textarea
            data-testid="bilan-editor-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full min-h-[360px] text-sm text-gray-800 leading-relaxed border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 font-mono"
            aria-label="Éditeur de bilan en Markdown"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
            <span>Format Markdown — utilisez ## pour les titres de section.</span>
            <span>{charCount} caractères</span>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              data-testid="bilan-save"
              type="button"
              onClick={() => onSave(draft)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4F44B0] transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Valider le bilan
            </button>
            <button
              data-testid="bilan-cancel"
              type="button"
              onClick={() => {
                setDraft(initialMarkdown);
                setIsEditing(false);
              }}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X size={14} />
              Annuler
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            data-testid="bilan-preview"
            className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100 rounded-xl p-4 bg-[#FAFAF8]"
          >
            {initialMarkdown}
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              data-testid="bilan-edit"
              type="button"
              onClick={() => {
                setDraft(initialMarkdown);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} />
              Modifier
            </button>
            <button
              data-testid="bilan-regenerate"
              type="button"
              onClick={() => onRegenerate()}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#5B4EC4]/30 text-sm text-[#5B4EC4] hover:bg-[#EEEDFB]/40 transition-colors disabled:opacity-50"
            >
              {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Régénérer
            </button>
          </div>
        </>
      )}

      {errorMessage && (
        <p data-testid="bilan-error" className="mt-3 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
