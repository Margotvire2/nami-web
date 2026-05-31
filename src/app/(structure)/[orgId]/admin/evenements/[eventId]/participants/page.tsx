"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Inbox, Users } from "lucide-react";
import { useEvent, type ReviewTargetStatus } from "@/hooks/useEvent";
import { ParticipantsList } from "@/components/event/ParticipantsList";
import { PatientSubmissionReviewModal } from "@/components/event/PatientSubmissionReviewModal";
import { EventStatusBadge } from "@/components/event/EventStatusBadge";
import { deriveEventUiStatus } from "@/hooks/useEvent";
import { ApiError } from "@/lib/api";

// Console Participants — admin-only.
// Backend PR #106 limite : seuls les compteurs sont disponibles côté GET.
// Le modal de review pointe sur PATCH /patient-submissions/:id directement,
// mais sans liste, l'admin doit fournir le submissionId (V2.1 backend ajoutera
// GET /events/:id/patient-submissions). On expose l'action via un champ ID
// pour ne pas livrer de mock data, et on documente la limitation.

export default function ParticipantsPage({
  params,
}: {
  params: Promise<{ orgId: string; eventId: string }>;
}) {
  const { orgId, eventId } = use(params);
  const {
    event,
    isLoading,
    isError,
    reviewSubmission,
    isReviewingSubmission,
    reviewSubmissionError,
  } = useEvent(eventId);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [submissionIdInput, setSubmissionIdInput] = useState("");

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E8ECF4] bg-white px-5 py-8 text-center text-sm text-[#6B7280]">
        Chargement…
      </div>
    );
  }
  if (isError || !event) {
    return (
      <div className="rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-5 py-6 text-center text-sm text-[#991B1B]">
        Événement introuvable ou accès refusé.
      </div>
    );
  }

  const uiStatus = deriveEventUiStatus({
    status: event.status,
    startAt: event.startAt,
    endAt: event.endAt,
    maxParticipants: event.maxParticipants,
    participantsCount: event._count.participants,
  });

  async function handleReview(input: {
    submissionId: string;
    status: ReviewTargetStatus;
    reviewNotes?: string;
  }) {
    try {
      await reviewSubmission({
        submissionId: input.submissionId,
        payload: { status: input.status, reviewNotes: input.reviewNotes ?? null },
      });
      setReviewModalOpen(false);
      setSubmissionIdInput("");
    } catch {
      // affiché via reviewSubmissionError
    }
  }

  const reviewErrorMessage =
    reviewSubmissionError instanceof ApiError
      ? reviewSubmissionError.message
      : reviewSubmissionError
        ? "Erreur lors de l'examen de la soumission."
        : null;

  return (
    <div className="space-y-6">
      <Link
        href={`/structure/${orgId}/admin/evenements/${eventId}`}
        className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#5B4EC4]"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        <ArrowLeft size={12} />
        Retour à l&apos;événement
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Users size={18} className="text-[#5B4EC4]" />
          <h1
            className="text-xl font-bold text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Console participants
          </h1>
          <EventStatusBadge status={uiStatus} />
        </div>
        <p className="text-sm text-[#6B7280] truncate">{event.title}</p>
      </header>

      <ParticipantsList
        participantsCount={event._count.participants}
        patientSubmissionsCount={event._count.patientSubmissions}
        acceptsPatientSubmissions={event.acceptsPatientSubmissions}
        isDpcEligible={event.isDpcEligible}
      />

      {event.acceptsPatientSubmissions && (
        <section
          aria-label="Examiner une soumission de dossier"
          className="rounded-xl border border-[#E8ECF4] bg-white p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Inbox size={16} className="text-[#2BA89C]" />
            <h2
              className="text-sm font-semibold text-[#0F172A]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Examiner un dossier soumis
            </h2>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Saisissez l&apos;identifiant d&apos;une soumission pour l&apos;accepter,
            la refuser ou la marquer présentée après la RCP. La liste paginée
            arrivera avec un endpoint backend dédié.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={submissionIdInput}
              onChange={(e) => setSubmissionIdInput(e.target.value)}
              placeholder="ID soumission (epss_…)"
              className="flex-1 rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-xs"
              style={{ fontFamily: "var(--font-jakarta)" }}
            />
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              disabled={!submissionIdInput.trim()}
              className="rounded-md bg-[#5B4EC4] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Examiner
            </button>
          </div>
        </section>
      )}

      <PatientSubmissionReviewModal
        open={reviewModalOpen}
        submissionId={submissionIdInput.trim() || null}
        eventTitle={event.title}
        submitting={isReviewingSubmission}
        errorMessage={reviewErrorMessage}
        onClose={() => setReviewModalOpen(false)}
        onReview={handleReview}
      />
    </div>
  );
}
