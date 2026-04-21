"use client";

import { useState, useEffect, useCallback } from "react";
import { MarkdownContent } from "@/components/MarkdownContent";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PatientDashboard, DashboardIndicator } from "@/hooks/usePatientDashboard";
import { CareCaseDetail, type TrajectoryMetric } from "@/lib/api";
import { ProtocolBanner } from "@/components/protocol/ProtocolBanner";
import { getClinicalProfile, getDeltaColorClass, type ClinicalProfile } from "@/lib/clinicalProfile";
import { GrowthCharts } from "@/components/patient/GrowthCharts";

interface Props {
  dashboard: PatientDashboard;
  careCaseId: string;
  careCase?: CareCaseDetail;
}

export function ViewGlobale({ dashboard, careCaseId, careCase }: Props) {
  const { indicators, questionnaires, actions, alerts, screenings } = dashboard;
  const profile: ClinicalProfile = getClinicalProfile(careCase);

  // Calcul isMinor / isInfant depuis birthDate (côté frontend uniquement pour l'affichage)
  let patientAgeMonths = 0;
  let isMinor = false;
  let isInfant = false;
  if (careCase?.patient?.birthDate) {
    const birth = new Date(careCase.patient.birthDate);
    const now = new Date();
    patientAgeMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());
    isMinor = patientAgeMonths < 216; // < 18 ans
    isInfant = patientAgeMonths <= 36; // ≤ 3 ans (PC disponible)
  }

  const patientSex =
    careCase?.patient?.sex?.toUpperCase() === "F" ||
    careCase?.patient?.sex?.toUpperCase() === "FEMALE" ||
    careCase?.patient?.sex?.toUpperCase() === "FEMME"
      ? ("F" as const)
      : ("M" as const);

  return (
    <div className="space-y-5">
      <ClinicalSummaryCard careCaseId={careCaseId} />
      <DeltaTickerBanner indicators={indicators} questionnaires={questionnaires} profile={profile} />
      <TrajectoryDeviationBanner
        careCaseId={careCaseId}
        patientFirstName={careCase?.patient?.firstName ?? ""}
      />
      <ProtocolBanner careCaseId={careCaseId} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <KeyIndicatorsGrid indicators={indicators} questionnaires={questionnaires} profile={profile} />
          {isMinor && careCase && (
            <GrowthCharts
              patientId={careCase.patient.id}
              careCaseId={careCaseId}
              sex={patientSex}
              ageMonths={patientAgeMonths}
              isInfant={isInfant}
            />
          )}
        </div>
        <div className="space-y-4">
          <ActionsPanel actions={actions} />
          {careCase && <PatientInfoCard careCase={careCase} />}
          <ConditionsCard careCaseId={careCaseId} />
          <CareTeamCard careCaseId={careCaseId} />
          <FlagsBanner alerts={alerts} screenings={screenings} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// TRAJECTORY DEVIATION BANNER
// ══════════════════════════════════════════════════════

function TrajSparkMini({ spark, stdResidual, zScore }: {
  spark: { value: number; predicted: number; date: string }[];
  stdResidual: number;
  zScore: number;
}) {
  if (spark.length < 2) return null;
  const W = 80, H = 28;
  const std = stdResidual || 0.001;
  const predFirst = spark[0].predicted;
  const predLast  = spark[spark.length - 1].predicted;
  const allVals = [
    ...spark.map((p) => p.value),
    predFirst + 2 * std, predFirst - 2 * std,
    predLast + 2 * std, predLast - 2 * std,
  ];
  const min = Math.min(...allVals), max = Math.max(...allVals);
  const range = max - min || 1;
  const xi = (i: number) => (i / (spark.length - 1)) * W;
  const yv = (v: number) => H - ((v - min) / range) * (H - 4) - 2;
  const linePts = spark.map((p, i) => `${xi(i)},${yv(p.value)}`).join(" ");
  const absZ = Math.abs(zScore);
  const dotColor = absZ >= 3 ? "#DC2626" : "#D97706";
  const lx = xi(spark.length - 1), ly = yv(spark[spark.length - 1].value);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 80, height: 28 }} preserveAspectRatio="none">
      <line x1={0} y1={yv(predFirst)} x2={W} y2={yv(predLast)}
        stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3,2" />
      <polyline points={linePts} fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={4} fill={dotColor} fillOpacity="0.25" />
      <circle cx={lx} cy={ly} r={2.5} fill={dotColor} />
    </svg>
  );
}

function TrajectoryDeviationBanner({
  careCaseId,
  patientFirstName,
}: {
  careCaseId: string;
  patientFirstName: string;
}) {
  const sessionKey = `traj-dismissed-${careCaseId}`;
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(sessionKey) || "[]");
    } catch { return []; }
  });

  function dismissMetric(key: string) {
    const next = [...dismissed, key];
    setDismissed(next);
    try { sessionStorage.setItem(sessionKey, JSON.stringify(next)); } catch {}
  }

  const { data } = useQuery({
    queryKey: ["obs-trajectory", careCaseId],
    queryFn: async () => {
      const { data } = await api.get<{
        deviations: TrajectoryMetric[]; stable: TrajectoryMetric[];
      }>(`/care-cases/${careCaseId}/observations/trajectory`);
      return data;
    },
    staleTime: 5 * 60_000,
  });

  const deviations = (data?.deviations ?? []).filter(
    (m) => !dismissed.includes(m.metricKey)
  );

  if (deviations.length === 0) return null;

  const topN = deviations.slice(0, 3);
  const name = patientFirstName || "Le patient";

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-semibold text-red-800">
            Écarts de trajectoire détectés
          </p>
          <p className="text-[11px] text-red-500 mt-0.5">
            Régression linéaire OLS · brouillon indicatif — à vérifier par le soignant
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
          {deviations.length} métrique{deviations.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {topN.map((m) => {
          const absZ       = Math.abs(m.zScore);
          const isCritical = absZ >= 3;
          const arrow      = m.direction === "up" ? "↑" : "↓";
          const diff       = m.currentValue - m.predictedValue;
          const diffStr    = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}${m.unit ? ` ${m.unit}` : ""}`;
          return (
            <div
              key={m.metricKey}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 border ${
                isCritical ? "bg-red-50 border-red-200" : "bg-white border-amber-100"
              }`}
            >
              {/* Mini sparkline */}
              <div className="shrink-0 text-amber-600">
                <TrajSparkMini spark={m.spark} stdResidual={m.stdResidual} zScore={m.zScore} />
              </div>

              {/* Narrative */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800">
                  <span className="text-amber-700">{name}</span>
                  {" · "}
                  {m.metricLabel} a dévié de sa trajectoire de{" "}
                  <strong className={isCritical ? "text-red-700" : "text-amber-700"}>
                    {arrow} {m.deviationLabel}
                  </strong>
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {m.currentValue.toFixed(1)}{m.unit ? ` ${m.unit}` : ""} mesuré
                  · attendu {m.predictedValue.toFixed(1)}{m.unit ? ` ${m.unit}` : ""}
                  {" "}({diffStr})
                  {m.trendSlopeLabel && m.trendSlopeLabel !== "stable" && (
                    <span className="ml-1 text-gray-400">· tendance {m.trendSlopeLabel}</span>
                  )}
                </p>
              </div>

              {/* Dismiss (sessionStorage — réapparaît au rechargement complet) */}
              <button
                onClick={() => dismissMetric(m.metricKey)}
                className="shrink-0 text-red-200 hover:text-red-500 transition-colors"
                title="Masquer pour cette session"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// RÉSUMÉ IA
// ══════════════════════════════════════════════════════

function ClinicalSummaryCard({ careCaseId }: { careCaseId: string }) {
  const qc = useQueryClient();
  const [sections, setSections] = useState<{ title: string; content: string }[]>([]);
  const [collapsed, setCollapsed] = useState(true);
  const [showFull, setShowFull] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const feedbackMutation = useMutation({
    mutationFn: (r: number) => api.post("/intelligence/summary-feedback", { careCaseId, rating: r }),
    onSuccess: () => toast.success("Merci pour votre retour"),
    onError: () => toast.error("Erreur lors de l'envoi du feedback"),
  });
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    api.get(`/care-cases/${careCaseId}`).then((res) => {
      if (res.data?.clinicalSummary) {
        setSections(parseSummary(res.data.clinicalSummary));
        setLastUpdated(res.data.updatedAt || null);
      }
    }).catch(() => {});
  }, [careCaseId]);

  const generate = useCallback(async () => {
    const token = (() => {
      try { const s = localStorage.getItem("nami-auth"); return s ? JSON.parse(s)?.state?.accessToken : null; } catch { return null; }
    })();
    if (!token) return;
    setIsStreaming(true);
    setStreamText("");
    setRating(null);

    try {
      const res = await fetch(`${API_URL}/intelligence/summarize-job/${careCaseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la génération");
      const { jobId } = await res.json() as { jobId: string };

      const deadline = Date.now() + 5 * 60 * 1000;
      const poll = async (): Promise<void> => {
        if (Date.now() > deadline) { setIsStreaming(false); toast.error("La génération a pris trop de temps"); return; }
        const statusRes = await fetch(`${API_URL}/intelligence/summarize-job/${jobId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statusRes.ok) { setIsStreaming(false); return; }
        const { status } = await statusRes.json() as { status: string };
        if (status === "completed") {
          setIsStreaming(false);
          qc.invalidateQueries({ queryKey: ["care-case", careCaseId] });
          qc.invalidateQueries({ queryKey: ["notes", careCaseId] });
          qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
          toast.success("Synthèse clinique générée");
          api.get(`/care-cases/${careCaseId}`).then((r) => {
            if (r.data?.clinicalSummary) {
              setSections(parseSummary(r.data.clinicalSummary));
              setLastUpdated(new Date().toISOString());
            }
          }).catch(() => {});
        } else if (status === "failed") {
          setIsStreaming(false);
          toast.error("Erreur lors de la génération de la synthèse");
        } else {
          setTimeout(poll, 3000);
        }
      };
      setTimeout(poll, 3000);
    } catch {
      setIsStreaming(false);
      toast.error("Erreur de connexion à la synthèse clinique");
    }
  }, [careCaseId, qc, API_URL]);

  function parseSummary(text: string): { title: string; content: string }[] {
    if (!text) return [];
    const result: { title: string; content: string }[] = [];
    let title = "Synthèse";
    let content: string[] = [];
    for (const line of text.split("\n")) {
      const t = line.trim();
      const isTitle = t.startsWith("## ") || t.startsWith("### ") || (t.startsWith("**") && t.endsWith("**") && t.length > 4);
      if (isTitle && content.length > 0) {
        result.push({ title, content: content.join("\n").trim() });
        content = [];
        title = t.replace(/^#{1,3}\s*/, "").replace(/^\*\*|\*\*$/g, "").replace(/\s*:$/, "").trim();
      } else if (t) content.push(t);
    }
    if (content.length > 0) result.push({ title, content: content.join("\n").trim() });
    return result.length > 0 ? result : text.trim() ? [{ title: "Synthèse", content: text.trim() }] : [];
  }

  const icons: Record<string, string> = {
    "Synthèse": "📋", "Diagnostic": "🩺", "Situation actuelle": "📍", "Évolution": "📈",
    "Plan de soins": "🗺️", "Traitements": "💊", "Points de vigilance": "⚠️", "Objectifs": "🎯",
  };

  const excerpt = sections[0]?.content
    ? sections[0].content.replace(/\*\*/g, "").replace(/\n/g, " ").slice(0, 220) + (sections[0].content.length > 220 ? "…" : "")
    : "";

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden border-l-4 border-l-[#5B4EC4]">
      {/* Header */}
      <button
        onClick={() => sections.length > 0 && setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/50"
      >
        <div className="flex items-center gap-2">
          <span>✨</span>
          <h3 className="text-sm font-semibold text-gray-900">Résumé clinique</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-100">
            Brouillon · à valider
          </span>
          {lastUpdated && (
            <span className="text-[10px] text-gray-400">
              {new Date(lastUpdated).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); generate(); }}
            disabled={isStreaming}
            className="text-xs px-3 py-1 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] disabled:opacity-50"
          >
            {isStreaming ? "…" : sections.length > 0 ? "Actualiser" : "Générer"}
          </button>
          {sections.length > 0 && <Chevron open={!collapsed} />}
        </div>
      </button>

      {/* Spinner génération */}
      {isStreaming && (
        <div className="px-5 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-xs text-[#5B4EC4]">Génération en cours…</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isStreaming && sections.length === 0 && (
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Aucun résumé disponible. Cliquez sur <strong>Générer</strong> pour créer une synthèse clinique.</p>
        </div>
      )}

      {/* Excerpt (collapsed) */}
      {!isStreaming && !collapsed && sections.length > 0 && !showFull && (
        <div className="px-5 pb-4 border-t border-gray-100 mt-0">
          <AiDisclaimer variant="inline" className="mt-3 mb-2" />
          <p className="text-sm text-gray-700 leading-relaxed">{excerpt}</p>
          <button
            onClick={() => setShowFull(true)}
            className="mt-2 text-xs text-[#5B4EC4] hover:underline font-medium"
          >
            Voir le résumé complet →
          </button>
        </div>
      )}

      {/* Résumé complet */}
      {!isStreaming && !collapsed && sections.length > 0 && showFull && (
        <div className="px-5 pb-4 border-t border-gray-100">
          <AiDisclaimer variant="inline" className="mt-3 mb-2" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {sections.map((s, i) => (
              <div key={i} className="rounded-lg bg-gray-50/70 p-3 border border-gray-100">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>{icons[s.title] || "📄"}</span>{s.title}
                </h4>
                <MarkdownContent content={s.content} compact />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setShowFull(false)} className="text-xs text-gray-400 hover:text-gray-600">
              ← Réduire
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">Qualité :</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={feedbackMutation.isPending}
                  onClick={() => { setRating(star); feedbackMutation.mutate(star); }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="text-base leading-none transition-transform hover:scale-110 disabled:opacity-50"
                  aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                >
                  {star <= (hoverRating ?? rating ?? 0) ? "★" : "☆"}
                </button>
              ))}
              {rating !== null && <span className="text-[11px] text-[#5B4EC4]">Merci !</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// BANDEAU DELTAS
// ══════════════════════════════════════════════════════

function DeltaTickerBanner({ indicators, questionnaires, profile }: {
  indicators: DashboardIndicator[];
  questionnaires: PatientDashboard["questionnaires"];
  profile: ClinicalProfile;
}) {
  const deltas: { metricKey: string; label: string; delta: number; unit: string; percent: number | null }[] = [];

  for (const ind of indicators) {
    if (ind.delta != null && ind.delta !== 0) {
      deltas.push({ metricKey: ind.metricKey, label: ind.label, delta: ind.delta, unit: ind.unit || "", percent: ind.deltaPercent });
    }
  }

  for (const q of questionnaires) {
    if (q.lastScore != null && q.previousScore != null && q.lastScore !== q.previousScore) {
      deltas.push({ metricKey: q.key, label: q.label, delta: q.lastScore - q.previousScore, unit: "", percent: null });
    }
  }

  if (deltas.length === 0) return null;

  const latestDate = indicators
    .filter((i) => i.lastObservedAt)
    .map((i) => new Date(i.lastObservedAt!))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 overflow-x-auto">
      <span className="text-xs text-gray-400 flex-shrink-0">
        ↻ Depuis le {latestDate ? latestDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"} :
      </span>
      <div className="flex items-center gap-3 overflow-x-auto">
        {deltas.map((d, i) => (
          <span key={i} className={`flex-shrink-0 text-xs font-medium ${getDeltaColorClass(d.metricKey, d.delta, profile)}`}>
            {d.label} {d.delta > 0 ? "+" : ""}{fv(d.delta)}{d.unit ? ` ${d.unit}` : ""} {d.delta > 0 ? "↑" : "↓"}
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// INDICATEURS CLÉS
// ══════════════════════════════════════════════════════

function KeyIndicatorsGrid({ indicators, questionnaires, profile }: {
  indicators: DashboardIndicator[];
  questionnaires: PatientDashboard["questionnaires"];
  profile: ClinicalProfile;
}) {
  const withValues = indicators.filter((i) => i.value !== null || i.status === "CRITICAL" || i.status === "ALERT" || i.required);
  const byDomain = new Map<string, DashboardIndicator[]>();
  for (const ind of withValues) {
    const group = byDomain.get(ind.domain) || [];
    group.push(ind);
    byDomain.set(ind.domain, group);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Indicateurs</h3>
        <button className="text-xs text-[#5B4EC4] hover:underline font-medium">+ Saisir une observation</button>
      </div>
      <div className="space-y-4">
        {Array.from(byDomain.entries()).map(([domain, inds]) => (
          <div key={domain}>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">{domain}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {inds.map((ind) => (
                <IndicatorTile key={ind.metricKey} ind={ind} profile={profile} />
              ))}
            </div>
          </div>
        ))}
        {questionnaires.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Questionnaires</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {questionnaires.map((q) => (
                <div key={q.key} className={`flex-shrink-0 rounded-lg border p-3 min-w-[110px] cursor-pointer hover:shadow-sm ${
                  q.timeStatus === "OVERDUE" ? "border-red-200 bg-red-50/50" :
                  q.timeStatus === "DUE_SOON" ? "border-amber-200 bg-amber-50/50" :
                  q.timeStatus === "NEVER" ? "border-gray-200 bg-gray-50/50" :
                  "border-green-200 bg-green-50/50"
                }`}>
                  <p className="text-[11px] font-medium text-gray-500">{q.label}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-0.5">
                    {q.lastScore ?? "—"}{q.maxScore ? <span className="text-[10px] text-gray-400 font-normal">/{q.maxScore}</span> : null}
                  </p>
                  {q.lastCompletedAt && <p className="text-[10px] text-gray-400">{new Date(q.lastCompletedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IndicatorTile({ ind, profile }: { ind: DashboardIndicator; profile: ClinicalProfile }) {
  const c = {
    OK: { bg: "bg-green-50/60", border: "border-green-100", text: "text-green-800", dot: "bg-green-400" },
    ALERT: { bg: "bg-amber-50/60", border: "border-amber-100", text: "text-amber-800", dot: "bg-amber-400" },
    CRITICAL: { bg: "bg-red-50/60", border: "border-red-100", text: "text-red-800", dot: "bg-red-400" },
    MISSING: { bg: "bg-gray-50/60", border: "border-gray-100", text: "text-gray-400", dot: "bg-gray-300" },
  }[ind.status];

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3 cursor-pointer hover:shadow-sm`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-gray-500 truncate">{ind.label}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      </div>
      {ind.value !== null ? (
        <span className={`text-xl font-semibold ${c.text}`}>{fv(ind.value)}<span className="text-[10px] text-gray-400 ml-0.5">{ind.unit}</span></span>
      ) : (
        <span className="text-lg text-gray-200">—</span>
      )}
      {ind.delta != null && ind.delta !== 0 && (
        <span className={`block text-[10px] font-medium ${getDeltaColorClass(ind.metricKey, ind.delta, profile)}`}>
          {ind.delta > 0 ? "↑" : "↓"} {Math.abs(ind.delta).toFixed(1)}{ind.deltaPercent ? ` (${ind.delta > 0 ? "+" : ""}${ind.deltaPercent}%)` : ""}
        </span>
      )}
      {ind.sparkline.length >= 3 && (
        <div className="mt-1 opacity-60 hover:opacity-100">
          <MiniChart values={ind.sparkline} color={ind.status === "CRITICAL" ? "#ef4444" : ind.status === "ALERT" ? "#f59e0b" : "#22c55e"} />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// COLONNE DROITE
// ══════════════════════════════════════════════════════

function ActionsPanel({ actions }: { actions: PatientDashboard["actions"] }) {
  const { urgentTasks, upcomingAppointments, pendingReferrals, suggestedReferrals } = actions;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">À faire</h3>
      {urgentTasks.map((t) => (
        <div key={t.id} className="flex items-start gap-2 py-1">
          <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-[#5B4EC4] w-3.5 h-3.5" />
          <div>
            <p className="text-xs text-gray-700">{t.label}</p>
            {t.dueDate && <p className="text-[10px] text-red-400">{new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>}
          </div>
        </div>
      ))}
      {upcomingAppointments.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Prochains RDV</p>
          {upcomingAppointments.map((a) => (
            <div key={a.id} className="flex justify-between py-1 text-xs">
              <span className="text-gray-700 truncate">{a.providerName || "RDV"}</span>
              <span className="text-[10px] text-gray-400">{new Date(a.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span>
            </div>
          ))}
        </div>
      )}
      {pendingReferrals.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Adressages en cours</p>
          {pendingReferrals.map((r) => (
            <div key={r.id} className="flex justify-between py-1 text-xs">
              <span className="text-gray-700">{r.toSpecialty || "Spécialiste"}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{r.status}</span>
            </div>
          ))}
        </div>
      )}
      {suggestedReferrals.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-[#5B4EC4] uppercase tracking-wider mb-1">Suggérés</p>
          {suggestedReferrals.slice(0, 3).map((s, i) => (
            <div key={i} className="flex justify-between py-1 text-xs">
              <span className="text-gray-600">→ {s.specialty}</span>
              <button className="text-[10px] text-[#5B4EC4] hover:underline">Adresser</button>
            </div>
          ))}
          {suggestedReferrals.length > 3 && <p className="text-[10px] text-gray-400">+ {suggestedReferrals.length - 3} autres</p>}
        </div>
      )}
      {urgentTasks.length + upcomingAppointments.length + pendingReferrals.length + suggestedReferrals.length === 0 && (
        <p className="text-xs text-gray-400 italic">Rien d'urgent</p>
      )}
    </div>
  );
}

function FlagsBanner({ alerts, screenings }: { alerts: PatientDashboard["alerts"]; screenings: PatientDashboard["screenings"] }) {
  const [expanded, setExpanded] = useState(false);
  const total = alerts.length + screenings.length;
  if (total === 0) return null;
  const critical = alerts.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH").length;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 text-xs">
        <div className="flex items-center gap-2">
          {critical > 0 && <span className="flex items-center gap-1 text-red-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{critical} critique{critical > 1 ? "s" : ""}</span>}
          {screenings.length > 0 && <span className="text-gray-500">{screenings.length} screening{screenings.length > 1 ? "s" : ""}</span>}
        </div>
        <Chevron open={expanded} />
      </button>
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-3 space-y-1 text-xs">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${a.severity === "CRITICAL" ? "bg-red-500" : a.severity === "HIGH" ? "bg-red-400" : "bg-amber-400"}`} />
              <span className={a.severity === "CRITICAL" || a.severity === "HIGH" ? "text-red-700" : "text-amber-700"}>{a.label}</span>
            </div>
          ))}
          {screenings.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-0.5">
              <span className="text-gray-600">{s.fromLabel} → {s.toLabel}</span>
              {s.suggestedSpecialty && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EDE9FC] text-[#5B4EC4]">→ {s.suggestedSpecialty}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// CONDITIONS CLINIQUES
// ══════════════════════════════════════════════════════

const CONDITION_TYPE_STYLE: Record<string, { badge: string; label: string; borderLeft: string }> = {
  PRIMARY:     { badge: "bg-[#EDE9FC] text-[#5B4EC4] border-[#C4B5FD]",   label: "Principale",   borderLeft: "border-l-[#5B4EC4]" },
  COMORBIDITY: { badge: "bg-slate-100 text-slate-700 border-slate-200",    label: "Comorbidité",  borderLeft: "border-l-[#8A8A96]" },
  SUSPECTED:   { badge: "bg-amber-50 text-amber-700 border-amber-200",     label: "Suspectée",    borderLeft: "border-l-[#E6993E]" },
  ALLERGY:     { badge: "bg-red-50 text-red-700 border-red-200",           label: "Allergie",     borderLeft: "border-l-[#D94F4F]" },
  BACKGROUND:  { badge: "bg-gray-50 text-gray-500 border-gray-200",        label: "Antécédent",   borderLeft: "border-l-gray-300" },
};

const SEVERITY_STYLE: Record<string, string> = {
  mild:     "bg-green-50 text-green-700",
  moderate: "bg-amber-50 text-amber-700",
  severe:   "bg-red-50 text-red-700",
};

function ConditionsCard({ careCaseId }: { careCaseId: string }) {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [condType, setCondType] = useState<"PRIMARY" | "COMORBIDITY" | "SUSPECTED">("COMORBIDITY");
  const [severity, setSeverity] = useState<"" | "mild" | "moderate" | "severe">("");

  const { data: conditions = [], isLoading } = useQuery({
    queryKey: ["conditions", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/conditions`);
      return res.data;
    },
  });

  const { data: catalog = [] } = useQuery({
    queryKey: ["conditions-catalog", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/conditions/catalog`);
      return res.data;
    },
    enabled: addOpen,
  });

  const addMut = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/care-cases/${careCaseId}/conditions`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conditions", careCaseId] });
      setAddOpen(false); setSearch(""); setSelected(null); setSeverity("");
      toast.success("Condition ajoutée");
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  const resolveMut = useMutation({
    mutationFn: async (conditionId: string) => {
      const res = await api.patch(`/care-cases/${careCaseId}/conditions/${conditionId}/resolve`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conditions", careCaseId] });
      toast.success("Condition résolue");
    },
  });

  const active = (conditions as any[]).filter((c) => c.status === "active" || c.status === "suspected");
  const filtered = (catalog as any[]).filter((e: any) =>
    !search || e.label?.toLowerCase().includes(search.toLowerCase()) || e.code?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Conditions</h3>
        <button onClick={() => setAddOpen((o) => !o)} className="text-[11px] text-[#5B4EC4] hover:text-[#4A3DB3] font-medium">
          + Ajouter
        </button>
      </div>

      {addOpen && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
          <input
            placeholder="Rechercher (code ou libellé)…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4] bg-white"
            autoFocus
          />
          {search && !selected && filtered.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white max-h-36 overflow-y-auto divide-y divide-gray-50">
              {filtered.map((e: any) => (
                <button key={e.code} onClick={() => { setSelected(e); setCondType(e.type || "COMORBIDITY"); setSearch(e.label); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium">{e.label}</span>
                  <span className="text-[10px] font-mono text-gray-400 shrink-0">{e.code}</span>
                </button>
              ))}
            </div>
          )}
          {selected && (
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {(["PRIMARY", "COMORBIDITY", "SUSPECTED"] as const).map((t) => (
                  <button key={t} onClick={() => setCondType(t)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${condType === t ? CONDITION_TYPE_STYLE[t].badge : "border-gray-200 text-gray-500 hover:border-[#5B4EC4]/30"}`}>
                    {CONDITION_TYPE_STYLE[t].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {(["mild", "moderate", "severe"] as const).map((s) => (
                  <button key={s} onClick={() => setSeverity(severity === s ? "" : s)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${severity === s ? SEVERITY_STYLE[s] + " border-transparent" : "border-gray-200 text-gray-500"}`}>
                    {s === "mild" ? "Légère" : s === "moderate" ? "Modérée" : "Sévère"}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAddOpen(false); setSearch(""); setSelected(null); }} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">Annuler</button>
            <button onClick={() => addMut.mutate({ conditionCode: selected?.code, conditionLabel: selected?.label, conditionType: condType, severity: severity || undefined })}
              disabled={!selected || addMut.isPending}
              className="text-xs px-3 py-1 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] disabled:opacity-50">
              {addMut.isPending ? "…" : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-1.5">
          {[1, 2].map((i) => <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" />)}
        </div>
      ) : active.length === 0 && !addOpen ? (
        <p className="text-xs text-gray-400 italic">Aucune condition documentée</p>
      ) : (
        <div className="space-y-1.5">
          {active.map((c: any) => {
            const typeStyle = CONDITION_TYPE_STYLE[c.conditionType];
            return (
            <div key={c.id} className={`flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-2.5 py-1.5 group border-l-4 ${typeStyle?.borderLeft ?? "border-l-gray-200"}`}>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${typeStyle?.badge ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {typeStyle?.label ?? c.conditionType}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium truncate block">{c.conditionLabel}</span>
                <span className="text-[10px] font-mono text-gray-400">{c.conditionCode}</span>
              </div>
              {c.severity && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${SEVERITY_STYLE[c.severity]}`}>
                  {c.severity === "mild" ? "Légère" : c.severity === "moderate" ? "Modérée" : "Sévère"}
                </span>
              )}
              <button onClick={() => resolveMut.mutate(c.id)} disabled={resolveMut.isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 shrink-0 text-xs" title="Résoudre">
                ✕
              </button>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// INFORMATIONS PATIENT
// ══════════════════════════════════════════════════════

function PatientInfoCard({ careCase }: { careCase: CareCaseDetail }) {
  const p = careCase.patient;
  const age = p.birthDate
    ? Math.floor((Date.now() - new Date(p.birthDate).getTime()) / (365.25 * 24 * 3600000))
    : null;

  const rows: { label: string; value: string | null | undefined }[] = [
    {
      label: "Naissance",
      value: p.birthDate
        ? `${new Date(p.birthDate).toLocaleDateString("fr-FR")}${age ? ` (${age} ans)` : ""}`
        : null,
    },
    { label: "Sexe", value: p.sex === "F" || p.sex === "FEMALE" ? "Féminin" : p.sex === "M" || p.sex === "MALE" ? "Masculin" : p.sex ?? null },
    { label: "Téléphone", value: p.phone ?? null },
    { label: "Email", value: p.email ?? null },
    {
      label: "Lead",
      value: careCase.leadProvider
        ? `${careCase.leadProvider.person.firstName} ${careCase.leadProvider.person.lastName}`
        : null,
    },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
        Informations patient
      </h3>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline gap-2">
            <span className="text-[11px] text-gray-400 w-20 shrink-0">{r.label}</span>
            <span className="text-xs text-gray-700 break-all">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ÉQUIPE DE SOINS
// ══════════════════════════════════════════════════════

function CareTeamCard({ careCaseId }: { careCaseId: string }) {
  const { data } = useQuery({
    queryKey: ["team", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/team`);
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: notes } = useQuery({
    queryKey: ["notes-authors", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/notes?limit=100`);
      return (res.data?.notes || res.data || []) as any[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const members: any[] = data?.members || data || [];
  if (members.length === 0) return null;

  // Build last-contact map per personId
  const lastContact: Record<string, string> = {};
  if (Array.isArray(notes)) {
    for (const n of notes) {
      const pid = n.authorPersonId || n.author?.id;
      if (pid && (!lastContact[pid] || n.createdAt > lastContact[pid])) {
        lastContact[pid] = n.createdAt;
      }
    }
  }

  const fmtDate = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Équipe de soins</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {members.map((m: any, i: number) => {
          const p = m.person || m;
          const initials = `${p.firstName?.[0] || "?"}${p.lastName?.[0] || ""}`.toUpperCase();
          const specialties = m.provider?.specialties || [];
          const last = lastContact[p.id];
          return (
            <div key={m.id || i} className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="w-7 h-7 rounded-full bg-[#EDE9FC] flex items-center justify-center text-[10px] font-semibold text-[#5B4EC4] shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {p.firstName} {p.lastName}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {m.roleInCase || specialties[0] || "Soignant"}
                </p>
              </div>
              {last && (
                <span className="text-[10px] text-gray-400 shrink-0">{fmtDate(last)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════

function MiniChart({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 24; const w = 64;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-5">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(values.length - 1) * step} cy={parseFloat(points.split(" ").pop()!.split(",")[1])} r="2" fill={color} />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function fv(v: number): string { return Number.isInteger(v) ? v.toString() : v.toFixed(1); }
