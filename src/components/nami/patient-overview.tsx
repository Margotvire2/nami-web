"use client";

/**
 * PatientOverview — Vue d'ensemble épurée
 *
 * NE CONTIENT PAS (déjà dans le panel droit permanent) :
 * - Équipe de suivi → PilotagePanel
 * - Alertes / Vigilance → PilotagePanel
 * - Gaps IA → PilotagePanel
 * - État du suivi → PilotagePanel
 * - Boutons d'action → Header parent
 *
 * CONTIENT (unique à cette vue) :
 * - Timeline du parcours
 * - Détail événement au clic
 * - Résumé IA (3 lignes + expand)
 * - Prochain RDV
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Sparkles, Calendar, X, ChevronDown, ChevronUp } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TimelineEvent {
  id: number;
  date: Date;
  label: string;
  title: string;
  practitioner: string;
  type: "consultation" | "team" | "planned" | "compte_rendu";
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

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const EVENTS: TimelineEvent[] = [
  { id: 1, date: new Date("2025-03-23"), label: "23 mars", title: "1ère consultation", practitioner: "Dr Suela", type: "consultation", past: true, detail: "Première consultation. Tableau préoccupant : restriction alimentaire sévère centrée sur la 'pureté' des aliments. IMC 17.8. Hyperactivité physique (2h/jour). Déni de la gravité." },
  { id: 2, date: new Date("2025-04-01"), label: "1er avril", title: "Point équipe", practitioner: "Équipe", type: "team", past: true, detail: "Consensus : situation critique. Théo minimise. Parents peu disponibles. Décision : consultation endoc en urgence + bilan bio." },
  { id: 3, date: new Date("2025-04-04"), label: "4 avril", title: "Consultation", practitioner: "É. Renard", type: "consultation", past: true, detail: "Séance psy initiale. Déni persistant. 'Je fais juste attention à ma santé.' Approche motivationnelle commencée." },
  { id: 4, date: new Date("2025-04-07"), label: "7 avril", title: "Consultation", practitioner: "M. Vire", type: "consultation", past: true, detail: "1er bilan diététique. Restriction sévère : élimine glucides, produits laitiers, viande rouge. Apports < 800 kcal/j." },
  { id: 5, date: new Date("2025-04-12"), label: "12 avril", title: "RDV planifié", practitioner: "Dr Suela", type: "planned", past: false },
  { id: 6, date: new Date("2025-04-15"), label: "15 avril", title: "RDV planifié", practitioner: "É. Renard", type: "planned", past: false },
];

const NEXT_RDV = { date: "Sam 12 avril", time: "14h00", practitioner: "Dr Suela", type: "Présentiel", reason: "Suivi médical — contrôle poids et constantes" };

const DEFAULT_SUMMARY = "Orthorexie sévère en évolution rapide. IMC 17.8, perte de 8 kg en 4 mois. Déni actif de la gravité. Famille peu mobilisée malgré les relances. Équipe incomplète — psychiatre manquant.";

const EVENT_COLORS: Record<string, { fill: string; border: string }> = {
  consultation: { fill: "bg-violet-500", border: "border-violet-500" },
  team: { fill: "bg-blue-500", border: "border-blue-500" },
  planned: { fill: "bg-white", border: "border-slate-300" },
  compte_rendu: { fill: "bg-slate-400", border: "border-slate-400" },
};

function computePositions(events: TimelineEvent[]) {
  const first = events[0].date.getTime();
  const last = events[events.length - 1].date.getTime();
  const range = last - first || 1;
  return events.map((e) => ({ ...e, pct: 5 + ((e.date.getTime() - first) / range) * 90 }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

export function PatientOverview({ patient, careCaseId }: PatientOverviewProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const selectedEvent = EVENTS.find((e) => e.id === selectedId);
  const summary = patient.clinicalSummary ?? DEFAULT_SUMMARY;

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ TIMELINE ═══ */}
      <div className="bg-white rounded-2xl px-8 py-6" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="relative" style={{ height: 110 }}>
          {/* Barre — exactement au centre vertical */}
          <div className="absolute left-0 right-0 h-px bg-slate-200" style={{ top: "50%" }} />

          {/* Aujourd'hui */}
          {(() => {
            const first = EVENTS[0].date.getTime();
            const last = EVENTS[EVENTS.length - 1].date.getTime();
            const range = last - first || 1;
            const pct = Math.min(95, Math.max(5, 5 + ((Date.now() - first) / range) * 90));
            return (
              <div className="absolute flex flex-col items-center z-10" style={{ left: `${pct}%`, top: 0, bottom: 0, transform: "translateX(-50%)" }}>
                <div className="w-px bg-blue-400 flex-1" />
                <span className="text-[10px] font-medium text-blue-500 mt-1 whitespace-nowrap" style={{ fontFamily: "var(--font-inter)" }}>Aujourd'hui</span>
              </div>
            );
          })()}

          {/* Points — centrés sur la barre */}
          {computePositions(EVENTS).map((event) => {
            const colors = EVENT_COLORS[event.type] ?? EVENT_COLORS.consultation;
            const isSelected = selectedId === event.id;
            const isAbove = event.id % 2 !== 0;

            return (
              <button key={event.id} onClick={() => setSelectedId(isSelected ? null : event.id)} className="absolute group" style={{ left: `${event.pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
                <div className={cn("w-3 h-3 rounded-full border-2 transition-all group-hover:scale-150", isSelected ? "scale-150 ring-2 ring-violet-300 ring-offset-2" : "", colors.fill, colors.border)} />
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

      {/* ═══ DÉTAIL ÉVÉNEMENT (au clic, sous la timeline) ═══ */}
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
          <p className="text-sm text-slate-600 leading-relaxed">{selectedEvent.detail ?? "Note complète disponible dans l'onglet Notes."}</p>
        </div>
      )}

      {/* ═══ RÉSUMÉ IA + PROCHAIN RDV — une seule zone, pas de colonnes ═══ */}
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {/* Résumé IA */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={13} className="text-slate-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>Résumé IA</span>
        </div>
        <p className={cn("text-sm text-slate-700 leading-relaxed", !summaryExpanded ? "line-clamp-3" : "")}>
          {summary}
        </p>
        {summary.length > 150 && (
          <button onClick={() => setSummaryExpanded(!summaryExpanded)} className="text-xs text-[#4F46E5] font-medium hover:underline mt-2 flex items-center gap-1">
            {summaryExpanded ? <><ChevronUp size={12} /> Réduire</> : <><ChevronDown size={12} /> Voir plus</>}
          </button>
        )}

        {/* Séparateur */}
        <div className="border-t border-slate-100 mt-4 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400 mb-2" style={{ fontFamily: "var(--font-inter)" }}>Prochain RDV</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#4F46E5]" /> {NEXT_RDV.date} · {NEXT_RDV.time}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{NEXT_RDV.practitioner} — {NEXT_RDV.type}</p>
              <p className="text-xs text-slate-400 mt-0.5">{NEXT_RDV.reason}</p>
            </div>
            <Link href="/agenda" className="text-xs text-[#4F46E5] font-medium hover:underline whitespace-nowrap ml-4">Agenda →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
