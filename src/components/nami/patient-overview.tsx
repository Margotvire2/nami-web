"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Stethoscope, FileText, ArrowUpRight, ArrowDownLeft, AlertTriangle,
  Users, Calendar, Clock, Sparkles, ChevronRight, ChevronLeft,
  MapPin, Video, ArrowLeftRight, X,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TimelineEvent {
  id: string;
  date: string;
  dateLabel: string;
  type: "consultation" | "compte_rendu" | "adressage_envoye" | "adressage_recu" | "alerte" | "equipe";
  emoji: string;
  label: string;
  praticien: string;
  resume: string;
  detailFull?: string;
  isFuture: boolean;
}

interface Alert {
  id: string;
  text: string;
  date: string;
}

interface TeamMember {
  id: string;
  initials: string;
  name: string;
  specialty: string;
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
  };
  careCaseId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: "e1", date: "2025-03-23", dateLabel: "23 mars", type: "consultation", emoji: "🩺", label: "Consultation", praticien: "Dr Suela", resume: "1ère consultation, adressé par médecin du sport", detailFull: "Première consultation. Tableau préoccupant : restriction alimentaire sévère centrée sur la 'pureté' des aliments. IMC 17.8. Hyperactivité physique (2h/jour). Déni de la gravité. Plan : bilan bio urgent, orientation psy et diét.", isFuture: false },
  { id: "e2", date: "2025-03-28", dateLabel: "28 mars", type: "adressage_envoye", emoji: "↗️", label: "Adressage envoyé", praticien: "→ Émilie Renard (Psy)", resume: "Adressage pour prise en charge psychologique TCA", isFuture: false },
  { id: "e3", date: "2025-04-01", dateLabel: "1er avril", type: "consultation", emoji: "🩺", label: "Consultation", praticien: "Émilie Renard (Psy)", resume: "Déni persistant, séance difficile. Alliance thérapeutique en construction.", detailFull: "Séance psy initiale. Théo minimise ses symptômes. 'Je fais juste attention à ma santé.' Travail d'approche motivationnelle commencé. Prochaine séance dans 10 jours.", isFuture: false },
  { id: "e4", date: "2025-04-04", dateLabel: "4 avril", type: "compte_rendu", emoji: "📋", label: "Compte-rendu", praticien: "Dr Suela", resume: "Résultats bilan bio reçus. IMC stable à 17.8.", detailFull: "Bilan biologique : NFS normale, iono correct, ferritine basse (18), vitamine D insuffisante. IMC 17.8 stable. Prescription supplémentation fer + vitamine D. Surveillance renforcée.", isFuture: false },
  { id: "e5", date: "2025-04-04", dateLabel: "4 avril", type: "equipe", emoji: "👥", label: "Ajout équipe", praticien: "Margot Vire (Diét.)", resume: "Diététicienne ajoutée à l'équipe de soin", isFuture: false },
  { id: "e6", date: "2025-04-07", dateLabel: "7 avril", type: "consultation", emoji: "🩺", label: "Consultation", praticien: "Margot Vire (Diét.)", resume: "1er bilan nutritionnel. Apports < 800 kcal/j.", detailFull: "Premier bilan diététique. Restriction sévère : élimine glucides, produits laitiers, viande rouge. Apports estimés < 800 kcal/j. Objectif : réintroduction progressive, commencer par le petit-déjeuner.", isFuture: false },
  { id: "e7", date: "2025-04-12", dateLabel: "12 avril", type: "consultation", emoji: "🩺", label: "RDV planifié", praticien: "Dr Suela", resume: "Suivi médical — contrôle poids et constantes", isFuture: true },
  { id: "e8", date: "2025-04-15", dateLabel: "15 avril", type: "consultation", emoji: "🩺", label: "RDV planifié", praticien: "Émilie Renard (Psy)", resume: "Séance psy de suivi", isFuture: true },
];

const ALERTS: Alert[] = [
  { id: "a1", text: "Famille injoignable depuis 10 jours", date: "il y a 2j" },
  { id: "a2", text: "Bilan biologique de contrôle non programmé", date: "il y a 5j" },
  { id: "a3", text: "Poids non renseigné depuis 2 semaines", date: "il y a 3j" },
];

const TEAM: TeamMember[] = [
  { id: "t1", initials: "AS", name: "Dr Amélie Suela", specialty: "Médecin · Lead" },
  { id: "t2", initials: "ER", name: "Émilie Renard", specialty: "Psychologue TCA" },
  { id: "t3", initials: "MV", name: "Margot Vire", specialty: "Diététicienne" },
];

const CRITICITE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critique: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", label: "Critique" },
  surveillance: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", label: "Surveillance" },
  stable: { bg: "bg-[#F0FDF4]", text: "text-[#059669]", label: "Stable" },
};

const EVENT_COLORS: Record<string, string> = {
  consultation: "#4F46E5",
  compte_rendu: "#64748B",
  adressage_envoye: "#D97706",
  adressage_recu: "#059669",
  alerte: "#DC2626",
  equipe: "#7C3AED",
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function PatientOverview({ patient, careCaseId }: PatientOverviewProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const selectedEvent = TIMELINE_EVENTS.find((e) => e.id === selectedEventId) ?? null;
  const crit = CRITICITE_STYLE[patient.criticite] ?? CRITICITE_STYLE.stable;

  // Scroll timeline to "today" area on mount
  useEffect(() => {
    if (timelineRef.current) {
      const todayMarker = timelineRef.current.querySelector("[data-today]");
      if (todayMarker) {
        todayMarker.scrollIntoView({ inline: "center", behavior: "smooth" });
      }
    }
  }, []);

  // Calculate positions — proportional to real time
  const allDates = TIMELINE_EVENTS.map((e) => new Date(e.date).getTime());
  const minDate = Math.min(...allDates) - 3 * 86400000;
  const maxDate = Math.max(...allDates) + 5 * 86400000;
  const range = maxDate - minDate || 1;
  const todayMs = Date.now();
  const todayPct = ((todayMs - minDate) / range) * 100;

  return (
    <div className="space-y-0">
      {/* ═══ TIMELINE ═══ */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8ECF4" }}>
        <div className="px-6 py-4 border-b border-[#E8ECF4] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>PARCOURS DE SOIN</p>
            <p className="text-[12px] text-[#94A3B8] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{TIMELINE_EVENTS.length} événements · Suivi {patient.suiviDepuis}</p>
          </div>
        </div>

        {/* Timeline scroll container */}
        <div ref={timelineRef} className="overflow-x-auto px-6 py-8">
          <div className="relative" style={{ minWidth: Math.max(700, TIMELINE_EVENTS.length * 120) }}>
            {/* Base line */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#E8ECF4] -translate-y-1/2" />

            {/* Today marker */}
            <div className="absolute top-0 bottom-0 z-10" style={{ left: `${Math.min(todayPct, 95)}%` }} data-today>
              <div className="absolute top-0 bottom-0 w-[2px] bg-[#3B82F6]" />
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ fontFamily: "var(--font-inter)" }}>Aujourd'hui</span>
            </div>

            {/* Events */}
            <div className="relative flex items-center" style={{ height: 120 }}>
              {TIMELINE_EVENTS.map((event) => {
                const pct = ((new Date(event.date).getTime() - minDate) / range) * 100;
                const color = EVENT_COLORS[event.type] ?? "#94A3B8";
                const isSelected = selectedEventId === event.id;

                return (
                  <div
                    key={event.id}
                    className="absolute flex flex-col items-center group cursor-pointer"
                    style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                    onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                  >
                    {/* Date above */}
                    <span className={cn("text-[10px] mb-2 whitespace-nowrap", event.isFuture ? "text-[#CBD5E1]" : "text-[#94A3B8]")} style={{ fontFamily: "var(--font-inter)" }}>
                      {event.dateLabel}
                    </span>

                    {/* Dot */}
                    <motion.div
                      whileHover={{ scale: 1.3 }}
                      className={cn(
                        "rounded-full transition-all z-10",
                        isSelected ? "w-4 h-4 ring-2 ring-[#4F46E5] ring-offset-2" : "w-3 h-3",
                        event.isFuture ? "border-2 bg-white" : ""
                      )}
                      style={{
                        backgroundColor: event.isFuture ? "white" : color,
                        borderColor: color,
                      }}
                    />

                    {/* Info below */}
                    <div className={cn("mt-2 text-center max-w-[110px]", event.isFuture ? "opacity-50" : "")}>
                      <p className="text-[10px] font-medium text-[#0F172A] leading-tight truncate">{event.emoji} {event.label}</p>
                      <p className="text-[9px] text-[#94A3B8] truncate" style={{ fontFamily: "var(--font-inter)" }}>{event.praticien}</p>
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
                      <div className="bg-[#0F172A] text-white text-[11px] rounded-lg px-3 py-2 max-w-[220px] shadow-xl">
                        <p className="font-semibold">{event.label} · {event.praticien}</p>
                        <p className="text-[#94A3B8] mt-0.5 leading-snug">{event.resume}</p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0F172A]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ZONE DÉTAIL — 2 colonnes ═══ */}
      <div className="flex gap-5 mt-5">
        {/* ── Colonne gauche 60% ── */}
        <div className="flex-[60] min-w-0 space-y-5">
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <motion.div key={selectedEvent.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF4" }}>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setSelectedEventId(null)} className="text-[12px] font-medium text-[#4F46E5] hover:underline flex items-center gap-1">
                    <ChevronLeft size={14} /> Résumé IA
                  </button>
                  <span className="text-[10px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{selectedEvent.dateLabel}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{selectedEvent.emoji}</span>
                  <div>
                    <p className="text-[15px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>{selectedEvent.label}</p>
                    <p className="text-[12px] text-[#64748B]">{selectedEvent.praticien}</p>
                  </div>
                </div>
                <p className="text-[13px] text-[#374151] leading-relaxed">{selectedEvent.detailFull ?? selectedEvent.resume}</p>
              </motion.div>
            ) : (
              <motion.div key="snapshot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF4" }}>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>RÉSUMÉ IA DU PARCOURS</p>
                  <span className="text-[9px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Sparkles size={8} /> IA</span>
                </div>
                <div className="bg-[#F5F0E8] rounded-xl p-4">
                  <p className="text-[13px] text-[#374151] leading-relaxed">
                    {patient.clinicalSummary ??
                      `${patient.firstName} est suivi depuis ${patient.suiviDepuis}. Trois professionnels impliqués. Le parcours nécessite une coordination étroite entre les membres de l'équipe de soin.`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Équipe */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>ÉQUIPE DE SUIVI</p>
            <div className="flex items-center gap-3">
              {TEAM.map((m) => (
                <Link key={m.id} href="/collaboration" title={`${m.name} · ${m.specialty}`}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] transition-colors group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                      {m.initials}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">{m.name.split(" ").slice(-1)[0]}</p>
                      <p className="text-[10px] text-[#94A3B8]">{m.specialty}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Colonne droite 40% ── */}
        <div className="flex-[40] min-w-0 space-y-5">
          {/* Alertes */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>ALERTES ACTIVES</p>
            <div className="space-y-2">
              {ALERTS.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 bg-[#FFFBEB] rounded-xl px-3.5 py-2.5" style={{ border: "1px solid #FDE68A" }}>
                  <AlertTriangle size={13} className="text-[#D97706] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#92400E] leading-snug">{a.text}</p>
                    <p className="text-[10px] text-[#D97706] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prochain RDV */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>PROCHAIN RDV</p>
            <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2">
              <p className="text-[13px] font-semibold text-[#0F172A] flex items-center gap-2">
                <Calendar size={13} className="text-[#4F46E5]" /> Samedi 12 avril · 14h00
              </p>
              <p className="text-[12px] text-[#64748B] flex items-center gap-2"><MapPin size={12} className="text-[#94A3B8]" /> Présentiel · Dr Suela</p>
              <p className="text-[12px] text-[#64748B] italic">Suivi médical — contrôle poids et constantes</p>
            </div>
            <Link href="/agenda" className="text-[12px] font-medium text-[#4F46E5] hover:underline mt-2 inline-block">Voir agenda →</Link>
          </div>

          {/* Motif d'entrée */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>MOTIF D'ENTRÉE</p>
            <div className="space-y-2 text-[12px] text-[#374151]">
              <p>Orthorexie sévère avec restriction alimentaire progressive</p>
              <p className="text-[#64748B] flex items-center gap-1.5">
                <ArrowDownLeft size={12} className="text-[#D97706]" /> Adressé par Dr Martin (Médecin du sport)
              </p>
              <p className="text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Depuis le 23 mars 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
