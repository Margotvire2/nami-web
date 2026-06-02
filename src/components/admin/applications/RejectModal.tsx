"use client";

import { useState } from "react";
import { XCircle, X, Loader2 } from "lucide-react";
import { N } from "@/lib/design-tokens";

const MIN_REASON_LEN = 5;
const MAX_REASON_LEN = 2000;

export function RejectModal({
  applicantEmail,
  proposedName,
  onConfirm,
  onCancel,
  isSubmitting = false,
  errorMessage,
}: {
  applicantEmail: string;
  proposedName: string;
  onConfirm: (rejectionReason: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = reason.trim();
  const tooShort = trimmed.length < MIN_REASON_LEN;
  const showError = touched && tooShort;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (isSubmitting || tooShort) return;
    onConfirm(trimmed);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
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
                background: N.dangerBg,
                color: N.danger,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XCircle size={18} />
            </span>
            <h2 id="reject-modal-title" style={{ fontSize: 17, fontWeight: 700, color: N.dark, margin: 0 }}>
              Rejeter la candidature
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
          <strong>{proposedName}</strong> sera marquée comme rejetée. Le motif sera envoyé à{" "}
          <strong>{applicantEmail}</strong>.
        </p>

        <label htmlFor="reject-reason" style={{ display: "block", marginTop: 18 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: N.textLight, letterSpacing: "0.02em" }}>
            Motif de rejet (obligatoire, communiqué à l&apos;applicant)
          </span>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Ex : SIRET non vérifiable, structure non éligible…"
            disabled={isSubmitting}
            required
            minLength={MIN_REASON_LEN}
            maxLength={MAX_REASON_LEN}
            rows={5}
            aria-invalid={showError}
            aria-describedby={showError ? "reject-reason-error" : undefined}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${showError ? N.danger : N.borderMed}`,
              fontSize: 13,
              fontFamily: "inherit",
              resize: "vertical",
              color: N.dark,
              background: N.bg,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
              fontSize: 11,
              color: N.textLight,
            }}
          >
            <span id="reject-reason-error" role={showError ? "alert" : undefined}>
              {showError ? `Minimum ${MIN_REASON_LEN} caractères.` : ""}
            </span>
            <span>{trimmed.length}/{MAX_REASON_LEN}</span>
          </div>
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
            disabled={isSubmitting || tooShort}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              background: N.danger,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: isSubmitting || tooShort ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              opacity: isSubmitting || tooShort ? 0.6 : 1,
            }}
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Confirmer le rejet
          </button>
        </div>
      </form>
    </div>
  );
}
