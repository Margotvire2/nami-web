"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PatientDashboard, DashboardIndicator } from "@/hooks/usePatientDashboard";

interface Props {
  dashboard: PatientDashboard;
  careCaseId: string;
}

export function ViewGlobale({ dashboard, careCaseId }: Props) {
  const { indicators, questionnaires, actions, alerts, screenings } = dashboard;

  const { data: protocolData } = useQuery({
    queryKey: ["protocol", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/protocols/care-cases/${careCaseId}/active-protocol`);
      return res.data;
    },
  });

  return (
    <div className="space-y-5">
      <ClinicalSummaryCard careCaseId={careCaseId} />
      <DeltaTickerBanner indicators={indicators} questionnaires={questionnaires} />
      {protocolData && <ProtocolBanner protocol={protocolData} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3">
          <KeyIndicatorsGrid indicators={indicators} questionnaires={questionnaires} />
        </div>
        <div className="space-y-4">
          <ActionsPanel actions={actions} />
          <FlagsBanner alerts={alerts} screenings={screenings} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// RÉSUMÉ IA
// ══════════════════════════════════════════════════════

function ClinicalSummaryCard({ careCaseId }: { careCaseId: string }) {
  const [sections, setSections] = useState<{ title: string; content: string }[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/care-cases/${careCaseId}`).then((res) => {
      if (res.data?.clinicalSummary) {
        setSections(parseSummary(res.data.clinicalSummary));
        setLastUpdated(res.data.updatedAt || null);
      }
    }).catch(() => {});
  }, [careCaseId]);

  async function generate() {
    setLoading(true);
    try {
      const res = await api.post(`/intelligence/summary`, { careCaseId });
      setSections(parseSummary(res.data?.summary || res.data?.content || ""));
      setLastUpdated(new Date().toISOString());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

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

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button onClick={() => sections.length > 0 && setCollapsed(!collapsed)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span>✨</span>
          <h3 className="text-sm font-semibold text-gray-900">Résumé clinique</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">Brouillon IA</span>
          {lastUpdated && <span className="text-[10px] text-gray-400">{new Date(lastUpdated).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); generate(); }} disabled={loading} className="text-xs px-3 py-1 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] disabled:opacity-50">
            {loading ? "…" : sections.length > 0 ? "Actualiser" : "Générer"}
          </button>
          {sections.length > 0 && <Chevron open={!collapsed} />}
        </div>
      </button>
      {!collapsed && sections.length > 0 && (
        <div className="px-5 pb-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          {sections.map((s, i) => (
            <div key={i} className="rounded-lg bg-gray-50/70 p-3 border border-gray-100">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>{icons[s.title] || "📄"}</span>{s.title}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>
      )}
      {loading && sections.length === 0 && (
        <div className="px-5 pb-4 border-t border-gray-100 flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Génération…</span>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// BANDEAU DELTAS
// ══════════════════════════════════════════════════════

function DeltaTickerBanner({ indicators, questionnaires }: {
  indicators: DashboardIndicator[];
  questionnaires: PatientDashboard["questionnaires"];
}) {
  const deltas: { label: string; delta: number; unit: string; percent: number | null }[] = [];

  for (const ind of indicators) {
    if (ind.delta != null && ind.delta !== 0) {
      deltas.push({ label: ind.label, delta: ind.delta, unit: ind.unit || "", percent: ind.deltaPercent });
    }
  }

  for (const q of questionnaires) {
    if (q.lastScore != null && q.previousScore != null && q.lastScore !== q.previousScore) {
      deltas.push({ label: q.label, delta: q.lastScore - q.previousScore, unit: "", percent: null });
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
          <span key={i} className={`flex-shrink-0 text-xs font-medium ${d.delta > 0 ? "text-green-600" : "text-red-500"}`}>
            {d.label} {d.delta > 0 ? "+" : ""}{fv(d.delta)}{d.unit ? ` ${d.unit}` : ""} {d.delta > 0 ? "↑" : "↓"}
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// PROTOCOLE HDJ
// ══════════════════════════════════════════════════════

function ProtocolBanner({ protocol }: { protocol: any }) {
  if (!protocol?.name) return null;

  const steps = protocol.steps || protocol.phases || [];
  const completedCount = steps.filter((s: any) => s.status === "COMPLETED" || s.completed).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span>📋</span>
          <h3 className="text-sm font-semibold text-gray-900">{protocol.name}</h3>
          {protocol.date && <span className="text-xs text-gray-400">· {new Date(protocol.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
          {completedCount}/{steps.length} étapes
        </span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step: any, i: number) => {
          const isDone = step.status === "COMPLETED" || step.completed;
          const isCurrent = step.status === "IN_PROGRESS" || step.current;
          return (
            <div key={i} className="flex items-center">
              {i > 0 && <span className={`mx-1 text-xs ${isDone ? "text-green-400" : "text-gray-300"}`}>→</span>}
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                  isDone ? "bg-green-100 border-green-400 text-green-700" :
                  isCurrent ? "bg-blue-100 border-blue-400 text-blue-700" :
                  "bg-gray-50 border-gray-200 text-gray-400"
                }`}>
                  {isDone ? "✓" : isCurrent ? "●" : "○"}
                </div>
                <span className={`text-[10px] mt-1 text-center font-medium ${isDone ? "text-green-600" : isCurrent ? "text-blue-600" : "text-gray-400"}`}>
                  {step.specialtyLabel || step.label || step.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// INDICATEURS CLÉS
// ══════════════════════════════════════════════════════

function KeyIndicatorsGrid({ indicators, questionnaires }: {
  indicators: DashboardIndicator[];
  questionnaires: PatientDashboard["questionnaires"];
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
                <IndicatorTile key={ind.metricKey} ind={ind} />
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

function IndicatorTile({ ind }: { ind: DashboardIndicator }) {
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
        <span className={`block text-[10px] font-medium ${ind.delta > 0 ? "text-green-600" : "text-red-500"}`}>
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
