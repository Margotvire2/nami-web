"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Paperclip, X, FileText } from "lucide-react";

interface ComposerEnhancedProps {
  /** Patient sans care case actif → désactive complètement le composer. */
  disabled?: boolean;
  /** Mutation send en vol — désactive submit + affiche spinner. */
  isPending: boolean;
  /** Envoi du body texte. V1 : les attachments ne sont pas envoyés au backend
   *  (preview UI seulement). V2 : ticket dérivé F-PATIENT-MESSAGES-ATTACHMENTS-UPLOAD-SUPABASE-STORAGE
   *  refera la signature avec File[] effectivement uploadé. */
  onSend: (body: string) => void;
}

const MAX_LENGTH = 2000;
const TEXTAREA_LINE_HEIGHT = 20; // px, doit matcher lineHeight CSS
const TEXTAREA_MAX_LINES = 8;
const TEXTAREA_MAX_HEIGHT = TEXTAREA_LINE_HEIGHT * TEXTAREA_MAX_LINES;

/**
 * Composer V2 — extension du composer inline historique :
 *   - Textarea autogrow (1 à 8 lignes visibles avant scroll interne)
 *   - Compteur caractères 2000 max (aria-live polite)
 *   - File picker UI + chips preview suppressibles (mock V1 — pas d'upload réel)
 *   - Bouton Send préservé pattern existant (cercle violet + spinner Loader2)
 *
 * AUCUNE régression sur l'API : onSend reçoit le body texte, exactement
 * comme avant. Le parent (page.tsx) appelle sendMutation.mutate(body) inchangé.
 */
export function ComposerEnhanced({ disabled = false, isPending, onSend }: ComposerEnhancedProps) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autogrow : ajuste la hauteur à chaque changement du draft.
  // Pattern manuel sans dépendance externe.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const newHeight = Math.min(ta.scrollHeight, TEXTAREA_MAX_HEIGHT);
    ta.style.height = `${newHeight}px`;
  }, [draft]);

  function handleSend() {
    const text = draft.trim();
    if (!text || disabled || isPending || text.length > MAX_LENGTH) return;
    // V1 : les attachments sont ignorés (pas d'upload réel)
    onSend(text);
    // onSuccess parent vide le draft via remount via key, mais ici on fait local
    setDraft("");
    setAttachments([]);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    // V1 : on accepte la sélection visuellement, on ne fait rien d'autre
    setAttachments((prev) => [...prev, ...Array.from(files)]);
    // Reset input pour permettre re-sélection du même fichier
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  const charCount = draft.length;
  const charLimitReached = charCount > MAX_LENGTH;
  const canSend = !!draft.trim() && !disabled && !isPending && !charLimitReached;

  return (
    <div
      style={{
        background: "var(--nami-card)",
        borderTop: `1px solid var(--nami-border)`,
        padding: "12px 16px",
        flexShrink: 0,
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Preview attachments (mock V1 — pas d'upload réel) */}
        {attachments.length > 0 && (
          <ul
            role="list"
            aria-label="Pièces jointes sélectionnées"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 10,
              padding: 0,
              listStyle: "none",
            }}
          >
            {attachments.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px 4px 10px",
                  background: "var(--nami-primary-light)",
                  border: `1px solid rgba(91,78,196,0.2)`,
                  borderRadius: 999,
                  fontSize: 12,
                  color: "var(--nami-primary)",
                  fontWeight: 500,
                  maxWidth: 220,
                }}
              >
                <FileText size={12} strokeWidth={2} aria-hidden="true" />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={file.name}
                >
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  aria-label={`Supprimer pièce jointe ${file.name}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(91,78,196,0.15)",
                    color: "var(--nami-primary)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary,#5B4EC4)]"
                >
                  <X size={10} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Composer row : attach + textarea + send */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          {/* File picker (hidden input + bouton trigger) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isPending}
            aria-label="Joindre un fichier"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              border: `1px solid var(--nami-border)`,
              background: "var(--nami-bg)",
              color: "var(--nami-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: disabled || isPending ? "not-allowed" : "pointer",
              flexShrink: 0,
              opacity: disabled || isPending ? 0.5 : 1,
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary,#5B4EC4)]"
          >
            <Paperclip size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Écrire un message à votre équipe…"
            disabled={disabled}
            aria-label="Écrire un message à votre équipe soignante"
            aria-describedby="composer-char-counter"
            rows={1}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 12,
              border: `1.5px solid ${charLimitReached ? "#DC2626" : "var(--nami-border)"}`,
              fontSize: 14,
              fontFamily: "inherit",
              resize: "none",
              background: "var(--nami-bg)",
              color: "var(--nami-dark)",
              outline: "none",
              lineHeight: `${TEXTAREA_LINE_HEIGHT}px`,
              maxHeight: TEXTAREA_MAX_HEIGHT,
              overflowY: "auto",
            }}
            className="focus-visible:ring-2 focus-visible:ring-[var(--nami-primary,#5B4EC4)]/40"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Envoyer le message"
            aria-busy={isPending}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              border: "none",
              background: canSend ? "var(--nami-primary)" : "var(--nami-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: canSend ? "pointer" : "not-allowed",
              flexShrink: 0,
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary,#5B4EC4)] focus-visible:ring-offset-2"
          >
            {isPending ? (
              <Loader2 size={16} color="#fff" className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={16} color="#fff" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Footer row : char counter + hint keyboard */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
            paddingLeft: 52, // align under textarea (after attach button + gap)
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--nami-text-muted)",
              opacity: 0.7,
            }}
          >
            Entrée pour envoyer · Maj+Entrée pour aller à la ligne
          </span>
          <span
            id="composer-char-counter"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontSize: 11,
              fontWeight: charLimitReached ? 700 : 500,
              color: charLimitReached ? "#DC2626" : "var(--nami-text-muted)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {charCount} / {MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
