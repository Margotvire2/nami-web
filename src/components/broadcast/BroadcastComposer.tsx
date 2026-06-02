"use client";

import { useState } from "react";
import { Eye, Send, FileText, AlertCircle, Info } from "lucide-react";

interface BroadcastComposerProps {
  initialSubject?: string;
  initialBody?: string;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (input: { subject: string; body: string }) => void | Promise<void>;
  errorMessage?: string | null;
}

const SUBJECT_MAX = 200;
const BODY_MAX = 50_000;

function renderMarkdownPreview(md: string): string {
  // Rendu très minimal (gras + italique + sauts de ligne + liens HTTP simples).
  // Le backend gère le rendu email final — ce preview sert d'aperçu approximatif.
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return escape(md)
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/\bhttps?:\/\/\S+/g, (m) => `<a href="${m}" target="_blank" rel="noopener noreferrer" class="text-[#5B4EC4] underline">${m}</a>`)
    .replace(/\n/g, "<br />");
}

export function BroadcastComposer({
  initialSubject = "",
  initialBody = "",
  isSubmitting = false,
  submitLabel = "Créer le brouillon",
  onSubmit,
  errorMessage,
}: BroadcastComposerProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const canSubmit =
    !isSubmitting &&
    subject.trim().length > 0 &&
    subject.trim().length <= SUBJECT_MAX &&
    body.trim().length > 0 &&
    body.trim().length <= BODY_MAX;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit({ subject: subject.trim(), body: body.trim() });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <div>
        <label
          htmlFor="broadcast-subject"
          className="block text-xs font-semibold text-[#374151] mb-1.5"
        >
          Objet de l&apos;email
        </label>
        <input
          id="broadcast-subject"
          type="text"
          value={subject}
          maxLength={SUBJECT_MAX}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex. Réunion mensuelle réseau TCA — 15 juin"
          className="w-full rounded-lg border border-[#E8ECF4] px-3 py-2 text-sm text-[#0F172A] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20"
        />
        <p className="mt-1 text-[11px] text-[#6B7280]">
          {subject.length} / {SUBJECT_MAX}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="broadcast-body"
            className="block text-xs font-semibold text-[#374151]"
          >
            Message
          </label>
          <div
            role="tablist"
            aria-label="Mode édition/aperçu"
            className="inline-flex rounded-md border border-[#E8ECF4] bg-[#F0F2FA] p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "edit"}
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                mode === "edit"
                  ? "bg-white text-[#5B4EC4] shadow-sm"
                  : "text-[#6B7280]"
              }`}
            >
              <FileText size={11} /> Édition
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "preview"}
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                mode === "preview"
                  ? "bg-white text-[#5B4EC4] shadow-sm"
                  : "text-[#6B7280]"
              }`}
            >
              <Eye size={11} /> Aperçu
            </button>
          </div>
        </div>

        {mode === "edit" ? (
          <textarea
            id="broadcast-body"
            value={body}
            maxLength={BODY_MAX}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Bonjour,\n\n**Réunion mensuelle du réseau TCA** le 15 juin à 18h en visio.\n\nOrdre du jour :\n- ...\n\nLien : https://...`}
            rows={14}
            className="w-full rounded-lg border border-[#E8ECF4] px-3 py-2 text-sm text-[#0F172A] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20 font-mono"
            style={{ fontFamily: "var(--font-inter, ui-monospace)" }}
          />
        ) : (
          <div
            role="region"
            aria-label="Aperçu du message"
            className="min-h-[14rem] rounded-lg border border-[#E8ECF4] bg-[#FAFAF8] px-3 py-2 text-sm text-[#0F172A] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html:
                body.trim().length > 0
                  ? renderMarkdownPreview(body)
                  : '<span class="text-[#9CA3AF]">L&rsquo;aperçu apparaîtra ici…</span>',
            }}
          />
        )}
        <p className="mt-1 text-[11px] text-[#6B7280]">
          {body.length} / {BODY_MAX}. Markdown léger : **gras**, *italique*,
          liens https://. Le rendu final est géré par Nami.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-[#E8ECF4] bg-[#F0F2FA] px-3 py-2 text-xs text-[#374151]">
        <Info size={13} className="mt-0.5 shrink-0 text-[#5B4EC4]" />
        <p>
          Email envoyé aux membres actifs. Une notification push sera également
          envoyée prochainement. Les membres ayant refusé les communications
          réseau ne reçoivent rien (RGPD Art. 21).
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]"
        >
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B4EC4] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4A3FB0] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={13} />
        {isSubmitting ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
