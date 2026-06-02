"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { refreshAwareRequest, organizationsApi } from "@/lib/api";
import type { EventListItem, ListEventsFilters } from "./useOrgEvents";

// ─── useMyEvents — events des orgs où je suis OrganizationMember ACTIVE ──────
//
// V1 — Fallback Option B (Phase 0) : pas d'endpoint backend `GET /events?asProvider=true`.
// On itère côté frontend : organizationsApi.mine → pour chaque org → GET /organizations/:orgId/events
// React Query met chaque fetch en parallèle. Le merge s'effectue ici.
//
// TODO V2 backend : exposer un endpoint dédié `GET /events?asProvider=true`
// (filtré par OrganizationMember.status=ACTIVE côté serveur) — voir ticket
// V3-C-COCKPIT-EVENTS-LIST-ENDPOINT.

export interface MyEventListItem extends EventListItem {
  organizationId: string;
  organizationName: string;
}

interface OrgEventsResponse {
  count: number;
  events: EventListItem[];
}

export function useMyEvents(filters: ListEventsFilters = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const personId = useAuthStore((s) => s.user?.id);

  const qs = new URLSearchParams();
  if (filters.status) qs.set("status", filters.status);
  if (filters.type) qs.set("type", filters.type);
  if (filters.visibility) qs.set("visibility", filters.visibility);
  if (filters.upcoming) qs.set("upcoming", "true");
  const search = qs.toString();

  const query = useQuery({
    queryKey: ["my-events", filters],
    queryFn: async (): Promise<MyEventListItem[]> => {
      if (!accessToken) return [];

      // 1) Liste les organisations où je suis membre ACTIVE.
      // organizationsApi.mine filtre déjà côté backend sur status=ACTIVE.
      const memberships = await organizationsApi.mine(accessToken);
      if (memberships.length === 0) return [];

      // 2) Fetch en parallèle les events de chaque org.
      const results = await Promise.allSettled(
        memberships.map(async (org) => {
          const data = await refreshAwareRequest<OrgEventsResponse>(
            `/organizations/${org.id}/events${search ? `?${search}` : ""}`,
            {},
            accessToken,
          );
          return data.events.map<MyEventListItem>((evt) => ({
            ...evt,
            organizationId: org.id,
            organizationName: org.name,
          }));
        }),
      );

      // 3) Merge — on ignore les orgs qui rejettent (403 sur certaines visibilités, etc.)
      const merged: MyEventListItem[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") merged.push(...r.value);
      }

      // 4) Tri : startAt ascendant pour upcoming, descendant sinon.
      merged.sort((a, b) => {
        const aT = new Date(a.startAt).getTime();
        const bT = new Date(b.startAt).getTime();
        return filters.upcoming ? aT - bT : bT - aT;
      });

      // 5) Déduplication par eventId (un event ne devrait apparaître qu'une fois,
      // mais on sécurise au cas où une org chevauche).
      const seen = new Set<string>();
      return merged.filter((evt) => {
        if (seen.has(evt.id)) return false;
        seen.add(evt.id);
        return true;
      });
    },
    enabled: !!accessToken && !!personId,
    staleTime: 30_000,
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
