"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  apiWithToken,
  type TrendDirection,
  type PathwayMetric,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Couleurs par série ──────────────────────────────────────────────────────

const SERIES_COLORS = ["#5B4EC4", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0891B2"];

const TREND_CONFIG: Record<TrendDirection, { icon: typeof TrendingUp; label: string; color: string }> = {
  improving:         { icon: TrendingUp,   label: "En amélioration", color: "text-green-600" },
  stable:            { icon: Minus,         label: "Stable",          color: "text-blue-600" },
  worsening:         { icon: TrendingDown,  label: "En dégradation",  color: "text-red-600" },
  insufficient_data: { icon: AlertCircle,   label: "Données insuffisantes", color: "text-slate-400" },
};

const PERIODS = [
  { key: "30d", label: "30j" },
  { key: "90d", label: "3 mois" },
  { key: "6m",  label: "6 mois" },
  { key: "1y",  label: "1 an" },
  { key: "all", label: "Tout" },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  careCaseId: string;
  pathwayMetrics?: PathwayMetric[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TrajectoryView({ careCaseId, pathwayMetrics }: Props) {
  const { accessToken } = useAuthStore();

  // Métriques sélectionnées (max 3)
  const defaultMetrics = useMemo(() => {
    if (!pathwayMetrics?.length) return ["weight_kg", "bmi", "heart_rate_bpm"];
    // Prendre les 3 premières required ou les plus critiques
    const required = pathwayMetrics.filter((m) => m.required);
    const picks = required.length >= 3 ? required.slice(0, 3) : pathwayMetrics.slice(0, 3);
    return picks.map((m) => m.metricKey);
  }, [pathwayMetrics]);

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(defaultMetrics);
  const [period, setPeriod] = useState("90d");

  const { data, isLoading } = useQuery({
    queryKey: ["trajectory", careCaseId, selectedMetrics, period],
    queryFn: () => apiWithToken(accessToken!).trajectory.get(careCaseId, selectedMetrics, period),
    enabled: !!accessToken && selectedMetrics.length > 0,
  });

  const toggleMetric = (key: string) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, key];
    });
  };

  // Chips disponibles depuis le pathway
  const availableMetrics = useMemo(() => {
    if (!pathwayMetrics?.length) return [];
    // Only show metrics that have data or are required
    return pathwayMetrics.filter((m) => m.required || m.status !== "never");
  }, [pathwayMetrics]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const hasData = data?.series.some((s) => s.dataPoints.length > 0);

  return (
    <div className="space-y-5">
      {/* Sélecteur de métriques */}
      {availableMetrics.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Métriques ({selectedMetrics.length}/3)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableMetrics.map((m) => {
              const isSelected = selectedMetrics.includes(m.metricKey);
              const colorIdx = selectedMetrics.indexOf(m.metricKey);
              return (
                <button
                  key={m.metricKey}
                  onClick={() => toggleMetric(m.metricKey)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                    isSelected
                      ? "text-white border-transparent"
                      : "bg-white text-muted-foreground border-border hover:border-primary/30"
                  )}
                  style={isSelected ? { backgroundColor: SERIES_COLORS[colorIdx] ?? SERIES_COLORS[0] } : undefined}
                >
                  {m.label}
                  {m.unit && <span className="opacity-70 ml-0.5">({m.unit})</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Période */}
      <div className="flex items-center gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
              period === p.key
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Indicateurs résumé */}
      {data?.series && data.series.length > 0 && (
        <div className="flex gap-3">
          {data.series.map((s, i) => {
            const trendCfg = TREND_CONFIG[s.trend];
            const TrendIcon = trendCfg.icon;
            return (
              <div
                key={s.metricKey}
                className="flex-1 rounded-lg border bg-card p-3"
                style={{ borderLeftColor: SERIES_COLORS[i], borderLeftWidth: 3 }}
              >
                <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-lg font-bold tabular-nums">
                    {s.lastValue !== null ? (Number.isInteger(s.lastValue) ? s.lastValue : s.lastValue.toFixed(1)) : "—"}
                  </span>
                  {s.unit && <span className="text-xs text-muted-foreground">{s.unit}</span>}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon size={12} className={trendCfg.color} />
                  <span className={cn("text-[10px] font-medium", trendCfg.color)}>{trendCfg.label}</span>
                  {s.delta !== null && s.delta !== 0 && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({s.delta > 0 ? "+" : ""}{s.delta})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Graphique */}
      {hasData ? (
        <div className="rounded-xl border bg-card p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                type="category"
                allowDuplicatedCategory={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(d: string) => {
                  const date = new Date(d);
                  return `${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "short" })}`;
                }}
              />

              {data?.series.map((s, i) => {
                const chartData = s.dataPoints.map((p) => ({
                  date: p.date,
                  [s.metricKey]: p.value,
                }));

                return (
                  <Line
                    key={s.metricKey}
                    data={chartData}
                    dataKey={s.metricKey}
                    name={`${s.label} (${s.unit ?? ""})`}
                    stroke={SERIES_COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: SERIES_COLORS[i] }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                );
              })}

              {/* Zone normale pour la première série */}
              {data?.series[0]?.normalRange.min != null && data?.series[0]?.normalRange.max != null && (
                <ReferenceArea
                  y1={data.series[0].normalRange.min}
                  y2={data.series[0].normalRange.max}
                  fill="#059669"
                  fillOpacity={0.06}
                  strokeOpacity={0}
                />
              )}

              {/* Événements cliniques */}
              {data?.events.map((e, i) => (
                <ReferenceLine
                  key={i}
                  x={e.date}
                  stroke="#94a3b8"
                  strokeDasharray="2 4"
                  label={{ value: "", position: "top" }}
                />
              ))}

              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelFormatter={(d) =>
                  new Date(String(d)).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/10 p-12 text-center">
          <TrendingUp size={28} className="text-muted-foreground/25 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Pas encore de données</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
            Les courbes apparaîtront dès que des observations seront saisies pour ce patient.
          </p>
        </div>
      )}
    </div>
  );
}
