"use client";

/**
 * PatientOverview — Vue d'ensemble de la fiche patient
 *
 * RÈGLES :
 * - Pas de header patient (géré par la page parente)
 * - Pas de boutons d'action (dans le header parente)
 * - Pas de sidebar de navigation (dans la page parente)
 * - Chaque info = 1 seul endroit
 * - Tout visible dans un viewport 1280px sans scroll vertical
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, Sparkles, Calendar, MapPin, X, ChevronDown, ChevronUp } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TimelineEvent {
  id: number;
  date: Date;
  label: string;
  title: string;
  practitioner: string;
  type: "consultation" | "team" | "planned" | "alert" | "compte_rendu";
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
// MOCK DATA — séparées proprement
// ═══════════════════════════════════════════════════════════════════════════════

const EVENTS: TimelineEvent[] = [
  { id: 1, date: new Date("2025-03-23"), label: "23 mars", title: "1ère consultation", practitioner: "Dr Suela", type: "consultation", past: true, detail: "Première consultation. Tableau préoccupant : restriction alimentaire sévère centrée sur la 'pureté' des aliments. IMC 17.8. Hyperactivité physique (2h/jour). Déni de la gravité." },
  { id: 2, date: new Date("2025-04-01"), label: "1er avril", title: "Point équipe", practitioner: "Équipe", type: "team", past: true, detail: "Consensus : situation critique. Théo minimise. Parents peu disponibles. Décision : consultation endoc en urgence + bilan bio." },
  { id: 3, date: new Date("2025-04-04"), label: "4 avril", title: "Consultation", practitioner: "É. Renard", type: "consultation", past: true, detail: "Séance psy initiale. Déni persistant. 'Je fais juste attention à ma santé.' Approche motivationnelle commencée." },
  { id: 4, date: new Date("2025-04-07"), label: "7 avril", title: "Consultation", practitioner: "M. Vire", type: "consultation", past: true, detail: "1er bilan diététique. Restriction sévère : élimine glucides, produits laitiers, viande rouge. Apports < 800 kcal/j." },
  { id: 5, date: new Date("2025-04-12"), label: "12 avril", title: "RDV planifié", practitioner: "Dr Suela", type: "planned", past: false },
  { id: 6, date: new Date("2025-04-15"), label: "15 avril", title: "RDV planifié", practitioner: "É. Renard", type: "planned", past: false },
];

const ALERTS = [
  { id: 1, level: "high" as const, text: "Famille injoignable depuis 10 jours" },
  { id: 2, level: "medium" as const, text: "Bilan biologique non récupéré" },
];

const TEAM = [
  { initials: "AS", name: "Amélie Suela", specialty: "Médecin lead", color: "bg-violet-500", active: true },
  { initials: "ER", name: "Émilie Renard", specialty: "Psychologue", color: "bg-blue-500", active: true },
  { initials: "MV", name: "Margot Vire", specialty: "Diététicienne", color: "bg-emerald-500", active: false },
];

const NEXT_RDV = { date: "Sam 12 avril", time: "14h00", practitioner: "Dr Suela", type: "Présentiel", reason: "Suivi médical — contrôle poids et constantes" };

const DEFAULT_SUMMARY = "Orthorexie sévère en évolution rapide. IMC 17.8, perte de 8 kg en 4 mois. Déni actif de la gravité. Famille peu mobilisée malgré les relances. Équipe incomplète — psychiatre manquant.";

const EVENT_COLORS: Record<string, { fill: string; border: string }> = {
  consultation: { fill: "bg-violet-500", border: "border-violet-500" },
  team: { fill: "bg-blue-500", border: "border-blue-500" },
  planned: { fill: "bg-white", border: "border-slate-300" },
  alert: { fill: "bg-red-500", border: "border-red-500" },
  compte_rendu: { fill: "bg-slate-400", border: "border-slate-400" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function computePositions(events: TimelineEvent[]) {
  const first = events[0].date.getTime();
  const last = events[events.length - 1].date.getTime();
  const range = last - first || 1;
  return events.map((e) => ({
    ...e,
    pct: 5 + ((e.date.getTime() - first) / range) * 90,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — pas de header, pas de nav, juste le contenu overview
// ═══════════════════════════════════════════════════════════════════════════════

export function PatientOverview({ patient, careCaseId }: PatientOverviewProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedEvent = EVENTS.find((e) => e.id === selectedId);

  return (
    <div className="flex flex-col gap-4">
      {/* ═══ 1. TIMELINE ═══ */}
      <PatientTimeline events={EVENTS} selectedId={selectedId} onSelect={setSelectedId} />

      {/* ═══ 2. DÉTAIL ÉVÉNEMENT (conditionnel) ═══ */}
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedId(null)} />
      )}

      {/* ═══ 3. CORPS — 2 zones ═══ */}
      <div className="flex gap-4">
        {/* Zone principale 65% */}
        <div className="flex-[65] min-w-0 space-y-4">
          <AISnapshot summary={patient.clinicalSummary ?? DEFAULT_SUMMARY} />
          <NextAppointment />
        </div>

        {/* Zone secondaire 35% */}
        <div className="flex-[35] min-w-0 space-y-4">
          <AlertsPanel alerts={ALERTS} />
          <CareTeam members={TEAM} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PatientTimeline — axe proportionnel, points centrés, labels alternés
// ═══════════════════════════════════════════════════════════════════════════════

function PatientTimeline({ events, selectedId, onSelect }: {
  events: TimelineEvent[]; selectedId: number | null; onSelect: (id: number | null) => void;
}) {
  const positioned = computePositions(events);
  const first = events[0].date.getTime();
  const last = events[events.length - 1].date.getTime();
  const range = last - first || 1;
  const todayPct = Math.min(95, Math.max(5, 5 + ((Date.now() - first) / range) * 90));

  return (
    <div className="bg-white rounded-2xl px-8 py-6" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Container : la barre est centrée verticalement, les points sont dessus */}
      <div className="relative" style={{ height: 120 }}>
        {/* Barre horizontale — exactement au milieu vertical */}
        <div className="absolute left-0 right-0 h-px bg-slate-200" style={{ top: "50%" }} />

        {/* Marqueur Aujourd'hui */}
        <div className="absolute flex flex-col items-center z-10" style={{ left: `${todayPct}%`, top: 0, bottom: 0, transform: "translateX(-50%)" }}>
          <div className="w-px bg-blue-400 flex-1" />
          <span className="text-[10px] font-medium text-blue-500 mt-1 whitespace-nowrap" style={{ fontFamily: "var(--font-inter)" }}>Aujourd'hui</span>
        </div>

        {/* Points — centrés sur la barre via top:50% + translateY(-50%) */}
        {positioned.map((event) => {
          const colors = EVENT_COLORS[event.type] ?? EVENT_COLORS.consultation;
          const isSelected = selectedId === event.id;
          const isAbove = event.id % 2 !== 0; // alternance stricte

          return (
            <button
              key={event.id}
              onClick={() => onSelect(isSelected ? null : event.id)}
              className="absolute group"
              style={{ left: `${event.pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}
            >
              {/* Le point — toujours centré sur la barre */}
              <div className={cn(
                "w-3 h-3 rounded-full border-2 transition-all group-hover:scale-150",
                isSelected ? "scale-150 ring-2 ring-violet-300 ring-offset-2" : "",
                colors.fill, colors.border,
              )} />

              {/* Label — au-dessus ou en-dessous, avec gap garanti de 48px */}
              <div
                className="absolute whitespace-nowrap text-center pointer-events-none"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: isAbove ? undefined : "16px",
                  bottom: isAbove ? "16px" : undefined,
                  maxWidth: 90,
                }}
              >
                <p className="text-[10px] text-slate-400 leading-tight truncate" style={{ fontFamily: "var(--font-inter)" }}>{event.label}</p>
                <p className="text-[11px] font-medium text-slate-700 leading-tight truncate">{event.title}</p>
                <p className="text-[10px] text-slate-400 leading-tight truncate">{event.practitioner}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EventDetail — s'ouvre SOUS la timeline au clic
// ═══════════════════════════════════════════════════════════════════════════════

function EventDetail({ event, onClose }: { event: TimelineEvent; onClose: () => void }) {
  return (
    <div className="bg-violet-50 rounded-2xl p-5" style={{ border: "1px solid #DDD6FE" }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>{event.label}</p>
          <h3 className="text-[15px] font-bold text-slate-800 mt-0.5" style={{ fontFamily: "var(--font-jakarta)" }}>{event.title}</h3>
          <p className="text-sm text-slate-500">{event.practitioner}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-violet-100 transition-colors"><X size={14} /></button>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{event.detail ?? "Note complète disponible dans l'onglet Notes."}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AISnapshot — 3 lignes max, expand au clic
// ═══════════════════════════════════════════════════════════════════════════════

function AISnapshot({ summary }: { summary: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} className="text-slate-400" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>Résumé IA</span>
      </div>
      <p className={cn("text-sm text-slate-700 leading-relaxed", !expanded ? "line-clamp-3" : "")}>
        {summary}
      </p>
      {summary.length > 150 && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#4F46E5] font-medium hover:underline mt-2 flex items-center gap-1">
          {expanded ? <><ChevronUp size={12} /> Réduire</> : <><ChevronDown size={12} /> Voir plus</>}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NextAppointment — bloc compact
// ═══════════════════════════════════════════════════════════════════════════════

function NextAppointment() {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
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
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AlertsPanel — max 2 visibles, badge count
// ═══════════════════════════════════════════════════════════════════════════════

function AlertsPanel({ alerts }: { alerts: typeof ALERTS }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>Vigilance</p>
        {alerts.length > 0 && <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{alerts.length}</span>}
      </div>
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-400">Aucune alerte active</p>
      ) : (
        <div className="space-y-2">
          {alerts.slice(0, 2).map((a) => (
            <div key={a.id} className={cn("flex items-start gap-2 px-3 py-2.5 rounded-xl border", a.level === "high" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200")}>
              <AlertTriangle size={12} className={cn("mt-0.5 shrink-0", a.level === "high" ? "text-red-500" : "text-orange-500")} />
              <p className={cn("text-xs font-medium leading-snug", a.level === "high" ? "text-red-700" : "text-orange-700")}>{a.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CareTeam — avatars + statut
// ═══════════════════════════════════════════════════════════════════════════════

function CareTeam({ members }: { members: typeof TEAM }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400 mb-3" style={{ fontFamily: "var(--font-inter)" }}>Équipe de suivi</p>
      <div className="space-y-2.5">
        {members.map((m) => (
          <div key={m.initials} className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", m.color)}>{m.initials}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
              <p className="text-xs text-slate-400 truncate">{m.specialty}</p>
            </div>
            {!m.active && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">En attente</span>}
          </div>
        ))}
      </div>
      <button className="text-xs text-[#4F46E5] font-medium hover:underline mt-3">+ Inviter un professionnel</button>
    </div>
  );
}
