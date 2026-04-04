"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Clock, MapPin, Monitor, Check, AlertCircle,
  ArrowLeftRight, FileText, Users, ChevronRight,
  Video,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Appointment {
  id: string;
  time: string;
  patient: string;
  initials: string;
  type: "suivi" | "premiere" | "urgence" | "teleconsult" | "bilan";
  duration: string;
  mode: "Présentiel" | "Téléconsultation";
  attention?: string;
  status: "past" | "current" | "upcoming";
}

interface TodoItem {
  id: string;
  icon: typeof Clock;
  iconColor: string;
  title: string;
  sub: string;
  href: string;
}

interface FeedItem {
  id: string;
  initials: string;
  name: string;
  time: string;
  message: string;
  tag: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const APPOINTMENTS: Appointment[] = [
  { id: "a1", time: "09:00", patient: "Margot Vire", initials: "MV", type: "suivi", duration: "45min", mode: "Présentiel", status: "past" },
  { id: "a2", time: "10:30", patient: "Lucas Bernier", initials: "LB", type: "suivi", duration: "30min", mode: "Présentiel", status: "past" },
  { id: "a3", time: "14:00", patient: "Théo Dufresne", initials: "TD", type: "suivi", duration: "45min", mode: "Présentiel", attention: "Pas de contact depuis 3 semaines", status: "upcoming" },
  { id: "a4", time: "15:30", patient: "Sofia Marchand", initials: "SM", type: "premiere", duration: "1h", mode: "Présentiel", status: "upcoming" },
  { id: "a5", time: "17:00", patient: "Gabrielle Martin", initials: "GM", type: "teleconsult", duration: "30min", mode: "Téléconsultation", status: "upcoming" },
];

const TODO_ITEMS: TodoItem[] = [
  { id: "t1", icon: ArrowLeftRight, iconColor: "text-[#4F46E5] bg-[#EEF2FF]", title: "3 adressages sans réponse", sub: "Le plus ancien date de 4 jours", href: "/adressages" },
  { id: "t2", icon: Clock, iconColor: "text-[#D97706] bg-[#FFFBEB]", title: "Emma Rousseau", sub: "Aucun contact depuis 3 semaines", href: "/patients" },
  { id: "t3", icon: FileText, iconColor: "text-[#64748B] bg-[#F1F5F9]", title: "Résultats labo · Théo Dufresne", sub: "Reçus hier, non consultés", href: "/documents" },
  { id: "t4", icon: Users, iconColor: "text-[#7C3AED] bg-[#F5F3FF]", title: "Réunion équipe Pédiatrie HAP", sub: "Demain · 8h00", href: "/equipe" },
];

const FEED_ITEMS: FeedItem[] = [
  { id: "f1", initials: "MV", name: "Margot Vire", time: "il y a 2h", message: "Bonne nouvelle pour Lucas — il m'a dit qu'il cuisinait à nouveau régulièrement", tag: "Lucas Bernier" },
  { id: "f2", initials: "KB", name: "Dr Benali", time: "il y a 3h", message: "Pouvez-vous prendre Emma Rousseau en urgence cette semaine ?", tag: "Emma Rousseau" },
  { id: "f3", initials: "AS", name: "Vous", time: "hier 18h30", message: "Situation inquiétante pour Théo — il m'a dit qu'il avait encore réduit ses repas", tag: "Théo Dufresne" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TYPE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  suivi:       { bg: "bg-indigo-50", text: "text-indigo-600", label: "Suivi régulier" },
  premiere:    { bg: "bg-violet-50", text: "text-violet-600", label: "Première consultation" },
  urgence:     { bg: "bg-amber-50",  text: "text-amber-700",  label: "Urgence" },
  teleconsult: { bg: "bg-sky-50",    text: "text-sky-600",    label: "Téléconsultation" },
  bilan:       { bg: "bg-emerald-50",text: "text-emerald-700",label: "Bilan" },
};

const AVATAR_COLORS = ["bg-indigo-100 text-indigo-700", "bg-violet-100 text-violet-700", "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700", "bg-amber-100 text-amber-700", "bg-sky-100 text-sky-700"];
function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Simulated "now" = 13:45 for demo purposes
const SIMULATED_HOUR = 13;
const SIMULATED_MINUTE = 45;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const nowMinutes = SIMULATED_HOUR * 60 + SIMULATED_MINUTE;

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const todayCount = APPOINTMENTS.length;
  const pendingReferrals = 3;
  const nextApt = APPOINTMENTS.find((a) => a.status === "upcoming");
  const minutesUntilNext = nextApt ? timeToMinutes(nextApt.time) - nowMinutes : 0;
  const nextLabel = minutesUntilNext > 0 ? `Prochain RDV dans ${minutesUntilNext}min` : "";

  const contextLine = [
    `${todayCount} consultations aujourd'hui`,
    `${pendingReferrals} adressages en attente`,
    nextLabel,
  ].filter(Boolean).join(" · ");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-[#E8ECF4] px-6 py-5 shrink-0">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
            Bonjour, Amélie
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1" style={{ fontFamily: "var(--font-inter)" }}>
            {contextLine.split(" · ").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="text-[#CBD5E1]"> · </span>}
              </span>
            ))}
          </p>
        </motion.div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F0F2FA]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex gap-6 items-start">

            {/* ── Colonne gauche — Ma journée ── */}
            <div className="flex-[65] min-w-0">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF4" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-5" style={{ fontFamily: "var(--font-inter)" }}>MA JOURNÉE</p>

                  <div className="relative">
                    {/* Vertical axis */}
                    <div className="absolute left-[52px] top-0 bottom-0 w-px bg-[#E8ECF4]" />

                    <div className="space-y-1">
                      {APPOINTMENTS.map((apt, i) => {
                        const aptMin = timeToMinutes(apt.time);
                        const isPast = aptMin + 45 < nowMinutes;
                        const isCurrent = aptMin <= nowMinutes && aptMin + 45 > nowMinutes;
                        const isNext = !isPast && !isCurrent && i === APPOINTMENTS.findIndex((a) => timeToMinutes(a.time) > nowMinutes);
                        const ts = TYPE_STYLE[apt.type];

                        // Check for gap before this appointment
                        const prevEnd = i > 0 ? timeToMinutes(APPOINTMENTS[i - 1].time) + 45 : aptMin;
                        const gapMinutes = aptMin - prevEnd;
                        const showGap = gapMinutes >= 45 && i > 0;

                        return (
                          <div key={apt.id}>
                            {/* Gap indicator */}
                            {showGap && (
                              <div className="flex items-center py-3">
                                <div className="w-[52px] shrink-0" />
                                <div className="w-3 flex justify-center relative"><div className="w-2 h-2 rounded-full bg-[#E8ECF4]" /></div>
                                <p className="text-[12px] italic text-[#94A3B8] ml-4" style={{ fontFamily: "var(--font-inter)" }}>
                                  Disponible · {Math.floor(gapMinutes / 60) > 0 ? `${Math.floor(gapMinutes / 60)}h` : ""}{gapMinutes % 60 > 0 ? `${gapMinutes % 60}min` : ""}
                                </p>
                              </div>
                            )}

                            {/* Appointment row */}
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 + i * 0.06, duration: 0.25 }}
                              className="flex items-stretch group"
                            >
                              {/* Time */}
                              <div className="w-[52px] shrink-0 text-right pr-3 pt-3.5">
                                <span className={cn("text-[13px] font-medium tabular-nums", isPast ? "text-[#CBD5E1]" : "text-[#64748B]")} style={{ fontFamily: "var(--font-inter)" }}>
                                  {apt.time}
                                </span>
                              </div>

                              {/* Node on axis */}
                              <div className="w-3 flex justify-center pt-4 relative z-10">
                                {isPast ? (
                                  <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center"><Check size={10} className="text-white" /></div>
                                ) : isCurrent ? (
                                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-5 h-5 rounded-full bg-[#4F46E5] ring-4 ring-[#EEF2FF]" />
                                ) : (
                                  <div className="w-3 h-3 rounded-full bg-[#E8ECF4] mt-1" />
                                )}
                              </div>

                              {/* Card */}
                              <div className={cn(
                                "flex-1 ml-4 rounded-xl p-4 transition-all duration-150 group-hover:shadow-md",
                                isPast ? "opacity-50" : "",
                                isCurrent ? "shadow-md border-l-4 border-l-[#4F46E5] bg-white" : "bg-white border border-[#E8ECF4] group-hover:-translate-y-px",
                              )}>
                                <div className="flex items-start gap-3">
                                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold shrink-0", avatarColor(apt.patient))}>
                                    {apt.initials}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-[15px] font-semibold text-[#0F172A] truncate" style={{ fontFamily: "var(--font-jakarta)" }}>{apt.patient}</p>
                                      {apt.attention && <div className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" title={apt.attention} />}
                                      {isCurrent && (
                                        <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
                                          En cours
                                        </motion.span>
                                      )}
                                      {isNext && minutesUntilNext > 0 && minutesUntilNext <= 30 && (
                                        <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-[11px] font-semibold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded-full">
                                          Dans {minutesUntilNext}min
                                        </motion.span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", ts.bg, ts.text)}>{ts.label}</span>
                                      <span className="text-[12px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{apt.duration}</span>
                                      <span className="text-[12px] text-[#94A3B8] flex items-center gap-1" style={{ fontFamily: "var(--font-inter)" }}>
                                        {apt.mode === "Téléconsultation" ? <Video size={10} /> : <MapPin size={10} />}
                                        {apt.mode}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}

                      {/* End of day */}
                      <div className="flex items-center py-4">
                        <div className="w-[52px] shrink-0" />
                        <div className="w-3 flex justify-center"><div className="w-2 h-2 rounded-full bg-[#E8ECF4]" /></div>
                        <p className="text-[12px] text-[#CBD5E1] ml-4" style={{ fontFamily: "var(--font-inter)" }}>Fin de journée</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Colonne droite ── */}
            <div className="flex-[35] min-w-0 space-y-5">
              {/* À faire maintenant */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-4" style={{ fontFamily: "var(--font-inter)" }}>À FAIRE</p>
                  <div className="space-y-2">
                    {TODO_ITEMS.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05, duration: 0.2 }}>
                          <Link href={item.href}>
                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-all duration-150 group cursor-pointer">
                              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", item.iconColor)}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-medium text-[#374151]" style={{ fontFamily: "var(--font-jakarta)" }}>{item.title}</p>
                                <p className="text-[12px] text-[#94A3B8] mt-0.5">{item.sub}</p>
                              </div>
                              <ChevronRight size={14} className="text-[#CBD5E1] shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Depuis hier */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-4" style={{ fontFamily: "var(--font-inter)" }}>DEPUIS HIER</p>
                  <div className="space-y-4">
                    {FEED_ITEMS.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05, duration: 0.2 }}>
                        <div className="flex gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                            {item.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-[#0F172A]">{item.name}</span>
                              <span className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{item.time}</span>
                            </div>
                            <p className="text-[13px] text-[#475569] leading-relaxed mt-0.5 line-clamp-2">{item.message}</p>
                            <span className="inline-block mt-1 text-[10px] font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{item.tag}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
