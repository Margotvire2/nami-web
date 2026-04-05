"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope, ArrowLeftRight, Clock, ChevronRight, X,
  MapPin, Video, Phone, Mail, Check, FileText, Users,
  Building2, FlaskConical, Radio,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ConsultationMock {
  id: string;
  time: string;
  patient: string;
  initials: string;
  type: "suivi" | "premiere" | "teleconsult";
  typeLabel: string;
  duration: string;
  mode: string;
  status: "past" | "next" | "upcoming";
  detail: PatientDetail;
}

interface PatientDetail {
  age: number;
  dob: string;
  phone: string;
  email: string;
  motif: string;
  mood: string;
  progression: string;
  vigilance: string;
  nextRdv: string | null;
}

interface TodoItem {
  id: string;
  icon: typeof Clock;
  iconBg: string;
  title: string;
  sub: string;
  href: string;
}

interface NewsItem {
  id: string;
  emoji: string;
  entity: string;
  title: string;
  meta: string;
}

interface MessageItem {
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

const CONSULTATIONS: ConsultationMock[] = [
  {
    id: "c1", time: "09:00", patient: "Margot Vire", initials: "MV", type: "suivi", typeLabel: "Suivi régulier", duration: "45min", mode: "Présentiel", status: "past",
    detail: { age: 32, dob: "14/05/1992", phone: "06 11 22 33 44", email: "margot.vire@email.com", motif: "Bilan mensuel", mood: "Bonne", progression: "Gestion des repas du soir", vigilance: "Stress professionnel", nextRdv: "Mardi 22 avril · 09h00" },
  },
  {
    id: "c2", time: "10:30", patient: "Lucas Bernier", initials: "LB", type: "suivi", typeLabel: "Suivi régulier", duration: "30min", mode: "Présentiel", status: "past",
    detail: { age: 24, dob: "03/08/2000", phone: "06 55 66 77 88", email: "lucas.b@email.com", motif: "Suivi boulimie", mood: "Stable", progression: "Rituels matinaux", vigilance: "Isolement social", nextRdv: "Vendredi 25 avril · 10h30" },
  },
  {
    id: "c3", time: "14:00", patient: "Théo Dufresne", initials: "TD", type: "suivi", typeLabel: "Suivi régulier", duration: "45min", mode: "Présentiel", status: "next",
    detail: { age: 28, dob: "12/03/1997", phone: "06 12 34 56 78", email: "theo.d@email.com", motif: "Bilan mensuel TCA", mood: "Stable", progression: "Rituels du matin", vigilance: "Reprise du sport", nextRdv: "Mardi 21 avril · 14h00" },
  },
  {
    id: "c4", time: "15:30", patient: "Sofia Marchand", initials: "SM", type: "premiere", typeLabel: "Première consultation", duration: "1h", mode: "Présentiel", status: "upcoming",
    detail: { age: 41, dob: "22/11/1983", phone: "06 98 76 54 32", email: "sofia.m@email.com", motif: "Première consultation obésité", mood: "Anxieuse", progression: "Première venue, à évaluer", vigilance: "Antécédents cardiovasculaires", nextRdv: null },
  },
  {
    id: "c5", time: "17:00", patient: "Gabrielle Martin", initials: "GM", type: "teleconsult", typeLabel: "Téléconsultation", duration: "45min", mode: "Téléconsultation", status: "upcoming",
    detail: { age: 19, dob: "07/02/2006", phone: "06 44 33 22 11", email: "gabrielle.m@email.com", motif: "Suivi anorexie", mood: "Fragile", progression: "Légère reprise de poids", vigilance: "Déni persistant", nextRdv: "Lundi 28 avril · 17h00" },
  },
];

const TODO_ITEMS: TodoItem[] = [
  { id: "t1", icon: ArrowLeftRight, iconBg: "bg-amber-50 text-amber-600", title: "3 adressages sans réponse", sub: "Le plus ancien : il y a 4 jours", href: "/adressages" },
  { id: "t2", icon: Clock, iconBg: "bg-orange-50 text-orange-600", title: "Emma Rousseau", sub: "Aucun contact depuis 3 semaines", href: "/patients" },
  { id: "t3", icon: FileText, iconBg: "bg-blue-50 text-blue-600", title: "Résultats labo · Théo Dufresne", sub: "Reçus hier, non consultés", href: "/documents" },
  { id: "t4", icon: Users, iconBg: "bg-violet-50 text-violet-600", title: "Réunion équipe Pédiatrie HAP", sub: "Demain · 8h00", href: "/equipe" },
];

const NEWS_ITEMS: NewsItem[] = [
  { id: "n1", emoji: "🏥", entity: "CHU Necker", title: "Nouvelle procédure HAD pour TCA", meta: "Publiée hier · 2 min de lecture" },
  { id: "n2", emoji: "📍", entity: "CPTS Paris 14", title: "Réunion plénière — 28 avril", meta: "Inscription ouverte" },
  { id: "n3", emoji: "🔬", entity: "Réseau Obésité IDF", title: "Webinaire chirurgie bariatrique", meta: "Jeudi 17 avril · 18h00" },
];

const MESSAGE_ITEMS: MessageItem[] = [
  { id: "m1", initials: "KB", name: "Dr Benali", time: "il y a 3h", message: "Pouvez-vous prendre Emma Rousseau en urgence cette semaine ?", tag: "Emma Rousseau" },
  { id: "m2", initials: "MV", name: "Margot Vire", time: "il y a 2h", message: "Bonne nouvelle pour Lucas — il m'a dit qu'il cuisinait à nouveau régulièrement", tag: "Lucas Bernier" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TYPE_PILL: Record<string, { bg: string; text: string }> = {
  suivi:       { bg: "bg-indigo-50", text: "text-indigo-600" },
  premiere:    { bg: "bg-violet-50", text: "text-violet-600" },
  teleconsult: { bg: "bg-sky-50",    text: "text-sky-600" },
};

const AVATAR_COLORS = ["bg-indigo-100 text-indigo-700", "bg-violet-100 text-violet-700", "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700", "bg-amber-100 text-amber-700"];
function avatarColor(name: string): string {
  let h = 0;
  for (const c of name) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function timeGap(a: string, b: string): number {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return (bh * 60 + bm) - (ah * 60 + am);
}

function formatGap(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`) : `${m}min`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = CONSULTATIONS.find((c) => c.id === selectedId) ?? null;

  const nextConsult = CONSULTATIONS.find((c) => c.status === "next");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-[#E8ECF4] px-6 py-5 shrink-0">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>Bonjour, Amélie</h1>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Link href="/agenda" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[13px] font-medium hover:bg-indigo-100 transition-colors">
              <Stethoscope size={14} /> 5 consultations aujourd'hui
            </Link>
            <Link href="/adressages" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[13px] font-medium hover:bg-amber-100 transition-colors">
              <ArrowLeftRight size={14} /> 3 adressages en attente
            </Link>
            {nextConsult && (
              <button onClick={() => setSelectedId(nextConsult.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4F46E5] text-white text-[13px] font-medium hover:bg-[#4338CA] transition-colors">
                <Clock size={14} /> Dans 15min · {nextConsult.patient} · {nextConsult.time}
              </button>
            )}
          </div>
        </motion.div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F0F2FA]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-6 items-start flex-col lg:flex-row">

            {/* ── Colonne gauche — Timeline ── */}
            <div className="w-full lg:flex-[60] min-w-0">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF4" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-5" style={{ fontFamily: "var(--font-inter)" }}>MA JOURNÉE</p>

                  <div className="space-y-0">
                    {CONSULTATIONS.map((c, i) => {
                      const tp = TYPE_PILL[c.type];
                      const isPast = c.status === "past";
                      const isNext = c.status === "next";

                      // Gap before this consultation
                      const prevEndMin = i > 0 ? (() => {
                        const prev = CONSULTATIONS[i - 1];
                        const [ph, pm] = prev.time.split(":").map(Number);
                        const dur = parseInt(prev.duration);
                        return ph * 60 + pm + dur;
                      })() : null;
                      const curStartMin = (() => { const [h, m] = c.time.split(":").map(Number); return h * 60 + m; })();
                      const gap = prevEndMin !== null ? curStartMin - prevEndMin : 0;

                      return (
                        <div key={c.id}>
                          {/* Gap line */}
                          {gap >= 45 && (
                            <div className="flex items-center gap-3 py-3 px-2">
                              <div className="flex-1 border-t border-dashed border-[#E2E8F0]" />
                              <span className="text-[11px] text-[#CBD5E1] shrink-0" style={{ fontFamily: "var(--font-inter)" }}>{formatGap(gap)} libres</span>
                              <div className="flex-1 border-t border-dashed border-[#E2E8F0]" />
                            </div>
                          )}

                          {/* Row */}
                          <motion.button
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + i * 0.05, duration: 0.2 }}
                            onClick={() => setSelectedId(c.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group",
                              isPast ? "opacity-50" : "",
                              isNext ? "bg-indigo-50/50" : "hover:bg-[#F8FAFC]",
                              selectedId === c.id ? "ring-2 ring-[#4F46E5] bg-indigo-50/30" : ""
                            )}
                          >
                            {/* Time */}
                            <span className={cn("w-12 text-[13px] font-medium tabular-nums shrink-0", isPast ? "text-[#CBD5E1]" : "text-[#64748B]")} style={{ fontFamily: "var(--font-inter)" }}>
                              {c.time}
                            </span>

                            {/* Dot */}
                            {isPast ? (
                              <div className="w-5 h-5 rounded-full bg-[#CBD5E1] flex items-center justify-center shrink-0"><Check size={10} className="text-white" /></div>
                            ) : isNext ? (
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-5 h-5 rounded-full bg-[#4F46E5] shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-[#4F46E5] shrink-0" />
                            )}

                            {/* Avatar */}
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0", avatarColor(c.patient))}>
                              {c.initials}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-[#0F172A] truncate" style={{ fontFamily: "var(--font-jakarta)" }}>{c.patient}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", tp.bg, tp.text)}>{c.typeLabel}</span>
                                <span className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{c.duration}</span>
                                <span className="text-[11px] text-[#94A3B8] flex items-center gap-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                                  {c.mode === "Téléconsultation" ? <Video size={10} /> : <MapPin size={10} />} {c.mode}
                                </span>
                              </div>
                            </div>

                            {/* Badges */}
                            {isNext && (
                              <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                                Dans 15min
                              </motion.span>
                            )}

                            <ChevronRight size={14} className="text-[#CBD5E1] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Colonne droite ── */}
            <div className="w-full lg:flex-[40] min-w-0 space-y-5">
              {/* À FAIRE */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-4" style={{ fontFamily: "var(--font-inter)" }}>À FAIRE</p>
                  <div className="space-y-1">
                    {TODO_ITEMS.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.04, duration: 0.2 }}>
                          <Link href={item.href}>
                            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-all group cursor-pointer">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.iconBg)}><Icon size={15} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-[#374151] truncate">{item.title}</p>
                                <p className="text-[11px] text-[#94A3B8] truncate">{item.sub}</p>
                              </div>
                              <ChevronRight size={13} className="text-[#CBD5E1] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* ACTUALITÉS */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>ACTUALITÉS</p>
                    <button className="text-[12px] font-medium text-[#4F46E5] hover:underline">Tout voir →</button>
                  </div>
                  <div className="divide-y divide-[#F1F5F9]">
                    {NEWS_ITEMS.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-lg transition-colors cursor-pointer group">
                        <span className="text-lg shrink-0 mt-0.5">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-[#94A3B8]">{item.entity}</p>
                          <p className="text-[13px] font-medium text-[#0F172A] mt-0.5 truncate">{item.title}</p>
                          <p className="text-[11px] text-[#94A3B8] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{item.meta}</p>
                        </div>
                        <ChevronRight size={13} className="text-[#CBD5E1] shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* MESSAGES */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>MESSAGES</p>
                    <Link href="/messages" className="text-[12px] font-medium text-[#4F46E5] hover:underline">Tout voir →</Link>
                  </div>
                  <div className="space-y-3">
                    {MESSAGE_ITEMS.map((item) => (
                      <div key={item.id} className="flex gap-3 hover:bg-[#F8FAFC] -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer group">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                          {item.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-[#0F172A]">{item.name}</span>
                            <span className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{item.time}</span>
                          </div>
                          <p className="text-[12px] text-[#475569] mt-0.5 truncate">{item.message}</p>
                          <span className="inline-block mt-1 text-[10px] font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{item.tag}</span>
                        </div>
                        <ChevronRight size={13} className="text-[#CBD5E1] shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Consultation Drawer ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedId(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col" style={{ border: "1px solid #E8ECF4" }}>
              {/* Drawer header */}
              <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#E8ECF4]">
                <p className="text-sm font-semibold text-[#0F172A]">Consultation</p>
                <button onClick={() => setSelectedId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] transition-colors"><X size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                {/* Patient identity */}
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold", avatarColor(selected.patient))}>
                    {selected.initials}
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>{selected.patient}</p>
                    <p className="text-[13px] text-[#64748B]">{selected.detail.age} ans · {selected.detail.dob}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[13px] text-[#475569]"><Phone size={13} className="text-[#94A3B8]" /> {selected.detail.phone}</div>
                  <div className="flex items-center gap-2 text-[13px] text-[#475569]"><Mail size={13} className="text-[#94A3B8]" /> {selected.detail.email}</div>
                </div>

                {/* Consultation du jour */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>CONSULTATION DU JOUR</p>
                  <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2 text-[13px] text-[#374151]">
                    <p className="flex items-center gap-2"><Clock size={13} className="text-[#94A3B8]" /> {selected.time} · {selected.duration}</p>
                    <p className="flex items-center gap-2">{selected.mode === "Téléconsultation" ? <Video size={13} className="text-[#94A3B8]" /> : <MapPin size={13} className="text-[#94A3B8]" />} {selected.mode}</p>
                    <p className="text-[#64748B] italic">{selected.detail.motif}</p>
                  </div>
                </div>

                {/* Situation clinique */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>SITUATION CLINIQUE</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-base">🧠</span>
                      <div><p className="text-[11px] font-semibold text-[#94A3B8]">Humeur</p><p className="text-[13px] text-[#0F172A] font-medium">{selected.detail.mood}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-base">📈</span>
                      <div><p className="text-[11px] font-semibold text-[#94A3B8]">Progression</p><p className="text-[13px] text-[#0F172A] font-medium">{selected.detail.progression}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-base">⚠️</span>
                      <div><p className="text-[11px] font-semibold text-[#94A3B8]">Vigilance</p><p className="text-[13px] text-[#0F172A] font-medium">{selected.detail.vigilance}</p></div>
                    </div>
                  </div>
                </div>

                {/* Prochain RDV */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>PROCHAIN RDV</p>
                  {selected.detail.nextRdv ? (
                    <p className="text-[13px] text-[#374151] font-medium">{selected.detail.nextRdv}</p>
                  ) : (
                    <div>
                      <p className="text-[13px] text-[#94A3B8] italic">Aucun RDV planifié</p>
                      <button className="mt-2 text-[13px] font-medium text-[#4F46E5] hover:underline">Planifier →</button>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 py-4 border-t border-[#E8ECF4] shrink-0">
                <button onClick={() => { setSelectedId(null); router.push(`/patients/${selected.id}`); }} className="w-full h-10 rounded-xl bg-[#4F46E5] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors">
                  Voir le dossier complet <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
