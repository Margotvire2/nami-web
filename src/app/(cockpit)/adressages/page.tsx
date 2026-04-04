"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight, Plus, X, Check, XCircle, Clock, Calendar,
  ChevronRight, Send, Sparkles, ArrowRight, ArrowDown, User,
  FileText, MessageSquare, RefreshCw, Upload, Stethoscope, Eye, Repeat,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Patient {
  id: string;
  name: string;
  age: number;
  pathology: string;
  initials: string;
  avatarColor: string;
}

interface Doctor {
  name: string;
  specialty: string;
  location: string;
  initials: string;
}

interface Slot {
  id: string;
  label: string;
  time: string;
}

interface MockReferral {
  id: string;
  direction: "received" | "sent";
  status: "to_plan" | "waiting" | "rdv_planned" | "rdv_confirmed" | "first_consult_done" | "declined";
  urgent: boolean;
  patient: Patient;
  from?: Doctor;
  to?: Doctor;
  deadline: string | null;
  reason: string;
  aiGenerated: boolean;
  suggestedSlots: Slot[];
  patientAvailability: string[];
  plannedDate?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_REFERRALS: MockReferral[] = [
  {
    id: "ref-001", direction: "received", status: "to_plan", urgent: true,
    patient: { id: "p-001", name: "Margot Vire", age: 23, pathology: "Anorexie mentale restrictive", initials: "MV", avatarColor: "bg-violet-100 text-violet-700" },
    from: { name: "Dr Karim Benali", specialty: "Psychiatre", location: "CHU Necker", initials: "KB" },
    deadline: "48h", reason: "Prise en charge nutritionnelle urgente. Restriction alimentaire sévère (<800 kcal/j), rituels rigides. Besoin d'un suivi diététique spécialisé TCA avec réintroduction alimentaire progressive.", aiGenerated: true,
    suggestedSlots: [{ id: "s1", label: "Jeu 23 jan", time: "14h00" }, { id: "s2", label: "Ven 24 jan", time: "9h30" }, { id: "s3", label: "Mar 28 jan", time: "11h00" }],
    patientAvailability: ["Lundi matin", "Mercredi après-midi"], createdAt: "2025-01-22T09:00:00Z",
  },
  {
    id: "ref-002", direction: "received", status: "to_plan", urgent: true,
    patient: { id: "p-003", name: "Émilie Renard", age: 19, pathology: "Anorexie mentale restrictive + anxiété", initials: "ER", avatarColor: "bg-rose-100 text-rose-700" },
    from: { name: "Dr Sophie Marchand", specialty: "Pédopsychiatre", location: "Clinique Saint-Jean", initials: "SM" },
    deadline: "48h", reason: "Patiente présentant une anorexie mentale restrictive avec composante anxieuse majeure. Nécessite une prise en charge psychothérapeutique spécialisée TCA en urgence.", aiGenerated: false,
    suggestedSlots: [{ id: "s4", label: "Mer 22 jan", time: "10h00" }, { id: "s5", label: "Jeu 23 jan", time: "16h30" }],
    patientAvailability: ["Mardi", "Jeudi après-midi"], createdAt: "2025-01-21T14:30:00Z",
  },
  {
    id: "ref-003", direction: "sent", status: "waiting", urgent: false,
    patient: { id: "p-002", name: "Paul Durand", age: 31, pathology: "TCA + bilan hormonal", initials: "PD", avatarColor: "bg-blue-100 text-blue-700" },
    to: { name: "Dr Isabelle Fontaine", specialty: "Endocrinologue", location: "Hôpital Lariboisière", initials: "IF" },
    deadline: "2 semaines", reason: "Bilan hormonal et métabolique complet recommandé dans le cadre du suivi TCA. IMC à 16.2, aménorrhée secondaire probable.", aiGenerated: true,
    suggestedSlots: [], patientAvailability: ["Vendredi"], createdAt: "2025-01-20T11:00:00Z",
  },
  {
    id: "ref-004", direction: "sent", status: "rdv_planned", urgent: false,
    patient: { id: "p-001", name: "Margot Vire", age: 23, pathology: "Anorexie mentale restrictive", initials: "MV", avatarColor: "bg-violet-100 text-violet-700" },
    to: { name: "Dr Thomas Lefèvre", specialty: "Cardiologue", location: "Cabinet Paris 15", initials: "TL" },
    deadline: "1 semaine", reason: "Surveillance cardiaque dans le cadre d'une dénutrition sévère. ECG et bilan électrolytique à contrôler.", aiGenerated: true,
    plannedDate: "Lun 27 jan · 11h00", suggestedSlots: [], patientAvailability: [], createdAt: "2025-01-19T16:00:00Z",
  },
  {
    id: "ref-005", direction: "sent", status: "first_consult_done", urgent: false,
    patient: { id: "p-004", name: "Léa Moreau", age: 26, pathology: "Boulimie + dépression", initials: "LM", avatarColor: "bg-teal-100 text-teal-700" },
    to: { name: "Dr Nadia Roussel", specialty: "Psychologue TCC", location: "Cabinet Paris 11", initials: "NR" },
    deadline: null, reason: "Suivi psychologique spécialisé TCA après stabilisation médicale. Patiente motivée.", aiGenerated: false,
    suggestedSlots: [], patientAvailability: [], createdAt: "2025-01-10T09:00:00Z",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_META: Record<string, { label: string; className: string }> = {
  to_plan:            { label: "À planifier",     className: "bg-rose-50 text-rose-700 border border-rose-200" },
  waiting:            { label: "En attente",      className: "bg-amber-50 text-amber-700 border border-amber-200" },
  rdv_planned:        { label: "RDV planifié",    className: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  rdv_confirmed:      { label: "RDV confirmé",    className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  first_consult_done: { label: "1re consult. OK", className: "bg-teal-50 text-teal-700 border border-teal-200" },
  declined:           { label: "Décliné",         className: "bg-slate-100 text-slate-500 border border-slate-200" },
};

const STEPPER_STEPS = ["Envoyé", "Reçu", "Accepté", "RDV planifié", "1re consultation", "Suivi en cours"];

function statusToStep(status: string): number {
  const map: Record<string, number> = { to_plan: 1, waiting: 1, rdv_planned: 3, rdv_confirmed: 3, first_consult_done: 4, declined: -1 };
  return map[status] ?? 0;
}

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return "hier";
  return `il y a ${d}j`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdressagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<MockReferral[]>(MOCK_REFERRALS);
  const [primaryTab, setPrimaryTab] = useState<"to_treat" | "in_progress" | "archived">("to_treat");
  const [directionFilter, setDirectionFilter] = useState<"all" | "received" | "sent">("all");
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = referrals;
    if (primaryTab === "to_treat") list = list.filter((r) => r.status === "to_plan");
    else if (primaryTab === "in_progress") list = list.filter((r) => ["waiting", "rdv_planned", "rdv_confirmed"].includes(r.status));
    else list = list.filter((r) => ["first_consult_done", "declined"].includes(r.status));
    if (directionFilter !== "all") list = list.filter((r) => r.direction === directionFilter);
    return list;
  }, [referrals, primaryTab, directionFilter]);

  const selected = referrals.find((r) => r.id === selectedId) ?? null;

  const kpiToPlan = referrals.filter((r) => r.status === "to_plan").length;
  const kpiWaiting = referrals.filter((r) => ["waiting"].includes(r.status)).length;
  const kpiPlanned = referrals.filter((r) => ["rdv_planned", "rdv_confirmed"].includes(r.status)).length;

  function handleAccept(id: string) {
    const slot = selectedSlots[id];
    if (!slot) { toast.error("Sélectionnez un créneau"); return; }
    setReferrals((prev) => prev.map((r) => r.id === id ? { ...r, status: "rdv_planned" as const, plannedDate: (() => { const s = r.suggestedSlots.find((s) => s.id === slot); return s ? `${s.label} · ${s.time}` : ""; })() } : r));
    toast.success("Adressage accepté — RDV planifié");
  }

  function handleDecline(id: string) {
    setReferrals((prev) => prev.map((r) => r.id === id ? { ...r, status: "declined" as const } : r));
    setSelectedId(null);
    toast.success("Adressage décliné");
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Colonne gauche ── */}
      <div className={cn("flex-1 flex flex-col overflow-hidden transition-all", selected ? "max-w-[calc(100%-420px)]" : "")}>
        {/* Header */}
        <header className="bg-white border-b border-[#E8ECF4] px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>Adressages</h1>
              <p className="text-sm text-[#64748B] mt-0.5">Coordination et orientations entre soignants</p>
            </div>
            <button onClick={() => setCreateOpen(true)} className="h-10 px-5 rounded-[10px] bg-[#4F46E5] text-white text-sm font-semibold flex items-center gap-2 hover:bg-[#4338CA] transition-colors">
              <Plus size={16} /> Nouvel adressage
            </button>
          </div>
        </header>

        {/* KPI strip */}
        <div className="bg-white border-b border-[#E8ECF4] px-6 py-3 shrink-0">
          <div className="flex gap-3">
            <KpiPill label="À traiter" value={kpiToPlan} sub="action requise" color="border-l-rose-400" active={primaryTab === "to_treat"} onClick={() => setPrimaryTab("to_treat")} />
            <KpiPill label="En attente" value={kpiWaiting} sub="réponse pending" color="border-l-amber-400" active={primaryTab === "in_progress"} onClick={() => setPrimaryTab("in_progress")} />
            <KpiPill label="Cette semaine" value={kpiPlanned} sub="RDV confirmés" color="border-l-emerald-400" active={primaryTab === "archived"} onClick={() => setPrimaryTab("archived")} />
          </div>
        </div>

        {/* Tabs + direction filter */}
        <div className="bg-white border-b border-[#E8ECF4] px-6 py-2 shrink-0 flex items-center justify-between">
          <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-0.5">
            {(["to_treat", "in_progress", "archived"] as const).map((t) => (
              <button key={t} onClick={() => setPrimaryTab(t)} className={cn("px-3 py-1.5 rounded-md text-[13px] font-medium transition-all", primaryTab === t ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]")}>
                {t === "to_treat" ? "À traiter" : t === "in_progress" ? "En cours" : "Archivés"}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "received", "sent"] as const).map((d) => (
              <button key={d} onClick={() => setDirectionFilter(d)} className={cn("px-2.5 py-1 rounded-md text-[12px] font-medium transition-all", directionFilter === d ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#94A3B8] hover:text-[#64748B]")} style={{ fontFamily: "var(--font-inter)" }}>
                {d === "all" ? "Tous" : d === "received" ? "Reçus" : "Envoyés"}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-[#F0F2FA] p-4 space-y-2">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <ArrowLeftRight size={28} className="text-[#CBD5E1] mb-3" />
                <p className="text-sm text-[#94A3B8]">Aucun adressage dans cette catégorie.</p>
              </div>
            ) : (
              filtered.map((ref, i) => (
                <motion.div key={ref.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ delay: i * 0.05, duration: 0.2 }}>
                  <ReferralCard
                    referral={ref}
                    isSelected={selectedId === ref.id}
                    selectedSlot={selectedSlots[ref.id]}
                    onSelect={() => setSelectedId(selectedId === ref.id ? null : ref.id)}
                    onSelectSlot={(slotId) => setSelectedSlots((p) => ({ ...p, [ref.id]: slotId }))}
                    onAccept={() => handleAccept(ref.id)}
                    onDecline={() => handleDecline(ref.id)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Panel détail ── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="w-[420px] shrink-0 bg-white border-l border-[#E8ECF4] flex flex-col h-full overflow-hidden shadow-xl z-10">
            <DetailPanel referral={selected} onClose={() => setSelectedId(null)} onAccept={() => handleAccept(selected.id)} onDecline={() => handleDecline(selected.id)} selectedSlot={selectedSlots[selected.id]} onSelectSlot={(slotId) => setSelectedSlots((p) => ({ ...p, [selected.id]: slotId }))} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal création ── */}
      <AnimatePresence>
        {createOpen && <CreateReferralModal onClose={() => setCreateOpen(false)} onCreate={(ref) => { setReferrals((p) => [ref, ...p]); setCreateOpen(false); toast.success("Adressage envoyé"); }} />}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KPI PILL
// ═══════════════════════════════════════════════════════════════════════════════

function KpiPill({ label, value, sub, color, active, onClick }: { label: string; value: number; sub: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex-1 rounded-xl p-4 text-left transition-all border-l-4", color, active ? "bg-white shadow-sm" : "bg-[#FAFBFF] hover:bg-white")} style={{ border: undefined }}>
      <p className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none" style={{ fontFamily: "var(--font-jakarta)" }}>{value}</p>
      <p className="text-[13px] font-semibold text-[#0F172A] mt-1">{label}</p>
      <p className="text-[12px] text-[#94A3B8] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{sub}</p>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERRAL CARD
// ═══════════════════════════════════════════════════════════════════════════════

function ReferralCard({ referral: r, isSelected, selectedSlot, onSelect, onSelectSlot, onAccept, onDecline }: {
  referral: MockReferral; isSelected: boolean; selectedSlot?: string;
  onSelect: () => void; onSelectSlot: (id: string) => void; onAccept: () => void; onDecline: () => void;
}) {
  const sm = STATUS_META[r.status];
  const doctor = r.direction === "received" ? r.from! : r.to!;

  return (
    <div onClick={onSelect} className={cn(
      "bg-white rounded-xl p-5 cursor-pointer transition-all duration-150",
      isSelected ? "border-l-[3px] border-l-[#4F46E5] bg-[#FAFBFF] shadow-lg" : "border border-[#E8ECF4] hover:shadow-md hover:-translate-y-px",
    )}>
      {/* Line 1 — Meta */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", r.direction === "received" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500")} style={{ fontFamily: "var(--font-inter)" }}>
          {r.direction === "received" ? "● REÇU" : "→ ENVOYÉ"}
        </span>
        {r.urgent && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">URGENT</span>}
        {r.deadline && <span className="text-[11px] text-[#94A3B8] ml-auto" style={{ fontFamily: "var(--font-inter)" }}>Délai : {r.deadline}</span>}
        <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", sm.className)}>{sm.label}</span>
      </div>

      {/* Line 2 — Patient */}
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0", r.patient.avatarColor)}>
          {r.patient.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[16px] font-semibold text-[#0F172A] truncate" style={{ fontFamily: "var(--font-jakarta)" }}>{r.patient.name}, {r.patient.age} ans</p>
          <p className="text-[13px] text-[#64748B] truncate">{r.patient.pathology}</p>
        </div>
      </div>

      {/* Line 3 — Doctor connection */}
      <div className="flex items-center gap-2 mb-2 text-[13px]">
        <span className="text-[#94A3B8]">{r.direction === "received" ? "De" : "Vers"} :</span>
        <span className="font-medium text-[#374151]">{doctor.name}</span>
        <span className="text-[#94A3B8]">·</span>
        <span className="text-[#64748B]">{doctor.specialty}</span>
        <span className="text-[#94A3B8]">·</span>
        <span className="text-[#94A3B8]">{doctor.location}</span>
      </div>

      {/* Line 4 — Reason */}
      <p className="text-[13px] text-[#475569] italic line-clamp-2 mb-3 leading-relaxed">{r.reason}</p>

      {/* Line 5 — Slots (only for received to_plan) */}
      {r.direction === "received" && r.status === "to_plan" && r.suggestedSlots.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] text-[#94A3B8] mb-1.5 flex items-center gap-1" style={{ fontFamily: "var(--font-inter)" }}>
            <Calendar size={11} /> Créneaux disponibles
          </p>
          <div className="flex gap-2 flex-wrap">
            {r.suggestedSlots.map((s) => (
              <button key={s.id} onClick={(e) => { e.stopPropagation(); onSelectSlot(s.id); }} className={cn("px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all", selectedSlot === s.id ? "bg-[#4F46E5] text-white" : "border border-[#E2E8F0] text-[#374151] hover:bg-[#EEF2FF] hover:border-[#4F46E5]")} style={{ fontFamily: "var(--font-inter)" }}>
                {s.label} · {s.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Line 6 — Actions (received + to_plan only) */}
      {r.direction === "received" && r.status === "to_plan" && (
        <div className="flex items-center gap-3 pt-2 border-t border-[#F1F5F9]" onClick={(e) => e.stopPropagation()}>
          <button onClick={onAccept} className="flex-1 h-9 rounded-lg bg-[#4F46E5] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#4338CA] transition-colors">
            <Check size={14} /> Accepter et planifier
          </button>
          <button onClick={onDecline} className="text-[13px] font-medium text-rose-500 hover:text-rose-700 transition-colors">Décliner</button>
        </div>
      )}

      {/* Planned date */}
      {r.plannedDate && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9] text-[12px] text-[#059669] font-medium" style={{ fontFamily: "var(--font-inter)" }}>
          <Calendar size={12} /> RDV : {r.plannedDate}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function DetailPanel({ referral: r, onClose, onAccept, onDecline, selectedSlot, onSelectSlot }: {
  referral: MockReferral; onClose: () => void; onAccept: () => void; onDecline: () => void;
  selectedSlot?: string; onSelectSlot: (id: string) => void;
}) {
  const doctor = r.direction === "received" ? r.from! : r.to!;
  const currentStep = statusToStep(r.status);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#E8ECF4]">
        <p className="text-sm font-semibold text-[#0F172A]">Détail de l'adressage</p>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] transition-colors"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* A) Patient header */}
        <div className="flex items-center gap-3">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0", r.patient.avatarColor)}>
            {r.patient.initials}
          </div>
          <div>
            <p className="text-[18px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>{r.patient.name}, {r.patient.age} ans</p>
            <p className="text-[13px] text-[#64748B]">{r.patient.pathology}</p>
          </div>
        </div>
        <Link href={`/patients/${r.patient.id}`} className="text-[13px] font-medium text-[#4F46E5] hover:underline flex items-center gap-1">
          Ouvrir le dossier complet <ChevronRight size={14} />
        </Link>

        {/* B) Stepper */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>Progression</p>
          <div className="space-y-3">
            {STEPPER_STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isCurrent = i === currentStep;
              const isFuture = i > currentStep;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <motion.div initial={false} animate={isCurrent ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }} className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", isDone ? "bg-[#059669]" : isCurrent ? "bg-[#4F46E5] ring-4 ring-[#EEF2FF]" : "bg-[#E2E8F0]")}>
                      {isDone ? <Check size={12} className="text-white" /> : isCurrent ? <div className="w-2 h-2 rounded-full bg-white" /> : <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />}
                    </motion.div>
                    {i < STEPPER_STEPS.length - 1 && <div className={cn("w-px h-4 mt-1", isDone ? "bg-[#059669]" : "bg-[#E2E8F0]")} />}
                  </div>
                  <p className={cn("text-[13px] pt-0.5", isDone ? "text-[#059669] font-medium" : isCurrent ? "text-[#4F46E5] font-semibold" : "text-[#CBD5E1]")}>{step}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* C) Clinical reason */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Résumé clinique</p>
            {r.aiGenerated && <span className="text-[10px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={9} /> IA</span>}
          </div>
          <p className="text-[13px] text-[#374151] leading-relaxed">{r.reason}</p>
        </div>

        {/* D) Patient availability */}
        {r.patientAvailability.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>Disponibilités patient</p>
            <div className="flex gap-2 flex-wrap">
              {r.patientAvailability.map((a) => (
                <span key={a} className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[12px] font-medium text-[#64748B]" style={{ fontFamily: "var(--font-inter)" }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* E) Slot selection (if to_plan) */}
        {r.status === "to_plan" && r.suggestedSlots.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>Sélectionner un créneau</p>
            <div className="space-y-1.5">
              {r.suggestedSlots.map((s) => (
                <motion.button key={s.id} whileTap={{ scale: 0.97 }} onClick={() => onSelectSlot(s.id)} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all", selectedSlot === s.id ? "bg-[#4F46E5] text-white" : "bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0]")}>
                  <Calendar size={14} className={selectedSlot === s.id ? "text-white" : "text-[#94A3B8]"} />
                  <span className={cn("text-[13px] font-medium", selectedSlot === s.id ? "text-white" : "text-[#0F172A]")} style={{ fontFamily: "var(--font-inter)" }}>{s.label} · {s.time}</span>
                  {selectedSlot === s.id && <Check size={14} className="ml-auto" />}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Doctor info */}
        <div className="bg-[#F8FAFC] rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>{r.direction === "received" ? "Envoyé par" : "Destinataire"}</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>{doctor.initials}</div>
            <div>
              <p className="text-[14px] font-semibold text-[#0F172A]">{doctor.name}</p>
              <p className="text-[12px] text-[#64748B]">{doctor.specialty} · {doctor.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* F) Footer actions */}
      <div className="px-5 py-4 border-t border-[#E8ECF4] space-y-2 shrink-0">
        {r.status === "to_plan" && r.direction === "received" && (
          <button onClick={onAccept} className="w-full h-10 rounded-xl bg-[#4F46E5] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors">
            <Check size={16} /> Confirmer le RDV
          </button>
        )}
        <button onClick={() => toast.info("Messagerie bientôt disponible")} className="w-full h-10 rounded-xl bg-[#F8FAFC] text-[#374151] text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[#F1F5F9] transition-colors border border-[#E8ECF4]">
          <MessageSquare size={14} /> Envoyer un message
        </button>
        {r.status === "to_plan" && r.direction === "received" && (
          <button onClick={onDecline} className="w-full h-9 rounded-xl text-[13px] font-medium text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5">
            <XCircle size={14} /> Décliner l'adressage
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE MODAL — 4 steps
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_PATIENTS = [
  { id: "p-001", name: "Margot Vire", age: 23, pathology: "Anorexie mentale restrictive", initials: "MV", avatarColor: "bg-violet-100 text-violet-700" },
  { id: "p-002", name: "Paul Durand", age: 31, pathology: "TCA + bilan hormonal", initials: "PD", avatarColor: "bg-blue-100 text-blue-700" },
  { id: "p-003", name: "Émilie Renard", age: 19, pathology: "Anorexie + anxiété", initials: "ER", avatarColor: "bg-rose-100 text-rose-700" },
  { id: "p-004", name: "Léa Moreau", age: 26, pathology: "Boulimie + dépression", initials: "LM", avatarColor: "bg-teal-100 text-teal-700" },
  { id: "p-005", name: "Théo Dufresne", age: 19, pathology: "Orthorexie sévère", initials: "TD", avatarColor: "bg-amber-100 text-amber-700" },
];

const MOCK_DOCTORS = [
  { name: "Dr Isabelle Fontaine", specialty: "Endocrinologue", location: "Hôpital Lariboisière", initials: "IF" },
  { name: "Dr Nadia Roussel", specialty: "Psychologue TCC", location: "Cabinet Paris 11", initials: "NR" },
  { name: "Dr Thomas Lefèvre", specialty: "Cardiologue", location: "Cabinet Paris 15", initials: "TL" },
  { name: "Dr Sophie Marchand", specialty: "Pédopsychiatre", location: "Clinique Saint-Jean", initials: "SM" },
];

function CreateReferralModal({ onClose, onCreate }: { onClose: () => void; onCreate: (ref: MockReferral) => void }) {
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<typeof MOCK_PATIENTS[0] | null>(null);
  const [refType, setRefType] = useState<"ponctuelle" | "avis" | "continue">("ponctuelle");
  const [urgency, setUrgency] = useState<"urgent" | "rapide" | "programme">("programme");
  const [selectedDoctor, setSelectedDoctor] = useState<typeof MOCK_DOCTORS[0] | null>(null);
  const [reason, setReason] = useState("Patiente suivie pour anorexie mentale restrictive. IMC 16.2, aménorrhée secondaire depuis 8 mois. Nécessite un avis spécialisé pour évaluation complémentaire et prise en charge coordonnée.");
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  const filteredPatients = MOCK_PATIENTS.filter((p) => !patientSearch || p.name.toLowerCase().includes(patientSearch.toLowerCase()));
  const filteredDoctors = MOCK_DOCTORS.filter((d) => !doctorSearch || d.name.toLowerCase().includes(doctorSearch.toLowerCase()) || d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()));

  function handleCreate() {
    if (!selectedPatient || !selectedDoctor) return;
    const ref: MockReferral = {
      id: `ref-${Date.now()}`, direction: "sent", status: "waiting", urgent: urgency === "urgent",
      patient: selectedPatient, to: selectedDoctor, deadline: urgency === "urgent" ? "48h" : urgency === "rapide" ? "2 semaines" : null,
      reason, aiGenerated: true, suggestedSlots: [], patientAvailability: [], createdAt: new Date().toISOString(),
    };
    onCreate(ref);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header + stepper */}
        <div className="px-6 py-5 border-b border-[#E8ECF4] shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Nouvel adressage</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"><X size={16} /></button>
          </div>
          <div className="flex items-center gap-2">
            {["Patient", "Demande", "Destinataire", "Résumé"].map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold", step > i + 1 ? "bg-[#059669] text-white" : step === i + 1 ? "bg-[#4F46E5] text-white" : "bg-[#E2E8F0] text-[#94A3B8]")}>
                  {step > i + 1 ? <Check size={12} /> : i + 1}
                </div>
                <span className={cn("text-[12px] font-medium hidden sm:block", step === i + 1 ? "text-[#0F172A]" : "text-[#94A3B8]")}>{s}</span>
                {i < 3 && <div className={cn("flex-1 h-px", step > i + 1 ? "bg-[#059669]" : "bg-[#E2E8F0]")} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <input value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Rechercher un patient…" autoFocus className="w-full h-10 rounded-xl bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
              <div className="space-y-2">
                {filteredPatients.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPatient(p)} className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all", selectedPatient?.id === p.id ? "bg-[#EEF2FF] ring-2 ring-[#4F46E5]" : "hover:bg-[#F8FAFC] border border-[#E8ECF4]")}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold", p.avatarColor)}>{p.initials}</div>
                    <div><p className="text-sm font-semibold text-[#0F172A]">{p.name}, {p.age} ans</p><p className="text-xs text-[#64748B]">{p.pathology}</p></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>Type de demande</p>
                <div className="grid grid-cols-3 gap-3">
                  {([["ponctuelle", Stethoscope, "Consultation ponctuelle"], ["avis", Eye, "Avis spécialisé"], ["continue", Repeat, "Prise en charge"]] as const).map(([key, Icon, label]) => (
                    <button key={key} onClick={() => setRefType(key)} className={cn("p-4 rounded-xl text-center transition-all border", refType === key ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#E8ECF4] text-[#64748B] hover:border-[#94A3B8]")}>
                      <Icon size={20} className="mx-auto mb-2" />
                      <p className="text-[12px] font-medium">{label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3" style={{ fontFamily: "var(--font-inter)" }}>Urgence</p>
                <div className="flex gap-2">
                  {([["urgent", "🔴 Urgent < 48h"], ["rapide", "🟡 Rapide < 2 sem"], ["programme", "🟢 Programmé"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setUrgency(key)} className={cn("flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all border", urgency === key ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#E8ECF4] text-[#64748B]")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <input value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} placeholder="Rechercher un confrère…" autoFocus className="w-full h-10 rounded-xl bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
              <div className="space-y-2">
                {filteredDoctors.map((d) => (
                  <button key={d.initials} onClick={() => setSelectedDoctor(d)} className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all", selectedDoctor?.initials === d.initials ? "bg-[#EEF2FF] ring-2 ring-[#4F46E5]" : "hover:bg-[#F8FAFC] border border-[#E8ECF4]")}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>{d.initials}</div>
                    <div><p className="text-sm font-semibold text-[#0F172A]">{d.name}</p><p className="text-xs text-[#64748B]">{d.specialty} · {d.location}</p></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Résumé clinique</p>
                <span className="text-[10px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={9} /> Pré-rempli par l'IA</span>
              </div>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={6} className="w-full bg-[#F8FAFC] rounded-xl p-4 text-[13px] text-[#374151] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 border border-[#E8ECF4]" />
              <button onClick={() => setReason("Patiente suivie pour anorexie mentale restrictive. IMC 16.2, aménorrhée secondaire depuis 8 mois...")} className="text-[12px] font-medium text-[#4F46E5] hover:underline flex items-center gap-1"><RefreshCw size={12} /> Régénérer</button>
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-dashed border-[#CBD5E1] text-center">
                <Upload size={20} className="text-[#CBD5E1] mx-auto mb-1" />
                <p className="text-[12px] text-[#94A3B8]">Glisser des pièces jointes ici</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8ECF4] flex justify-between shrink-0">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
            {step > 1 ? "← Retour" : "Annuler"}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} disabled={(step === 1 && !selectedPatient) || (step === 3 && !selectedDoctor)} className={cn("px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-colors", (step === 1 && !selectedPatient) || (step === 3 && !selectedDoctor) ? "bg-[#E8ECF4] text-[#94A3B8] cursor-not-allowed" : "bg-[#4F46E5] text-white hover:bg-[#4338CA]")}>
              Suivant →
            </button>
          ) : (
            <button onClick={handleCreate} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors flex items-center gap-2">
              <Send size={14} /> Envoyer l'adressage
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
