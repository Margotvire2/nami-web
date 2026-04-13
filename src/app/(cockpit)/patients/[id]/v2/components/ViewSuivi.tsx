"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatShortDate } from "@/lib/date-utils";
import { PatientDashboard } from "@/hooks/usePatientDashboard";

interface Props {
  careCaseId: string;
  dashboard: PatientDashboard;
}

interface Observation {
  id: string;
  metricId: string;
  metric?: { label: string; unit: string | null };
  valueNumeric: number | null;
  valueText: string | null;
  unit: string | null;
  effectiveAt: string;
}

// ─── Weight curve ────────────────────────────────────────────────────────────

function WeightCurveCard({ observations }: { observations: Observation[] }) {
  const weights = observations
    .filter((o) => o.metricId === "weight_kg" || o.metricId === "poids")
    .filter((o) => o.valueNumeric !== null)
    .sort((a, b) => new Date(a.effectiveAt).getTime() - new Date(b.effectiveAt).getTime())
    .slice(-20);

  if (weights.length < 2) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Courbe de poids</h3>
        <p className="text-sm text-gray-400 italic text-center py-6">Pas assez de mesures</p>
      </div>
    );
  }

  const values = weights.map((w) => w.valueNumeric as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 480, H = 100;
  const step = W / (values.length - 1);
  const y = (v: number) => H - ((v - min) / range) * (H - 16) - 8;

  const pts = values.map((v, i) => `${i * step},${y(v)}`);
  const fillPts = [...pts, `${(values.length - 1) * step},${H}`, `0,${H}`].join(" ");

  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Courbe de poids</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-gray-900">{last.toFixed(1)} kg</span>
          {delta !== 0 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${delta < 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              {delta > 0 ? "+" : ""}{delta.toFixed(1)} kg
            </span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B4EC4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#5B4EC4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill="url(#weightFill)" />
        <polyline points={pts.join(" ")} fill="none" stroke="#5B4EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => (
          <circle key={i} cx={i * step} cy={y(v)} r="3" fill="white" stroke="#5B4EC4" strokeWidth="1.5" />
        ))}
      </svg>

      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{formatShortDate(weights[0].effectiveAt)}</span>
        <span>{formatShortDate(weights[weights.length - 1].effectiveAt)}</span>
      </div>
    </div>
  );
}

// ─── Bio N vs N-1 ────────────────────────────────────────────────────────────

function BioComparisonCard({ observations }: { observations: Observation[] }) {
  // Regrouper par métrique, garder les 2 dernières valeurs pour chaque
  const byMetric = new Map<string, { label: string; unit: string | null; values: { v: number; date: string }[] }>();

  for (const o of observations) {
    if (o.valueNumeric === null) continue;
    const id = o.metricId;
    if (!byMetric.has(id)) {
      byMetric.set(id, {
        label: o.metric?.label ?? id,
        unit: o.unit ?? o.metric?.unit ?? null,
        values: [],
      });
    }
    byMetric.get(id)!.values.push({ v: o.valueNumeric, date: o.effectiveAt });
  }

  const rows: { label: string; unit: string | null; current: number; previous: number | null; date: string }[] = [];
  for (const [, m] of byMetric) {
    const sorted = m.values.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length === 0) continue;
    rows.push({
      label: m.label,
      unit: m.unit,
      current: sorted[0].v,
      previous: sorted[1]?.v ?? null,
      date: sorted[0].date,
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Bilan biologique</h3>
        <p className="text-sm text-gray-400 italic text-center py-6">Aucune mesure</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Bilan — N vs N‑1</h3>
      <div className="divide-y divide-gray-50">
        {rows.slice(0, 12).map((row) => {
          const delta = row.previous !== null ? row.current - row.previous : null;
          return (
            <div key={row.label} className="flex items-center justify-between py-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-gray-700">{row.label}</span>
                <span className="text-[10px] text-gray-400 ml-1">
                  {formatShortDate(row.date)}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {row.previous !== null && (
                  <span className="text-xs text-gray-400 line-through">
                    {fmtVal(row.previous)}{row.unit ? ` ${row.unit}` : ""}
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900">
                  {fmtVal(row.current)}{row.unit ? ` ${row.unit}` : ""}
                </span>
                {delta !== null && delta !== 0 && (
                  <span className={`text-[10px] font-medium ${delta < 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {delta > 0 ? "+" : ""}{fmtVal(delta)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Alimentation heatmap (journal MEAL) ─────────────────────────────────────

function AlimentationHeatmap({ careCaseId }: { careCaseId: string }) {
  const { data: journal } = useQuery<any[]>({
    queryKey: [`journal-${careCaseId}`],
    queryFn: async () => {
      const { data } = await api.get<any[]>(`/care-cases/${careCaseId}/journal`);
      return data;
    },
    staleTime: 60_000,
  });

  const meals = (journal ?? []).filter((j) => j.entryType === "MEAL");

  // Compter les repas par jour sur les 8 dernières semaines
  const dayCount = new Map<string, number>();
  for (const m of meals) {
    const day = new Date(m.occurredAt ?? m.createdAt).toISOString().split("T")[0];
    dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
  }

  // Générer les 56 derniers jours
  const days: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 55; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: dayCount.get(key) ?? 0 });
  }

  const colorFor = (n: number) => {
    if (n === 0) return "bg-gray-100";
    if (n === 1) return "bg-[#C4BBF0]";
    if (n === 2) return "bg-[#9B8EE4]";
    return "bg-[#5B4EC4]";
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Journal alimentaire</h3>
        <span className="text-xs text-gray-400">{meals.length} repas enregistrés</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {days.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} repas`}
            className={`w-4 h-4 rounded-sm ${colorFor(d.count)} transition-colors cursor-pointer`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
        <span>Moins</span>
        <div className="flex gap-1">
          {["bg-gray-100", "bg-[#C4BBF0]", "bg-[#9B8EE4]", "bg-[#5B4EC4]"].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
}

// ─── Santé mentale (questionnaires scores) ───────────────────────────────────

function MentalHealthCard({ dashboard }: { dashboard: PatientDashboard }) {
  const mental = dashboard.questionnaires.filter((q) =>
    ["phq9", "gad7", "binge", "ors", "ede", "ede-q", "eq5d", "bem", "bdi"].some((k) =>
      q.key.toLowerCase().includes(k)
    )
  );

  if (mental.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Santé mentale</h3>
        <p className="text-sm text-gray-400 italic text-center py-6">Aucun questionnaire de santé mentale</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Santé mentale</h3>
      <div className="space-y-3">
        {mental.map((q) => {
          const pct = q.lastScore !== null && q.maxScore ? (q.lastScore / q.maxScore) * 100 : null;
          const barColor = pct === null ? "bg-gray-200" : pct < 40 ? "bg-green-400" : pct < 70 ? "bg-amber-400" : "bg-red-400";
          return (
            <div key={q.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{q.label}</span>
                <div className="flex items-center gap-2">
                  {q.lastScore !== null ? (
                    <span className="text-sm font-semibold text-gray-900">
                      {q.lastScore}{q.maxScore ? `/${q.maxScore}` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                  )}
                  {q.lastCompletedAt && (
                    <span className="text-[10px] text-gray-400">
                      {formatShortDate(q.lastCompletedAt)}
                    </span>
                  )}
                </div>
              </div>
              {pct !== null && (
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activité physique ───────────────────────────────────────────────────────

function ActivityCard({ careCaseId }: { careCaseId: string }) {
  const { data: journal } = useQuery<any[]>({
    queryKey: [`journal-${careCaseId}`],
    queryFn: async () => {
      const { data } = await api.get<any[]>(`/care-cases/${careCaseId}/journal`);
      return data;
    },
    staleTime: 60_000,
  });

  const activities = (journal ?? [])
    .filter((j) => j.entryType === "PHYSICAL_ACTIVITY")
    .sort((a: any, b: any) => new Date(b.occurredAt ?? b.createdAt).getTime() - new Date(a.occurredAt ?? a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Activité physique</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-6">Aucune activité enregistrée</p>
      ) : (
        <div className="space-y-2">
          {activities.map((a: any, i: number) => {
            const payload = a.payload as any;
            return (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏃</span>
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      {payload?.activity ?? payload?.type ?? "Activité"}
                    </p>
                    {payload?.duration && (
                      <p className="text-[10px] text-gray-400">{payload.duration} min</p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {formatShortDate(a.occurredAt ?? a.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ViewSuivi({ careCaseId, dashboard }: Props) {
  const { data: observations } = useQuery<Observation[]>({
    queryKey: [`observations-${careCaseId}`],
    queryFn: async () => {
      const { data } = await api.get<{ observations: Observation[] }>(`/care-cases/${careCaseId}/observations`);
      return data.observations ?? [];
    },
    staleTime: 60_000,
  });

  const obs = observations ?? [];

  return (
    <div className="space-y-5">
      {/* Ligne 1 : courbe de poids + bilan N vs N-1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WeightCurveCard observations={obs} />
        <BioComparisonCard observations={obs} />
      </div>

      {/* Ligne 2 : alimentation + santé mentale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AlimentationHeatmap careCaseId={careCaseId} />
        <MentalHealthCard dashboard={dashboard} />
      </div>

      {/* Ligne 3 : activité physique */}
      <ActivityCard careCaseId={careCaseId} />
    </div>
  );
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function fmtVal(v: number): string {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1);
}
