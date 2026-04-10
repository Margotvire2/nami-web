"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Clock, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineEvent, TimelineSummary, TimelineSeverity } from "@/lib/timeline/model";
import { getRegistryEntry } from "@/lib/timeline/registry";

// ─── Severity badges ─────────────────────────────────────────────────────────
const SEVERITY_BADGE: Record<TimelineSeverity, { dot: string; badge: string; label: string; icon: React.ReactNode } | null> = {
  critical: {
    dot:   "bg-[#DC2626]",
    badge: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
    label: "Critique",
    icon:  <ShieldAlert size={10} strokeWidth={2} />,
  },
  high: {
    dot:   "bg-[#EF4444]",
    badge: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
    label: "Urgent",
    icon:  <AlertTriangle size={10} strokeWidth={2} />,
  },
  medium: {
    dot:   "bg-[#D97706]",
    badge: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    label: "À vérifier",
    icon:  <AlertTriangle size={10} strokeWidth={2} />,
  },
  info: {
    dot:   "bg-[#2563EB]",
    badge: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    label: "Info",
    icon:  <Info size={10} strokeWidth={2} />,
  },
  low: null, // pas de badge
};

// ─── Mapping émojis sémantiques ─────────────────────────────────────────────
const EVENT_EMOJI: Record<string, string> = {
  consultation:      "🩺",
  clinical_note:     "📋",
  alert:             "🚨",
  referral_created:  "📤",
  referral_accepted: "📥",
  task:              "✅",
  message:           "💬",
  document:          "📄",
  journal_entry:     "💬",
  care_team_change:  "👥",
  risk_change:       "⚠️",
  care_plan_update:  "🤝",
  milestone:         "🏁",
  phase_change:      "📅",
  other:             "📌",
};

// ─── Couleurs par catégorie ─────────────────────────────────────────────────
const CATEGORY_STYLE: Record<string, { card: string }> = {
  consultation:  { card: "bg-[#EEF2FF] border-[#C7D2FE]" },
  note:          { card: "bg-[#F8FAFC] border-[#E2E8F0]" },
  alert:         { card: "bg-[#FEF2F2] border-[#FECACA]" },
  coordination:  { card: "bg-[#F5F3FF] border-[#DDD6FE]" },
  patient:       { card: "bg-[#EFF6FF] border-[#BFDBFE]" },
  task:          { card: "bg-[#F5F3FF] border-[#DDD6FE]" },
  document:      { card: "bg-[#F8FAFC] border-[#E2E8F0]" },
};

const getCategoryCard = (cat: string) =>
  CATEGORY_STYLE[cat]?.card ?? "bg-[#F8FAFC] border-[#E2E8F0]";

// ─── Format date ────────────────────────────────────────────────────────────
function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return "hier";
  if (diff < 7) return `il y a ${diff}j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function dateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Props ──────────────────────────────────────────────────────────────────
interface ClinicalLifelineProps {
  events: TimelineEvent[];
  trajectory: TimelineEvent[];
  summary: TimelineSummary;
  isLoading?: boolean;
}

// ─── Derive phases from events ──────────────────────────────────────────────
function derivePhases(events: TimelineEvent[]) {
  if (events.length === 0) return [];
  const refAccepted = events.findIndex((e) => e.type === "referral_accepted");
  const total = events.length;
  const p1End = refAccepted >= 0 ? refAccepted : Math.floor(total * 0.3);
  const p2End = Math.floor(total * 0.7);
  return [
    { label: "Évaluation", startIndex: 0, endIndex: p1End },
    { label: "Coordination", startIndex: p1End, endIndex: p2End },
    { label: "Stabilisation", startIndex: p2End, endIndex: total - 1 },
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
export function ClinicalLifeline({ events, trajectory, summary, isLoading }: ClinicalLifelineProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"trajectory" | "detail">("trajectory");

  const phases = useMemo(() => derivePhases(trajectory), [trajectory]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedId) ?? null,
    [events, selectedId],
  );

  if (isLoading) return <TimelineSkeleton />;

  return (
    <div className="rounded-2xl bg-white border border-[#E8ECF4] overflow-hidden" style={{ fontFamily: "var(--font-jakarta)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8ECF4]">
        <div>
          <div className="flex items-center gap-2">
            <Clock size={16} strokeWidth={1.75} className="text-[#94A3B8]" />
            <span className="text-[15px] font-semibold text-[#0F172A] tracking-tight">Ligne de vie clinique</span>
          </div>
          <p className="text-[12px] text-[#94A3B8] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
            Parcours du patient — {events.length} événement{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-xl p-1">
          {(["trajectory", "detail"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150", view === v ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]")}>
              {v === "trajectory" ? "Trajectoire" : "Détail"}
            </button>
          ))}
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-4 gap-px bg-[#E8ECF4] border-b border-[#E8ECF4]">
        {[
          { label: "DÉBUT DE SUIVI", value: formatShortDate(summary.startDate), sub: "" },
          { label: "PHASE ACTUELLE", value: summary.currentPhase ?? "Non définie", sub: "" },
          { label: "DERNIER ÉVÉNEMENT", value: summary.lastImportantEvent ? formatShortDate(summary.lastImportantEvent.occurredAt) : "—", sub: summary.lastImportantEvent?.title ?? "" },
          { label: "PROCHAINE ÉTAPE", value: summary.nextPlannedEvent?.title ?? "Non définie", sub: summary.nextPlannedEvent ? formatShortDate(summary.nextPlannedEvent.occurredAt) : "" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-1" style={{ fontFamily: "var(--font-inter)" }}>{label}</p>
            <p className="text-[14px] font-semibold text-[#0F172A] leading-tight truncate">{value}</p>
            {sub && <p className="text-[12px] text-[#94A3B8] mt-0.5 truncate" style={{ fontFamily: "var(--font-inter)" }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Vue Trajectoire */}
      {view === "trajectory" && (
        <div className="px-6 py-5">
          {/* Phases */}
          {phases.length > 0 && (
            <div className="flex mb-3 rounded-xl overflow-hidden border border-[#E8ECF4]">
              {phases.map((phase, i) => {
                const width = ((phase.endIndex - phase.startIndex) / Math.max(trajectory.length - 1, 1)) * 100;
                const colors = ["bg-[#EEF2FF] text-[#6366F1]", "bg-[#F0F9FF] text-[#0EA5E9]", "bg-[#F0FDF4] text-[#059669]"];
                return (
                  <div key={i} className={cn("py-1.5 px-3 text-center text-[11px] font-semibold uppercase tracking-[0.06em]", colors[i])} style={{ width: `${Math.max(width, 20)}%`, fontFamily: "var(--font-inter)" }}>
                    {phase.label}
                  </div>
                );
              })}
            </div>
          )}

          {/* Frise */}
          <div className="relative py-8">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#E8ECF4] rounded-full -translate-y-1/2" />
            <div className="relative flex items-center justify-between">
              {trajectory.map((event) => {
                const emoji = EVENT_EMOJI[event.type] ?? "📌";
                const isSelected = selectedId === event.id;
                const isCurrent = event.status === "current";

                return (
                  <motion.button
                    key={event.id}
                    onClick={() => setSelectedId(isSelected ? null : event.id)}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="relative flex flex-col items-center group focus:outline-none"
                  >
                    <div className={cn(
                      "relative flex items-center justify-center rounded-full transition-all duration-150",
                      isCurrent ? "w-10 h-10 ring-2 ring-[#4F46E5] ring-offset-2 shadow-lg" : isSelected ? "w-9 h-9 ring-2 ring-[#CBD5E1] ring-offset-1" : "w-8 h-8",
                      "bg-white shadow-sm border border-[#E8ECF4] group-hover:shadow-md",
                    )}>
                      <span className={isCurrent ? "text-lg" : "text-sm"}>{emoji}</span>
                      {SEVERITY_BADGE[event.severity]?.dot && (
                        <span className={cn("absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white", SEVERITY_BADGE[event.severity]!.dot)} />
                      )}
                      {isCurrent && <span className="absolute inset-0 rounded-full animate-ping bg-[#C7D2FE] opacity-30" />}
                    </div>
                    <span className={cn("mt-2 text-[11px] whitespace-nowrap", isCurrent ? "text-[#4F46E5] font-semibold" : "text-[#94A3B8]")} style={{ fontFamily: "var(--font-inter)" }}>
                      {formatShortDate(event.occurredAt)}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-20">
                      <div className="bg-[#0F172A] text-white text-[12px] rounded-[10px] px-3 py-2 whitespace-nowrap shadow-xl border border-[#1E293B]">
                        <p className="font-semibold">{event.title}</p>
                        {event.actor && <p className="text-[#94A3B8] mt-0.5">{event.actor.name}</p>}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0F172A]" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Légende émojis */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-[#F1F5F9]">
            {Object.entries(EVENT_EMOJI)
              .filter(([type]) => trajectory.some((e) => e.type === type))
              .map(([type, emoji]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="text-sm">{emoji}</span>
                  <span className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>
                    {getRegistryEntry(type as any).label}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Vue Détail */}
      {view === "detail" && (
        <div className="divide-y divide-[#F1F5F9] max-h-[420px] overflow-y-auto px-6 py-2">
          {events.map((event, i) => {
            const emoji = EVENT_EMOJI[event.type] ?? "📌";
            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02, duration: 0.2 }} className="flex items-start gap-3 py-3">
                <div className="w-14 shrink-0 text-right pt-0.5">
                  <span className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{formatShortDate(event.occurredAt)}</span>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm border", getCategoryCard(event.category))}>{emoji}</div>
                  {i < events.length - 1 && <div className="w-px h-full min-h-[16px] bg-[#E8ECF4] mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-[#0F172A]">{event.title}</span>
                    {SEVERITY_BADGE[event.severity] && (
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border", SEVERITY_BADGE[event.severity]!.badge)}>
                        {SEVERITY_BADGE[event.severity]!.icon}
                        {SEVERITY_BADGE[event.severity]!.label}
                      </span>
                    )}
                  </div>
                  {event.summary && <p className="text-[12px] text-[#94A3B8] mt-0.5 line-clamp-2" style={{ fontFamily: "var(--font-inter)" }}>{event.summary}</p>}
                  {event.actor && <p className="text-[11px] text-[#CBD5E1] mt-1" style={{ fontFamily: "var(--font-inter)" }}>{event.actor.name}{event.actor.role ? ` · ${event.actor.role}` : ""}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Panel détail sélectionné */}
      <AnimatePresence>
        {selectedEvent && view === "trajectory" && (
          <motion.div key={selectedEvent.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.2 }} className={cn("mx-6 mb-5 rounded-xl border p-4", getCategoryCard(selectedEvent.category))}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{EVENT_EMOJI[selectedEvent.type] ?? "📌"}</span>
                <div>
                  <p className="text-[14px] font-semibold text-[#0F172A]">{selectedEvent.title}</p>
                  {selectedEvent.summary && <p className="text-[13px] text-[#64748B] mt-1 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{selectedEvent.summary}</p>}
                  {selectedEvent.actor && (
                    <div className="flex items-center gap-1.5 mt-2 text-[12px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>
                      <span>{selectedEvent.actor.name}</span>
                      {selectedEvent.actor.role && <><span className="text-[#CBD5E1]">·</span><span>{selectedEvent.actor.role}</span></>}
                    </div>
                  )}
                  <p className="text-[11px] text-[#CBD5E1] mt-1" style={{ fontFamily: "var(--font-inter)" }}>{dateFr(selectedEvent.occurredAt)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-[#CBD5E1] hover:text-[#64748B] transition-colors shrink-0 mt-0.5">
                <ChevronRight size={16} strokeWidth={1.75} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA quand rien sélectionné */}
      {!selectedEvent && view === "trajectory" && trajectory.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-4 text-[12px] text-[#CBD5E1] border-t border-[#F1F5F9]">
          <Info size={13} strokeWidth={1.75} />
          <span style={{ fontFamily: "var(--font-inter)" }}>Cliquez sur un événement pour voir le détail</span>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function TimelineSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-[#E8ECF4] p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><div className="h-4 w-40 bg-[#F1F5F9] rounded-lg" /><div className="h-3 w-24 bg-[#F8FAFC] rounded-lg" /></div>
        <div className="h-8 w-36 bg-[#F1F5F9] rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-px bg-[#E8ECF4] rounded-xl overflow-hidden">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white p-4 space-y-2"><div className="h-2 w-20 bg-[#F1F5F9] rounded" /><div className="h-4 w-28 bg-[#F1F5F9] rounded" /></div>)}
      </div>
      <div className="flex items-center justify-between py-6 relative">
        <div className="absolute inset-x-0 top-1/2 h-[2px] bg-[#E8ECF4] -translate-y-1/2" />
        {[...Array(5)].map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-[#F1F5F9] relative" />)}
      </div>
    </div>
  );
}
