"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

interface DailyEntry {
  id: string;
  type: string;
  occurredAt: string;
  data: Record<string, unknown>;
  source: string;
}

interface Props {
  profileId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const TYPE_META: Record<string, { emoji: string; label: string }> = {
  FEEDING:          { emoji: "🍼", label: "Repas" },
  SLEEP:            { emoji: "🌙", label: "Sommeil" },
  DIAPER:           { emoji: "🧷", label: "Couche" },
  WEIGHT_HOME:      { emoji: "⚖️", label: "Pesée maison" },
  HEALTH_EVENT:     { emoji: "🌡️", label: "Événement santé" },
  FOOD_INTRODUCTION:{ emoji: "🥣", label: "Diversification" },
  MILESTONE_EVENT:  { emoji: "⭐", label: "Jalon" },
  MEDICATION_INTAKE:{ emoji: "💊", label: "Médicament" },
};

function summarize(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "FEEDING": {
      if (data.feedingType === "BOTTLE") return `Biberon · ${data.volumeMl ?? "?"}ml`;
      if (data.feedingType === "BREASTFEEDING") return `Allaitement · ${data.durationMin ?? "?"}min`;
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
        return `${dur} · ${data.quality ?? ""}`;
      }
      return data.quality ? String(data.quality) : "En cours";
    }
    case "DIAPER": {
      const content = data.content === "BOTH" ? "Selles + urine" : data.content === "STOOL" ? "Selles" : "Urine";
      return `${content}${data.stoolColor ? ` · ${data.stoolColor}` : ""}`;
    }
    case "WEIGHT_HOME":
      return `${data.weightGrams ?? "?"}g${data.isClothed ? " (habillé)" : ""} · à valider`;
    case "HEALTH_EVENT":
      return data.description ? String(data.description).slice(0, 60) : "Événement";
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

export function PediatricParentEntries({ profileId }: Props) {
  const { accessToken } = useAuthStore();

  const { data: entries = [], isLoading } = useQuery<DailyEntry[]>({
    queryKey: ["pediatric-daily-entries", profileId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/pediatric/profiles/${profileId}/daily-entries?limit=30`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error();
      return res.json() as Promise<DailyEntry[]>;
    },
    enabled: !!accessToken && !!profileId,
    staleTime: 30_000,
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
      <p className="text-xs text-[#8A8A96] italic">
        Aucune saisie parent enregistrée.
      </p>
    );
  }

  // Group by day
  const groups: { date: string; items: DailyEntry[] }[] = [];
  for (const e of entries) {
    const date = formatDate(e.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.items.push(e);
    } else {
      groups.push({ date, items: [e] });
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.date}>
          <p className="text-[10px] font-semibold text-[#8A8A96] uppercase tracking-wide mb-2">
            {g.date}
          </p>
          <div className="space-y-1">
            {g.items.map((e) => {
              const meta = TYPE_META[e.type] ?? { emoji: "📝", label: e.type };
              const isPending = e.type === "WEIGHT_HOME";
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#FAFAF8] hover:bg-[#F5F3EF] transition-colors"
                >
                  <span className="text-base shrink-0">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1A1A2E] truncate">
                      {summarize(e.type, e.data)}
                    </p>
                    <p className="text-[10px] text-[#8A8A96]">{meta.label}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPending && (
                      <span className="text-[9px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                        À valider
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
      ))}
    </div>
  );
}
