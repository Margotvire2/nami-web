"use client";

/**
 * Hook React Query — génère et valide un bilan structuré par profession.
 *
 * F-SOIGNANT-BILAN-VOXTRAL-TEMPLATES
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export function useGenerateBilan(careCaseId: string, consultationId: string) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const generate = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Non authentifié");
      return apiWithToken(accessToken).consultations.generateBilan(careCaseId, consultationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation", consultationId] });
    },
  });

  const validate = useMutation({
    mutationFn: async (body?: string) => {
      if (!accessToken) throw new Error("Non authentifié");
      return apiWithToken(accessToken).consultations.validateBilan(
        careCaseId,
        consultationId,
        body,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation", consultationId] });
    },
  });

  return { generate, validate };
}
