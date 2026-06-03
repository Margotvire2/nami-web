"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { MembershipRequestRow } from "@/hooks/useMembershipRequests";

interface MembershipRequestReviewModalProps {
  open: boolean;
  request: MembershipRequestRow | null;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onReview: (input: { id: string; status: "ACCEPTED" | "REJECTED" }) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function MembershipRequestReviewModal({
  open,
  request,
  submitting = false,
  errorMessage,
  onClose,
  onReview,
}: MembershipRequestReviewModalProps) {
  const [selectedAction, setSelectedAction] = useState<
    "ACCEPTED" | "REJECTED" | null
  >(null);

  if (!open || !request) return null;

  const { applicant, status, motivationMessage, createdAt, reviewer, reviewedAt } =
    request;
  const fullName = `${applicant.firstName} ${applicant.lastName}`.trim();
  const initials =
    `${applicant.firstName[0] ?? "?"}${applicant.lastName[0] ?? ""}`.toUpperCase();
  const isPending = status === "PENDING";

  function handleAction(target: "ACCEPTED" | "REJECTED") {
    setSelectedAction(target);
    onReview({ id: request!.id, status: target });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-review-title"
      data-testid="membership-review-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-[#E8ECF4] px-5 py-4">
          <div className="min-w-0">
            <h2
              id="membership-review-title"
              className="text-base font-semibold text-[#0F172A]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              {isPending
                ? "Examiner la demande d'adhésion"
                : "Détails de la demande"}
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5 truncate">
              Demandée le {formatDate(createdAt)}
            </p>
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
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full bg-[#5B4EC4]/10 text-[#5B4EC4] flex items-center justify-center text-base font-semibold shrink-0"
              style={{ fontFamily: "var(--font-jakarta)" }}
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold text-[#0F172A] truncate"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                {fullName || "Demandeur"}
              </p>
              {applicant.specialty && (
                <p className="text-xs text-[#6B7280]">{applicant.specialty}</p>
              )}
            </div>
          </div>

          {motivationMessage ? (
            <div>
              <p
                className="text-xs font-medium text-[#374151] mb-1"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                Message de motivation
              </p>
              <div className="rounded-md border border-[#E8ECF4] bg-[#FAFAF8] px-3 py-2 text-sm text-[#374151] whitespace-pre-wrap">
                {motivationMessage}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#6B7280] italic">
              Aucun message de motivation joint à la demande.
            </p>
          )}

          {!isPending && reviewer && reviewedAt && (
            <div className="rounded-md border border-[#E8ECF4] bg-[#FAFAF8] px-3 py-2 text-xs text-[#6B7280]">
              {status === "ACCEPTED" ? "Approuvée" : "Refusée"} par{" "}
              <span className="font-medium text-[#0F172A]">
                {reviewer.firstName} {reviewer.lastName}
              </span>{" "}
              le {formatDate(reviewedAt)}
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-xs text-[#991B1B]"
            >
              {errorMessage}
            </div>
          )}
        </div>

        {isPending && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E8ECF4] px-5 py-3">
            <button
              type="button"
              onClick={() => handleAction("REJECTED")}
              disabled={submitting}
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
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#5B4EC4] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4A3FB0] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              {submitting && selectedAction === "ACCEPTED" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle2 size={12} />
              )}
              Approuver
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
