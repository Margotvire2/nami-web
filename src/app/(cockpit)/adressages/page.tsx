"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useOutgoingReferrals, useIncomingReferrals } from "@/hooks/useReferrals";
import { REFERRAL_STATUS, REFERRAL_PRIORITY, getStatusMeta, getPriorityMeta } from "@/lib/referrals/model";
import { referralsApi, type Referral, type ReferralStatus } from "@/lib/api";
import {
  ArrowLeftRight, Plus, X, Check, Clock, Calendar,
  ChevronRight, Send, Loader2, AlertCircle,
} from "lucide-react";
import { EmptyState } from "@/components/nami/EmptyState";
import { ShimmerCard } from "@/components/ui/shimmer";
import { toast } from "sonner";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS GROUPING
// ═══════════════════════════════════════════════════════════════════════════════

type TabKey = "pending" | "in_progress" | "completed";

const TAB_STATUSES: Record<TabKey, ReferralStatus[]> = {
  pending:     ["DRAFT", "SENT", "RECEIVED", "UNDER_REVIEW"],
  in_progress: ["ACCEPTED", "PATIENT_CONTACTED", "APPOINTMENT_INVITED", "APPOINTMENT_BOOKED"],
  completed:   ["FIRST_VISIT_COMPLETED", "EXPIRED", "CANCELLED", "DECLINED"],
};

function getTab(status: ReferralStatus): TabKey {
  for (const [tab, statuses] of Object.entries(TAB_STATUSES)) {
    if (statuses.includes(status)) return tab as TabKey;
  }
  return "pending";
}

const TAB_LABELS: Record<TabKey, string> = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminés",
};

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return "hier";
  return `il y a ${d}j`;
}

function providerName(ref: Referral): string {
  if (ref.targetProvider?.person) {
    return `${ref.targetProvider.person.firstName} ${ref.targetProvider.person.lastName}`;
  }
  return ref.preferredSpecialty || "Non spécifié";
}

function providerSpecialty(ref: Referral): string {
  return ref.targetProvider?.specialties?.[0] || ref.preferredSpecialty || "";
}

function patientName(ref: Referral): string {
  return ref.careCase?.caseTitle || "Patient";
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdressagesPage() {
  const { data: outgoing, isLoading: loadOut } = useOutgoingReferrals();
  const { data: incoming, isLoading: loadIn } = useIncomingReferrals();

  const [tab, setTab] = useState<TabKey>("pending");
  const [dirFilter, setDirFilter] = useState<"all" | "sent" | "received">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isLoading = loadOut || loadIn;

  type ReferralWithDir = Referral & { _direction: "sent" | "received" };

  const allReferrals = useMemo((): ReferralWithDir[] => {
    const sent: ReferralWithDir[] = (outgoing || []).map((r) => ({ ...r, _direction: "sent" }));
    const recv: ReferralWithDir[] = (incoming || []).map((r) => ({ ...r, _direction: "received" }));
    const map = new Map<string, ReferralWithDir>();
    for (const r of [...sent, ...recv]) map.set(r.id, r);
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [outgoing, incoming]);

  const filtered = useMemo(() => {
    let list = allReferrals.filter((r) => getTab(r.status) === tab);
    if (dirFilter !== "all") list = list.filter((r) => r._direction === dirFilter);
    return list;
  }, [allReferrals, tab, dirFilter]);

  const selected = allReferrals.find((r) => r.id === selectedId) ?? null;

  const kpi = useMemo(() => ({
    pending: allReferrals.filter((r) => getTab(r.status) === "pending").length,
    in_progress: allReferrals.filter((r) => getTab(r.status) === "in_progress").length,
    completed: allReferrals.filter((r) => getTab(r.status) === "completed").length,
  }), [allReferrals]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#E8ECF4] px-6 py-4 shrink-0">
          <div className="h-7 w-40 bg-[#F1F5F9] rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-[#F1F5F9] rounded mt-2 animate-pulse" />
        </div>
        <div className="flex-1 overflow-auto px-6 py-4 flex flex-col gap-3">
          {[...Array(5)].map((_, i) => <ShimmerCard key={i} />)}
        </div>
      </div>
    );
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
          </div>
        </header>

        {/* KPI strip */}
        <div className="bg-white border-b border-[#E8ECF4] px-6 py-3 shrink-0">
          <div className="flex gap-3">
            <KpiPill label="En attente" value={kpi.pending} sub="action requise" color="border-l-amber-400" active={tab === "pending"} onClick={() => setTab("pending")} />
            <KpiPill label="En cours" value={kpi.in_progress} sub="RDV en cours" color="border-l-indigo-400" active={tab === "in_progress"} onClick={() => setTab("in_progress")} />
            <KpiPill label="Terminés" value={kpi.completed} sub="1re consult. / clos" color="border-l-emerald-400" active={tab === "completed"} onClick={() => setTab("completed")} />
          </div>
        </div>

        {/* Tabs + direction filter */}
        <div className="bg-white border-b border-[#E8ECF4] px-6 py-2 shrink-0 flex items-center justify-between">
          <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-0.5">
            {(["pending", "in_progress", "completed"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-1.5 rounded-md text-[13px] font-medium transition-all", tab === t ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]")}>
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "received", "sent"] as const).map((d) => (
              <button key={d} onClick={() => setDirFilter(d)} className={cn("px-2.5 py-1 rounded-md text-[12px] font-medium transition-all", dirFilter === d ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#94A3B8] hover:text-[#64748B]")}>
                {d === "all" ? "Tous" : d === "received" ? "Reçus" : "Envoyés"}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-[#F0F2FA] p-4 space-y-2">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <EmptyState
                icon={Send}
                title="Aucun adressage"
                description="Orientez un patient vers un confrère en quelques clics."
              />
            ) : (
              filtered.map((ref, i) => (
                <motion.div key={ref.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}>
                  <ReferralCard
                    referral={ref}
                    direction={ref._direction}
                    isSelected={selectedId === ref.id}
                    onSelect={() => setSelectedId(selectedId === ref.id ? null : ref.id)}
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
          <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.25 }} className="w-[420px] shrink-0 bg-white border-l border-[#E8ECF4] flex flex-col h-full overflow-hidden shadow-xl z-10">
            <DetailPanel referral={selected} direction={selected._direction} onClose={() => setSelectedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KPI PILL
// ═══════════════════════════════════════════════════════════════════════════════

function KpiPill({ label, value, sub, color, active, onClick }: { label: string; value: number; sub: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex-1 rounded-xl p-4 text-left transition-all border-l-4", color, active ? "bg-white shadow-sm" : "bg-[#FAFBFF] hover:bg-white")}>
      <p className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none" style={{ fontFamily: "var(--font-jakarta)" }}>{value}</p>
      <p className="text-[13px] font-semibold text-[#0F172A] mt-1">{label}</p>
      <p className="text-[12px] text-[#94A3B8] mt-0.5">{sub}</p>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERRAL CARD
// ═══════════════════════════════════════════════════════════════════════════════

function ReferralCard({ referral: r, direction, isSelected, onSelect }: {
  referral: Referral; direction: "sent" | "received"; isSelected: boolean; onSelect: () => void;
}) {
  const statusMeta = getStatusMeta(r.status);
  const priorityMeta = getPriorityMeta(r.priority);

  return (
    <div onClick={onSelect} className={cn(
      "bg-white rounded-xl p-5 cursor-pointer transition-all duration-150",
      isSelected ? "border-l-[3px] border-l-[#4F46E5] bg-[#FAFBFF] shadow-lg" : "border border-[#E8ECF4] hover:shadow-md hover:-translate-y-px",
    )}>
      {/* Meta row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", direction === "received" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500")}>
          {direction === "received" ? "REÇU" : "ENVOYÉ"}
        </span>
        {r.priority !== "ROUTINE" && (
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", priorityMeta.badgeClass)}>
            {priorityMeta.label}
          </span>
        )}
        <span className="text-[11px] text-[#94A3B8] ml-auto">{daysAgo(r.createdAt)}</span>
        <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border", statusMeta.badgeClass)}>
          {statusMeta.label}
        </span>
      </div>

      {/* Case title */}
      <p className="text-[15px] font-semibold text-[#0F172A] truncate mb-1" style={{ fontFamily: "var(--font-jakarta)" }}>
        {r.careCase?.caseTitle || "Dossier"}
      </p>

      {/* Provider connection */}
      <div className="flex items-center gap-2 mb-2 text-[13px]">
        <span className="text-[#94A3B8]">{direction === "received" ? "De" : "Vers"} :</span>
        <span className="font-medium text-[#374151]">
          {direction === "received"
            ? `${r.sender?.firstName ?? ""} ${r.sender?.lastName ?? ""}`.trim() || "Inconnu"
            : providerName(r)}
        </span>
        {providerSpecialty(r) && (
          <>
            <span className="text-[#94A3B8]">&middot;</span>
            <span className="text-[#64748B]">{providerSpecialty(r)}</span>
          </>
        )}
      </div>

      {/* Reason */}
      <p className="text-[13px] text-[#475569] italic line-clamp-2 leading-relaxed">{r.clinicalReason}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════════

const STEPPER_STEPS: { status: ReferralStatus; label: string }[] = [
  { status: "SENT", label: "Envoyé" },
  { status: "RECEIVED", label: "Reçu" },
  { status: "ACCEPTED", label: "Accepté" },
  { status: "APPOINTMENT_BOOKED", label: "RDV pris" },
  { status: "FIRST_VISIT_COMPLETED", label: "1re consultation" },
];

function stepIndex(status: ReferralStatus): number {
  if (status === "DECLINED" || status === "CANCELLED" || status === "EXPIRED") return -1;
  const idx = STEPPER_STEPS.findIndex((s) => s.status === status);
  if (idx >= 0) return idx;
  // Map intermediate statuses
  if (status === "UNDER_REVIEW") return 1;
  if (status === "PATIENT_CONTACTED" || status === "APPOINTMENT_INVITED") return 3;
  return 0;
}

function DetailPanel({ referral: r, direction, onClose }: { referral: Referral; direction: "sent" | "received"; onClose: () => void }) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const currentStep = stepIndex(r.status);
  const statusMeta = getStatusMeta(r.status);

  // Action states
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [responseNote, setResponseNote] = useState("");
  const [declineReason, setDeclineReason] = useState("");

  const isPending = r.status === "SENT" || r.status === "RECEIVED" || r.status === "UNDER_REVIEW" || r.status === "DRAFT";

  const respondMutation = useMutation({
    mutationFn: (body: { decision: "ACCEPTED" | "DECLINED"; responseNote?: string; proposedDate?: string }) =>
      referralsApi.respond(accessToken!, r.id, body.decision, body.responseNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      onClose();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      referralsApi.updateStatus(accessToken!, r.id, "CANCELLED"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      toast.success("Adressage annulé");
      onClose();
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#E8ECF4]">
        <p className="text-sm font-semibold text-[#0F172A]">Détail de l&apos;adressage</p>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Case info */}
        <div>
          <p className="text-[18px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>
            {r.careCase?.caseTitle || "Dossier"}
          </p>
          <p className="text-[13px] text-[#64748B] mt-0.5">{r.careCase?.caseType}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border", statusMeta.badgeClass)}>
              {statusMeta.label}
            </span>
            {r.priority !== "ROUTINE" && (
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", getPriorityMeta(r.priority).badgeClass)}>
                {getPriorityMeta(r.priority).label}
              </span>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-3">Progression</p>
          <div className="space-y-3">
            {STEPPER_STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                      isDone ? "bg-[#059669]" : isCurrent ? "bg-[#4F46E5] ring-4 ring-[#EEF2FF]" : "bg-[#E2E8F0]"
                    )}>
                      {isDone ? <Check size={12} className="text-white" /> : <div className={cn("w-2 h-2 rounded-full", isCurrent ? "bg-white" : "bg-[#94A3B8]")} />}
                    </div>
                    {i < STEPPER_STEPS.length - 1 && <div className={cn("w-px h-4 mt-1", isDone ? "bg-[#059669]" : "bg-[#E2E8F0]")} />}
                  </div>
                  <p className={cn("text-[13px] pt-0.5", isDone ? "text-[#059669] font-medium" : isCurrent ? "text-[#4F46E5] font-semibold" : "text-[#CBD5E1]")}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical reason */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2">Motif clinique</p>
          <p className="text-[13px] text-[#374151] leading-relaxed">{r.clinicalReason}</p>
          {r.urgencyNote && (
            <p className="text-[13px] text-amber-700 mt-2 bg-amber-50 rounded-lg p-2">{r.urgencyNote}</p>
          )}
        </div>

        {/* Sender */}
        {r.sender && (
        <div className="bg-[#F8FAFC] rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2">Envoyé par</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
              {initials(`${r.sender.firstName ?? ""} ${r.sender.lastName ?? ""}`)}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#0F172A]">{r.sender.firstName} {r.sender.lastName}</p>
            </div>
          </div>
        </div>
        )}

        {/* Target provider */}
        {r.targetProvider?.person && (
          <div className="bg-[#F8FAFC] rounded-xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2">Destinataire</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #059669 0%, #10B981 100%)" }}>
                {initials(`${r.targetProvider.person.firstName ?? ""} ${r.targetProvider.person.lastName ?? ""}`)}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0F172A]">{r.targetProvider.person.firstName} {r.targetProvider.person.lastName}</p>
                {r.targetProvider.specialties && r.targetProvider.specialties.length > 0 && (
                  <p className="text-[12px] text-[#64748B]">{r.targetProvider.specialties[0]}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Response note */}
        {r.responseNote && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2">Réponse</p>
            <p className="text-[13px] text-[#374151] leading-relaxed">{r.responseNote}</p>
          </div>
        )}

        {/* Dates */}
        <div className="text-[12px] text-[#94A3B8] space-y-1">
          <p>Créé : {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          {r.respondedAt && <p>Répondu : {new Date(r.respondedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>}
          {r.desiredAppointmentDate && <p>RDV souhaité : {new Date(r.desiredAppointmentDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>}
        </div>

        {/* Modale inline — Accepter */}
        {acceptOpen && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-4 space-y-3">
            <p className="text-sm font-semibold text-green-800">Accepter cet adressage</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#374151]">Proposer un créneau (optionnel)</label>
              <input
                type="datetime-local"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#374151]">Note pour l&apos;émetteur (optionnel)</label>
              <textarea
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                rows={2}
                placeholder="Ex: Disponible mardi prochain..."
                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAcceptOpen(false)} className="flex-1 py-2 text-xs border rounded-lg hover:bg-white transition">Annuler</button>
              <button
                onClick={() => {
                  respondMutation.mutate({
                    decision: "ACCEPTED",
                    responseNote: responseNote || undefined,
                    proposedDate: proposedDate ? new Date(proposedDate).toISOString() : undefined,
                  });
                  toast.success("Adressage accepté");
                }}
                disabled={respondMutation.isPending}
                className="flex-1 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {respondMutation.isPending ? "..." : "Confirmer"}
              </button>
            </div>
          </div>
        )}

        {/* Modale inline — Décliner */}
        {declineOpen && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-800">Décliner cet adressage</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#374151]">Motif du refus *</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
                placeholder="Indiquez pourquoi vous ne pouvez pas prendre en charge ce patient..."
                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeclineOpen(false)} className="flex-1 py-2 text-xs border rounded-lg hover:bg-white transition">Annuler</button>
              <button
                onClick={() => {
                  if (!declineReason.trim()) { toast.error("Motif obligatoire"); return; }
                  respondMutation.mutate({ decision: "DECLINED", responseNote: declineReason });
                  toast.success("Adressage décliné");
                }}
                disabled={respondMutation.isPending || !declineReason.trim()}
                className="flex-1 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {respondMutation.isPending ? "..." : "Décliner"}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation annulation */}
        {cancelConfirm && (
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-800">Annuler cet adressage ?</p>
            <p className="text-xs text-amber-700">Cette action est irréversible. Le destinataire sera notifié.</p>
            <div className="flex gap-2">
              <button onClick={() => setCancelConfirm(false)} className="flex-1 py-2 text-xs border rounded-lg hover:bg-white transition">Non, garder</button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex-1 py-2 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
              >
                {cancelMutation.isPending ? "..." : "Oui, annuler"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {isPending && !acceptOpen && !declineOpen && !cancelConfirm && (
        <div className="px-5 py-4 border-t border-[#E8ECF4] space-y-2 shrink-0">
          {direction === "received" && (
            <>
              <button
                onClick={() => setAcceptOpen(true)}
                className="w-full py-2.5 rounded-lg bg-[#4F46E5] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#4338CA] transition"
              >
                <Check size={14} /> Accepter
              </button>
              <button
                onClick={() => setDeclineOpen(true)}
                className="w-full py-2 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 transition flex items-center justify-center gap-1.5"
              >
                <X size={14} /> Décliner
              </button>
            </>
          )}
          {direction === "sent" && (
            <button
              onClick={() => setCancelConfirm(true)}
              className="w-full py-2 rounded-lg text-[13px] font-medium text-amber-600 border border-amber-200 hover:bg-amber-50 transition flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Annuler cet adressage
            </button>
          )}
        </div>
      )}
    </div>
  );
}
