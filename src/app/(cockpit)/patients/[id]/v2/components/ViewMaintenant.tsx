"use client";

import { useState, useEffect, useRef } from "react";
import { MarkdownContent } from "@/components/MarkdownContent";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { useQuery } from "@tanstack/react-query";
import { api, summaryDiffApi, type SummaryDiff } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  PatientDashboard,
  DashboardIndicator,
  DashboardAlert,
  DashboardScreening,
} from "@/hooks/usePatientDashboard";

interface Props {
  dashboard: PatientDashboard;
  careCaseId: string;
}

export function ViewMaintenant({ dashboard, careCaseId }: Props) {
  const { alerts, screenings, indicators, questionnaires, actions, recentActivity } = dashboard;

  const totalFlags = alerts.length + screenings.length;

  return (
    <div className="space-y-5">
      {/* ═══ BLOC 1 — Synthèse structurée ═══ */}
      <ClinicalSummaryCard careCaseId={careCaseId} />

      {/* ═══ Indicateurs + Actions ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Indicateurs visuels (3/4) */}
        <div className="lg:col-span-3 space-y-5">
          <IndicatorsGrid indicators={indicators} />

          {questionnaires.length > 0 && (
            <QuestionnairesRow questionnaires={questionnaires} />
          )}

          {/* Sparklines tendances */}
          <TrendsSection indicators={indicators} />
        </div>

        {/* Colonne droite: quoi faire (1/4) */}
        <div className="space-y-4">
          <ActionsPanel actions={actions} />
          <RecentPanel events={recentActivity} />
        </div>
      </div>

      {/* ═══ BLOC 3 — Alertes & screenings (discret, repliable) ═══ */}
      {totalFlags > 0 && (
        <FlagsBanner alerts={alerts} screenings={screenings} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Indicateurs visuels
// ══════════════════════════════════════════════════════

function IndicatorsGrid({ indicators }: { indicators: DashboardIndicator[] }) {
  const byDomain = new Map<string, DashboardIndicator[]>();
  for (const ind of indicators) {
    const group = byDomain.get(ind.domain) ?? [];
    group.push(ind);
    byDomain.set(ind.domain, group);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Indicateurs</h3>
        <button className="text-xs text-[#5B4EC4] hover:underline font-medium">
          + Saisir une observation
        </button>
      </div>

      <div className="space-y-5">
        {Array.from(byDomain.entries()).map(([domain, inds]) => (
          <div key={domain}>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
              {domain}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {inds.map((ind) => (
                <IndicatorTile key={ind.metricKey} indicator={ind} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndicatorTile({ indicator }: { indicator: DashboardIndicator }) {
  const colors = {
    OK:       { bg: "bg-green-50/60",  border: "border-green-100",  text: "text-green-800",  dot: "bg-green-400"  },
    ALERT:    { bg: "bg-amber-50/60",  border: "border-amber-100",  text: "text-amber-800",  dot: "bg-amber-400"  },
    CRITICAL: { bg: "bg-red-50/60",    border: "border-red-100",    text: "text-red-800",    dot: "bg-red-400"    },
    MISSING:  { bg: "bg-gray-50/60",   border: "border-gray-100",   text: "text-gray-400",   dot: "bg-gray-300"   },
  };

  const c = colors[indicator.status];

  const timeLabel =
    indicator.timeStatus === "OVERDUE" ? "En retard" :
    indicator.timeStatus === "DUE_SOON" ? "Bientôt dû" :
    indicator.timeStatus === "NEVER" ? "Jamais mesuré" : null;

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3 cursor-pointer transition-all hover:shadow-sm group`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-gray-500 truncate pr-1">{indicator.label}</span>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      </div>

      {indicator.value !== null ? (
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-semibold ${c.text} leading-none`}>{formatValue(indicator.value)}</span>
          {indicator.unit && <span className="text-[10px] text-gray-400">{indicator.unit}</span>}
        </div>
      ) : (
        <span className="text-lg text-gray-200 leading-none">—</span>
      )}

      {indicator.delta !== null && indicator.delta !== 0 && (
        <span className={`text-[10px] font-medium ${indicator.delta > 0 ? "text-emerald-600" : "text-red-500"}`}>
          {indicator.delta > 0 ? "↑" : "↓"} {Math.abs(indicator.delta)}
          {indicator.deltaPercent ? ` (${indicator.delta > 0 ? "+" : ""}${indicator.deltaPercent}%)` : ""}
        </span>
      )}

      {indicator.sparkline.length >= 3 && (
        <div className="mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <MiniSparkline values={indicator.sparkline} status={indicator.status} />
        </div>
      )}

      {timeLabel && (
        <span className={`mt-1.5 inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
          indicator.timeStatus === "OVERDUE" ? "bg-red-100 text-red-600" :
          indicator.timeStatus === "NEVER" ? "bg-gray-100 text-gray-500" :
          "bg-amber-100 text-amber-600"
        }`}>
          {timeLabel}
        </span>
      )}
    </div>
  );
}

function MiniSparkline({ values, status }: { values: number[]; status: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 24, w = 64;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const color = status === "CRITICAL" ? "#ef4444" : status === "ALERT" ? "#f59e0b" : "#22c55e";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-5">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(values.length - 1) * step} cy={h - ((values[values.length - 1] - min) / range) * (h - 4) - 2} r="2" fill={color} />
    </svg>
  );
}

function QuestionnairesRow({ questionnaires }: { questionnaires: PatientDashboard["questionnaires"] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Questionnaires</h3>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {questionnaires.map((q) => {
          const statusBg =
            q.timeStatus === "OVERDUE" ? "border-red-200 bg-red-50/50" :
            q.timeStatus === "NEVER" ? "border-gray-200 bg-gray-50/50" :
            q.timeStatus === "DUE_SOON" ? "border-amber-200 bg-amber-50/50" :
            "border-green-200 bg-green-50/50";
          return (
            <div key={q.key} className={`flex-shrink-0 rounded-lg border p-3 min-w-[120px] cursor-pointer hover:shadow-sm transition-all ${statusBg}`}>
              <p className="text-[11px] font-medium text-gray-500">{q.label}</p>
              {q.lastScore !== null ? (
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-semibold text-gray-900">{q.lastScore}</span>
                  {q.maxScore && <span className="text-[10px] text-gray-400">/ {q.maxScore}</span>}
                </div>
              ) : (
                <p className="text-sm text-gray-300 italic mt-1">—</p>
              )}
              {q.lastCompletedAt && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(q.lastCompletedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrendsSection({ indicators }: { indicators: DashboardIndicator[] }) {
  const withData = indicators.filter((i) => i.sparkline.length >= 4).slice(0, 4);
  if (withData.length === 0) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Tendances</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {withData.map((ind) => (
          <div key={ind.metricKey} className="text-center">
            <p className="text-[11px] text-gray-500 mb-1 font-medium">{ind.label}</p>
            <LargeSparkline values={ind.sparkline} status={ind.status} />
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {ind.value !== null ? `${formatValue(ind.value)} ${ind.unit ?? ""}` : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LargeSparkline({ values, status }: { values: number[]; status: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 40, w = 120;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 6) - 3}`);
  const fillPoints = [...pts, `${(values.length - 1) * step},${h}`, `0,${h}`].join(" ");
  const color = status === "CRITICAL" ? "#ef4444" : status === "ALERT" ? "#f59e0b" : "#22c55e";
  const fillColor = status === "CRITICAL" ? "#fef2f2" : status === "ALERT" ? "#fffbeb" : "#f0fdf4";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10 mx-auto">
      <polygon points={fillPoints} fill={fillColor} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(values.length - 1) * step} cy={h - ((values[values.length - 1] - min) / range) * (h - 6) - 3} r="3" fill={color} />
    </svg>
  );
}

// ══════════════════════════════════════════════════════
// COLONNE DROITE — Actions
// ══════════════════════════════════════════════════════

function ActionsPanel({ actions }: { actions: PatientDashboard["actions"] }) {
  const { urgentTasks, upcomingAppointments, pendingReferrals, suggestedReferrals } = actions;
  const hasContent = urgentTasks.length + upcomingAppointments.length + pendingReferrals.length + suggestedReferrals.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">À faire</h3>

      {!hasContent && <p className="text-xs text-gray-400 italic">Rien d'urgent</p>}

      {urgentTasks.length > 0 && (
        <div>
          {urgentTasks.map((t) => (
            <div key={t.id} className="flex items-start gap-2 py-1.5">
              <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-[#5B4EC4] w-3.5 h-3.5" readOnly />
              <div className="min-w-0">
                <p className="text-xs text-gray-700 leading-tight">{t.label}</p>
                {t.dueDate && (
                  <p className="text-[10px] text-red-400">
                    {new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {upcomingAppointments.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Prochains RDV</p>
          {upcomingAppointments.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-1 text-xs">
              <span className="text-gray-700 truncate">{a.providerName ?? "RDV"}</span>
              <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                {new Date(a.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {pendingReferrals.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Adressages en cours</p>
          {pendingReferrals.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-1 text-xs">
              <span className="text-gray-700">{r.toSpecialty ?? "Spécialiste"}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{r.status}</span>
            </div>
          ))}
        </div>
      )}

      {suggestedReferrals.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-[#5B4EC4] uppercase tracking-wider mb-1">Suggérés par Nami</p>
          {suggestedReferrals.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1 text-xs">
              <span className="text-gray-600">→ {s.specialty}</span>
              <button className="text-[10px] text-[#5B4EC4] hover:underline">Adresser</button>
            </div>
          ))}
          {suggestedReferrals.length > 3 && (
            <p className="text-[10px] text-gray-400">+ {suggestedReferrals.length - 3} autres</p>
          )}
        </div>
      )}
    </div>
  );
}

function RecentPanel({ events }: { events: PatientDashboard["recentActivity"] }) {
  const icons: Record<string, string> = {
    NOTE: "📝", OBSERVATION: "🧪", DOCUMENT: "📄",
    APPOINTMENT: "📅", REFERRAL: "↗️", JOURNAL: "📱",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">Récent</h3>
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="flex gap-2 text-xs">
            <span className="flex-shrink-0">{icons[e.type] ?? "•"}</span>
            <div className="min-w-0">
              <p className="text-gray-600 truncate">{e.summary}</p>
              <p className="text-[10px] text-gray-400">
                {new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                {e.authorName ? ` — ${e.authorName}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// BLOC 3 — Alertes & Screenings (discret, repliable)
// ══════════════════════════════════════════════════════

function FlagsBanner({ alerts, screenings }: { alerts: DashboardAlert[]; screenings: DashboardScreening[] }) {
  const [expanded, setExpanded] = useState(false);

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH").length;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3 text-sm">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-red-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {criticalCount} alerte{criticalCount > 1 ? "s" : ""} critique{criticalCount > 1 ? "s" : ""}
            </span>
          )}
          {alerts.length - criticalCount > 0 && (
            <span className="text-amber-600 font-medium">
              {alerts.length - criticalCount} indicateur{alerts.length - criticalCount > 1 ? "s" : ""}
            </span>
          )}
          {screenings.length > 0 && (
            <span className="text-gray-500">
              {screenings.length} screening{screenings.length > 1 ? "s" : ""} recommandé{screenings.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 px-5 py-4 space-y-4">
          {alerts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Alertes ({alerts.length})
              </p>
              <div className="space-y-1">
                {alerts.map((a, i) => {
                  const dotColor =
                    a.severity === "CRITICAL" ? "bg-red-500" :
                    a.severity === "HIGH" ? "bg-red-400" :
                    a.severity === "WARNING" ? "bg-amber-400" : "bg-blue-400";
                  const textColor =
                    a.severity === "CRITICAL" ? "text-red-700" :
                    a.severity === "HIGH" ? "text-red-600" :
                    a.severity === "WARNING" ? "text-amber-700" : "text-blue-600";
                  return (
                    <div key={i} className="flex items-center justify-between text-sm py-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                        <span className={textColor}>{a.label}</span>
                      </div>
                      {a.sourceLabel && (
                        <span className="text-[10px] text-gray-400 ml-4 flex-shrink-0">{a.sourceLabel}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {screenings.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Screenings recommandés ({screenings.length})
              </p>
              <div className="space-y-1">
                {screenings.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-gray-700">{s.fromLabel} → {s.toLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {s.suggestedSpecialty && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDE9FC] text-[#5B4EC4]">
                          → {s.suggestedSpecialty}
                        </span>
                      )}
                      {s.sourceRef && (
                        <span className="text-[10px] text-gray-400">{s.sourceRef}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ClinicalSummaryCard — Résumé IA structuré (SSE streaming)
// ══════════════════════════════════════════════════════

interface SummarySection {
  title: string;
  icon: string;
  content: string;
}

function parseMarkdownSections(text: string): SummarySection[] {
  const sectionIcons: Record<string, string> = {
    diagnostic: "🩺",
    situation: "📍",
    évolution: "📈",
    evolution: "📈",
    plan: "🗺️",
    vigilance: "⚠️",
    alerte: "⚠️",
    recommandation: "✅",
    synthèse: "📋",
    synthese: "📋",
    équipe: "👥",
    equipe: "👥",
    questionnaire: "📊",
    bilan: "🧪",
  };

  const getIcon = (title: string) => {
    const lower = title.toLowerCase();
    for (const [key, icon] of Object.entries(sectionIcons)) {
      if (lower.includes(key)) return icon;
    }
    return "📋";
  };

  const sections: SummarySection[] = [];
  const lines = text.split("\n");
  let currentTitle = "";
  let currentIcon = "📋";
  let currentLines: string[] = [];

  const pushSection = () => {
    if (currentTitle && currentLines.join("").trim()) {
      sections.push({ title: currentTitle, icon: currentIcon, content: currentLines.join("\n").trim() });
    }
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    const bold = line.match(/^\*\*(.+?)\*\*\s*:?\s*$/);
    const colon = line.match(/^([A-ZÀÂÉÈÊËÎÏÔÙÛÜ][^:]{2,40})\s*:\s*$/);

    if (h2 || bold || colon) {
      pushSection();
      currentTitle = (h2?.[1] ?? bold?.[1] ?? colon?.[1] ?? "").replace(/\*\*/g, "").trim();
      currentIcon = getIcon(currentTitle);
      currentLines = [];
    } else {
      const cleaned = line.replace(/^\*\*(.+?)\*\*/g, "$1").replace(/^#+\s*/, "");
      currentLines.push(cleaned);
    }
  }
  pushSection();

  return sections;
}

function getPersistedToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const stored = localStorage.getItem("nami-auth");
    if (!stored) return "";
    const parsed = JSON.parse(stored);
    return parsed?.state?.accessToken ?? "";
  } catch { return ""; }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function ClinicalSummaryCard({ careCaseId }: { careCaseId: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: diff } = useQuery<SummaryDiff>({
    queryKey: ["summary-diff", careCaseId],
    queryFn: async () => {
      const token = getPersistedToken();
      return summaryDiffApi.get(token, careCaseId);
    },
    enabled: !!careCaseId,
    staleTime: 120_000,
    refetchInterval: 120_000,
  });

  const { data: careCase } = useQuery<{ clinicalSummary: string | null }>({
    queryKey: ["care-case-summary", careCaseId],
    queryFn: async () => {
      const { data } = await api.get<{ clinicalSummary: string | null }>(`/care-cases/${careCaseId}`);
      return data;
    },
    enabled: !!careCaseId,
    staleTime: 60_000,
  });

  const savedSummary = careCase?.clinicalSummary ?? null;
  const displayText = streamText ?? savedSummary;
  const sections = displayText ? parseMarkdownSections(displayText) : [];

  const startStream = async () => {
    if (streaming) return;
    const token = getPersistedToken();
    if (!token) return;
    setStreaming(true);
    setStreamText(null);

    try {
      const res = await fetch(`${API_URL}/intelligence/summarize-job/${careCaseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la génération");
      const { jobId } = await res.json() as { jobId: string };

      const deadline = Date.now() + 5 * 60 * 1000;
      const poll = async (): Promise<void> => {
        if (Date.now() > deadline) { setStreaming(false); return; }
        const statusRes = await fetch(`${API_URL}/intelligence/summarize-job/${jobId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statusRes.ok) { setStreaming(false); return; }
        const { status } = await statusRes.json() as { status: string };
        if (status === "completed") {
          // Recharge le résumé depuis la DB
          const { data } = await api.get<{ clinicalSummary: string | null }>(`/care-cases/${careCaseId}`);
          setStreamText(data.clinicalSummary ?? "");
          setStreaming(false);
        } else if (status === "failed") {
          setStreaming(false);
        } else {
          pollTimerRef.current = setTimeout(poll, 3000) as unknown as ReturnType<typeof setTimeout>;
        }
      };
      pollTimerRef.current = setTimeout(poll, 3000) as unknown as ReturnType<typeof setTimeout>;
    } catch {
      setStreaming(false);
    }
  };

  useEffect(() => {
    return () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); };
  }, []);

  if (!displayText && !streaming) {
    return (
      <div className="rounded-xl border border-dashed border-[#5B4EC4]/30 bg-[#F8F7FD] p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Synthèse clinique</p>
          <p className="text-xs text-gray-400 mt-0.5">Aucune synthèse générée. Lancez la génération pour obtenir une synthèse structurée.</p>
        </div>
        <button
          onClick={startStream}
          className="flex-shrink-0 ml-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4A3DB3] transition-colors"
        >
          <span>✨</span> Générer
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#5B4EC4]/20 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-[#F8F7FD]">
        <div className="flex items-center gap-2.5">
          <span className="text-base">✨</span>
          <span className="text-sm font-semibold text-gray-900">Résumé clinique</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
            Brouillon — à valider
          </span>
          {streaming && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#5B4EC4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B4EC4] animate-pulse" />
              Génération en cours…
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!streaming && (
            <button
              onClick={startStream}
              className="relative text-xs text-[#5B4EC4] hover:underline font-medium"
            >
              {savedSummary ? "Actualiser" : "Générer"}
              {diff?.hasChanges && (
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title={collapsed ? "Déplier" : "Replier"}
          >
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? "-rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Diff banner */}
      {diff?.hasChanges && !collapsed && (
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2.5">
          <span className="text-amber-500 text-sm mt-0.5 flex-shrink-0">Δ</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-amber-700">
              Nouveautés depuis la dernière synthèse
              {diff.lastSummaryAt && (
                <span className="font-normal text-amber-600 ml-1">
                  ({formatDistanceToNow(new Date(diff.lastSummaryAt), { addSuffix: true, locale: fr })})
                </span>
              )}
            </span>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
              {diff.counts.notes > 0 && (
                <span className="text-[11px] text-amber-700">
                  {diff.counts.notes} nouvelle{diff.counts.notes > 1 ? "s" : ""} note{diff.counts.notes > 1 ? "s" : ""}
                </span>
              )}
              {diff.newObservations.slice(0, 3).map((obs) => (
                <span key={obs.metric.key} className="text-[11px] text-amber-700">
                  {obs.metric.label} : <strong>{obs.valueNumeric ?? obs.valueText}</strong>{obs.unit ? ` ${obs.unit}` : ""}
                </span>
              ))}
              {diff.counts.observations > 3 && (
                <span className="text-[11px] text-amber-600">
                  +{diff.counts.observations - 3} mesure{diff.counts.observations - 3 > 1 ? "s" : ""}
                </span>
              )}
              {diff.counts.alerts > 0 && (
                <span className="text-[11px] text-amber-700">
                  {diff.counts.alerts} rappel{diff.counts.alerts > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] text-amber-500 flex-shrink-0 mt-0.5 italic">Actualiser pour intégrer</span>
        </div>
      )}

      {/* Body */}
      {!collapsed && (
        <div className="p-5">
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((s, i) => (
                <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base leading-none">{s.icon}</span>
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{s.title}</span>
                  </div>
                  <MarkdownContent content={s.content} compact />
                </div>
              ))}
            </div>
          ) : streaming ? (
            <div className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed font-['Inter']">
              {streamText}
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#5B4EC4] animate-pulse rounded-sm align-text-bottom" />
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Aucune section détectée.</p>
          )}
          <AiDisclaimer variant="inline" className="mt-3" />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Utils
// ══════════════════════════════════════════════════════

function formatValue(v: number): string {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1);
}
