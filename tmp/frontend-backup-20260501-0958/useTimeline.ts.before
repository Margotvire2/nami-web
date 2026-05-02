/**
 * Hook unique pour la timeline d'un care case.
 *
 * Récupère les activités brutes, les transforme en TimelineEvent canoniques,
 * et expose des projections prêtes à consommer par les vues.
 *
 * Usage :
 *   const { data, isLoading } = useTimeline(careCaseId, careCase);
 *   data.events          — tous les événements
 *   data.summary         — résumé trajectoire
 *   data.trajectory      — événements pour la frise
 *   data.filtered("note") — événements filtrés par catégorie
 */

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import type { CareCaseDetail } from "@/lib/api";
import {
  mapActivitiesToTimeline,
  filterByCategory,
  filterForTrajectory,
  type TimelineData,
  type TimelineEvent,
} from "@/lib/timeline";
import { useMemo, useCallback } from "react";

interface UseTimelineResult {
  events: TimelineEvent[];
  trajectory: TimelineEvent[];
  summary: TimelineData["summary"];
  filtered: (categoryKey: string) => TimelineEvent[];
}

export function useTimeline(careCaseId: string, careCase: CareCaseDetail | null) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["timeline", careCaseId, "full"],
    queryFn: () => api.careCases.timeline(careCaseId, 1, 100),
    enabled: !!careCase,
  });

  const timelineData = useMemo<UseTimelineResult | null>(() => {
    if (!rawData || !careCase) return null;

    const mapped = mapActivitiesToTimeline(rawData.data, careCaseId, {
      startDate: careCase.startDate,
      riskLevel: careCase.riskLevel,
      careStage: careCase.careStage,
      nextStepSummary: careCase.nextStepSummary,
    });

    const trajectory = filterForTrajectory(mapped.events);

    return {
      events: mapped.events,
      trajectory,
      summary: mapped.summary,
      filtered: (categoryKey: string) => filterByCategory(mapped.events, categoryKey),
    };
  }, [rawData, careCase, careCaseId]);

  return { data: timelineData, isLoading };
}
