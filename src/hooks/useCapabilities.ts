"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type ProviderCapabilitySet } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export type { ProviderCapabilitySet };

export function useCapabilities() {
  const { accessToken, user } = useAuthStore();
  const isProvider = user?.roleType === "PROVIDER" || user?.roleType === "ADMIN";

  return useQuery<ProviderCapabilitySet>({
    queryKey: ["provider", "capabilities"],
    queryFn: async () => {
      if (!accessToken) throw new Error("Non authentifié");
      return apiWithToken(accessToken).providers.capabilities();
    },
    enabled: isProvider && !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}
