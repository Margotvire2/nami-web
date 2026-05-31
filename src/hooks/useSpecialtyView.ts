"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

export type SpecialtyView =
  | "DIETITIAN"
  | "PSYCHOLOGIST"
  | "PHYSICIAN"
  | "PEDIATRICIAN"
  | "ENDOCRINOLOGIST"
  | "OTHER";

export interface SpecialtyViewConfig {
  primaryModules: string[];
  metrics: string[];
  journalTypes: string[];
  label: string;
}

interface SpecialtyViewResponse {
  specialtyView: SpecialtyView;
  config: SpecialtyViewConfig;
}

const FALLBACK: SpecialtyViewResponse = {
  specialtyView: "OTHER",
  config: {
    primaryModules: [],
    metrics: [],
    journalTypes: [],
    label: "Vue générale",
  },
};

export function useSpecialtyView() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data } = useQuery({
    queryKey: ["specialty-view", accessToken ? "auth" : "anon"],
    queryFn: async (): Promise<SpecialtyViewResponse> => {
      if (!accessToken) return FALLBACK;
      const api = apiWithToken(accessToken);
      try {
        const res = await api.providers.specialtyView();
        return res;
      } catch {
        return FALLBACK;
      }
    },
    enabled: !!accessToken,
    staleTime: 10 * 60_000,
  });

  const value = data ?? FALLBACK;
  return {
    specialtyView: value.specialtyView,
    primaryModules: value.config.primaryModules,
    metrics: value.config.metrics,
    journalTypes: value.config.journalTypes,
    isGenericView:
      value.specialtyView === "OTHER" ||
      (value.config.metrics.length === 0 &&
        value.config.primaryModules.length === 0 &&
        value.config.journalTypes.length === 0),
  };
}
