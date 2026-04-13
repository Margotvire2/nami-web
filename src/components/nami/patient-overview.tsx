"use client";

/**
 * PatientOverview — Vue d'ensemble épurée
 *
 * LIT DEPUIS LE STORE CENTRAL (useNamiStore).
 * Aucun mock local. Les données viennent de getCarePathwayDashboard().
 * Fallback sur les props patient si le store n'a pas de données (API réelle).
 */

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Sparkles, Calendar, X, ChevronDown, ChevronUp } from "lucide-react";
import { useNamiStore } from "@/lib/nami-store";
import { getCarePathwayDashboard } from "@/lib/nami-store/selectors";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TimelineEvent {
  id: string;
  date: Date;
  label: string;
  title: string;
  practitioner: string;
  type: string;
  past: boolean;
  detail?: string;
}

interface PatientOverviewProps {
  patient: {
    firstName: string;
    lastName: string;
    age?: number;
    criticite: "critique" | "surveillance" | "stable";
    pathologie: string;
    leadPraticien: string;
    leadSpecialite: string;
    suiviDepuis: string;
    clinicalSummary?: string | null;
    riskLevel: string;
    phase?: string;
  };
  careCaseId: string;
}

const EVENT_COLORS: Record<string, { fill: string; border: string }> = {
  consultation: { fill: "bg-violet-500", border: "border-violet-500" },
  note: { fill: "bg-blue-500", border: "border-blue-500" },
  referral: { fill: "bg-amber-500", border: "border-amber-500" },
  alert: { fill: "bg-red-400", border: "border-red-400" },
  team_change: { fill: "bg-teal-500", border: "border-teal-500" },
  planned: { fill: "bg-white", border: "border-slate-300" },
};

function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

export function PatientOverview({ patient, careCaseId }: PatientOverviewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // ── Lire depuis le store central ──
  const storeState = useNamiStore.getState();
  const dashboard = useMemo(() => getCarePathwayDashboard(storeState, careCaseId), [storeState, careCaseId]);

  // ── Convertir les timeline events du store en format local ──
  const events: TimelineEvent[] = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.timelineEvents.map((e, i) => ({
      id: e.id,
      date: new Date(e.date),
      label: formatDateLabel(e.date),
      title: e.title,
      practitioner: e.practitionerName,
      type: e.type,
      past: e.isPast,
      detail: e.summary,
    }));
  }, [dashboard]);

  // ── Fallback si pas de données dans le store (l'API réelle est utilisée) ──
  const summary = dashboard?.aiSummary ?? patient.clinicalSummary ?? "Aucun résumé IA disponible.";
  const nextApt = dashboard?.nextAppointment;

  const selectedEvent = events.find((e) => e.id === selectedId);

  // Si aucun événement dans le store, ne rien afficher de timeline
  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <AISnapshotBlock summary={summary} expanded={summaryExpanded} onToggle={() => setSummaryExpanded(!summaryExpanded)} />
      </div>
    );
  }

  // Calcul positions timeline
  const first = events[0].date.getTime();
  const last = events[events.length - 1].date.getTime();
  const range = last - first || 1;
  const todayPct = Math.min(95, Math.max(5, 5 + ((Date.now() - first) / range) * 90));
  const positioned = events.map((e) => ({ ...e, pct: 5 + ((e.date.getTime() - first) / range) * 90 }));

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ TIMELINE ═══ */}
      <div className="bg-white rounded-2xl px-8 py-6" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="relative" style={{ height: 110 }}>
          <div className="absolute left-0 right-0 h-px bg-slate-200" style={{ top: "50%" }} />

          {/* Aujourd'hui */}
          <div className="absolute flex flex-col items-center z-10" style={{ left: `${todayPct}%`, top: 0, bottom: 0, transform: "translateX(-50%)" }}>
            <div className="w-px bg-blue-400 flex-1" />
            <span className="text-[10px] font-medium text-blue-500 mt-1 whitespace-nowrap" style={{ fontFamily: "var(--font-inter)" }}>Aujourd'hui</span>
          </div>

          {/* Points */}
          {positioned.map((event) => {
            const colors = EVENT_COLORS[event.type] ?? EVENT_COLORS.consultation;
            const isSelected = selectedId === event.id;
            const isAbove = parseInt(event.id.replace(/\D/g, "") || "0") % 2 !== 0;

            return (
              <button key={event.id} onClick={() => setSelectedId(isSelected ? null : event.id)} className="absolute group" style={{ left: `${event.pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
                <div className={cn("rounded-full transition-all group-hover:scale-150", isSelected ? "w-4 h-4 ring-2 ring-violet-300 ring-offset-2" : "w-3 h-3", event.past ? "" : "border-2 bg-white", colors.fill, colors.border)} />
                <div className="absolute whitespace-nowrap text-center pointer-events-none" style={{ left: "50%", transform: "translateX(-50%)", top: isAbove ? undefined : "16px", bottom: isAbove ? "16px" : undefined, maxWidth: 90 }}>
                  <p className="text-[10px] text-slate-400 leading-tight truncate" style={{ fontFamily: "var(--font-inter)" }}>{event.label}</p>
                  <p className="text-[11px] font-medium text-slate-700 leading-tight truncate">{event.title}</p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate">{event.practitioner}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ DÉTAIL ÉVÉNEMENT ═══ */}
      {selectedEvent && (
        <div className="bg-violet-50 rounded-2xl p-5" style={{ border: "1px solid #DDD6FE" }}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>{selectedEvent.label}</p>
              <h3 className="text-[15px] font-bold text-slate-800 mt-0.5" style={{ fontFamily: "var(--font-jakarta)" }}>{selectedEvent.title}</h3>
              <p className="text-sm text-slate-500">{selectedEvent.practitioner}</p>
            </div>
            <button onClick={() => setSelectedId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-violet-100 transition-colors"><X size={14} /></button>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{selectedEvent.detail ?? "Détail disponible dans l'onglet Notes."}</p>
        </div>
      )}

      {/* ═══ RÉSUMÉ IA + PROCHAIN RDV ═══ */}
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <AISnapshotBlock summary={summary} expanded={summaryExpanded} onToggle={() => setSummaryExpanded(!summaryExpanded)} />

        {nextApt && (
          <div className="border-t border-slate-100 mt-4 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400 mb-2" style={{ fontFamily: "var(--font-inter)" }}>Prochain RDV</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#4F46E5]" /> {new Date(nextApt.startAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · {new Date(nextApt.startAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{nextApt.practitionerName} — {nextApt.mode === "in_person" ? "Présentiel" : "Téléconsultation"}</p>
                <p className="text-xs text-slate-400 mt-0.5">{nextApt.reason}</p>
              </div>
              <Link href="/agenda" className="text-xs text-[#4F46E5] font-medium hover:underline whitespace-nowrap ml-4">Agenda →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI SNAPSHOT BLOCK
// ═══════════════════════════════════════════════════════════════════════════════

function AISnapshotBlock({ summary, expanded, onToggle }: { summary: string; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} className="text-slate-400" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>Synthèse structurée</span>
      </div>
      <p className={cn("text-sm text-slate-700 leading-relaxed", !expanded ? "line-clamp-3" : "")}>{summary}</p>
      {summary.length > 150 && (
        <button onClick={onToggle} className="text-xs text-[#4F46E5] font-medium hover:underline mt-2 flex items-center gap-1">
          {expanded ? <><ChevronUp size={12} /> Réduire</> : <><ChevronDown size={12} /> Voir plus</>}
        </button>
      )}
    </>
  );
}
