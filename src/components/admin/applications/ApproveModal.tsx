"use client";

import { useState } from "react";
import { CheckCircle2, X, Loader2 } from "lucide-react";
import { N } from "@/lib/design-tokens";

export function ApproveModal({
  applicantEmail,
  proposedName,
  onConfirm,
  onCancel,
  isSubmitting = false,
  errorMessage,
}: {
  applicantEmail: string;
  proposedName: string;
  onConfirm: (reviewNotes: string | null) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}) {
  const [reviewNotes, setReviewNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    const trimmed = reviewNotes.trim();
    onConfirm(trimmed.length > 0 ? trimmed : null);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        background: N.glassOverlayBg,
        backdropFilter: N.glassOverlayBlur,
        WebkitBackdropFilter: N.glassOverlayBlur,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: N.card,
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          padding: 28,
          boxShadow: "0 24px 64px rgba(26,26,46,0.18)",
          border: `1px solid ${N.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: N.successBg,
                color: N.success,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={18} />
            </span>
            <h2 id="approve-modal-title" style={{ fontSize: 17, fontWeight: 700, color: N.dark, margin: 0 }}>
              Approuver la candidature
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Fermer"
            style={{
              background: "transparent",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              color: N.textLight,
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: N.textMid, lineHeight: 1.5, marginTop: 0 }}>
          La structure <strong>{proposedName}</strong> sera créée et un magic link sera envoyé à{" "}
          <strong>{applicantEmail}</strong> pour finaliser son inscription comme administrateur.
        </p>

        <label htmlFor="approve-review-notes" style={{ display: "block", marginTop: 18 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: N.textLight, letterSpacing: "0.02em" }}>
            Notes de review (optionnel, internes)
          </span>
          <textarea
            id="approve-review-notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Ex : vérification SIRET OK via INSEE, contact pris par téléphone…"
            disabled={isSubmitting}
            maxLength={2000}
            rows={4}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${N.borderMed}`,
              fontSize: 13,
              fontFamily: "inherit",
              resize: "vertical",
              color: N.dark,
              background: N.bg,
            }}
          />
        </label>

        {errorMessage && (
          <p
            role="alert"
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 8,
              background: N.dangerBg,
              color: N.danger,
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: `1px solid ${N.borderMed}`,
              background: "transparent",
              color: N.textMid,
              fontSize: 13,
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              background: N.success,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Approuver et créer la structure
          </button>
        </div>
      </form>
    </div>
  );
}
