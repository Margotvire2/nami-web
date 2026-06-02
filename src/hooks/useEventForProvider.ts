"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { refreshAwareRequest, ApiError, organizationsApi } from "@/lib/api";
import { useEvent } from "./useEvent";
import type {
  EventDetail,
  ParticipantStatus,
  SubmissionStatus,
} from "./useEvent";

// ─── useEventForProvider — vue soignant (cockpit) ────────────────────────────
//
// Composé de :
//  - useEvent(eventId) : détail event + mutations RSVP, removeParticipant, etc.
//  - participantCheck  : suis-je inscrit ? (status local après mutations + 409)
//  - canSubmitPatient  : true si event.acceptsPatientSubmissions ET je suis
//                        OrganizationMember ACTIVE de l'org organisatrice.
//
// V1 — pas d'endpoint backend `GET /events/:id/me` qui exposerait
// directement ma participation. On utilise :
//  - POST /events/:id/patient-submissions sub-pattern : si POST → 201 alors
//    REGISTERED ; 409 alors déjà inscrit ; DELETE 404 → pas inscrit.
//  - Pour l'affichage initial du badge participation, on essaie une approche
//    optimiste : on ne sait pas — l'utilisateur voit "S'inscrire", clique,
//    et l'UI bascule.
//
// TODO V2 backend : ajouter `participantStatus: ParticipantStatus | null` au
// payload GET /events/:id (voir ticket V3-C-COCKPIT-EVENTS-PARTICIPANT-CHECK).

export interface ProviderEventState {
  // Détail event (depuis useEvent)
  event: EventDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;

  // Computed flags (V1)
  canSubmitPatient: boolean; // suis-je membre ACTIVE de l'org organisatrice ET event accepte submissions ?
  isMemberOfOrg: boolean | null; // null tant que la check organisation n'est pas chargée

  // Mutations exposées (réutilisées depuis useEvent)
  rsvp: () => Promise<{ id: string; status: ParticipantStatus }>;
  isRsvping: boolean;
  rsvpError: unknown;

  unregister: () => Promise<unknown>;
  isUnregistering: boolean;
  unregisterError: unknown;

  submitPatient: (input: {
    careCaseId: string;
    reasonForSubmission: string;
  }) => Promise<{ id: string; status: SubmissionStatus }>;
  isSubmittingPatient: boolean;
  submitPatientError: unknown;

  refetch: () => void;
}

export function useEventForProvider(
  eventId: string | undefined,
): ProviderEventState {
  const accessToken = useAuthStore((s) => s.accessToken);
  const personId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  // 1) Détail event + mutations standard.
  const ev = useEvent(eventId);

  // 2) Suis-je membre ACTIVE de l'org organisatrice ?
  // On dérive du payload organizationsApi.mine (cache partagé).
  const mineQuery = useQuery({
    queryKey: ["organizations", "mine"],
    queryFn: async () => {
      if (!accessToken) return [];
      return organizationsApi.mine(accessToken);
    },
    enabled: !!accessToken && !!personId,
    staleTime: 60_000,
  });

  const orgIdOfEvent = ev.event?.organizationId ?? null;
  const isMemberOfOrg = mineQuery.data
    ? orgIdOfEvent != null &&
      mineQuery.data.some((o) => o.id === orgIdOfEvent)
    : null;

  const canSubmitPatient =
    !!ev.event?.acceptsPatientSubmissions && isMemberOfOrg === true;

  // 3) Unregister mutation — exposée séparément pour pointer sur moi.
  const unregisterMutation = useMutation({
    mutationFn: async (): Promise<unknown> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      if (!eventId) throw new ApiError(400, "eventId manquant");
      if (!personId) throw new ApiError(400, "personId manquant");
      return refreshAwareRequest(
        `/events/${eventId}/participants/${personId}`,
        { method: "DELETE" },
        accessToken,
      );
    },
    onSuccess: () => {
      if (!eventId) return;
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });

  // 4) Patient submission — Pattern A.2 (POST /events/:id/patient-submissions)
  const submitPatientMutation = useMutation({
    mutationFn: async (input: {
      careCaseId: string;
      reasonForSubmission: string;
    }): Promise<{ id: string; status: SubmissionStatus }> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      if (!eventId) throw new ApiError(400, "eventId manquant");
      return refreshAwareRequest<{ id: string; status: SubmissionStatus }>(
        `/events/${eventId}/patient-submissions`,
        { method: "POST", body: JSON.stringify(input) },
        accessToken,
      );
    },
    onSuccess: () => {
      if (!eventId) return;
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  return {
    event: ev.event,
    isLoading: ev.isLoading || mineQuery.isLoading,
    isError: ev.isError,
    error: ev.error,

    canSubmitPatient,
    isMemberOfOrg,

    rsvp: ev.rsvp,
    isRsvping: ev.isRsvping,
    rsvpError: ev.rsvpError,

    unregister: unregisterMutation.mutateAsync,
    isUnregistering: unregisterMutation.isPending,
    unregisterError: unregisterMutation.error,

    submitPatient: submitPatientMutation.mutateAsync,
    isSubmittingPatient: submitPatientMutation.isPending,
    submitPatientError: submitPatientMutation.error,

    refetch: () => ev.refetch(),
  };
}
