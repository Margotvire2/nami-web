"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { refreshAwareRequest, ApiError } from "@/lib/api";
import type {
  EventListItem,
  CreateEventInput,
  EventStatus,
} from "./useOrgEvents";

// ─── Types détail Event ──────────────────────────────────────────────────────
// GET /events/:id renvoie l'Event complet + createdBy + _count.
// Backend PR #106 n'expose pas (encore) GET liste participants ou submissions
// → l'UI V1 affiche les counts uniquement.

export type ParticipantStatus =
  | "REGISTERED"
  | "WAITLIST"
  | "CONFIRMED"
  | "CANCELLED"
  | "NO_SHOW";

export type SubmissionStatus =
  | "SUBMITTED"
  | "ACCEPTED"
  | "REJECTED"
  | "PRESENTED"
  | "WITHDRAWN";

export type ReviewTargetStatus = Extract<
  SubmissionStatus,
  "ACCEPTED" | "REJECTED" | "PRESENTED"
>;

export interface EventDetail extends EventListItem {
  organizationId: string;
  createdByPersonId: string;
}

export interface PatchEventInput
  extends Partial<Omit<CreateEventInput, "type">> {
  type?: CreateEventInput["type"];
}

export interface CancelEventInput {
  cancelReason?: string;
}

export interface ReviewSubmissionInput {
  status: ReviewTargetStatus;
  reviewNotes?: string | null;
}

// ─── Hook détail Event ───────────────────────────────────────────────────────

export function useEvent(eventId: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const personId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["event", eventId],
    queryFn: async (): Promise<EventDetail | null> => {
      if (!accessToken || !eventId) return null;
      return refreshAwareRequest<EventDetail>(
        `/events/${eventId}`,
        {},
        accessToken,
      );
    },
    enabled: !!accessToken && !!personId && !!eventId,
    staleTime: 30_000,
  });

  function invalidate() {
    if (!eventId) return;
    queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    queryClient.invalidateQueries({ queryKey: ["org-events"] });
  }

  const patchMutation = useMutation({
    mutationFn: async (input: PatchEventInput): Promise<EventDetail> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      if (!eventId) throw new ApiError(400, "eventId manquant");
      return refreshAwareRequest<EventDetail>(
        `/events/${eventId}`,
        { method: "PATCH", body: JSON.stringify(input) },
        accessToken,
      );
    },
    onSuccess: () => invalidate(),
  });

  const cancelMutation = useMutation({
    mutationFn: async (input: CancelEventInput): Promise<EventDetail> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      if (!eventId) throw new ApiError(400, "eventId manquant");
      return refreshAwareRequest<EventDetail>(
        `/events/${eventId}/cancel`,
        { method: "POST", body: JSON.stringify(input) },
        accessToken,
      );
    },
    onSuccess: () => invalidate(),
  });

  // RSVP self — POST /events/:id/participants
  const rsvpMutation = useMutation({
    mutationFn: async (): Promise<{
      id: string;
      status: ParticipantStatus;
    }> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      if (!eventId) throw new ApiError(400, "eventId manquant");
      return refreshAwareRequest<{ id: string; status: ParticipantStatus }>(
        `/events/${eventId}/participants`,
        { method: "POST", body: JSON.stringify({}) },
        accessToken,
      );
    },
    onSuccess: () => invalidate(),
  });

  // Admin confirme un participant (jour J) — POST /events/:id/participants/:personId/confirm
  const confirmParticipantMutation = useMutation({
    mutationFn: async (input: {
      personId: string;
      dpcAttestationUrl?: string | null;
    }): Promise<{ id: string; status: ParticipantStatus }> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      if (!eventId) throw new ApiError(400, "eventId manquant");
      return refreshAwareRequest<{
        id: string;
        status: ParticipantStatus;
      }>(
        `/events/${eventId}/participants/${input.personId}/confirm`,
        {
          method: "POST",
          body: JSON.stringify({
            dpcAttestationUrl: input.dpcAttestationUrl ?? null,
          }),
        },
        accessToken,
      );
    },
    onSuccess: () => invalidate(),
  });

  // Admin retire un participant (ou self-unregister) — DELETE
  const removeParticipantMutation = useMutation({
    mutationFn: async (input: { personId: string }): Promise<unknown> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      if (!eventId) throw new ApiError(400, "eventId manquant");
      return refreshAwareRequest(
        `/events/${eventId}/participants/${input.personId}`,
        { method: "DELETE" },
        accessToken,
      );
    },
    onSuccess: () => invalidate(),
  });

  // Review patient submission — PATCH /patient-submissions/:id
  const reviewSubmissionMutation = useMutation({
    mutationFn: async (input: {
      submissionId: string;
      payload: ReviewSubmissionInput;
    }): Promise<unknown> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      return refreshAwareRequest(
        `/patient-submissions/${input.submissionId}`,
        { method: "PATCH", body: JSON.stringify(input.payload) },
        accessToken,
      );
    },
    onSuccess: () => invalidate(),
  });

  return {
    event: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    patch: patchMutation.mutateAsync,
    isPatching: patchMutation.isPending,
    patchError: patchMutation.error,

    cancel: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error,

    rsvp: rsvpMutation.mutateAsync,
    isRsvping: rsvpMutation.isPending,
    rsvpError: rsvpMutation.error,

    confirmParticipant: confirmParticipantMutation.mutateAsync,
    isConfirmingParticipant: confirmParticipantMutation.isPending,

    removeParticipant: removeParticipantMutation.mutateAsync,
    isRemovingParticipant: removeParticipantMutation.isPending,

    reviewSubmission: reviewSubmissionMutation.mutateAsync,
    isReviewingSubmission: reviewSubmissionMutation.isPending,
    reviewSubmissionError: reviewSubmissionMutation.error,
  };
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

/**
 * Statut UI dérivé du couple (status, dates, maxParticipants, participantCount).
 * Reflète l'état "vivant" tel que perçu par l'utilisateur — distinct du
 * status DB (DRAFT/PUBLISHED/CANCELLED/COMPLETED).
 *
 *  - SCHEDULED : status=DRAFT (pas encore publié)
 *  - OPEN      : PUBLISHED + à venir + des places restantes
 *  - FULL      : PUBLISHED + à venir + max atteint
 *  - CANCELLED : status=CANCELLED
 *  - PAST      : endAt < now (terminé ou COMPLETED)
 */
export type EventUiStatus =
  | "SCHEDULED"
  | "OPEN"
  | "FULL"
  | "CANCELLED"
  | "PAST";

export function deriveEventUiStatus(input: {
  status: EventStatus;
  startAt: string | Date;
  endAt: string | Date;
  maxParticipants: number | null;
  participantsCount: number;
}): EventUiStatus {
  if (input.status === "CANCELLED") return "CANCELLED";
  const endAt = new Date(input.endAt);
  if (endAt.getTime() < Date.now() || input.status === "COMPLETED") return "PAST";
  if (input.status === "DRAFT") return "SCHEDULED";
  // PUBLISHED + à venir
  if (
    input.maxParticipants != null &&
    input.participantsCount >= input.maxParticipants
  ) {
    return "FULL";
  }
  return "OPEN";
}
