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
  /** Score moyen d'humeur 7 j sur l'échelle 1-6 (1 = tornado, 6 = sunny), arrondi 1 décimale. */
  moodAvg7d: number | null;
  /** Suite des scores d'humeur 1-6 sur 7 j, triés chronologiquement. */
  moodPoints7d: number[];
  /** Dernière durée de sommeil renseignée (heures), bornée 0-24. */
  latestSleepHours: number | null;
  /** Moyenne heures de sommeil sur 7 j (arrondie 1 décimale), null si aucune donnée. */
  sleepHours7d: number | null;
  /** Suite des durées de sommeil 7 j (heures), triées chronologiquement. */
  sleepPoints7d: number[];
  entriesCount7d: number;
  entriesCountPrev7d: number;
}

/** Échelle subjective MDR-safe : 6 = belle journée → 1 = très dure. */
export const MOOD_SCORE: Record<MoodKey, number> = {
  sunny: 6,
  partly_cloudy: 5,
  cloudy: 4,
  rainy: 3,
  stormy: 2,
  tornado: 1,
};

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
 * Lit les heures de sommeil dans le payload — supporte 3 clés possibles
 * pour absorber la diversité des sources mobiles/intégrations à venir :
 * - `sleepHours` (number, heures)
 * - `sleep_hours` (number, heures)
 * - `sleepMinutes` (number, converti en heures)
 * Borné 0-24 h.
 */
function readSleepHours(payload: Record<string, unknown>): number | null {
  const candidates: Array<unknown> = [payload.sleepHours, payload.sleep_hours];
  for (const raw of candidates) {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return Math.max(0, Math.min(24, raw));
    }
  }
  const minutes = payload.sleepMinutes;
  if (typeof minutes === "number" && Number.isFinite(minutes)) {
    return Math.max(0, Math.min(24, minutes / 60));
  }
  return null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
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
      sleepHours: readSleepHours(e.payload),
    }))
    .filter((e) => e.occurredAt >= cutoff14 && e.occurredAt <= now);

  const sortedDesc = [...emotions].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );

  const latestMood = sortedDesc.find((e) => e.mood !== null)?.mood ?? null;
  const latestEnergy = sortedDesc.find((e) => e.energy !== null)?.energy ?? null;
  const latestSleepHours =
    sortedDesc.find((e) => e.sleepHours !== null)?.sleepHours ?? null;

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

  const moodPoints7d = current7
    .filter((e): e is typeof e & { mood: MoodKey } => e.mood !== null)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
    .map((e) => MOOD_SCORE[e.mood]);

  const moodAvg7d =
    moodPoints7d.length > 0
      ? round1(
          moodPoints7d.reduce((sum, v) => sum + v, 0) / moodPoints7d.length,
        )
      : null;

  const sleepPoints7d = current7
    .filter((e): e is typeof e & { sleepHours: number } => e.sleepHours !== null)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
    .map((e) => e.sleepHours);

  const sleepHours7d =
    sleepPoints7d.length > 0
      ? round1(
          sleepPoints7d.reduce((sum, v) => sum + v, 0) / sleepPoints7d.length,
        )
      : null;

  return {
    latestMood,
    latestEnergy,
    averageEnergy7d,
    energyPoints7d,
    moodAvg7d,
    moodPoints7d,
    latestSleepHours,
    sleepHours7d,
    sleepPoints7d,
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
