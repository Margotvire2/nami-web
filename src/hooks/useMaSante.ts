"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type JournalEntry } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export type MoodKey =
  | "sunny"
  | "partly_cloudy"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "tornado";

export interface MaSanteAggregate {
  latestMood: MoodKey | null;
  latestEnergy: number | null;
  averageEnergy7d: number | null;
  energyPoints7d: number[];
  entriesCount7d: number;
  entriesCountPrev7d: number;
}

const MOOD_KEYS: ReadonlySet<MoodKey> = new Set([
  "sunny",
  "partly_cloudy",
  "cloudy",
  "rainy",
  "stormy",
  "tornado",
]);

function isMoodKey(value: unknown): value is MoodKey {
  return typeof value === "string" && MOOD_KEYS.has(value as MoodKey);
}

function readEnergy(payload: Record<string, unknown>): number | null {
  const raw = payload.energy;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return Math.max(0, Math.min(100, raw));
}

function readMood(payload: Record<string, unknown>): MoodKey | null {
  return isMoodKey(payload.mood) ? payload.mood : null;
}

/**
 * Agrège les entrées EMOTION sur 14 jours :
 * - dernière humeur / énergie (entrée la plus récente avec la valeur présente)
 * - moyenne énergie 7j courants
 * - points énergie 7j courants triés chronologiquement
 * - counts 7j courants et 7j précédents
 *
 * Pure et déterministe — testable sans IO.
 */
export function aggregate(
  entries: JournalEntry[],
  now: Date = new Date(),
): MaSanteAggregate {
  const cutoff7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cutoff14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const emotions = entries
    .filter((e) => e.entryType === "EMOTION")
    .map((e) => ({
      occurredAt: new Date(e.occurredAt),
      mood: readMood(e.payload),
      energy: readEnergy(e.payload),
    }))
    .filter((e) => e.occurredAt >= cutoff14 && e.occurredAt <= now);

  const sortedDesc = [...emotions].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );

  const latestMood = sortedDesc.find((e) => e.mood !== null)?.mood ?? null;
  const latestEnergy = sortedDesc.find((e) => e.energy !== null)?.energy ?? null;

  const current7 = emotions.filter((e) => e.occurredAt >= cutoff7);
  const prev7 = emotions.filter(
    (e) => e.occurredAt < cutoff7 && e.occurredAt >= cutoff14,
  );

  const energyPoints7d = current7
    .filter((e): e is typeof e & { energy: number } => e.energy !== null)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
    .map((e) => e.energy);

  const averageEnergy7d =
    energyPoints7d.length > 0
      ? Math.round(
          energyPoints7d.reduce((sum, v) => sum + v, 0) / energyPoints7d.length,
        )
      : null;

  return {
    latestMood,
    latestEnergy,
    averageEnergy7d,
    energyPoints7d,
    entriesCount7d: current7.length,
    entriesCountPrev7d: prev7.length,
  };
}

export function useMaSante(careCaseId: string | undefined) {
  const token = useAuthStore((s) => s.accessToken);

  return useQuery<MaSanteAggregate>({
    queryKey: ["patient", "ma-sante", careCaseId],
    enabled: !!token && !!careCaseId,
    staleTime: 60_000,
    queryFn: async () => {
      const now = new Date();
      const from = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const to = now.toISOString();
      const entries = await apiWithToken(token!).journal.list(careCaseId!, {
        type: "EMOTION",
        from,
        to,
      });
      return aggregate(entries, now);
    },
  });
}
