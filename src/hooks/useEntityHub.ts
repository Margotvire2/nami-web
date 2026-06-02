"use client";

import { useQuery } from "@tanstack/react-query";
import {
  apiWithToken,
  type EntityHubConsultation,
  type EntityHubDocument,
  type EntityHubProvider,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export type EntityHubType = "provider" | "consultation" | "document";

export interface EntityHubTarget {
  type: EntityHubType;
  careCaseId: string;
  entityId: string;
}

type EntityHubPayloadMap = {
  provider: EntityHubProvider;
  consultation: EntityHubConsultation;
  document: EntityHubDocument;
};

export type EntityHubPayload<T extends EntityHubType = EntityHubType> =
  EntityHubPayloadMap[T];

/**
 * Fiche relationnelle scopée à un CareCase + une sous-entité (provider /
 * consultation / document). Backend : V1-ENTITY-HUB (PRs #128 / #129 / #130).
 *
 * Self-only V1 (pas de onBehalfOf). Retry désactivé sur 404 / 403 (le backend
 * renvoie 404 anti-énumération si la sous-entité ne fait pas partie du parcours
 * du patient connecté).
 */
export function useEntityHub<T extends EntityHubType>(
  target: (EntityHubTarget & { type: T }) | null,
) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<EntityHubPayload<T>>({
    queryKey: [
      "patient",
      "entityHub",
      target?.type,
      target?.careCaseId,
      target?.entityId,
      user?.id,
    ],
    queryFn: () => {
      const t = target!;
      const hub = apiWithToken(token!).patient.careCaseHub;
      if (t.type === "provider") {
        return hub.provider(t.careCaseId, t.entityId) as Promise<
          EntityHubPayload<T>
        >;
      }
      if (t.type === "consultation") {
        return hub.consultation(t.careCaseId, t.entityId) as Promise<
          EntityHubPayload<T>
        >;
      }
      return hub.document(t.careCaseId, t.entityId) as Promise<
        EntityHubPayload<T>
      >;
    },
    enabled: !!token && !!user?.id && !!target,
    staleTime: 30_000,
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number })?.status;
      if (status === 404 || status === 403) return false;
      return failureCount < 1;
    },
  });
}
