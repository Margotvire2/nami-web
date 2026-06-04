// F-SECRETAIRE-SIGNUP-FLOW-V1 — hooks rattachements secrétaire ↔ soignant.
//
// Couvre :
//   - listing GET  /me/secretariat-links?status=...
//   - PATCH /secretariat-links/:id  { action: ACCEPT | REJECT }  (soignant)
//   - DELETE /secretariat-links/:id (secrétaire ou soignant)
//   - GET  /providers/search-light?q=... (signup, debounced 300ms)
//
// Toutes les mutations invalident la query ["secretariat-links", personId]
// pour rafraîchir simultanément le widget cockpit + l'écran /reglages/secretariat.

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  secretariatApi,
  type SecretariatLinkStatus,
  type SecretariatLinksResponse,
  type ProviderSearchLightResult,
} from "@/lib/api";

const LIST_KEY = "secretariat-links";

// ─── list ────────────────────────────────────────────────────────────────────

export function useSecretariatLinks(
  role: "SECRETARY" | "PROVIDER",
  status?: SecretariatLinkStatus,
) {
  const { accessToken, user } = useAuthStore();
  const personId = user?.id ?? null;

  return useQuery<SecretariatLinksResponse>({
    queryKey: [LIST_KEY, personId, role, status ?? "ALL"],
    queryFn: async () => {
      if (!accessToken) return { asRole: role, links: [] };
      const data = await secretariatApi.listMyLinks(accessToken, { status });
      return data;
    },
    enabled: !!accessToken && !!personId,
    staleTime: 15_000,
  });
}

function useInvalidateLinks() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const personId = user?.id ?? null;
  return () => qc.invalidateQueries({ queryKey: [LIST_KEY, personId] });
}

// ─── mutations ───────────────────────────────────────────────────────────────

export function useAcceptSecretariatLink() {
  const { accessToken } = useAuthStore();
  const invalidate = useInvalidateLinks();

  return useMutation({
    mutationFn: (linkId: string) => {
      if (!accessToken) throw new Error("Non authentifié");
      return secretariatApi.patchLink(accessToken, linkId, "ACCEPT");
    },
    onSuccess: () => { invalidate(); },
  });
}

export function useRejectSecretariatLink() {
  const { accessToken } = useAuthStore();
  const invalidate = useInvalidateLinks();

  return useMutation({
    mutationFn: (linkId: string) => {
      if (!accessToken) throw new Error("Non authentifié");
      return secretariatApi.patchLink(accessToken, linkId, "REJECT");
    },
    onSuccess: () => { invalidate(); },
  });
}

export function useRevokeSecretariatLink() {
  const { accessToken } = useAuthStore();
  const invalidate = useInvalidateLinks();

  return useMutation({
    mutationFn: (linkId: string) => {
      if (!accessToken) throw new Error("Non authentifié");
      return secretariatApi.revokeLink(accessToken, linkId);
    },
    onSuccess: () => { invalidate(); },
  });
}

// ─── provider search (signup) ────────────────────────────────────────────────

/**
 * Recherche light de soignants pour le wizard signup secrétaire (pas d'auth requise).
 * Debounce 300 ms appliqué côté hook : on n'attaque le réseau qu'une fois la frappe stable.
 * Retourne `providers: []` tant que q.length < 2.
 */
export function useProviderSearchLight(
  query: string,
  city?: string,
): {
  providers: ProviderSearchLightResult[];
  isLoading: boolean;
  isFetching: boolean;
} {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [debouncedCity,  setDebouncedCity]  = useState(city ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedCity(city ?? "");
    }, 300);
    return () => clearTimeout(t);
  }, [query, city]);

  const q = debouncedQuery.trim();
  const c = debouncedCity.trim();
  const enabled = q.length >= 2 || c.length >= 2;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["providers-search-light", q, c],
    queryFn: () => secretariatApi.searchProvidersLight({
      q:    q.length >= 2 ? q : undefined,
      city: c.length >= 2 ? c : undefined,
      limit: 20,
    }),
    enabled,
    staleTime: 30_000,
  });

  return {
    providers: data?.providers ?? [],
    isLoading: enabled && isLoading,
    isFetching,
  };
}
