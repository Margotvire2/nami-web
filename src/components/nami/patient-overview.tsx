"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  AlertTriangle, Sparkles, ChevronLeft, Calendar, MapPin,
  FileText, MessageSquare, ArrowUpRight, CalendarDays, X,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TimelineEventMock {
  id: number;
  date: Date;
  label: string;
  title: string;
  practitioner: string;
  type: "consultation" | "team" | "planned" | "alert" | "compte_rendu";
  past: boolean;
  detail?: string;
}

interface AlertMock {
  id: number;
  level: "high" | "medium";
  text: string;
}

interface TeamMemberMock {
  initials: string;
  name: string;
  specialty: string;
  color: string;
  active: boolean;
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
    entryReason?: string;
    referredBy?: string;
  };
  careCaseId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const TIMELINE_EVENTS: TimelineEventMock[] = [
  { id: 1, date: new Date("2025-03-23"), label: "23 mars", title: "1ère consultation", practitioner: "Dr Suela", type: "consultation", past: true, detail: "Première consultation. Tableau préoccupant : restriction alimentaire sévère centrée sur la 'pureté' des aliments. IMC 17.8. Hyperactivité physique (2h/jour). Déni de la gravité." },
  { id: 2, date: new Date("2025-04-01"), label: "1er avril", title: "Point équipe", practitioner: "Équipe", type: "team", past: true, detail: "Point d'équipe. Consensus : situation critique. Théo minimise ses symptômes. Les parents ne mesurent pas la gravité. Décision : consultation endoc en urgence." },
  { id: 3, date: new Date("2025-04-04"), label: "4 avril", title: "Consultation", practitioner: "É. Renard", type: "consultation", past: true, detail: "Séance psy initiale. Déni persistant. 'Je fais juste attention à ma santé.' Travail d'approche motivationnelle commencé." },
  { id: 4, date: new Date("2025-04-07"), label: "7 avril", title: "Consultation", practitioner: "M. Vire", type: "consultation", past: true, detail: "Premier bilan diététique. Restriction sévère : élimine glucides, produits laitiers, viande rouge. Apports estimés < 800 kcal/j." },
  { id: 5, date: new Date("2025-04-12"), label: "12 avril", title: "RDV planifié", practitioner: "Dr Suela", type: "planned", past: false },
  { id: 6, date: new Date("2025-04-15"), label: "15 avril", title: "RDV planifié", practitioner: "É. Renard", type: "planned", past: false },
];

const ALERTS: AlertMock[] = [
  { id: 1, level: "high", text: "Famille injoignable depuis 10 jours" },
  { id: 2, level: "medium", text: "Bilan biologique non récupéré" },
];

const TEAM: TeamMemberMock[] = [
  { initials: "AS", name: "Amélie Suela", specialty: "Médecin lead", color: "bg-violet-500", active: true },
  { initials: "ER", name: "Émilie Renard", specialty: "Psychologue", color: "bg-blue-500", active: true },
  { initials: "MV", name: "Margot Vire", specialty: "Diététicienne", color: "bg-emerald-500", active: false },
];

const NEXT_RDV = { date: "Samedi 12 avril", time: "14h00", practitioner: "Dr Suela", type: "Présentiel", reason: "Suivi médical — contrôle poids et constantes" };

const CRITICALITY_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  stable: { label: "Stable", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  surveillance: { label: "Surveillance", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  critique: { label: "Critique", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const EVENT_TYPE_CONFIG: Record<string, { color: string; border: string }> = {
  consultation: { color: "bg-violet-500", border: "border-violet-500" },
  team: { color: "bg-blue-500", border: "border-blue-500" },
  planned: { color: "bg-white", border: "border-slate-300" },
  alert: { color: "bg-red-500", border: "border-red-500" },
  compte_rendu: { color: "bg-slate-400", border: "border-slate-400" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function computePositions(events: TimelineEventMock[]) {
  const first = events[0].date.getTime();
  const last = events[events.length - 1].date.getTime();
  const range = last - first || 1;
  return events.map((e) => ({ ...e, position: 5 + ((e.date.getTime() - first) / range) * 90 }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function PatientOverview({ patient, careCaseId }: PatientOverviewProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const selectedEvent = TIMELINE_EVENTS.find((e) => e.id === selectedEventId);
  const crit = CRITICALITY_CONFIG[patient.criticite] ?? CRITICALITY_CONFIG.stable;

  const aiSummary = patient.clinicalSummary ?? "Orthorexie sévère en évolution rapide. IMC 17.8, perte de 8 kg en 4 mois. Déni actif de la gravité. Famille peu mobilisée malgré les relances. Équipe incomplète — psychiatre manquant.";

  return (
    <div className="flex flex-col gap-5">

      {/* ═══ HEADER ═══ */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0", patient.criticite === "critique" ? "bg-red-500" : patient.criticite === "surveillance" ? "bg-orange-500" : "bg-emerald-500")}>
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-jakarta)" }}>
                {patient.firstName} {patient.lastName}
              </h1>
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", crit.bg, crit.text)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", crit.dot)} />
                {crit.label}
              </span>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{patient.pathologie}</span>
              {patient.phase && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{patient.phase}</span>}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {patient.age ? `${patient.age} ans · ` : ""}Lead : {patient.leadPraticien} · Suivi depuis le {patient.suiviDepuis}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"><FileText size={14} /> Note</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"><ArrowUpRight size={14} /> Adresser</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"><MessageSquare size={14} /> Message</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors"><CalendarDays size={14} /> RDV</button>
        </div>
      </div>

      {/* ═══ TIMELINE ═══ */}
      <TimelineComponent events={TIMELINE_EVENTS} selectedId={selectedEventId} onSelect={setSelectedEventId} />

      {/* ═══ CORPS — 3 colonnes (5/3/4) ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Colonne gauche — Snapshot IA ou détail événement */}
        <div className="col-span-5">
          {selectedEvent ? (
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-violet-500 font-medium uppercase tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>{selectedEvent.label}</p>
                  <h3 className="text-base font-semibold text-slate-800 mt-0.5" style={{ fontFamily: "var(--font-jakarta)" }}>{selectedEvent.title}</h3>
                  <p className="text-sm text-slate-500">{selectedEvent.practitioner}</p>
                </div>
                <button onClick={() => setSelectedEventId(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{selectedEvent.detail ?? "Note complète disponible dans l'onglet Documents."}</p>
              <button onClick={() => setSelectedEventId(null)} className="text-xs text-violet-600 hover:underline mt-3 flex items-center gap-1"><ChevronLeft size={12} /> Retour au résumé</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>Résumé IA</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{aiSummary}</p>
              <div className="border-t border-slate-100 pt-3 mt-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2" style={{ fontFamily: "var(--font-inter)" }}>Prochain RDV</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{NEXT_RDV.date} · {NEXT_RDV.time}</p>
                    <p className="text-xs text-slate-500">{NEXT_RDV.practitioner} — {NEXT_RDV.type}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{NEXT_RDV.reason}</p>
                  </div>
                  <Link href="/agenda" className="text-xs text-[#4F46E5] hover:underline whitespace-nowrap ml-4">Voir agenda →</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne centrale — Alertes */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>Vigilance</p>
            {ALERTS.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune alerte active</p>
            ) : (
              ALERTS.map((alert) => {
                const isHigh = alert.level === "high";
                return (
                  <div key={alert.id} className={cn("flex items-start gap-2 px-3 py-2.5 rounded-xl border", isHigh ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200")}>
                    <AlertTriangle size={12} className={cn("mt-0.5 shrink-0", isHigh ? "text-red-500" : "text-orange-500")} />
                    <p className={cn("text-xs font-medium", isHigh ? "text-red-700" : "text-orange-700")}>{alert.text}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Colonne droite — Équipe */}
        <div className="col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>Équipe de suivi</p>
            <div className="flex flex-col gap-2">
              {TEAM.map((m) => (
                <div key={m.initials} className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", m.color)}>{m.initials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
                    <p className="text-xs text-slate-400 truncate">{m.specialty}</p>
                  </div>
                  {!m.active && <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap">En attente</span>}
                </div>
              ))}
            </div>
            <button className="text-xs text-[#4F46E5] hover:underline text-left mt-1">+ Inviter un professionnel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function TimelineComponent({ events, selectedId, onSelect }: { events: TimelineEventMock[]; selectedId: number | null; onSelect: (id: number | null) => void }) {
  const positioned = computePositions(events);
  const first = events[0].date.getTime();
  const last = events[events.length - 1].date.getTime();
  const range = last - first || 1;
  const todayPosition = Math.min(95, Math.max(5, 5 + ((Date.now() - first) / range) * 90));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-8 py-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="relative" style={{ height: 100 }}>
        {/* Ligne de base */}
        <div className="absolute top-[40px] left-0 right-0 h-px bg-slate-200" />

        {/* Marqueur Aujourd'hui */}
        <div className="absolute top-0 flex flex-col items-center" style={{ left: `${todayPosition}%`, transform: "translateX(-50%)" }}>
          <div className="w-px h-[40px] bg-blue-400" />
          <span className="text-[10px] font-medium text-blue-500 mt-1 whitespace-nowrap" style={{ fontFamily: "var(--font-inter)" }}>Aujourd'hui</span>
        </div>

        {/* Points */}
        {positioned.map((event) => {
          const typeConfig = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.consultation;
          const isSelected = selectedId === event.id;
          const isAbove = event.id % 2 !== 0;

          return (
            <button key={event.id} onClick={() => onSelect(isSelected ? null : event.id)} className="absolute flex flex-col items-center group" style={{ left: `${event.position}%`, transform: "translateX(-50%)", top: "28px" }}>
              {/* Point */}
              <div className={cn(
                "w-3 h-3 rounded-full border-2 transition-transform group-hover:scale-125",
                isSelected ? "scale-125 ring-2 ring-violet-300 ring-offset-1" : "",
                typeConfig.color, typeConfig.border
              )} />

              {/* Label — alternance haut/bas */}
              <div className={cn("absolute whitespace-nowrap text-center pointer-events-none", isAbove ? "-top-[52px]" : "top-[20px]")} style={{ maxWidth: 100 }}>
                <p className="text-[10px] text-slate-400 leading-tight" style={{ fontFamily: "var(--font-inter)" }}>{event.label}</p>
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
