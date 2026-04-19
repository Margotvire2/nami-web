"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { Loader2, Smartphone } from "lucide-react";

interface DailyEntry {
  id: string;
  type: string;
  occurredAt: string;
  data: Record<string, unknown>;
  source: string;
}

interface FollowUpIndicator {
  id: string;
  type: string;
  status: "OK" | "LOW" | "HIGH" | "WATCH" | "INSUFFICIENT_DATA";
  severity: "INFO" | "ATTENTION" | "CONSULTATION";
  observed: number;
  normMin: number;
  normMax: number;
  unit: string;
  title: string;
  message: string;
  recommendation?: string;
}

interface IndicatorsResponse {
  ageMonths: number;
  dataPoints: number;
  indicators: FollowUpIndicator[];
}

interface Props {
  profileId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const TYPE_META: Record<string, { emoji: string; label: string }> = {
  FEEDING:           { emoji: "🍼", label: "Repas" },
  SLEEP:             { emoji: "😴", label: "Sommeil" },
  DIAPER:            { emoji: "🧷", label: "Couche" },
  WEIGHT_HOME:       { emoji: "⚖️", label: "Pesée maison" },
  HEALTH_EVENT:      { emoji: "🌡️", label: "Événement santé" },
  FOOD_INTRODUCTION: { emoji: "🥣", label: "Diversification" },
  MILESTONE_EVENT:   { emoji: "⭐", label: "Étape de développement" },
  MEDICATION_INTAKE: { emoji: "💊", label: "Médicament" },
};

const STOOL_COLOR_LABELS: Record<string, string> = {
  YELLOW: "Jaune",
  GREEN: "Vert",
  BROWN: "Marron",
  BLACK: "Noir (méconium)",
  RED: "Rouge",
  WHITE: "Blanc",
};

const HEALTH_EVENT_TYPE_LABELS: Record<string, string> = {
  FEVER: "Fièvre",
  VOMITING: "Vomissements",
  DIARRHEA: "Diarrhée",
  RASH: "Éruption",
  CRYING: "Pleurs importants",
  OTHER: "Autre",
};

const FOOD_TEXTURE_LABELS: Record<string, string> = {
  PUREE: "Purée",
  MASHED: "Écrasé",
  FINGER_FOOD: "Morceaux",
};

function summarize(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "FEEDING": {
      if (data.feedingType === "BOTTLE") return `Biberon · ${data.volumeMl ?? "?"}ml`;
      if (data.feedingType === "BREAST" || data.feedingType === "BREASTFEEDING")
        return `Allaitement · ${data.durationMin ?? "?"}min`;
      if (data.feedingType === "MIXED") return `Mixte · ${data.volumeMl ? `${data.volumeMl}ml` : `${data.durationMin ?? "?"}min`}`;
      return "Repas";
    }
    case "SLEEP": {
      const start = data.startedAt ? new Date(data.startedAt as string) : null;
      const end   = data.endedAt   ? new Date(data.endedAt as string)   : null;
      if (start && end) {
        const min = Math.round((end.getTime() - start.getTime()) / 60_000);
        const h = Math.floor(min / 60);
        const m = min % 60;
        const dur = h > 0 ? (m > 0 ? `${h}h${m}min` : `${h}h`) : `${m}min`;
        const quality = data.quality ? ` · ${data.quality === "GOOD" ? "Bon" : data.quality === "AGITATED" ? "Agité" : ""}` : "";
        return `${dur}${quality}`;
      }
      return "En cours";
    }
    case "DIAPER": {
      const content = data.content === "BOTH"
        ? "Selles + urine"
        : data.content === "STOOL" ? "Selles" : "Urine";
      const color = data.stoolColor ? ` · ${STOOL_COLOR_LABELS[data.stoolColor as string] ?? data.stoolColor}` : "";
      return `${content}${color}`;
    }
    case "WEIGHT_HOME":
      return `${data.weightGrams ?? "?"}g${data.isClothed ? " (habillé)" : " (nu)"}`;
    case "HEALTH_EVENT": {
      const evtType = data.eventType
        ? HEALTH_EVENT_TYPE_LABELS[data.eventType as string] ?? String(data.eventType)
        : "";
      const temp = data.temperatureC ? ` · ${data.temperatureC}°C` : "";
      const desc = data.description ? String(data.description).slice(0, 60) : "";
      return [evtType, temp, desc].filter(Boolean).join("") || "Événement";
    }
    case "FOOD_INTRODUCTION": {
      const food = data.foodName ? String(data.foodName) : "Aliment";
      const texture = data.texture ? ` · ${FOOD_TEXTURE_LABELS[data.texture as string] ?? data.texture}` : "";
      const reaction = data.reaction === "ACCEPTED" ? " · accepté" : data.reaction === "REFUSED" ? " · refusé" : data.reaction === "ALLERGY_SUSPECTED" ? " · réaction suspectée" : "";
      return `${food}${texture}${reaction}`;
    }
    case "MILESTONE_EVENT":
      return data.description ? String(data.description).slice(0, 60) : "Nouvelle étape";
    case "MEDICATION_INTAKE": {
      const med = data.medicationName ? String(data.medicationName) : "Médicament";
      const dose = data.doseMg ? ` · ${data.doseMg}mg` : "";
      return `${med}${dose}`;
    }
    default:
      return type.toLowerCase().replace(/_/g, " ");
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function toDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

// Compute per-day totals from entries
interface DayTotals {
  totalMl: number;
  feedingCount: number;
  sleepMinutes: number;
  sleepCount: number;
  diaperCount: number;
  weightGrams?: number;
}

function computeDayTotals(items: DailyEntry[]): DayTotals {
  const t: DayTotals = { totalMl: 0, feedingCount: 0, sleepMinutes: 0, sleepCount: 0, diaperCount: 0 };
  for (const e of items) {
    if (e.type === "FEEDING") {
      t.feedingCount++;
      const ml = Number(e.data.volumeMl ?? 0);
      if (ml > 0) t.totalMl += ml;
    }
    if (e.type === "SLEEP") {
      const start = e.data.startedAt ? new Date(e.data.startedAt as string) : null;
      const end   = e.data.endedAt   ? new Date(e.data.endedAt as string)   : null;
      if (start && end) {
        const min = Math.round((end.getTime() - start.getTime()) / 60_000);
        if (min > 0 && min < 720) { // ignore bogus values > 12h
          t.sleepMinutes += min;
          t.sleepCount++;
        }
      }
    }
    if (e.type === "DIAPER") t.diaperCount++;
    if (e.type === "WEIGHT_HOME" && e.data.weightGrams) {
      t.weightGrams = Number(e.data.weightGrams);
    }
  }
  return t;
}

function minutesToDisplay(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? (m > 0 ? `${h}h${m}` : `${h}h`) : `${m}min`;
}

// 7-day summary across all entries
interface WeekStats {
  avgMl: number;
  avgSleepMin: number;
  avgDiapers: number;
  days: number;
}

function computeWeekStats(entries: DailyEntry[]): WeekStats {
  const byDay: Record<string, DailyEntry[]> = {};
  for (const e of entries) {
    const k = toDateKey(e.occurredAt);
    if (!byDay[k]) byDay[k] = [];
    byDay[k].push(e);
  }
  const days = Object.keys(byDay).length;
  if (days === 0) return { avgMl: 0, avgSleepMin: 0, avgDiapers: 0, days: 0 };

  let totalMl = 0, totalSleep = 0, totalDiapers = 0;
  for (const items of Object.values(byDay)) {
    const t = computeDayTotals(items);
    totalMl += t.totalMl;
    totalSleep += t.sleepMinutes;
    totalDiapers += t.diaperCount;
  }
  return {
    avgMl: Math.round(totalMl / days),
    avgSleepMin: Math.round(totalSleep / days),
    avgDiapers: Math.round((totalDiapers / days) * 10) / 10,
    days,
  };
}

const STATUS_COLOR: Record<string, string> = {
  OK:               "text-emerald-700 bg-emerald-50 border-emerald-200",
  LOW:              "text-amber-700 bg-amber-50 border-amber-200",
  HIGH:             "text-violet-700 bg-violet-50 border-violet-200",
  WATCH:            "text-amber-700 bg-amber-50 border-amber-200",
  INSUFFICIENT_DATA:"text-slate-500 bg-slate-50 border-slate-200",
};
const STATUS_ICON: Record<string, string> = {
  OK: "✓", LOW: "↓", HIGH: "↑", WATCH: "⚑", INSUFFICIENT_DATA: "?",
};

export function PediatricParentEntries({ profileId }: Props) {
  const { accessToken } = useAuthStore();

  const { data: entries = [], isLoading } = useQuery<DailyEntry[]>({
    queryKey: ["pediatric-daily-entries", profileId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/pediatric/profiles/${profileId}/daily-entries?limit=100`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error();
      return res.json() as Promise<DailyEntry[]>;
    },
    enabled: !!accessToken && !!profileId,
    staleTime: 30_000,
  });

  const { data: indicatorsData } = useQuery<IndicatorsResponse>({
    queryKey: ["pediatric-indicators", profileId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/pediatric/profiles/${profileId}/indicators`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error();
      return res.json() as Promise<IndicatorsResponse>;
    },
    enabled: !!accessToken && !!profileId,
    staleTime: 2 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#8A8A96] py-2">
        <Loader2 size={13} className="animate-spin" /> Chargement…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <Smartphone size={28} className="text-[#8A8A96]" />
        <p className="text-xs text-[#8A8A96]">Aucune saisie parent enregistrée.</p>
        <p className="text-[10px] text-[#8A8A96]">Les données apparaîtront ici dès que la famille utilise l'application.</p>
      </div>
    );
  }

  // Group by day
  const groups: { date: string; dateKey: string; items: DailyEntry[] }[] = [];
  for (const e of entries) {
    const date = formatDate(e.occurredAt);
    const dateKey = toDateKey(e.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.dateKey === dateKey) {
      last.items.push(e);
    } else {
      groups.push({ date, dateKey, items: [e] });
    }
  }

  const weekStats = computeWeekStats(entries);
  const flaggedIndicators = (indicatorsData?.indicators ?? []).filter(
    (i) => i.severity !== "INFO" && i.status !== "INSUFFICIENT_DATA"
  );

  return (
    <div className="space-y-5">
      {/* 7-day summary card */}
      <div className="rounded-xl border border-[#E8ECF4] bg-[#F8F9FF] p-4">
        <p className="text-[10px] font-semibold text-[#8A8A96] uppercase tracking-wide mb-3">
          Moyennes sur {weekStats.days} jour{weekStats.days > 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg">🍼</p>
            <p className="text-base font-bold text-[#1A1A2E]">
              {weekStats.avgMl > 0 ? `${weekStats.avgMl}ml` : "—"}
            </p>
            <p className="text-[10px] text-[#8A8A96]">Lait/j</p>
          </div>
          <div className="text-center">
            <p className="text-lg">😴</p>
            <p className="text-base font-bold text-[#1A1A2E]">
              {weekStats.avgSleepMin > 0 ? minutesToDisplay(weekStats.avgSleepMin) : "—"}
            </p>
            <p className="text-[10px] text-[#8A8A96]">Sommeil/j</p>
          </div>
          <div className="text-center">
            <p className="text-lg">🧷</p>
            <p className="text-base font-bold text-[#1A1A2E]">
              {weekStats.avgDiapers > 0 ? weekStats.avgDiapers : "—"}
            </p>
            <p className="text-[10px] text-[#8A8A96]">Couches/j</p>
          </div>
        </div>
      </div>

      {/* Indicators banner — visible to soignant */}
      {flaggedIndicators.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
          <p className="text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
            Indicateurs de suivi (7 derniers jours)
          </p>
          <div className="space-y-1.5">
            {flaggedIndicators.map((ind) => (
              <div key={ind.id} className="flex items-start gap-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${STATUS_COLOR[ind.status]}`}>
                  {STATUS_ICON[ind.status]} {ind.status === "LOW" ? "En dessous" : ind.status === "HIGH" ? "Au-dessus" : "À suivre"}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-900">{ind.title}</p>
                  <p className="text-[10px] text-amber-700">{ind.message}</p>
                  {ind.recommendation && (
                    <p className="text-[10px] text-amber-600 italic mt-0.5">→ {ind.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-amber-600 mt-1">
            Indicateurs non cliniques destinés à l'organisation du dossier · Sources : HAS · OMS · SFP
          </p>
        </div>
      )}

      {/* Day groups */}
      {groups.map((g) => {
        const totals = computeDayTotals(g.items);
        return (
          <div key={g.dateKey}>
            {/* Day header with totals */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-[#8A8A96] uppercase tracking-wide">
                {g.date}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-[#4A4A5A]">
                {totals.totalMl > 0 && (
                  <span className="flex items-center gap-0.5">
                    <span>🍼</span>
                    <span className="font-semibold">{totals.totalMl}ml</span>
                  </span>
                )}
                {totals.sleepMinutes > 0 && (
                  <span className="flex items-center gap-0.5">
                    <span>😴</span>
                    <span className="font-semibold">{minutesToDisplay(totals.sleepMinutes)}</span>
                  </span>
                )}
                {totals.diaperCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <span>🧷</span>
                    <span className="font-semibold">{totals.diaperCount}</span>
                  </span>
                )}
                {totals.weightGrams && (
                  <span className="flex items-center gap-0.5">
                    <span>⚖️</span>
                    <span className="font-semibold">{(totals.weightGrams / 1000).toFixed(2)}kg</span>
                  </span>
                )}
              </div>
            </div>

            {/* Entries */}
            <div className="space-y-1">
              {g.items.map((e) => {
                const meta = TYPE_META[e.type] ?? { emoji: "📝", label: e.type };
                const isWeight = e.type === "WEIGHT_HOME";
                const isAllergy = e.type === "FOOD_INTRODUCTION" && e.data.reaction === "ALLERGY_SUSPECTED";
                const isMilestone = e.type === "MILESTONE_EVENT";
                const isHealthEvent = e.type === "HEALTH_EVENT";

                return (
                  <div
                    key={e.id}
                    className={`flex items-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isAllergy
                        ? "bg-red-50 border border-red-100"
                        : isMilestone
                        ? "bg-purple-50 border border-purple-100"
                        : isHealthEvent
                        ? "bg-orange-50 border border-orange-100"
                        : "bg-[#FAFAF8] hover:bg-[#F5F3EF]"
                    }`}
                  >
                    <span className="text-base shrink-0 mt-0.5">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A1A2E]">
                        {summarize(e.type, e.data)}
                      </p>
                      <p className="text-[10px] text-[#8A8A96]">{meta.label}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isWeight && (
                        <span className="text-[9px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          À valider
                        </span>
                      )}
                      {isAllergy && (
                        <span className="text-[9px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                          Réaction
                        </span>
                      )}
                      <span className="text-[10px] text-[#8A8A96]">
                        {formatTime(e.occurredAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-[#8A8A96] text-center pt-1">
        {entries.length} saisie{entries.length > 1 ? "s" : ""} · Données saisies par la famille via l'application Nami
      </p>
    </div>
  );
}
