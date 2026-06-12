"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { secretaryApi, type SecretaryMeResponse } from "@/lib/api";

export function useSecretaryProfile() {
  const { accessToken, user } = useAuthStore();
  const isSecretary = user?.roleType === "SECRETARY";

  const { data, isLoading } = useQuery<SecretaryMeResponse | null>({
    queryKey: ["secretary-profile", user?.id],
    queryFn: async () => {
      try {
        return await secretaryApi(accessToken!).getMe();
      } catch {
        return null;
      }
    },
    enabled: !!accessToken && isSecretary,
    staleTime: 60_000,
  });

  return {
    profile: data ?? null,
    isLoading,
  };
}
