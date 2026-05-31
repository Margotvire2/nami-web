"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { refreshAwareRequest, ApiError } from "@/lib/api";

// ─── Types alignés sur backend PR #106 (F-STRUCT-V2-EVENTS) ──────────────────
// Aucun import @nami/api-types disponible → types locaux fidèles au router
// src/routes/events.ts.

export type EventType =
  | "WEBINAR"
  | "RCP_ELARGIE"
  | "FORMATION_DPC"
  | "WORKING_GROUP_MEET"
  | "GENERAL";

export type EventVisibility =
  | "PUBLIC"
  | "ORGANIZATION_MEMBERS"
  | "WORKING_GROUP";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type EventFormat = "VISIO" | "IN_PERSON" | "HYBRID";

export interface EventCreatedBy {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
}

export interface EventListItem {
  id: string;
  type: EventType;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  format: EventFormat;
  locationLabel: string | null;
  visioUrl: string | null;
  visibility: EventVisibility;
  status: EventStatus;
  maxParticipants: number | null;
  isDpcEligible: boolean;
  dpcReferenceCode: string | null;
  workingGroupConvId: string | null;
  acceptsPatientSubmissions: boolean;
  patientSubmissionDeadline: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: EventCreatedBy;
  _count: {
    participants: number;
    patientSubmissions: number;
  };
}

export interface CreateEventInput {
  type: EventType;
  title: string;
  description?: string | null;
  startAt: string; // ISO
  endAt: string; // ISO
  format: EventFormat;
  locationLabel?: string | null;
  visioUrl?: string | null;
  visibility?: EventVisibility;
  status?: EventStatus;
  maxParticipants?: number | null;
  isDpcEligible?: boolean;
  dpcReferenceCode?: string | null;
  workingGroupConvId?: string | null;
  acceptsPatientSubmissions?: boolean;
  patientSubmissionDeadline?: string | null;
}

export interface ListEventsFilters {
  status?: EventStatus;
  type?: EventType;
  visibility?: EventVisibility;
  upcoming?: boolean;
}

interface OrgEventsResponse {
  count: number;
  events: EventListItem[];
}

// ─── Hook principal — liste des Events d'une organisation ────────────────────

export function useOrgEvents(orgId: string, filters: ListEventsFilters = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const personId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const qs = new URLSearchParams();
  if (filters.status) qs.set("status", filters.status);
  if (filters.type) qs.set("type", filters.type);
  if (filters.visibility) qs.set("visibility", filters.visibility);
  if (filters.upcoming) qs.set("upcoming", "true");
  const search = qs.toString();

  const query = useQuery({
    queryKey: ["org-events", orgId, filters],
    queryFn: async (): Promise<OrgEventsResponse> => {
      if (!accessToken) return { count: 0, events: [] };
      return refreshAwareRequest<OrgEventsResponse>(
        `/organizations/${orgId}/events${search ? `?${search}` : ""}`,
        {},
        accessToken,
      );
    },
    enabled: !!accessToken && !!personId && !!orgId,
    staleTime: 30_000,
  });

  // Mutation create — réservée admin (assertOrganizationAdmin côté backend).
  const createMutation = useMutation({
    mutationFn: async (input: CreateEventInput): Promise<EventListItem> => {
      if (!accessToken) throw new ApiError(401, "Non authentifié");
      return refreshAwareRequest<EventListItem>(
        `/organizations/${orgId}/events`,
        { method: "POST", body: JSON.stringify(input) },
        accessToken,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-events", orgId] });
    },
  });

  return {
    events: query.data?.events ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
