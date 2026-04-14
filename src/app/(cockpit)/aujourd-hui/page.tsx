"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope, ArrowLeftRight, Clock, ChevronRight, X,
  MapPin, Video, Phone, Mail, Check, Play, ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useDashboard, type DashboardConsultation } from "@/hooks/useDashboard";
import { KnowledgeSearch } from "@/components/nami/KnowledgeSearch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, type ConnectionRequest, type AppointmentRequest, type ProConversation, type Referral, type TaskWithContext } from "@/lib/api";
import { toast } from "sonner";
import { useConsultation } from "@/contexts/ConsultationContext";

// ═══════════════════════════════════════════════════════════════════════════════
// ACTUALITÉS RÉSEAU — static (pas de backend pour l'instant)
// ═══════════════════════════════════════════════════════════════════════════════

const NEWS_ITEMS = [
  { id: "n1", emoji: "🏥", entity: "CHU Necker", title: "Nouvelle procédure HAD pour TCA", meta: "Publiée hier · 2 min de lecture", isNew: true },
  { id: "n2", emoji: "📍", entity: "CPTS Paris 14", title: "Réunion plénière — 28 avril", meta: "Inscription ouverte", isNew: false },
  { id: "n3", emoji: "🔬", entity: "Réseau Obésité IDF", title: "Webinaire chirurgie bariatrique", meta: "Jeudi 17 avril · 18h00", isNew: false },
];

const PENDING_REFERRAL_STATUSES = ["SENT", "RECEIVED", "UNDER_REVIEW"];

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TYPE_PILL: Record<string, { bg: string; text: string }> = {
  suivi:       { bg: "bg-indigo-50", text: "text-indigo-600" },
  premiere:    { bg: "bg-violet-50", text: "text-violet-600" },
  teleconsult: { bg: "bg-sky-50",    text: "text-sky-600" },
};

const CASE_TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  TCA:          { bg: "bg-rose-50",   text: "text-rose-600",   label: "TCA" },
  OBESITY:      { bg: "bg-teal-50",   text: "text-teal-600",   label: "Obésité" },
  METABOLIC:    { bg: "bg-orange-50", text: "text-orange-600", label: "Métabolique" },
  MENTAL_HEALTH:{ bg: "bg-violet-50", text: "text-violet-600", label: "Santé mentale" },
  PEDIATRIC:    { bg: "bg-sky-50",    text: "text-sky-600",    label: "Pédiatrie" },
  CHRONIC_PAIN: { bg: "bg-amber-50",  text: "text-amber-600",  label: "Douleur" },
};

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const AVATAR_COLORS = ["bg-indigo-100 text-indigo-700", "bg-violet-100 text-violet-700", "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700", "bg-amber-100 text-amber-700"];
function avatarColor(name: string): string {
  let h = 0;
  for (const c of name) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatGap(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`) : `${m}min`;
}

// Vrai si le RDV démarre dans les 30 prochaines minutes ou est passé non complété
function isImminent(c: DashboardConsultation): boolean {
  const minsUntil = (new Date(c.startAt).getTime() - Date.now()) / 60_000;
  return c.status === "next" || (c.status === "upcoming" && minsUntil <= 30);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user, accessToken } = useAuthStore();
  const { startConsultation } = useConsultation();

  // ── RDV du jour ──
  const { consultations, nextConsultation: nextConsult, totalToday, isLoading, isError, refetch } = useDashboard();

  // ── Tâches du provider (cross-care-case) ──
  const api = apiWithToken(accessToken!);
  const { data: allTasks = [] } = useQuery<TaskWithContext[]>({
    queryKey: ["tasks-mine"],
    queryFn: () => api.tasksMine.list(),
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });

  // Tâches non complétées, triées par urgence
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const pendingTasks = allTasks
    .filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED")
    .sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date();
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date();
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      const aPrio = PRIORITY_ORDER[a.priority] ?? 2;
      const bPrio = PRIORITY_ORDER[b.priority] ?? 2;
      return aPrio - bPrio;
    });

  // Tâches en retard ou dues aujourd'hui par careCaseId (pour badge ⚠)
  const taskAlertByCase = new Map<string, number>();
  for (const t of pendingTasks) {
    if (!t.careCase?.id) continue;
    const isOverdueOrToday = t.dueDate && new Date(t.dueDate) <= today;
    if (isOverdueOrToday) {
      taskAlertByCase.set(t.careCase.id, (taskAlertByCase.get(t.careCase.id) ?? 0) + 1);
    }
  }

  // ── Adressages envoyés en attente ──
  const { data: outgoingReferrals = [] } = useQuery({
    queryKey: ["referrals-outgoing-pending"],
    queryFn: () => api.referrals.outgoing(),
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });
  const pendingOutgoing = (outgoingReferrals as Referral[]).filter((r) =>
    PENDING_REFERRAL_STATUSES.includes(r.status)
  );

  const selected = consultations.find((c: DashboardConsultation) => c.id === selectedId) ?? null;

  async function handleStartConsultation(c: DashboardConsultation) {
    if (!c.careCaseId) return;
    try {
      await startConsultation({ careCaseId: c.careCaseId, patientName: c.patient });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de démarrer");
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-[#E8ECF4] px-6 py-5 shrink-0">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
              Bonjour{user ? `, ${user.firstName}` : ""}
            </h1>
            <KnowledgeSearch className="w-80 hidden sm:block" />
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Link href="/agenda" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[13px] font-medium hover:bg-indigo-100 transition-colors">
              <Stethoscope size={14} /> {totalToday} consultation{totalToday !== 1 ? "s" : ""} aujourd&apos;hui
            </Link>
            {pendingOutgoing.length > 0 && (
              <Link href="/adressages" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[13px] font-medium hover:bg-amber-100 transition-colors">
                <ArrowLeftRight size={14} /> {pendingOutgoing.length} adressage{pendingOutgoing.length > 1 ? "s" : ""} en attente
              </Link>
            )}
            {nextConsult && (
              <button onClick={() => setSelectedId(nextConsult.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5B4EC4] text-white text-[13px] font-medium hover:bg-[#4A3EA6] transition-colors">
                <Clock size={14} /> Prochain · {nextConsult.patient} · {nextConsult.time}
              </button>
            )}
          </div>
        </motion.div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-6 items-start flex-col lg:flex-row">

            {/* ── Colonne gauche 2/3 ── */}
            <div className="w-full lg:flex-[2] min-w-0 space-y-5">

              {/* MA JOURNÉE */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF4" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-5" style={{ fontFamily: "var(--font-inter)" }}>MA JOURNÉE</p>

                  {isLoading && (
                    <div className="flex items-center justify-center h-40">
                      <div className="w-5 h-5 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {isError && (
                    <div className="text-center py-8 text-[13px] text-red-400">
                      Erreur de chargement — <button onClick={() => refetch()} className="underline">Réessayer</button>
                    </div>
                  )}
                  {!isLoading && !isError && consultations.length === 0 && (
                    <div className="text-center py-8 text-[13px] text-[#94A3B8]">
                      Aucune consultation aujourd&apos;hui
                    </div>
                  )}

                  <div className="space-y-0">
                    {consultations.map((c: DashboardConsultation, i: number) => {
                      const tp = TYPE_PILL[c.type] ?? TYPE_PILL.suivi;
                      const isPast = c.status === "past";
                      const isNext = c.status === "next";
                      const imminent = isImminent(c);
                      const alertCount = c.careCaseId ? (taskAlertByCase.get(c.careCaseId) ?? 0) : 0;
                      const caseBadge = c.caseType ? CASE_TYPE_BADGE[c.caseType] : null;

                      // Gap avant ce RDV
                      const prevEndMin = i > 0 ? (() => {
                        const prev = consultations[i - 1];
                        const [ph, pm] = prev.time.split(":").map(Number);
                        const dur = parseInt(prev.duration);
                        return ph * 60 + pm + dur;
                      })() : null;
                      const curStartMin = (() => { const [h, m] = c.time.split(":").map(Number); return h * 60 + m; })();
                      const gap = prevEndMin !== null ? curStartMin - prevEndMin : 0;

                      return (
                        <div key={c.id}>
                          {gap >= 45 && (
                            <div className="flex items-center gap-3 py-3 px-2">
                              <div className="flex-1 border-t border-dashed border-[#E2E8F0]" />
                              <span className="text-[11px] text-[#CBD5E1] shrink-0" style={{ fontFamily: "var(--font-inter)" }}>{formatGap(gap)} libres</span>
                              <div className="flex-1 border-t border-dashed border-[#E2E8F0]" />
                            </div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + i * 0.05, duration: 0.2 }}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group",
                              isPast ? "opacity-50" : "",
                              isNext ? "bg-indigo-50/50" : "hover:bg-[#F8FAFC]",
                              selectedId === c.id ? "ring-2 ring-[#5B4EC4] bg-indigo-50/30" : ""
                            )}
                          >
                            {/* Heure */}
                            <span className={cn("w-12 text-[13px] font-medium tabular-nums shrink-0", isPast ? "text-[#CBD5E1]" : "text-[#64748B]")} style={{ fontFamily: "var(--font-inter)" }}>
                              {c.time}
                            </span>

                            {/* Dot statut */}
                            {isPast ? (
                              <div className="w-5 h-5 rounded-full bg-[#CBD5E1] flex items-center justify-center shrink-0"><Check size={10} className="text-white" /></div>
                            ) : isNext ? (
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-5 h-5 rounded-full bg-[#5B4EC4] shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-[#5B4EC4] shrink-0" />
                            )}

                            {/* Avatar */}
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 cursor-pointer hover:ring-2 hover:ring-[#5B4EC4]", avatarColor(c.patient))}
                              onClick={() => c.careCaseId && router.push(`/patients/${c.careCaseId}`)}>
                              {c.initials}
                            </div>

                            {/* Infos patient */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedId(c.id)}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[14px] font-semibold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>{c.patient}</p>
                                {caseBadge && (
                                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", caseBadge.bg, caseBadge.text)}>
                                    {caseBadge.label}
                                  </span>
                                )}
                                {alertCount > 0 && (
                                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title={`${alertCount} tâche${alertCount > 1 ? "s" : ""} en retard`}>
                                    <AlertTriangle size={9} />  {alertCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", tp.bg, tp.text)}>{c.typeLabel}</span>
                                <span className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{c.duration}</span>
                                <span className="text-[11px] text-[#94A3B8] flex items-center gap-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                                  {c.mode === "Téléconsultation" ? <Video size={10} /> : <MapPin size={10} />} {c.mode}
                                </span>
                              </div>
                            </div>

                            {/* Badges + actions droite */}
                            <div className="flex items-center gap-2 shrink-0">
                              {isNext && (
                                <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full hidden sm:inline">
                                  Maintenant
                                </motion.span>
                              )}
                              {imminent && c.careCaseId && (
                                <button
                                  onClick={() => handleStartConsultation(c)}
                                  className="h-7 px-2.5 rounded-lg bg-[#5B4EC4] text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-[#4A3EA6] transition-colors"
                                >
                                  <Play size={10} fill="currentColor" /> Démarrer
                                </button>
                              )}
                              <ChevronRight size={14} className="text-[#CBD5E1] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setSelectedId(c.id)} />
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* À FAIRE */}
              <TachesSection tasks={pendingTasks.slice(0, 5)} api={api} />
            </div>

            {/* ── Colonne droite 1/3 ── */}
            <div className="w-full lg:flex-[1] min-w-0 space-y-5">

              {/* ADRESSAGES ENVOYÉS EN ATTENTE */}
              {pendingOutgoing.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
                  <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>ADRESSAGES EN ATTENTE</p>
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold flex items-center justify-center">{pendingOutgoing.length}</span>
                      </div>
                      <Link href="/adressages" className="text-[12px] font-medium text-[#5B4EC4] hover:underline">Tout voir</Link>
                    </div>
                    <div className="space-y-2">
                      {pendingOutgoing.slice(0, 3).map((ref) => {
                        const daysAgoRef = Math.floor((Date.now() - new Date(ref.updatedAt).getTime()) / 86400000);
                        const timeLabel = daysAgoRef === 0 ? "aujourd'hui" : daysAgoRef === 1 ? "hier" : `il y a ${daysAgoRef}j`;
                        const isUrgent = ref.priority === "URGENT" || ref.priority === "EMERGENCY";
                        return (
                          <Link key={ref.id} href="/adressages">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors group">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", isUrgent ? "bg-red-50" : "bg-amber-50")}>
                                <ArrowLeftRight size={14} className={isUrgent ? "text-red-500" : "text-amber-600"} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-[13px] font-medium text-[#374151] truncate">{ref.careCase?.caseTitle ?? "Dossier"}</p>
                                  {isUrgent && <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">Urgent</span>}
                                </div>
                                <p className="text-[11px] text-[#94A3B8]">Sans réponse {timeLabel}</p>
                              </div>
                              <ChevronRight size={13} className="text-[#CBD5E1] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DEMANDES DE PATIENTS */}
              <IncomingRequestsSection />

              {/* DEMANDES DE RDV */}
              <AppointmentRequestsSection />

              {/* DEMANDES DE COORDINATION */}
              <IncomingReferralsSection />

              {/* ACTUALITÉS */}
              {NEWS_ITEMS.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
                  <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>ACTUALITÉS</p>
                      <button className="text-[12px] font-medium text-[#5B4EC4] hover:underline">Tout voir →</button>
                    </div>
                    <div className="divide-y divide-[#F1F5F9]">
                      {NEWS_ITEMS.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-lg transition-colors cursor-pointer group">
                          <span className="text-lg shrink-0 mt-0.5">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[11px] font-semibold text-[#94A3B8]">{item.entity}</p>
                              {item.isNew && <span className="text-[9px] font-bold text-[#5B4EC4] bg-indigo-50 px-1.5 py-0.5 rounded-full">Nouveau</span>}
                            </div>
                            <p className="text-[13px] font-medium text-[#0F172A] mt-0.5 truncate">{item.title}</p>
                            <p className="text-[11px] text-[#94A3B8] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{item.meta}</p>
                          </div>
                          <ChevronRight size={13} className="text-[#CBD5E1] shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MESSAGES */}
              <ProMessagesSection />
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
              <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#E8ECF4]">
                <p className="text-sm font-semibold text-[#0F172A]">Consultation</p>
                <button onClick={() => setSelectedId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] transition-colors"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
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
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>CONSULTATION DU JOUR</p>
                  <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2 text-[13px] text-[#374151]">
                    <p className="flex items-center gap-2"><Clock size={13} className="text-[#94A3B8]" /> {selected.time} · {selected.duration}</p>
                    <p className="flex items-center gap-2">{selected.mode === "Téléconsultation" ? <Video size={13} className="text-[#94A3B8]" /> : <MapPin size={13} className="text-[#94A3B8]" />} {selected.mode}</p>
                    <p className="text-[#64748B] italic">{selected.typeLabel}</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-[#E8ECF4] shrink-0 space-y-2">
                {selected.careCaseId && (
                  <button onClick={() => handleStartConsultation(selected)} className="w-full h-9 rounded-xl bg-[#5B4EC4] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#4A3EA6] transition-colors">
                    <Play size={12} fill="currentColor" /> Démarrer la consultation
                  </button>
                )}
                <button onClick={() => { setSelectedId(null); router.push(`/patients/${selected.careCaseId ?? selected.patientId}`); }} className="w-full h-9 rounded-xl border border-[#E8ECF4] text-[#374151] text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-[#F8FAFC] transition-colors">
                  Voir le dossier <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// À FAIRE — tâches cross-dossiers du provider
// ═══════════════════════════════════════════════════════════════════════════════

function TachesSection({ tasks, api }: { tasks: TaskWithContext[]; api: ReturnType<typeof apiWithToken> }) {
  const qc = useQueryClient();

  const completeMut = useMutation({
    mutationFn: (t: TaskWithContext) =>
      api.tasks.update(t.careCase.id, t.id, { status: "COMPLETED" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks-mine"] });
    },
  });

  if (tasks.length === 0) return null;

  const router = useRouter();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  function taskMeta(t: TaskWithContext): { label: string; cls: string } {
    if (!t.dueDate) return { label: "", cls: "text-[#94A3B8]" };
    const d = new Date(t.dueDate);
    if (d < todayStart) {
      const days = Math.round((todayStart.getTime() - d.getTime()) / 86400000);
      return { label: `En retard (${days}j)`, cls: "text-red-500 font-semibold" };
    }
    if (d <= todayEnd) return { label: "Aujourd'hui", cls: "text-amber-600 font-medium" };
    return { label: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), cls: "text-[#94A3B8]" };
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.3 }}>
      <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF4" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-[#94A3B8]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>À FAIRE</p>
          </div>
          <Link href="/taches" className="text-[12px] font-medium text-[#5B4EC4] hover:underline">Tout voir →</Link>
        </div>
        <div className="space-y-1">
          {tasks.map((t) => {
            const meta = taskMeta(t);
            const isCompleting = completeMut.isPending && (completeMut.variables as TaskWithContext)?.id === t.id;
            return (
              <div key={t.id} className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors group">
                {/* Checkbox */}
                <button
                  onClick={() => completeMut.mutate(t)}
                  disabled={isCompleting}
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                    isCompleting ? "bg-emerald-100 border-emerald-300" : "border-[#CBD5E1] hover:border-[#5B4EC4]"
                  )}
                >
                  {isCompleting && <Check size={9} className="text-emerald-500" />}
                </button>

                {/* Titre + patient */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#0F172A] truncate">{t.title}</p>
                  {t.careCase?.patient && (
                    <button
                      onClick={() => router.push(`/patients/${t.careCase.id}`)}
                      className="text-[11px] text-[#5B4EC4] hover:underline truncate block text-left"
                    >
                      {t.careCase.patient.firstName} {t.careCase.patient.lastName}
                    </button>
                  )}
                </div>

                {/* Date */}
                {meta.label && (
                  <span className={cn("text-[11px] shrink-0", meta.cls)} style={{ fontFamily: "var(--font-inter)" }}>
                    {meta.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMANDES DE PATIENTS — section dashboard
// ═══════════════════════════════════════════════════════════════════════════════

function IncomingRequestsSection() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const { data: requests } = useQuery({
    queryKey: ["connection-requests-pending"],
    queryFn: () => {
      if (!accessToken) return [];
      const api = apiWithToken(accessToken);
      return api.connectionRequests.incoming("PENDING");
    },
    enabled: !!accessToken,
    refetchInterval: 30000,
  });

  const pending = requests ?? [];
  if (pending.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}>
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>
              DEMANDES DE PATIENTS
            </p>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#5B4EC4] text-white text-[10px] font-semibold flex items-center justify-center">
              {pending.length}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {pending.map((cr) => (
            <RequestCard key={cr.id} cr={cr} accessToken={accessToken!} qc={qc} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function RequestCard({ cr, accessToken, qc }: { cr: ConnectionRequest; accessToken: string; qc: ReturnType<typeof useQueryClient> }) {
  const api = apiWithToken(accessToken);

  const acceptMut = useMutation({
    mutationFn: () => api.connectionRequests.respond(cr.id, { decision: "ACCEPTED" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connection-requests-pending"] });
      qc.invalidateQueries({ queryKey: ["care-cases"] });
      toast.success(`Demande de ${cr.patient?.firstName} acceptée — dossier créé`);
    },
    onError: () => toast.error("Erreur"),
  });

  const declineMut = useMutation({
    mutationFn: () => api.connectionRequests.respond(cr.id, { decision: "DECLINED" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connection-requests-pending"] });
      toast.success("Demande déclinée");
    },
    onError: () => toast.error("Erreur"),
  });

  const daysAgo = Math.floor((Date.now() - new Date(cr.createdAt).getTime()) / 86400000);
  const timeLabel = daysAgo === 0 ? "aujourd'hui" : daysAgo === 1 ? "hier" : `il y a ${daysAgo}j`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFBFF] border border-[#E8ECF4]">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {cr.patient?.firstName?.[0]}{cr.patient?.lastName?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#0F172A] truncate">
          {cr.patient?.firstName} {cr.patient?.lastName}
        </p>
        <p className="text-[11px] text-[#94A3B8] truncate">
          {cr.reason || "Demande de suivi"} · {timeLabel}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => acceptMut.mutate()}
          disabled={acceptMut.isPending}
          className="h-7 px-3 rounded-lg bg-[#5B4EC4] text-white text-[11px] font-medium hover:bg-[#4A3EA6] transition-colors disabled:opacity-50"
        >
          Accepter
        </button>
        <button
          onClick={() => declineMut.mutate()}
          disabled={declineMut.isPending}
          className="h-7 px-2.5 rounded-lg border border-[#E8ECF4] text-[#64748B] text-[11px] font-medium hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
        >
          Décliner
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMANDES DE RDV — section dashboard (AppointmentRequests)
// ═══════════════════════════════════════════════════════════════════════════════

function AppointmentRequestsSection() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();

  const { data: requests } = useQuery({
    queryKey: ["appointment-requests-pending"],
    queryFn: () => {
      if (!accessToken) return [];
      const api = apiWithToken(accessToken);
      return api.appointmentRequests.list("PENDING");
    },
    enabled: !!accessToken,
    refetchInterval: 30000,
  });

  const pending = requests ?? [];
  if (pending.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>
              DEMANDES DE RENDEZ-VOUS
            </p>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#7C3AED] text-white text-[10px] font-semibold flex items-center justify-center">
              {pending.length}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {pending.map((ar) => (
            <AppointmentRequestCard key={ar.id} ar={ar} accessToken={accessToken!} qc={qc} router={router} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AppointmentRequestCard({
  ar,
  accessToken,
  qc,
  router,
}: {
  ar: AppointmentRequest;
  accessToken: string;
  qc: ReturnType<typeof useQueryClient>;
  router: ReturnType<typeof useRouter>;
}) {
  const api = apiWithToken(accessToken);

  const acceptMut = useMutation({
    mutationFn: () => api.appointmentRequests.accept(ar.id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["appointment-requests-pending"] });
      qc.invalidateQueries({ queryKey: ["care-cases"] });
      toast.success(data.message, {
        action: {
          label: "Voir le dossier",
          onClick: () => router.push(`/patients/${data.careCaseId}`),
        },
      });
    },
    onError: () => toast.error("Erreur lors de l'acceptation"),
  });

  const declineMut = useMutation({
    mutationFn: () => api.appointmentRequests.decline(ar.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointment-requests-pending"] });
      toast.success("Demande de RDV déclinée");
    },
    onError: () => toast.error("Erreur"),
  });

  const daysAgo = Math.floor((Date.now() - new Date(ar.createdAt).getTime()) / 86400000);
  const timeLabel = daysAgo === 0 ? "aujourd'hui" : daysAgo === 1 ? "hier" : `il y a ${daysAgo}j`;

  const rdvDate = ar.requestedDate
    ? new Date(ar.requestedDate).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF9FF] border border-[#E8E5F4]">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {ar.patientFirstName[0]}{ar.patientLastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#0F172A] truncate">
          {ar.patientFirstName} {ar.patientLastName}
        </p>
        <p className="text-[11px] text-[#94A3B8] truncate">
          {ar.motif || "Demande de RDV"}
          {rdvDate && ` · ${rdvDate}`}
          {" · "}{timeLabel}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => acceptMut.mutate()}
          disabled={acceptMut.isPending}
          className="h-7 px-3 rounded-lg bg-[#7C3AED] text-white text-[11px] font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
        >
          {acceptMut.isPending ? "…" : "Accepter"}
        </button>
        <button
          onClick={() => declineMut.mutate()}
          disabled={declineMut.isPending}
          className="h-7 px-2.5 rounded-lg border border-[#E8ECF4] text-[#64748B] text-[11px] font-medium hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
        >
          Décliner
        </button>
      </div>
    </div>
  );
}

// ─── DEMANDES DE COORDINATION REÇUES (Referrals) ─────────────────────────────

function IncomingReferralsSection() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals-incoming"],
    queryFn: () => api.referrals.incoming({ status: "SENT" }),
    enabled: !!accessToken,
  });

  const acceptRefMut = useMutation({
    mutationFn: (id: string) => api.referrals.respond(id, "ACCEPTED"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["referrals-incoming"] }); },
  });

  const declineRefMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.referrals.respond(id, "DECLINED", note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["referrals-incoming"] }); },
  });

  const [declRefId, setDeclRefId] = useState<string | null>(null);
  const [declRefReason, setDeclRefReason] = useState("");

  const pending = (referrals as any[]).filter(
    (r: any) => ["SENT", "RECEIVED", "UNDER_REVIEW"].includes(r.status)
  );

  if (pending.length === 0) return null;

  const PRI_BADGE: Record<string, string> = {
    ROUTINE: "bg-emerald-50 text-emerald-700",
    URGENT: "bg-amber-50 text-amber-700",
    EMERGENCY: "bg-red-50 text-red-700",
  };
  const PRI_LABEL: Record<string, string> = {
    ROUTINE: "Routine", URGENT: "Sous 15j", EMERGENCY: "Urgent",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}>
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>
            DEMANDES DE COORDINATION ({pending.length})
          </p>
          <Link href="/adressages" className="text-[12px] font-medium text-[#5B4EC4] hover:underline">Tout voir</Link>
        </div>
        <div className="space-y-3">
          {pending.map((ref: any) => (
            <div key={ref.id} className="rounded-xl border border-[#E8ECF4] p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                    {ref.sender?.firstName?.[0]}{ref.sender?.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#0F172A]">
                      {ref.sender?.firstName} {ref.sender?.lastName}
                      <span className="text-[#94A3B8] font-normal"> vous adresse </span>
                      {ref.careCase?.caseTitle}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1 italic">{ref.clinicalReason}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRI_BADGE[ref.priority] ?? ""}`}>
                  {PRI_LABEL[ref.priority] ?? ref.priority}
                </span>
              </div>
              {declRefId === ref.id ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#64748B]">Motif du refus (obligatoire)</p>
                  <textarea value={declRefReason} onChange={(e: any) => setDeclRefReason(e.target.value)}
                    placeholder="File complète, spécialité inadaptée..."
                    className="w-full rounded-lg border border-[#E8ECF4] px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200" rows={2} />
                  <p className="text-[10px] text-[#94A3B8]">Le refus discriminatoire est passible de sanctions (art. L.1110-3 CSP)</p>
                  <div className="flex gap-2">
                    <button onClick={() => { if (!declRefReason.trim()) return; declineRefMut.mutate({ id: ref.id, note: declRefReason }); setDeclRefId(null); setDeclRefReason(""); }}
                      disabled={!declRefReason.trim() || declineRefMut.isPending}
                      className="h-7 px-3 rounded-lg bg-red-50 text-red-700 text-[11px] font-medium hover:bg-red-100 transition-colors disabled:opacity-50">Confirmer le refus</button>
                    <button onClick={() => { setDeclRefId(null); setDeclRefReason(""); }}
                      className="h-7 px-2.5 rounded-lg border border-[#E8ECF4] text-[#64748B] text-[11px] font-medium hover:bg-[#F1F5F9] transition-colors">Annuler</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => acceptRefMut.mutate(ref.id)} disabled={acceptRefMut.isPending}
                    className="h-7 px-3 rounded-lg bg-[#5B4EC4] text-white text-[11px] font-medium hover:bg-[#4A3EA6] transition-colors disabled:opacity-50">
                    {acceptRefMut.isPending ? "…" : "Accepter"}</button>
                  <button onClick={() => setDeclRefId(ref.id)}
                    className="h-7 px-2.5 rounded-lg border border-[#E8ECF4] text-[#64748B] text-[11px] font-medium hover:bg-[#F1F5F9] transition-colors">Décliner</button>
                  <Link href={`/patients/${ref.careCaseId}`}
                    className="h-7 px-2.5 rounded-lg border border-[#E8ECF4] text-[#64748B] text-[11px] font-medium hover:bg-[#F1F5F9] transition-colors flex items-center">Voir le dossier</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── MESSAGES PRO — dernières conversations ───────────────────────────────────

function ProMessagesSection() {
  const { accessToken, user } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const { data: conversations = [] } = useQuery({
    queryKey: ["pro-conversations-dashboard"],
    queryFn: () => api.proMessages.getConversations(),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });

  const sorted = (conversations as ProConversation[])
    .filter((c) => c.lastMessage)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  if (sorted.length === 0) return null;

  const unreadTotal = (conversations as ProConversation[]).reduce((s, c) => s + (c.unreadCount ?? 0), 0);

  function convName(conv: ProConversation): string {
    if (conv.name) return conv.name;
    if (conv.type === "DIRECT") {
      const other = conv.members.find((m) => m.id !== user?.id);
      return other ? `${other.firstName} ${other.lastName}` : "Conversation";
    }
    return "Groupe";
  }

  function convInitials(conv: ProConversation): string {
    const name = convName(conv);
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2).toUpperCase();
  }

  function relativeTime(dateStr: string): string {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins}min`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `il y a ${h}h`;
    const d = Math.floor(h / 24);
    return d === 1 ? "hier" : `il y a ${d}j`;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.3 }}>
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>MESSAGES</p>
            {unreadTotal > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#5B4EC4] text-white text-[10px] font-semibold flex items-center justify-center">{unreadTotal}</span>
            )}
          </div>
          <Link href="/messages" className="text-[12px] font-medium text-[#5B4EC4] hover:underline">Tout voir →</Link>
        </div>
        <div className="space-y-1">
          {sorted.map((conv) => (
            <Link key={conv.id} href="/messages">
              <div className="flex gap-3 hover:bg-[#F8FAFC] -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                  {convInitials(conv)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[13px] font-semibold text-[#0F172A] truncate">{convName(conv)}</span>
                    <span className="text-[11px] text-[#94A3B8] shrink-0" style={{ fontFamily: "var(--font-inter)" }}>{relativeTime(conv.updatedAt)}</span>
                  </div>
                  <p className="text-[12px] text-[#475569] mt-0.5 truncate">{conv.lastMessage?.content ?? ""}</p>
                  {conv.unreadCount > 0 && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-[#5B4EC4] bg-indigo-50 px-2 py-0.5 rounded-full">{conv.unreadCount} non lu{conv.unreadCount > 1 ? "s" : ""}</span>
                  )}
                </div>
                <ChevronRight size={13} className="text-[#CBD5E1] shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
