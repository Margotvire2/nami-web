"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, XCircle, Award } from "lucide-react";
import type { ReviewTargetStatus } from "@/hooks/useEvent";

interface PatientSubmissionReviewModalProps {
  open: boolean;
  /** ID de la soumission à reviewer. */
  submissionId: string | null;
  /** Statut actuel — détermine les transitions autorisées. */
  currentStatus?: "SUBMITTED" | "ACCEPTED" | "REJECTED" | "PRESENTED" | "WITHDRAWN";
  /** Titre de l'événement (pour contexte UI). */
  eventTitle?: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onReview: (input: {
    submissionId: string;
    status: ReviewTargetStatus;
    reviewNotes?: string;
  }) => void | Promise<void>;
}

/**
 * Modal admin pour reviewer une EventPatientSubmission.
 *
 * Transitions backend (validées par PR #106) :
 *   SUBMITTED → ACCEPTED | REJECTED
 *   ACCEPTED  → PRESENTED (post-RCP, validation que le dossier a bien été discuté)
 *
 * On désactive les boutons non autorisés selon currentStatus.
 */
export function PatientSubmissionReviewModal({
  open,
  submissionId,
  currentStatus = "SUBMITTED",
  eventTitle,
  submitting = false,
  errorMessage,
  onClose,
  onReview,
}: PatientSubmissionReviewModalProps) {
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedAction, setSelectedAction] = useState<ReviewTargetStatus | null>(
    null,
  );

  // Reset quand on ouvre/ferme.
  useEffect(() => {
    if (!open) {
      setReviewNotes("");
      setSelectedAction(null);
    }
  }, [open]);

  if (!open || !submissionId) return null;

  const canAccept = currentStatus === "SUBMITTED";
  const canReject = currentStatus === "SUBMITTED";
  const canMarkPresented = currentStatus === "ACCEPTED";

  function handleAction(status: ReviewTargetStatus) {
    if (!submissionId) return;
    setSelectedAction(status);
    void onReview({
      submissionId,
      status,
      reviewNotes: reviewNotes.trim() || undefined,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-review-title"
      data-testid="submission-review-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-[#E8ECF4] px-5 py-4">
          <div>
            <h2
              id="submission-review-title"
              className="text-base font-semibold text-[#0F172A]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Examiner la soumission
            </h2>
            {eventTitle && (
              <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                {eventTitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1 text-[#6B7280] hover:bg-[#F0F2FA] hover:text-[#0F172A]"
          >
            <X size={16} />
          </button>
        </header>

        <div className="px-5 py-4 space-y-4">
          <div className="rounded-md border border-[#E8ECF4] bg-[#FAFAF8] px-3 py-2 text-xs text-[#6B7280]">
            Statut actuel :{" "}
            <span className="font-medium text-[#0F172A]">{currentStatus}</span>
          </div>

          <div>
            <label
              htmlFor="review-notes"
              className="text-xs font-medium text-[#374151] block mb-1"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Notes (optionnel)
            </label>
            <textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              maxLength={5000}
              placeholder="Motif d'acceptation, de refus, ou notes post-RCP…"
              className="w-full rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            />
          </div>

          {errorMessage && (
            <div className="rounded-md border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-xs text-[#991B1B]">
              {errorMessage}
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E8ECF4] px-5 py-3">
          <button
            type="button"
            onClick={() => handleAction("REJECTED")}
            disabled={!canReject || submitting}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#FECACA] bg-white px-3 py-1.5 text-xs font-medium text-[#991B1B] hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {submitting && selectedAction === "REJECTED" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <XCircle size={12} />
            )}
            Refuser
          </button>
          <button
            type="button"
            onClick={() => handleAction("ACCEPTED")}
            disabled={!canAccept || submitting}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#D7D2F3] bg-[#EEEDFB] px-3 py-1.5 text-xs font-medium text-[#5B4EC4] hover:bg-[#E0DAF6] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {submitting && selectedAction === "ACCEPTED" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CheckCircle2 size={12} />
            )}
            Accepter
          </button>
          <button
            type="button"
            onClick={() => handleAction("PRESENTED")}
            disabled={!canMarkPresented || submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2BA89C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#23897F] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {submitting && selectedAction === "PRESENTED" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Award size={12} />
            )}
            Marquer présenté
          </button>
        </footer>
      </div>
    </div>
  );
}
