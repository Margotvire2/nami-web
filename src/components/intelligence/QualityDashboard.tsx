"use client";

/**
 * QualityDashboard — bandeau de qualité IA en haut du mode "Recherche
 * documentaire". Helper `pct` exclusif à ce composant.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

function pct(v: number | null): string {
  if (v == null) return "—";
  return `${Math.round(v * 100)}%`;
}

export default function QualityDashboard() {
  const { accessToken } = useAuthStore();
  const [open, setOpen] = useState(false);
  const api = apiWithToken(accessToken!);

  const { data, isLoading } = useQuery({
    queryKey: ["evaluation-stats"],
    queryFn: () => api.intelligence.evaluationStats(),
    staleTime: 5 * 60_000,
    enabled: !!accessToken,
  });

  const score = data?.avgOverallScore ?? null;
  const halluc = data?.avgHallucinationRate ?? null;
  const coverage = data?.avgSourceCoverage ?? null;
  const completeness = data?.avgCompleteness ?? null;
  const total = data?.totalEvaluations ?? 0;

  const scoreColor = (v: number | null) => {
    if (v == null) return "text-gray-400";
    if (v >= 0.9) return "text-emerald-600";
    if (v >= 0.7) return "text-amber-600";
    return "text-red-500";
  };

  const maxDist = Math.max(1, ...(data?.scoreDistribution ?? []).map((d) => d.count));

  const DIST_COLORS: Record<string, string> = {
    "0.9-1.0": "bg-emerald-400",
    "0.8-0.9": "bg-blue-400",
    "0.7-0.8": "bg-amber-400",
    "<0.7":    "bg-red-400",
  };

  // Trend sparkline — last 14 days
  const trend = (data?.trend ?? []).slice(0, 14).reverse();
  const maxTrend = Math.max(0.5, ...trend.map((t) => t.avgScore));

  return (
    <div className="mb-6 rounded-xl border border-[#E8ECF4] bg-white overflow-hidden">
      {/* Header row — always visible */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-[#5B4EC4]" />
            <span className="text-xs font-semibold text-gray-700">Qualité IA</span>
          </div>
          {isLoading ? (
            <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div className="flex items-center gap-4">
              <span className={`text-xs font-bold tabular-nums ${scoreColor(score)}`}>
                {pct(score)} score
              </span>
              <span className="text-xs text-gray-400 tabular-nums">
                {pct(halluc)} halluc.
              </span>
              <span className="text-xs text-gray-400 tabular-nums">
                {pct(coverage)} sources
              </span>
              <span className="text-xs text-gray-400 tabular-nums hidden sm:inline">
                {pct(completeness)} complétude
              </span>
              <span className="text-[10px] text-gray-300">
                {total} éval.
              </span>
            </div>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-[#E8ECF4] px-4 py-4 space-y-4">
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Score global",   value: data?.avgOverallScore,       good: ">= 0.85" },
              { label: "Hallucinations", value: data?.avgHallucinationRate,  invert: true },
              { label: "Couverture",     value: data?.avgSourceCoverage,     good: ">= 0.85" },
              { label: "Complétude",     value: data?.avgCompleteness,       good: ">= 0.85" },
              { label: "Actionnabilité", value: data?.avgActionability,      good: ">= 0.85" },
              { label: "Cohérence",      value: data?.avgConsistency,        good: ">= 0.85" },
            ].map(({ label, value, invert }) => {
              const v = value ?? null;
              const color = v == null ? "text-gray-400"
                : invert
                  ? (v <= 0.05 ? "text-emerald-600" : v <= 0.15 ? "text-amber-600" : "text-red-500")
                  : (v >= 0.9 ? "text-emerald-600" : v >= 0.7 ? "text-amber-600" : "text-red-500");
              return (
                <div key={label} className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center">
                  <div className={`text-lg font-bold tabular-nums ${color}`}>{pct(v)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Score distribution */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Distribution des scores</p>
              <div className="space-y-1.5">
                {(data?.scoreDistribution ?? []).map(({ bucket, count }) => (
                  <div key={bucket} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-14 shrink-0 tabular-nums">{bucket}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${DIST_COLORS[bucket] ?? "bg-gray-400"}`}
                        style={{ width: `${Math.round((count / maxDist) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 w-6 text-right tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend sparkline */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Tendance (30j)</p>
              {trend.length === 0 ? (
                <p className="text-[11px] text-gray-300 italic">Pas encore de données</p>
              ) : (
                <div className="flex items-end gap-0.5 h-12">
                  {trend.map((t, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-[#5B4EC4]/60 hover:bg-[#5B4EC4] transition-colors cursor-default min-w-[4px]"
                      style={{ height: `${Math.round((t.avgScore / maxTrend) * 100)}%` }}
                      title={`${t.date} — ${pct(t.avgScore)}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pipeline context */}
          {data?.pipelineContext && (
            <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-100">
              <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${data.pipelineContext.rerankerEnabled ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                Reranker {data.pipelineContext.rerankerEnabled ? "actif" : "inactif"}
              </span>
              {data.pipelineContext.avgRagChunks != null && (
                <span className="text-[10px] px-2 py-1 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200 font-medium">
                  {data.pipelineContext.avgRagChunks.toFixed(1)} chunks / résumé
                </span>
              )}
              {data.pipelineContext.avgGraphRelations != null && (
                <span className="text-[10px] px-2 py-1 rounded-full border bg-purple-50 text-purple-600 border-purple-200 font-medium">
                  {data.pipelineContext.avgGraphRelations.toFixed(1)} relations graphe
                </span>
              )}
              <span className="text-[10px] px-2 py-1 rounded-full border bg-gray-50 text-gray-500 border-gray-200 font-medium">
                {total} évaluation{total !== 1 ? "s" : ""} totale{total !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
