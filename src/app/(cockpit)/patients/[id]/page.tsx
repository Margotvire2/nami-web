"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, CareCaseDetail, Gap, GapAnalysis, SummaryResult, Appointment, JournalEntry, Document, Message, Referral, Alert, observationsApi, type ObservationInput, type PathwayMetric, type DeltaObservation, type LatestObservation } from "@/lib/api";
import { KEY_TO_METRIC, interpretValue, EXAM_TYPE_LABELS } from "@/lib/metricCatalog";
import { getStatusMeta, getPriorityMeta } from "@/lib/referrals";
import { ClinicalLifeline as NewClinicalLifeline } from "@/components/nami/clinical-lifeline";
import { PatientOverview } from "@/components/nami/patient-overview";
import { ObservationForm } from "@/components/nami/observation-form";
import { TrajectoryView } from "@/components/nami/TrajectoryView";
import { useRecording } from "@/contexts/RecordingContext";
import { PatientJournalView } from "./PatientJournalView";
import { ClinicalTimeline } from "./ClinicalTimeline";
import { ProtocolBanner } from "@/components/protocol/ProtocolBanner";
import { SuiviTab as SuiviTabNew } from "@/components/patient/SuiviTab";
import { ObservationDashboard } from "@/components/nami/observation-dashboard";
import { LikertQuestionnaire } from "@/components/nami/LikertQuestionnaire";
import { QUESTIONNAIRE_CATALOG, getBand, BAND_COLORS } from "@/lib/scoring/questionnaire-scoring";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { use } from "react";
import Link from "next/link";
import {
  ChevronLeft, Clock, Activity as ActivityIcon, FileText, Users, CheckSquare,
  CalendarDays, MessageSquare, BookOpen, Bell, Sparkles,
  ArrowLeftRight, CalendarPlus, CheckCircle2, AlertTriangle,
  User, ChevronRight, Crosshair, Send, CornerDownRight, TrendingUp, Mic, Loader2, Trash2,
} from "lucide-react";

import { useTimeline } from "@/hooks/useTimeline";
import { track } from "@/lib/track";
import { ReferralModal } from "./referral-modal";
import { QuickTaskModal } from "./QuickTaskModal";
import { QuickMessageModal } from "./QuickMessageModal";
import {
  type TimelineEvent,
  TIMELINE_CATEGORIES,
  getRegistryEntry,
  filterByCategory,
} from "@/lib/timeline";

// ─── Constantes journal ──────────────────────────────────────────────────────

const JOURNAL_STYLE: Record<string, { color: string; icon: string; label: string }> = {
  MEAL:              { color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: "🍽", label: "Repas" },
  EMOTION:           { color: "text-blue-600 bg-blue-50 border-blue-200", icon: "💬", label: "Émotion" },
  SYMPTOM:           { color: "text-orange-600 bg-orange-50 border-orange-200", icon: "⚠️", label: "Symptôme" },
  NOTE:              { color: "text-slate-600 bg-slate-50 border-slate-200", icon: "📝", label: "Note" },
  PHYSICAL_ACTIVITY: { color: "text-purple-600 bg-purple-50 border-purple-200", icon: "🏃", label: "Activité" },
};

const LOCATION_LABEL: Record<string, string> = {
  IN_PERSON: "Présentiel",
  VIDEO: "Visio",
  PHONE: "Téléphone",
};

const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
};

// ─── Constantes UI ───────────────────────────────────────────────────────────

const RISK_BADGE: Record<string, string> = {
  CRITICAL: "bg-severity-critical-bg text-severity-critical-foreground border-severity-critical-border",
  HIGH:     "bg-severity-high-bg text-severity-high-foreground border-severity-high-border",
  MEDIUM:   "bg-severity-warning-bg text-severity-warning-foreground border-severity-warning-border",
  LOW:      "bg-severity-success-bg text-severity-success-foreground border-severity-success-border",
  UNKNOWN:  "bg-muted text-muted-foreground border-border",
};
const RISK_LABEL: Record<string, string> = {
  CRITICAL: "Critique", HIGH: "Élevé", MEDIUM: "Modéré", LOW: "Faible", UNKNOWN: "Inconnu",
};
const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "text-severity-critical", HIGH: "text-severity-high",
  WARNING: "text-severity-warning", INFO: "text-severity-info",
};
const GAP_BADGE: Record<string, string> = {
  CRITICAL: "bg-severity-critical-bg text-severity-critical-foreground border-severity-critical-border",
  HIGH:     "bg-severity-high-bg text-severity-high-foreground border-severity-high-border",
  WARNING:  "bg-severity-warning-bg text-severity-warning-foreground border-severity-warning-border",
  INFO:     "bg-severity-info-bg text-severity-info-foreground border-severity-info-border",
};
const PRIORITY_STYLE: Record<string, string> = {
  URGENT: "text-severity-critical font-semibold", HIGH: "text-severity-high",
  MEDIUM: "text-severity-warning", LOW: "text-muted-foreground",
};
const VIGILANCE_LABEL: Record<string, string> = {
  CRITICAL: "Très élevé", HIGH: "Élevé", MEDIUM: "Modéré", LOW: "Faible", UNKNOWN: "Non évalué",
};
const VIGILANCE_STYLE: Record<string, string> = {
  CRITICAL: "text-severity-critical", HIGH: "text-severity-high",
  MEDIUM: "text-severity-warning", LOW: "text-severity-success", UNKNOWN: "text-muted-foreground",
};

// ─── Helpers dates ───────────────────────────────────────────────────────────

function dateFr(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
function dateFrShort(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function daysAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days}j`;
}

const STAGE_LABELS: Record<string, string> = {
  evaluation: "Évaluation initiale", stabilization: "Stabilisation",
  weight_recovery: "Reprise pondérale", restructuring: "Restructuration alimentaire",
  consolidation: "Consolidation", autonomy: "Autonomie",
  bilan_m0: "Bilan initial", intensive_m0_m6: "Phase intensive",
  consolidation_m6_m12: "Consolidation", reinforced_m12_m18: "Suivi renforcé",
  autonomous_m18_m24: "Suivi autonome", maintenance: "Maintien",
  crisis_reduction: "Réduction des crises", food_structuring: "Structuration alimentaire",
  emotional_work: "Travail émotionnel", relapse_prevention: "Prévention rechute",
}

// ─── Navigation ──────────────────────────────────────────────────────────────

type Section = "overview" | "suivi" | "trajectoire" | "timeline" | "notes" | "journal" | "documents" | "messages" | "biologie";

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "overview",     label: "Vue d'ensemble",  icon: <ActivityIcon size={13} /> },
  { key: "suivi",        label: "Suivi",            icon: <Crosshair size={13} /> },
  { key: "biologie",     label: "Biologie",         icon: <ArrowLeftRight size={13} /> },
  { key: "trajectoire",  label: "Trajectoire",      icon: <TrendingUp size={13} /> },
  { key: "timeline",     label: "Timeline",         icon: <Clock size={13} /> },
  { key: "notes",        label: "Notes",             icon: <FileText size={13} /> },
  { key: "journal",      label: "Journal patient",   icon: <BookOpen size={13} /> },
  { key: "documents",    label: "Documents",         icon: <FileText size={13} /> },
  { key: "messages",     label: "Messagerie",        icon: <MessageSquare size={13} /> },
];

// ═════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════════════════

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const [section, setSection] = useState<Section>("overview");
  const [noteOpen, setNoteOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const { startRecording } = useRecording();

  const { data: careCase, isLoading } = useQuery({
    queryKey: ["care-case", id],
    queryFn: () => api.careCases.get(id),
  });

  useEffect(() => {
    if (careCase) track.patientOpened({ patientId: careCase.patient.id });
  }, [careCase]);

  if (isLoading) return <DetailSkeleton />;
  if (!careCase) return <div className="p-8 text-sm text-muted-foreground">Dossier introuvable.</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PatientHeader careCase={careCase} onAddNote={() => setNoteOpen(true)} onReferral={() => setReferralOpen(true)} onTask={() => setTaskModalOpen(true)} onMessage={() => setSection("messages")} onRecord={() => startRecording(id, `${careCase.patient.firstName} ${careCase.patient.lastName}`)} careCaseId={id} api={api} />
      <DeltaBanner careCaseId={id} />
      {noteOpen && <NoteInline careCaseId={id} api={api} onClose={() => setNoteOpen(false)} />}
      <ReferralModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        careCaseId={id}
        patientFirstName={careCase.patient?.firstName ?? "le patient"}
        senderRoleType="PROVIDER"
      />
      {taskModalOpen && (
        <QuickTaskModal careCaseId={id} patientName={`${careCase.patient.firstName} ${careCase.patient.lastName}`} onClose={() => setTaskModalOpen(false)} />
      )}
      {messageModalOpen && (
        <QuickMessageModal careCaseId={id} patientName={`${careCase.patient.firstName} ${careCase.patient.lastName}`} onClose={() => setMessageModalOpen(false)} />
      )}
      {/* Recording widget is now global — see RecordingWidget in cockpit layout */}

      {/* ── Onglets (5 max) ── */}
      <nav className="bg-card border-b px-6 shrink-0 flex">
        {NAV.map((item) => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              section === item.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* ── Contenu ── */}
      <div className="flex-1 overflow-auto">
        {section === "overview" ? (
          <div className="h-full flex overflow-auto">
            {/* Colonne 1 — Résumé dossier */}
            <div className="flex-1 overflow-y-auto border-r p-5 space-y-5">
              <ClinicalSummaryCard careCase={careCase} careCaseId={id} api={api} />
              {/* CompletenessIndicators supprimé — remplacé par alertes cliniques */}
              <CareTeamCompact careCaseId={id} api={api} careCase={careCase} />
              <LatestBioCard
                careCaseId={id}
                patientSex={careCase.patient.sex as "MALE" | "FEMALE" | undefined}
                patientAge={careCase.patient.birthDate ? Math.floor((Date.now() - new Date(careCase.patient.birthDate).getTime()) / (365.25 * 24 * 3600000)) : undefined}
              />
            </div>

            {/* Colonne 2 — Timeline clinique */}
            <div className="flex-1 overflow-y-auto border-r p-5">
              <CompactTimelineView careCaseId={id} careCase={careCase} />
            </div>

            {/* Colonne 3 — À faire maintenant */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <UrgentTasksColumn careCaseId={id} api={api} />
              <UpcomingAppointmentsColumn careCaseId={id} api={api} />
            </div>
          </div>
        ) : section === "timeline" ? (
          <div className="h-full overflow-y-auto p-6">
            <ProtocolBanner careCaseId={id} />
            <ClinicalTimeline careCaseId={id} startDate={careCase.startDate} />
          </div>
        ) : section === "notes" ? (
          <div className="h-full overflow-y-auto">
            <NotesSection careCaseId={id} api={api} />
          </div>
        ) : section === "journal" ? (
          <div className="h-full overflow-y-auto">
            <PatientJournalView careCaseId={id} pathwayName={careCase.caseTitle} currentPhase={careCase.careStage ?? undefined} />
          </div>
        ) : section === "documents" ? (
          <div className="h-full overflow-y-auto">
            <DocumentsSection careCaseId={id} api={api} patientFirstName={careCase.patient.firstName} />
          </div>
        ) : section === "suivi" ? (
          <div className="h-full overflow-y-auto">
            <SuiviTabNew
              careCaseId={id}
              pathwayKey={careCase.pathwayTemplateId ?? "default"}
              personId={careCase.patient.id}
              patient={{ firstName: careCase.patient.firstName, lastName: careCase.patient.lastName, birthDate: careCase.patient.birthDate ?? null, sex: careCase.patient.sex ?? undefined }}
              height={careCase.height}
              napValue={careCase.napValue}
              napDescription={careCase.napDescription}
            />
          </div>
        ) : section === "biologie" ? (
          <div className="h-full overflow-y-auto p-6">
            <LaboDeltaSection careCaseId={id} />
          </div>
        ) : section === "trajectoire" ? (
          <div className="h-full overflow-y-auto p-6">
            <TrajectoireSection careCaseId={id} />
          </div>
        ) : section === "messages" ? (
          <div className="h-full overflow-hidden flex flex-col">
            <MessagesSection careCaseId={id} api={api} patientName={`${careCase.patient.firstName} ${careCase.patient.lastName}`} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Col 1 : Indicateurs de complétude ──────────────────────────────────────

function CompletenessIndicators({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data: gaps } = useQuery({
    queryKey: ["care-gaps", careCaseId],
    queryFn: () => api.intelligence.careGaps(careCaseId),
  });
  const { data: alerts } = useQuery({
    queryKey: ["alerts", careCaseId],
    queryFn: () => api.alerts.list(careCaseId),
  });
  const openAlerts = (alerts ?? []).filter((a) => a.status === "OPEN");

  // Completeness checklist based on alerts + gaps
  const items: { label: string; ok: boolean }[] = [];

  // Check for missing bio
  const hasBioAlert = openAlerts.some((a) => a.alertType === "MISSING_DOCUMENT");
  items.push({ label: "Bilan biologique à jour", ok: !hasBioAlert });

  // Check for upcoming appointment
  const hasRdvAlert = openAlerts.some((a) => a.alertType === "NO_FOLLOW_UP_SCHEDULED");
  items.push({ label: "Prochain RDV planifié", ok: !hasRdvAlert });

  // Check for team
  const hasTeamAlert = openAlerts.some((a) => a.alertType === "INCOMPLETE_CARE_TEAM");
  items.push({ label: "Équipe pluridisciplinaire", ok: !hasTeamAlert });

  // Check for overdue tasks
  const hasTaskAlert = openAlerts.some((a) => a.alertType === "OVERDUE_TASK");
  items.push({ label: "Tâches à jour", ok: !hasTaskAlert });

  // Gap-based indicators
  const gapItems = (gaps?.gaps ?? []).slice(0, 3);
  for (const gap of gapItems) {
    if (!items.some((i) => i.label.includes(gap.title.split(" ")[0]))) {
      items.push({ label: gap.title, ok: false });
    }
  }

  return (
    <BlockTitle title="Complétude du dossier" icon={<Crosshair size={13} />}
      sub="Indicateurs de complétude — non cliniques"
    >
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full shrink-0 ${item.ok ? "bg-green-500" : "bg-amber-400"}`} />
            <span className={item.ok ? "text-muted-foreground" : "text-foreground font-medium"}>{item.label}</span>
            {!item.ok && (
              <span title="Indicateur de complétude du dossier — non clinique" className="text-muted-foreground/40 cursor-help text-[10px]">ⓘ</span>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-green-600 font-medium">Tous les éléments sont à jour</p>}
      </div>
    </BlockTitle>
  );
}

// ── Col 1 : Équipe compacte ────────────────────────────────────────────────

function CareTeamCompact({ careCaseId, api, careCase }: {
  careCaseId: string; api: ReturnType<typeof apiWithToken>; careCase: CareCaseDetail;
}) {
  const { data } = useQuery({ queryKey: ["team", careCaseId], queryFn: () => api.team.list(careCaseId) });
  const members = data ?? [];

  return (
    <BlockTitle title="Équipe de soin" icon={<Users size={13} />} sub={`${members.length} membre${members.length > 1 ? "s" : ""}`}>
      {members.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun membre — <Link href="/adressages" className="text-primary hover:underline">adresser un confrère</Link></p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {m.person.firstName[0]}{m.person.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{m.person.firstName} {m.person.lastName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{m.roleInCase}</p>
              </div>
            </div>
          ))}
          <Link href="/equipe" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 mt-2">
            Gérer l&apos;équipe <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </BlockTitle>
  );
}

// ── Col 3 : Tâches urgentes ────────────────────────────────────────────────

function UrgentTasksColumn({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["tasks", careCaseId], queryFn: () => api.tasks.list(careCaseId) });
  const toggle = useMutation({
    mutationFn: (taskId: string) => api.tasks.update(careCaseId, taskId, { status: "COMPLETED" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", careCaseId] }),
  });

  const pending = (data ?? [])
    .filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED")
    .sort((a, b) => {
      // Overdue first, then by priority
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date() ? 1 : 0;
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date() ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      const prio = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3);
    })
    .slice(0, 3);

  return (
    <BlockTitle title="À faire maintenant" icon={<CheckSquare size={13} />} sub={`${pending.length} tâche${pending.length > 1 ? "s" : ""} prioritaire${pending.length > 1 ? "s" : ""}`}>
      {pending.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucune tâche en attente</p>
      ) : (
        <div className="space-y-2.5">
          {pending.map((t) => {
            const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
            return (
              <div key={t.id} className={`flex items-start gap-2.5 rounded-lg border p-3 ${isOverdue ? "border-amber-300 bg-amber-50/50" : "bg-white"}`}>
                <input type="checkbox" className="mt-0.5 accent-primary shrink-0 cursor-pointer" onChange={() => toggle.mutate(t.id)} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-snug">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    {t.dueDate && (
                      <span className={`flex items-center gap-0.5 ${isOverdue ? "text-amber-700 font-semibold" : ""}`}>
                        <Clock size={9} /> {new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        {isOverdue && " (en retard)"}
                      </span>
                    )}
                    <span className={PRIORITY_STYLE[t.priority]}>{t.priority}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <Link href="#" onClick={(e) => { e.preventDefault(); }} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
            Voir toutes les tâches <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </BlockTitle>
  );
}

// ── Col 3 : Prochains RDV ──────────────────────────────────────────────────

function UpcomingAppointmentsColumn({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data } = useQuery({
    queryKey: ["appointments", careCaseId],
    queryFn: () => api.appointments.list({ careCaseId }),
  });
  const upcoming = (data ?? [])
    .filter((a) => new Date(a.startAt) > new Date() && a.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 2);

  return (
    <BlockTitle title="Prochains RDV" icon={<CalendarDays size={13} />}>
      {upcoming.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun RDV à venir — <Link href="/agenda" className="text-primary hover:underline">planifier</Link></p>
      ) : (
        <div className="space-y-1.5">
          {upcoming.map((a) => <AppointmentRow key={a.id} appointment={a} />)}
          <Link href="/agenda" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
            Voir l&apos;agenda <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </BlockTitle>
  );
}

// ── Col 3 : Dernier message de coordination ─────────────────────────────────

function LatestMessageColumn({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data: messages } = useQuery({
    queryKey: ["messages", careCaseId],
    queryFn: () => api.messages.list(careCaseId),
  });
  const lastMsg = messages?.length ? messages[messages.length - 1] : null;
  const totalCount = messages?.length ?? 0;

  return (
    <BlockTitle title="Coordination" icon={<MessageSquare size={13} />} sub={totalCount > 0 ? `${totalCount} message${totalCount > 1 ? "s" : ""}` : undefined}>
      {!lastMsg ? (
        <p className="text-xs text-muted-foreground">Aucun message — démarrez la coordination avec l&apos;équipe</p>
      ) : (
        <div className="rounded-lg border bg-white p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
              {lastMsg.sender.firstName[0]}{lastMsg.sender.lastName[0]}
            </div>
            <p className="text-[11px] font-medium">{lastMsg.sender.firstName} {lastMsg.sender.lastName}</p>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {new Date(lastMsg.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{lastMsg.body}</p>
          <Link href="/messages" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
            Voir la conversation <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </BlockTitle>
  );
}

// ─── Latest Bio Card (overview column) ───────────────────────────────────────

const INTERP_DOT: Record<string, string> = {
  green: "bg-emerald-500", orange: "bg-amber-500", red: "bg-red-500", gray: "bg-gray-300",
};
const INTERP_BADGE: Record<string, string> = {
  green: "text-emerald-600 bg-emerald-50", orange: "text-amber-600 bg-amber-50",
  red: "text-red-600 bg-red-50", gray: "text-gray-400",
};

function LatestBioCard({ careCaseId, patientSex, patientAge }: {
  careCaseId: string; patientSex?: "MALE" | "FEMALE"; patientAge?: number;
}) {
  const { accessToken } = useAuthStore();
  const { data } = useQuery({
    queryKey: ["observations-latest", careCaseId],
    queryFn: () => observationsApi.latest(accessToken!, careCaseId),
    enabled: !!accessToken,
  });

  const latest = data?.latest ?? {};
  const allObs = Object.values(latest).flat();
  if (allObs.length === 0) return null;

  // Group by examType from catalog
  const grouped: Record<string, (LatestObservation & { interp: ReturnType<typeof interpretValue> })[]> = {};
  for (const o of allObs) {
    const def = KEY_TO_METRIC[o.metricKey];
    const numVal = typeof o.value === "number" ? o.value : null;
    const interp = def && numVal != null
      ? interpretValue(numVal, def, patientSex, patientAge)
      : { color: "gray" as const, label: "—", rangeStr: "" };
    const group = def ? (EXAM_TYPE_LABELS[def.examType]?.label ?? def.category) : "Autres";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push({ ...o, interp });
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Derniers résultats</h3>
      {Object.entries(grouped).map(([group, obs]) => (
        <div key={group}>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">{group}</p>
          <div className="space-y-0.5">
            {obs.map((o) => {
              const def = KEY_TO_METRIC[o.metricKey];
              return (
                <div key={o.metricKey} className="flex items-center gap-2 text-sm py-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${INTERP_DOT[o.interp.color]}`} />
                  <span className="text-muted-foreground truncate flex-1 text-xs">{def?.label ?? o.label}</span>
                  <span className="font-semibold whitespace-nowrap tabular-nums text-xs">
                    {typeof o.value === "boolean" ? (o.value ? "Oui" : "Non") : o.value}
                    {(o.unit || def?.unit) && (
                      <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{o.unit ?? def?.unit}</span>
                    )}
                  </span>
                  {o.interp.rangeStr && (
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">({o.interp.rangeStr})</span>
                  )}
                  {o.interp.label !== "—" && (
                    <span className={`text-[9px] font-medium px-1 py-0.5 rounded whitespace-nowrap ${INTERP_BADGE[o.interp.color]}`}>
                      {o.interp.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Delta Banner ────────────────────────────────────────────────────────────

function DeltaBanner({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore();
  const { data } = useQuery({
    queryKey: ["observations-delta", careCaseId],
    queryFn: () => observationsApi.delta(accessToken!, careCaseId),
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  if (!data?.deltas?.length || !data.referenceDate) return null;

  const refDate = new Date(data.referenceDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <div className="bg-muted/50 border-b px-8 py-2 flex items-center gap-2 text-xs text-muted-foreground">
      <TrendingUp size={12} className="shrink-0" />
      <span className="font-medium">Depuis le {refDate} :</span>
      <div className="flex items-center gap-3 flex-wrap">
        {data.deltas.slice(0, 6).map((d) => {
          const sign = d.direction === "up" ? "+" : d.direction === "down" ? "" : "";
          const arrow = d.direction === "up" ? "↑" : d.direction === "down" ? "↓" : "→";
          const color = d.direction === "stable"
            ? "text-muted-foreground"
            : d.metricKey === "weight" || d.metricKey === "bmi"
              ? d.direction === "up" ? "text-orange-600" : "text-emerald-600"
              : d.metricKey === "eat26_score" || d.metricKey === "phq9_score"
                ? d.direction === "down" ? "text-emerald-600" : "text-orange-600"
                : "text-blue-600";

          return (
            <span key={d.metricKey} className={color}>
              {d.label} {sign}{d.delta}{d.unit ? ` ${d.unit}` : ""} {arrow}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PatientHeader({ careCase: c, onAddNote, onReferral, onTask, onMessage, onRecord, careCaseId, api }: {
  careCase: CareCaseDetail; onAddNote: () => void; onReferral: () => void; onTask: () => void; onMessage: () => void; onRecord: () => void;
  careCaseId: string; api: ReturnType<typeof apiWithToken>;
}) {
  const qc = useQueryClient();
  const { accessToken } = useAuthStore();
  const [aiStreaming, setAiStreaming] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleAiSummarize = useCallback(() => {
    if (!accessToken) return;
    setAiStreaming(true);
    const es = new EventSource(
      `${API_URL}/intelligence/summarize-stream/${careCaseId}?token=${encodeURIComponent(accessToken)}`
    );
    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        es.close();
        setAiStreaming(false);
        qc.invalidateQueries({ queryKey: ["care-case", careCaseId] });
        qc.invalidateQueries({ queryKey: ["notes", careCaseId] });
        qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
        toast.success("Résumé IA généré");
      }
    };
    es.onerror = () => { es.close(); setAiStreaming(false); toast.error("Erreur lors de la génération"); };
  }, [accessToken, careCaseId, qc, API_URL]);

  return (
    <header className="bg-card px-8 py-6 shrink-0">
      <Link href="/patients" className="flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground mb-3 w-fit transition-colors">
        <ChevronLeft size={12} /> Patients
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {c.patient.firstName[0]}{c.patient.lastName[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-page-title">{c.patient.firstName} {c.patient.lastName}</h1>
              {c.patient.birthDate && (
                <span className="text-xs text-muted-foreground">
                  {Math.floor((Date.now() - new Date(c.patient.birthDate).getTime()) / (365.25 * 24 * 3600000))} ans
                </span>
              )}
              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${RISK_BADGE[c.riskLevel]}`}>
                {RISK_LABEL[c.riskLevel]}
              </span>
              <span className="text-xs border rounded px-1.5 py-0.5 text-muted-foreground">{c.caseType}</span>
              {c.careStage && <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">{STAGE_LABELS[c.careStage] ?? c.careStage}</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {c.leadProvider && (
                <span className="text-xs text-muted-foreground">Lead : {c.leadProvider.person.firstName} {c.leadProvider.person.lastName}</span>
              )}
              {c.nextStepSummary && (
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {c.nextStepSummary}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5" onClick={onAddNote}><FileText size={12} /> Note</Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5" onClick={onTask}><CheckSquare size={12} /> Tâche</Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5" onClick={onReferral}><ArrowLeftRight size={12} /> Adresser</Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5" onClick={onMessage}><MessageSquare size={12} /> Message</Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5 text-red-600 border-red-200 hover:bg-red-50" onClick={onRecord}><Mic size={12} /> Enregistrer</Button>
          <Link href="/agenda"><Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5"><CalendarPlus size={12} /> RDV</Button></Link>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5"
            onClick={handleAiSummarize} disabled={aiStreaming}>
            <Sparkles size={12} /> {aiStreaming ? "Génération…" : "Résumé IA"}
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Note inline ──────────────────────────────────────────────────────────────

function NoteInline({ careCaseId, api, onClose }: {
  careCaseId: string; api: ReturnType<typeof apiWithToken>; onClose: () => void;
}) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const create = useMutation({
    mutationFn: () => api.notes.create(careCaseId, { noteType: "EVOLUTION", body }),
    onSuccess: () => {
      ["timeline", "notes", "care-case"].forEach((k) => qc.invalidateQueries({ queryKey: [k, careCaseId] }));
      track.noteCreated({ patientId: careCaseId, noteType: "EVOLUTION" });
      toast.success("Note ajoutée"); onClose();
    },
    onError: () => toast.error("Erreur"),
  });

  return (
    <div className="border-b bg-white px-6 py-3 shrink-0">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Nouvelle note clinique</p>
        <Textarea placeholder="Rédiger une note…" value={body} onChange={(e) => setBody(e.target.value)} rows={3} autoFocus className="text-sm resize-none" />
        <div className="flex gap-2">
          <Button size="sm" className="text-xs h-7" disabled={!body.trim() || create.isPending} onClick={() => create.mutate()}>
            {create.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TIMELINE — wrapper pour le nouveau composant ClinicalLifeline
// ═════════════════════════════════════════════════════════════════════════════

function TimelineTab({ careCaseId, careCase }: {
  careCaseId: string; careCase: CareCaseDetail;
}) {
  const { data: timeline, isLoading } = useTimeline(careCaseId, careCase);

  if (!timeline) return (
    <div className="p-6">
      <NewClinicalLifeline events={[]} trajectory={[]} summary={{ startDate: careCase.startDate, totalEvents: 0, vigilanceLevel: "low" }} isLoading={isLoading} />
    </div>
  );

  return (
    <div className="p-6">
      <NewClinicalLifeline events={timeline.events} trajectory={timeline.trajectory} summary={timeline.summary} />
    </div>
  );
}

function ClinicalSummaryCard({ careCase: c, careCaseId }: {
  careCase: CareCaseDetail; careCaseId: string; api: ReturnType<typeof apiWithToken>;
}) {
  const qc = useQueryClient();
  const { accessToken } = useAuthStore();
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const displayedSummary = isStreaming ? streamText : (c.clinicalSummary ?? "");

  const handleStream = useCallback(() => {
    if (!accessToken) return;
    setIsStreaming(true);
    setStreamText("");

    const es = new EventSource(
      `${API_URL}/intelligence/summarize-stream/${careCaseId}?token=${encodeURIComponent(accessToken)}`
    );

    const startedAt = Date.now();

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        es.close();
        setIsStreaming(false);
        qc.invalidateQueries({ queryKey: ["care-case", careCaseId] });
        qc.invalidateQueries({ queryKey: ["notes", careCaseId] });
        qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
        track.summaryGenerated({ patientId: careCaseId, duration_ms: Date.now() - startedAt });
        toast.success("Résumé IA généré");
        return;
      }
      try {
        const { text, error } = JSON.parse(e.data);
        if (error) {
          track.summaryError({ patientId: careCaseId, error });
          toast.error(error);
          es.close();
          setIsStreaming(false);
          return;
        }
        if (text) setStreamText((prev) => prev + text);
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      es.close();
      setIsStreaming(false);
      if (!streamText) {
        track.summaryError({ patientId: careCaseId, error: "connection_error" });
        toast.error("Erreur de connexion au résumé IA");
      }
    };
  }, [accessToken, careCaseId, qc, API_URL, streamText]);

  return (
    <BlockTitle title="Résumé clinique" icon={<Sparkles size={13} />}
      action={
        <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 text-muted-foreground"
          onClick={handleStream} disabled={isStreaming}>
          <Sparkles size={11} /> {isStreaming ? "Génération…" : c.clinicalSummary ? "Actualiser" : "Générer IA"}
        </Button>
      }
    >
      {!displayedSummary && !c.mainConcern ? (
        <div className="rounded-xl border border-dashed bg-muted/10 p-8 text-center">
          <Sparkles size={20} className="text-muted-foreground/30 mx-auto mb-2.5" />
          <p className="text-sm font-medium text-muted-foreground">Aucun résumé clinique disponible</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto leading-relaxed">
            Générez un résumé IA pour transformer le dossier en prose clinique lisible et structurée.
          </p>
          <Button size="sm" className="mt-4 text-xs gap-1.5 h-7" onClick={handleStream} disabled={isStreaming}>
            <Sparkles size={11} /> {isStreaming ? "Génération…" : "Générer le résumé"}
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {c.mainConcern && (
            <div className="rounded-xl border-l-[3px] border-primary/50 bg-primary/3 pl-4 pr-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary/60 mb-1">Situation actuelle</p>
              <p className="text-sm leading-relaxed">{c.mainConcern}</p>
            </div>
          )}
          {displayedSummary && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles size={9} /> {isStreaming ? "Génération en cours…" : "Synthèse IA — à vérifier"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {displayedSummary}
                {isStreaming && <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />}
              </p>
            </div>
          )}
        </div>
      )}
    </BlockTitle>
  );
}

// Compact timeline for overview — uses same canonical model
function CompactTimelineView({ careCaseId, careCase }: {
  careCaseId: string; careCase: CareCaseDetail;
}) {
  const { data: timeline, isLoading } = useTimeline(careCaseId, careCase);
  const items = timeline?.events.slice(0, 5) ?? [];

  return (
    <BlockTitle title="Activité récente" icon={<Clock size={13} />}>
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <ActivityIcon size={18} className="text-muted-foreground/25 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucune activité.</p>
        </div>
      ) : (
        <div>
          {items.map((event, i) => {
            const reg = getRegistryEntry(event.type);
            const Icon = reg.icon;
            const isLast = i === items.length - 1;
            return (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${reg.listStyle}`}>
                    <Icon size={12} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border/50 my-1 min-h-[10px]" />}
                </div>
                <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-4"}`}>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-sm font-medium leading-snug">{event.title}</p>
                    {event.actor && <span className="text-[11px] text-muted-foreground shrink-0">{event.actor.name}</span>}
                  </div>
                  {event.summary && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{event.summary}</p>}
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    {new Date(event.occurredAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BlockTitle>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTIONS SECONDAIRES (Notes, Équipe, Tâches, RDV, Journal)
// ═════════════════════════════════════════════════════════════════════════════

function PatientSignalsCard({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["journal", careCaseId],
    queryFn: () => api.journal.list(careCaseId),
  });

  const entries = (data ?? []).slice(0, 4);

  return (
    <BlockTitle title="Remontées patient récentes" icon={<BookOpen size={13} />}
      sub="Signaux utiles du journal"
    >
      {isLoading ? <LoadingCards /> : entries.length === 0 ? (
        <EmptyView icon={<BookOpen size={20} />} msg="Aucune entrée journal" desc="Les remontées du patient (repas, émotions, symptômes) apparaîtront ici." />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {entries.map((entry) => <JournalCard key={entry.id} entry={entry} />)}
        </div>
      )}
    </BlockTitle>
  );
}

function AppointmentsCard({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["appointments", careCaseId],
    queryFn: () => api.appointments.list({ careCaseId }),
  });

  const now = new Date();
  const upcoming = (data ?? []).filter((a) => new Date(a.startAt) > now && a.status !== "CANCELLED");
  const past = (data ?? []).filter((a) => new Date(a.startAt) <= now || a.status === "COMPLETED");

  return (
    <BlockTitle title="Rendez-vous" icon={<CalendarDays size={13} />}>
      {isLoading ? <LoadingCards /> : (data ?? []).length === 0 ? (
        <EmptyView icon={<CalendarDays size={20} />} msg="Aucun rendez-vous" desc="Les rendez-vous planifiés avec ce patient apparaîtront ici." />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">À venir</p>
              {upcoming.map((a) => <AppointmentRow key={a.id} appointment={a} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground opacity-50">Passés</p>
              {past.slice(0, 3).map((a) => <AppointmentRow key={a.id} appointment={a} past />)}
            </div>
          )}
        </>
      )}
    </BlockTitle>
  );
}

function AppointmentRow({ appointment: a, past }: { appointment: Appointment; past?: boolean }) {
  const d = new Date(a.startAt);
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${past ? "opacity-50 bg-muted/20" : "bg-white hover:bg-muted/20 transition-colors"}`}>
      <div className="text-center min-w-[44px]">
        <p className="text-sm font-bold tabular-nums">{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
        <p className="text-[10px] text-muted-foreground">{d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{a.consultationType?.name ?? "Consultation"}</p>
        <p className="text-[11px] text-muted-foreground truncate">{a.provider.person.firstName} {a.provider.person.lastName}</p>
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
        a.locationType === "VIDEO" ? "bg-blue-50 text-blue-600" :
        a.locationType === "PHONE" ? "bg-purple-50 text-purple-600" :
        "bg-muted text-muted-foreground"
      }`}>
        {LOCATION_LABEL[a.locationType] ?? a.locationType}
      </span>
    </div>
  );
}

function NotesSection({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data, isLoading } = useQuery({ queryKey: ["notes", careCaseId], queryFn: () => api.notes.list(careCaseId) });
  return (
    <div className="p-6 max-w-3xl space-y-3">
      <h2 className="text-sm font-semibold">Notes cliniques {data?.length ? <span className="text-muted-foreground font-normal">({data.length})</span> : ""}</h2>
      {isLoading ? <LoadingCards /> : !data?.length ? <EmptyView icon={<FileText size={20} />} msg="Aucune note clinique" desc="Documentez les observations et décisions cliniques pour l'équipe." /> : (
        data.map((n) => (
          <div key={n.id} className="rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-semibold uppercase">{n.noteType}{n.title ? ` — ${n.title}` : ""}</span>
              <span>{n.author.firstName} {n.author.lastName} · {new Date(n.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{n.body}</p>
          </div>
        ))
      )}
    </div>
  );
}

function EquipeSection({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data, isLoading } = useQuery({ queryKey: ["team", careCaseId], queryFn: () => api.team.list(careCaseId) });
  return (
    <div className="p-6 max-w-3xl space-y-3">
      <h2 className="text-sm font-semibold">Équipe de soin {data?.length ? <span className="text-muted-foreground font-normal">({data.length})</span> : ""}</h2>
      {isLoading ? <LoadingCards /> : !data?.length ? <EmptyView icon={<Users size={20} />} msg="Aucun membre d'équipe" desc="Adressez un confrère pour constituer l'équipe pluridisciplinaire." /> : (
        data.map((m) => (
          <div key={m.id} className="rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {m.person.firstName[0]}{m.person.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{m.person.firstName} {m.person.lastName}{m.isPrimary && <span className="ml-2 text-xs font-normal text-muted-foreground">(lead)</span>}</p>
                <p className="text-xs text-muted-foreground">{m.provider.specialties.join(", ") || m.roleInCase}</p>
              </div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded border ${
              m.status === "ACCEPTED" ? "bg-green-50 text-green-700 border-green-200" :
              m.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
              "bg-muted text-muted-foreground border-border"
            }`}>{m.roleInCase}</span>
          </div>
        ))
      )}
    </div>
  );
}

function TachesSection({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tasks", careCaseId], queryFn: () => api.tasks.list(careCaseId) });
  const toggle = useMutation({
    mutationFn: (taskId: string) => api.tasks.update(careCaseId, taskId, { status: "COMPLETED" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", careCaseId] }); toast.success("Tâche complétée"); },
  });
  const pending = (data ?? []).filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  const done = (data ?? []).filter((t) => t.status === "COMPLETED");
  return (
    <div className="p-6 max-w-3xl space-y-3">
      <h2 className="text-sm font-semibold">Tâches & prochaines étapes {pending.length > 0 ? <span className="text-muted-foreground font-normal">({pending.length} en cours)</span> : ""}</h2>
      {isLoading ? <LoadingCards /> : (
        <>
          {pending.length === 0 && done.length === 0 && <EmptyView icon={<CheckSquare size={20} />} msg="Aucune action en cours" desc="Planifiez les prochaines étapes du parcours de soin." />}
          {pending.map((t) => (
            <div key={t.id} className="rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 accent-primary cursor-pointer shrink-0" onChange={() => toggle.mutate(t.id)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className={`text-[11px] ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                  {t.dueDate && <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock size={9} />{new Date(t.dueDate).toLocaleDateString("fr-FR")}</span>}
                  {t.assignedTo && <span className="text-[11px] text-muted-foreground">→ {t.assignedTo.firstName} {t.assignedTo.lastName}</span>}
                </div>
              </div>
            </div>
          ))}
          {done.length > 0 && (
            <details><summary className="text-xs text-muted-foreground cursor-pointer">{done.length} terminée{done.length !== 1 ? "s" : ""}</summary>
              <div className="mt-2 space-y-1 opacity-50">
                {done.map((t) => <div key={t.id} className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /><p className="text-xs line-through">{t.title}</p></div>)}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function RDVSection({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["appointments", careCaseId],
    queryFn: () => api.appointments.list({ careCaseId }),
  });
  const now = new Date();
  const upcoming = (data ?? []).filter((a) => new Date(a.startAt) > now && a.status !== "CANCELLED");
  const past = (data ?? []).filter((a) => new Date(a.startAt) <= now || a.status === "COMPLETED");

  return (
    <div className="p-6 max-w-3xl space-y-3">
      <h2 className="text-sm font-semibold">Rendez-vous {data?.length ? <span className="text-muted-foreground font-normal">({data.length})</span> : ""}</h2>
      {isLoading ? <LoadingCards /> : (data ?? []).length === 0 ? <EmptyView icon={<CalendarDays size={20} />} msg="Aucun rendez-vous" desc="Les rendez-vous planifiés avec ce patient apparaîtront ici." /> : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">À venir</p>
              {upcoming.map((a) => <AppointmentRow key={a.id} appointment={a} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground opacity-50">Passés</p>
              {past.map((a) => <AppointmentRow key={a.id} appointment={a} past />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// DOCUMENTS — branchés sur api.documents.list
// ═════════════════════════════════════════════════════════════════════════════

const DOC_TYPE_STYLE_PATIENT: Record<string, { label: string; color: string }> = {
  PRESCRIPTION:         { label: "Ordonnance",        color: "text-purple-700 bg-purple-50 border-purple-200" },
  BIOLOGICAL_REPORT:    { label: "Bilan biologique",  color: "text-teal-700 bg-teal-50 border-teal-200" },
  CONSULTATION_REPORT:  { label: "Compte rendu",      color: "text-blue-700 bg-blue-50 border-blue-200" },
  HOSPITAL_REPORT:      { label: "Rapport hospitalier", color: "text-orange-700 bg-orange-50 border-orange-200" },
  LETTER:               { label: "Courrier",          color: "text-slate-600 bg-slate-50 border-slate-200" },
  IMAGING:              { label: "Imagerie",          color: "text-amber-700 bg-amber-50 border-amber-200" },
  OTHER:                { label: "Autre",             color: "text-gray-600 bg-gray-50 border-gray-200" },
};

const SUGGESTED_TYPES = [
  { label: "Ordonnance", type: "PRESCRIPTION" },
  { label: "Compte rendu", type: "CONSULTATION_REPORT" },
  { label: "Bilan biologique", type: "BIOLOGICAL_REPORT" },
  { label: "Courrier", type: "LETTER" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function DocumentsSection({ careCaseId, api, patientFirstName }: { careCaseId: string; api: ReturnType<typeof apiWithToken>; patientFirstName: string }) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState("OTHER");
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["documents", careCaseId],
    queryFn: () => api.documents.list(careCaseId),
  });

  async function handleUpload(file: File, docType: string) {
    setUploading(true);
    try {
      await api.documents.upload(careCaseId, file, file.name, docType);
      qc.invalidateQueries({ queryKey: ["documents", careCaseId] });
      toast.success("Document ajouté ✨");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  function triggerUpload(docType: string) {
    setUploadType(docType);
    fileInputRef.current?.click();
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file, uploadType);
    e.target.value = "";
  }

  async function handleDownload(docId: string) {
    try {
      const { url } = await api.documents.download(careCaseId, docId);
      window.open(url, "_blank");
    } catch {
      toast.error("Impossible de télécharger le document");
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-3">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={onFileSelected} />
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Documents {data?.length ? <span className="text-muted-foreground font-normal">({data.length})</span> : ""}
        </h2>
        {data && data.length > 0 && (
          <div className="relative group">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7" disabled={uploading}>
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
              {uploading ? "Upload…" : "Ajouter"}
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg p-1.5 hidden group-hover:block z-50 min-w-[180px]">
              {SUGGESTED_TYPES.map((t) => (
                <button key={t.type} className="w-full text-left text-xs px-3 py-1.5 rounded-md hover:bg-muted transition-colors" onClick={() => triggerUpload(t.type)}>
                  {t.label}
                </button>
              ))}
              <button className="w-full text-left text-xs px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground" onClick={() => triggerUpload("OTHER")}>
                Autre
              </button>
            </div>
          </div>
        )}
      </div>
      {/* header done above */}
      {isLoading ? <LoadingCards /> : !(data?.length) ? (
        /* ── Empty state contexte 2 : dossier patient vide ── */
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
            <FileText size={20} className="text-primary/40" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Aucun document dans ce dossier
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
            Ajoutez une ordonnance, un compte rendu ou un bilan pour le partager
            avec l&apos;équipe de {patientFirstName}.
          </p>
          {/* Chips types suggérés */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {SUGGESTED_TYPES.map((t) => (
              <button
                key={t.type}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border bg-card hover:bg-muted hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
                onClick={() => triggerUpload(t.type)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            className="text-xs gap-1.5 h-8 mt-4"
            onClick={() => triggerUpload("OTHER")}
          >
            <FileText size={12} /> Ajouter un document
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((doc) => {
            const style = DOC_TYPE_STYLE_PATIENT[doc.documentType] ?? DOC_TYPE_STYLE_PATIENT.OTHER;
            return (
              <div key={doc.id} className="rounded-xl border bg-card p-3 hover:shadow-[0_2px_8px_rgba(79,70,229,0.08)] transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${style.color}`}>
                        {style.label}
                      </span>
                      {doc.isSharedWithTeam && (
                        <span className="text-[10px] text-primary/70 flex items-center gap-0.5">
                          <Users size={9} /> Partagé
                        </span>
                      )}
                      {doc.summaryAi && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 cursor-help"
                          title="Synthèse automatique extractive. Validation humaine requise avant tout usage."
                        >
                          <Sparkles size={9} /> Brouillon IA — à vérifier
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{formatBytes(doc.sizeBytes)}</span>
                    </div>
                    {/* Titre */}
                    <p className="text-xs font-medium truncate">{doc.title}</p>
                    {/* Métadonnées */}
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {doc.uploadedBy.firstName} {doc.uploadedBy.lastName} · {daysAgo(doc.createdAt)}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      title="Télécharger"
                      onClick={() => handleDownload(doc.id)}
                    >
                      <FileText size={14} />
                    </button>
                    {(doc.documentType === "BIOLOGICAL_REPORT" ||
                      doc.title?.toLowerCase().includes("analyse") ||
                      doc.title?.toLowerCase().includes("bilan") ||
                      doc.title?.toLowerCase().includes("résultat") ||
                      doc.title?.toLowerCase().includes("biolog")) && (
                      <button
                        className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        title="Analyser avec l'IA"
                        onClick={async () => {
                          toast.info("Analyse en cours...")
                          try {
                            const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
                            let res = await fetch(`${API}/care-cases/${careCaseId}/documents/${doc.id}/extract-bio`, {
                              method: "POST",
                              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                              body: JSON.stringify({}),
                            })
                            let data = await res.json()

                            // PDF protégé → demander le mot de passe
                            if (data.needsPassword) {
                              const pwd = prompt("Ce PDF est protégé. Entrez le mot de passe :")
                              if (!pwd) return
                              toast.info("Analyse avec mot de passe...")
                              res = await fetch(`${API}/care-cases/${careCaseId}/documents/${doc.id}/extract-bio`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                                body: JSON.stringify({ pdfPassword: pwd }),
                              })
                              data = await res.json()
                              if (data.needsPassword) { toast.error("Mot de passe incorrect"); return }
                            }

                            if (res.ok) {
                              const count = data.candidates?.length ?? data.extracted ?? 0
                              toast.success(`${count} valeurs extraites ✨`)
                              qc.invalidateQueries({ queryKey: ["observations-latest"] })
                              qc.invalidateQueries({ queryKey: ["documents"] })
                              qc.invalidateQueries({ queryKey: ["care-case"] })
                              qc.invalidateQueries({ queryKey: ["observations-delta"] })
                            } else {
                              toast.error(`Erreur : ${data.error}`)
                            }
                          } catch { toast.error("Erreur d'analyse") }
                        }}
                      >
                        <Sparkles size={14} />
                      </button>
                    )}
                    <button
                      className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-destructive transition-colors"
                      title="Supprimer"
                      onClick={async () => {
                        if (!confirm("Supprimer ce document ?")) return
                        try {
                          const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
                          await fetch(`${API}/care-cases/${careCaseId}/documents/${doc.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${accessToken}` },
                          })
                          qc.invalidateQueries({ queryKey: ["documents"] })
                          toast.success("Document supprimé")
                        } catch { toast.error("Erreur de suppression") }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JournalSection({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["journal", careCaseId],
    queryFn: () => api.journal.list(careCaseId),
  });

  return (
    <div className="p-6 max-w-3xl space-y-3">
      <h2 className="text-sm font-semibold">Journal patient {data?.length ? <span className="text-muted-foreground font-normal">({data.length})</span> : ""}</h2>
      {isLoading ? <LoadingCards /> : !(data?.length) ? <EmptyView icon={<BookOpen size={20} />} msg="Aucune entrée journal" desc="Les remontées du patient (repas, émotions, symptômes) apparaîtront ici." /> : (
        <div className="grid grid-cols-2 gap-2">
          {data.map((entry) => <JournalCard key={entry.id} entry={entry} />)}
        </div>
      )}
    </div>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  const style = JOURNAL_STYLE[entry.entryType] ?? JOURNAL_STYLE.NOTE;
  const [textColor, ...bgBorder] = style.color.split(" ");
  const payload = entry.payload;

  // Derive title and detail from payload based on entry type
  let title = style.label;
  let detail = "";
  let intensity: number | undefined;

  if (entry.entryType === "MEAL") {
    title = (payload.moment as string)?.toLowerCase() === "breakfast" ? "Petit-déjeuner"
      : (payload.moment as string)?.toLowerCase() === "lunch" ? "Déjeuner"
      : (payload.moment as string)?.toLowerCase() === "dinner" ? "Dîner"
      : (payload.moment as string)?.toLowerCase() === "snack" ? "Collation"
      : "Repas";
    detail = (payload.description as string) ?? "";
  } else if (entry.entryType === "EMOTION") {
    title = (payload.emotionType as string) ?? "Émotion";
    detail = (payload.note as string) ?? (payload.trigger as string) ?? "";
    intensity = payload.intensity as number | undefined;
  } else if (entry.entryType === "SYMPTOM") {
    title = (payload.symptomType as string) ?? "Symptôme";
    detail = (payload.note as string) ?? "";
    intensity = payload.intensity as number | undefined;
  } else if (entry.entryType === "PHYSICAL_ACTIVITY") {
    title = (payload.activityName as string) ?? "Activité";
    detail = `${payload.durationMinutes ?? "?"}min` + (payload.note ? ` — ${payload.note}` : "");
  } else if (entry.entryType === "NOTE") {
    title = "Note";
    detail = (payload.content as string) ?? "";
  }

  return (
    <div className={`rounded-xl border p-3 ${bgBorder.join(" ")}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{style.icon}</span>
        <p className={`text-[11px] font-semibold ${textColor}`}>{style.label}</p>
        <span className="text-[10px] text-muted-foreground ml-auto">{daysAgo(entry.occurredAt)}</span>
      </div>
      <p className="text-xs font-medium">{title}</p>
      {detail && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{detail}</p>}
      {intensity !== undefined && (
        <div className="flex gap-0.5 mt-1.5">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= intensity! ? textColor.replace("text-", "bg-") : "bg-muted"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MESSAGES — Chat intégré par care case
// ═════════════════════════════════════════════════════════════════════════════

function MessagesSection({ careCaseId, api, patientName }: {
  careCaseId: string; api: ReturnType<typeof apiWithToken>; patientName?: string;
}) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", careCaseId],
    queryFn: () => api.messages.list(careCaseId),
  });

  const sendMutation = useMutation({
    mutationFn: () => api.messages.send(careCaseId, newMessage, replyTo?.id),
    onSuccess: () => {
      setNewMessage("");
      setReplyTo(null);
      qc.invalidateQueries({ queryKey: ["messages", careCaseId] });
      qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
    },
    onError: () => toast.error("Erreur d'envoi"),
  });

  // Auto-scroll en bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length]);

  // Mark as read
  useEffect(() => {
    if (!messages || !user) return;
    for (const msg of messages) {
      if (!msg.reads.some((r) => r.personId === user.id)) {
        api.messages.markRead(careCaseId, msg.id).catch(() => {});
      }
    }
  }, [messages, user, careCaseId, api]);

  const currentUserId = user?.id ?? "";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-3 border-b shrink-0">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare size={14} /> Messagerie d&apos;équipe
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {patientName ? `Coordination · ${patientName}` : "Fil de coordination partagé avec l'équipe"}
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : !messages?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <MessageSquare size={28} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Aucun message</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Démarrez la conversation avec l'équipe de soin.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender.id === currentUserId}
              onReply={() => setReplyTo(msg)}
              careCaseId={careCaseId}
              api={api}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Zone d'envoi */}
      <div className="border-t bg-white px-6 py-3 shrink-0">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 px-3 py-1.5 rounded-lg bg-muted/30 text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <CornerDownRight size={10} /> Réponse à {replyTo.sender.firstName}
            </span>
            <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground text-xs">Annuler</button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <Textarea
            placeholder="Écrire un message à l'équipe…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={1}
            className="text-sm resize-none flex-1 min-h-[36px] max-h-24"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
                e.preventDefault();
                sendMutation.mutate();
              }
            }}
          />
          <Button
            size="sm" className="h-9 px-3 shrink-0"
            disabled={!newMessage.trim() || sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message: msg, isOwn, onReply, careCaseId, api, currentUserId }: {
  message: Message; isOwn: boolean; onReply: () => void;
  careCaseId: string; api: ReturnType<typeof apiWithToken>; currentUserId: string;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const hasReplies = msg._count.replies > 0;

  const { data: replies } = useQuery({
    queryKey: ["messages", careCaseId, "replies", msg.id],
    queryFn: () => api.messages.list(careCaseId, msg.id),
    enabled: showReplies && hasReplies,
  });

  const ROLE_LABEL: Record<string, string> = {
    PROVIDER: "Soignant", PATIENT: "Patient", ADMIN: "Admin", ORG_ADMIN: "Admin org.",
  };

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
        isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/40 rounded-bl-md"
      }`}>
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${
              isOwn ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
            }`}>
              {msg.sender.firstName[0]}{msg.sender.lastName[0]}
            </div>
            <span className={`text-[10px] font-semibold ${isOwn ? "text-primary-foreground/80" : "text-foreground"}`}>
              {msg.sender.firstName} {msg.sender.lastName}
            </span>
            <span className={`text-[9px] ${isOwn ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
              {ROLE_LABEL[msg.sender.roleType] ?? msg.sender.roleType}
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.body}</p>
        <p className={`text-[9px] mt-1 ${isOwn ? "text-primary-foreground/40 text-right" : "text-muted-foreground/40"}`}>
          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          {" · "}
          {new Date(msg.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-0.5 px-1">
        <button onClick={onReply} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Répondre</button>
        {hasReplies && (
          <button onClick={() => setShowReplies(!showReplies)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
            <CornerDownRight size={9} /> {msg._count.replies} réponse{msg._count.replies > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {showReplies && replies && (
        <div className="ml-6 mt-1 space-y-1.5 border-l-2 border-primary/10 pl-3 max-w-[75%]">
          {replies.map((reply) => (
            <div key={reply.id} className={`rounded-xl px-3 py-2 ${
              reply.sender.id === currentUserId ? "bg-primary/10" : "bg-muted/30"
            }`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold">{reply.sender.firstName} {reply.sender.lastName}</span>
                <span className="text-[9px] text-muted-foreground">{ROLE_LABEL[reply.sender.roleType] ?? ""}</span>
              </div>
              <p className="text-xs leading-relaxed">{reply.body}</p>
              <p className="text-[9px] text-muted-foreground/40 mt-0.5">
                {new Date(reply.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PANNEAU PILOTAGE (colonne droite)
// ═════════════════════════════════════════════════════════════════════════════

function PilotagePanel({ careCaseId, careCase, api }: {
  careCaseId: string; careCase: CareCaseDetail; api: ReturnType<typeof apiWithToken>;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <ActivityIcon size={11} /> État du suivi
        </p>
        <div className="rounded-xl border bg-muted/10 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Phase actuelle</span>
            <span className="text-[11px] font-semibold">{careCase.careStage ? (STAGE_LABELS[careCase.careStage] ?? careCase.careStage) : "Non définie"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Vigilance</span>
            <span className={`text-[11px] font-semibold ${VIGILANCE_STYLE[careCase.riskLevel]}`}>
              {VIGILANCE_LABEL[careCase.riskLevel]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Dernière activité</span>
            <span className="text-[11px] font-medium">
              {careCase.lastActivityAt ? daysAgo(careCase.lastActivityAt) : "—"}
            </span>
          </div>
          {careCase.nextStepSummary && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Prochaine échéance</span>
              <span className="text-[11px] font-medium text-primary truncate ml-2 max-w-[120px]">{careCase.nextStepSummary}</span>
            </div>
          )}
        </div>
      </div>
      <NextStepsPanelRight careCaseId={careCaseId} api={api} />
      <CareTeamPanelRight careCaseId={careCaseId} api={api} careCase={careCase} />
      <CareGapsPanelRight careCaseId={careCaseId} api={api} />
      <AlertsPanelRight careCaseId={careCaseId} api={api} />
      <CoordinationBlock />
    </div>
  );
}

function NextStepsPanelRight({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["tasks", careCaseId], queryFn: () => api.tasks.list(careCaseId) });
  const toggle = useMutation({
    mutationFn: (taskId: string) => api.tasks.update(careCaseId, taskId, { status: "COMPLETED" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", careCaseId] }); qc.invalidateQueries({ queryKey: ["timeline", careCaseId] }); },
  });
  const pending = (data ?? []).filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  if (!pending.length) return null;
  return (
    <PanelSection title="Prochaines étapes" icon={<CheckSquare size={12} />} count={pending.length}>
      <div className="space-y-2.5">
        {pending.slice(0, 5).map((t) => (
          <div key={t.id} className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 accent-primary shrink-0 cursor-pointer" onChange={() => toggle.mutate(t.id)} />
            <div className="min-w-0">
              <p className="text-xs leading-snug">{t.title}</p>
              {(t.dueDate || t.assignedTo) && (
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                  {t.dueDate && <><Clock size={9} />{new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</>}
                  {t.assignedTo && <span className="truncate">{t.assignedTo.firstName} {t.assignedTo.lastName}</span>}
                </p>
              )}
            </div>
          </div>
        ))}
        {pending.length > 5 && <p className="text-[11px] text-muted-foreground">+{pending.length - 5} autres</p>}
      </div>
    </PanelSection>
  );
}

function CareTeamPanelRight({ careCaseId, api, careCase }: {
  careCaseId: string; api: ReturnType<typeof apiWithToken>; careCase: CareCaseDetail;
}) {
  const { data } = useQuery({ queryKey: ["team", careCaseId], queryFn: () => api.team.list(careCaseId) });
  const noLead = !careCase.leadProvider;
  const hasPending = (data ?? []).some((m) => m.status === "PENDING");
  return (
    <PanelSection title="Équipe de soin" icon={<Users size={12} />} count={data?.length}
      warning={noLead ? "Lead non défini" : hasPending ? "Invitation en attente" : undefined}>
      {!(data?.length) ? <p className="text-[11px] text-muted-foreground">Aucun professionnel assigné.</p> : (
        <div className="space-y-2">
          {data.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {m.person.firstName[0]}{m.person.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate">{m.person.firstName} {m.person.lastName}{m.isPrimary && <span className="text-muted-foreground font-normal"> (lead)</span>}</p>
                <p className="text-[10px] text-muted-foreground truncate">{m.provider.specialties[0] ?? m.roleInCase}</p>
              </div>
              {m.status === "PENDING" && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </PanelSection>
  );
}

function CareGapsPanelRight({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data, isLoading } = useQuery({ queryKey: ["care-gaps", careCaseId], queryFn: () => api.intelligence.careGaps(careCaseId) });
  const allGaps = data?.gaps ?? [];
  const s = data?.summary;
  if (!isLoading && allGaps.length === 0) return (
    <PanelSection title="Vigilance & gaps" icon={<AlertTriangle size={12} />}>
      <div className="flex items-center gap-1.5 text-green-600">
        <CheckCircle2 size={12} />
        <p className="text-[11px] font-medium">Aucune lacune détectée</p>
      </div>
    </PanelSection>
  );
  return (
    <PanelSection title="Vigilance & gaps" icon={<AlertTriangle size={12} />}
      count={allGaps.length} titleClass={s && (s.critical > 0 || s.high > 0) ? "text-destructive" : undefined}>
      {isLoading ? <Skeleton className="h-10 rounded" /> : (
        <div className="space-y-2">
          {/* Compteurs inline */}
          {s && (
            <div className="flex items-center gap-2 flex-wrap">
              {s.critical > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-destructive/10 text-destructive border-destructive/20">{s.critical} critique{s.critical > 1 ? "s" : ""}</span>}
              {s.high > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-orange-50 text-orange-600 border-orange-200">{s.high} élevé{s.high > 1 ? "s" : ""}</span>}
              {s.warning > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded border bg-yellow-50 text-yellow-600 border-yellow-200">{s.warning} attention</span>}
              {s.info > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded border bg-blue-50 text-blue-600 border-blue-200">{s.info} info</span>}
            </div>
          )}
          {allGaps.slice(0, 4).map((g: Gap, i: number) => (
            <div key={i} className={`rounded-lg border px-2.5 py-2 ${GAP_BADGE[g.severity]}`}>
              <p className="text-[11px] font-medium leading-snug">{g.title}</p>
              <p className="text-[10px] mt-0.5 opacity-70 line-clamp-1">{g.recommendedAction}</p>
            </div>
          ))}
          {allGaps.length > 4 && <p className="text-[11px] text-muted-foreground">+{allGaps.length - 4} autres lacunes</p>}
        </div>
      )}
    </PanelSection>
  );
}

function AlertsPanelRight({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["alerts", careCaseId], queryFn: () => api.alerts.list(careCaseId) });
  const ack = useMutation({
    mutationFn: (alertId: string) => api.alerts.update(careCaseId, alertId, { status: "ACKNOWLEDGED" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts", careCaseId] }); qc.invalidateQueries({ queryKey: ["care-case", careCaseId] }); },
  });
  const open = (data ?? []).filter((a) => a.status === "OPEN");
  if (!open.length) return null;
  return (
    <PanelSection title="Alertes actives" icon={<Bell size={12} />} count={open.length} titleClass="text-destructive">
      <div className="space-y-2">
        {open.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase ${SEVERITY_COLOR[a.severity]}`}>{a.severity}</p>
              <p className="text-[11px] leading-snug">{a.title}</p>
            </div>
            <button onClick={() => ack.mutate(a.id)} className="text-[10px] underline underline-offset-2 text-muted-foreground hover:text-foreground shrink-0">Vu</button>
          </div>
        ))}
      </div>
    </PanelSection>
  );
}

function CoordinationBlock() {
  return (
    <PanelSection title="Coordination" icon={<MessageSquare size={12} />}>
      <p className="text-[11px] text-muted-foreground mb-2">Aucun message récent sur ce dossier.</p>
      <div className="flex gap-1.5">
        <Link href="/messages" className="flex-1"><Button size="sm" variant="outline" className="text-[11px] h-6 px-2 w-full">Message</Button></Link>
        <Link href="/adressages" className="flex-1"><Button size="sm" variant="outline" className="text-[11px] h-6 px-2 w-full">Adresser</Button></Link>
      </div>
    </PanelSection>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PILOTAGE IA — Section complète (gap engine + résumé structuré)
// ═════════════════════════════════════════════════════════════════════════════

const GAP_TYPE_LABEL: Record<string, string> = {
  NO_LEAD_PROVIDER: "Pas de lead provider",
  INCOMPLETE_CARE_TEAM: "Équipe incomplète",
  NO_UPCOMING_APPOINTMENT: "Aucun RDV planifié",
  NO_RECENT_CLINICAL_NOTE: "Note clinique absente",
  NO_NEXT_STEP_DEFINED: "Pas de prochaine étape",
  OVERDUE_TASKS: "Tâches en retard",
  STALE_REFERRAL: "Adressage en attente",
  MISSING_BIOLOGICAL_REPORT: "Bilan biologique manquant",
  HIGH_RISK_UNADDRESSED: "Risque élevé non traité",
};

const SEVERITY_LABEL: Record<string, string> = {
  CRITICAL: "Critique",
  HIGH: "Élevé",
  WARNING: "Attention",
  INFO: "Information",
};

const SEVERITY_ICON_COLOR: Record<string, string> = {
  CRITICAL: "text-destructive",
  HIGH: "text-orange-600",
  WARNING: "text-yellow-600",
  INFO: "text-blue-500",
};

function PilotageIASection({ careCaseId, careCase, api }: {
  careCaseId: string; careCase: CareCaseDetail; api: ReturnType<typeof apiWithToken>;
}) {
  const qc = useQueryClient();
  const { accessToken } = useAuthStore();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Gap analysis
  const { data: gapData, isLoading: gapsLoading, refetch: refetchGaps } = useQuery({
    queryKey: ["care-gaps", careCaseId],
    queryFn: () => api.intelligence.careGaps(careCaseId),
  });

  // AI Summary — streaming SSE
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryResult | null>(null);

  const handleStreamSummary = useCallback(() => {
    if (!accessToken) return;
    setIsStreaming(true);
    setStreamText("");
    setSummaryData(null);

    const es = new EventSource(
      `${API_URL}/intelligence/summarize-stream/${careCaseId}?token=${encodeURIComponent(accessToken)}`
    );

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        es.close();
        setIsStreaming(false);
        qc.invalidateQueries({ queryKey: ["care-case", careCaseId] });
        qc.invalidateQueries({ queryKey: ["notes", careCaseId] });
        qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
        toast.success("Résumé IA généré");
        return;
      }
      try {
        const { text, error } = JSON.parse(e.data);
        if (error) {
          toast.error(error);
          es.close();
          setIsStreaming(false);
          return;
        }
        if (text) setStreamText((prev) => prev + text);
      } catch { /* ignore */ }
    };

    es.onerror = () => {
      es.close();
      setIsStreaming(false);
    };
  }, [accessToken, careCaseId, qc, API_URL]);

  const gaps = gapData?.gaps ?? [];
  const summary = gapData?.summary ?? { total: 0, critical: 0, high: 0, warning: 0, info: 0 };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles size={14} /> Pilotage IA
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analyse automatique des lacunes du parcours de soin et résumé clinique intelligent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5"
            onClick={() => refetchGaps()} disabled={gapsLoading}>
            <Crosshair size={11} /> {gapsLoading ? "Analyse…" : "Relancer l'analyse"}
          </Button>
          <Button size="sm" className="text-xs h-7 gap-1.5"
            onClick={handleStreamSummary} disabled={isStreaming}>
            <Sparkles size={11} /> {isStreaming ? "Génération…" : "Générer résumé IA"}
          </Button>
        </div>
      </div>

      {/* ── Bandeau compteurs ── */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { key: "critical", label: "Critiques", value: summary.critical, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
          { key: "high", label: "Élevés", value: summary.high, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { key: "warning", label: "Attention", value: summary.warning, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
          { key: "info", label: "Information", value: summary.info, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
        ] as const).map((s) => (
          <div key={s.key} className={`rounded-lg border px-3.5 py-3 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{gapsLoading ? "…" : s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Liste des gaps ── */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle size={12} /> Lacunes détectées
            {gaps.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-[10px]">{gaps.length}</span>}
          </p>
        </div>

        {gapsLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : gaps.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <CheckCircle2 size={24} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-700">Aucune lacune détectée</p>
            <p className="text-xs text-muted-foreground mt-1">Le parcours de soin est complet pour ce dossier.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {gaps.map((g: Gap, i: number) => (
              <div key={i} className="px-4 py-3.5 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${SEVERITY_ICON_COLOR[g.severity]}`}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${GAP_BADGE[g.severity]}`}>
                        {SEVERITY_LABEL[g.severity]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{GAP_TYPE_LABEL[g.type] ?? g.type}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{g.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{g.description}</p>
                    <div className="mt-2 flex items-start gap-1.5 bg-primary/5 rounded-md px-2.5 py-2 border border-primary/10">
                      <Crosshair size={11} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-primary leading-relaxed">{g.recommendedAction}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Résumé IA — streaming ou existant ── */}
      {(isStreaming || streamText || careCase.clinicalSummary) ? (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={12} /> {isStreaming ? "Génération en cours…" : "Synthèse IA — à vérifier"}
            </p>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {streamText || careCase.clinicalSummary}
              {isStreaming && <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/10 px-6 py-10 text-center">
          <Sparkles size={24} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucun résumé IA disponible</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm mx-auto leading-relaxed">
            Générez un résumé clinique intelligent pour obtenir une synthèse structurée du parcours, les points clés et les recommandations.
          </p>
          <Button size="sm" className="mt-4 text-xs gap-1.5" onClick={handleStreamSummary} disabled={isStreaming}>
            <Sparkles size={12} /> {isStreaming ? "Génération…" : "Générer le résumé IA"}
          </Button>
        </div>
      )}

      {/* ── Suggestions d'adressage ── */}
      <ReferralSuggestionsCard careCaseId={careCaseId} />

      {/* ── Arbres décisionnels ── */}
      <ClinicalRulesCard careCaseId={careCaseId} />
    </div>
  );
}

// ─── Suggestions d'adressage basées sur comorbidités ────────────────────────

function ReferralSuggestionsCard({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore()
  const { data } = useQuery({
    queryKey: ["referral-suggestions", careCaseId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/care-cases/${careCaseId}/referral-suggestions`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!res.ok) return { suggestions: [] }
      return res.json()
    },
    enabled: !!accessToken,
  })
  const suggestions = data?.suggestions ?? []
  if (suggestions.length === 0) return null

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b bg-amber-50/50">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1.5">
          <ArrowLeftRight size={12} /> Adressages suggérés ({suggestions.length})
        </p>
      </div>
      <div className="divide-y">
        {suggestions.map((s: any, i: number) => (
          <div key={i} className="px-4 py-3 flex items-start gap-3">
            <div className="size-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{s.suggestedSpecialty}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Comorbidité : {s.comorbidity}</p>
              {s.evidence && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.evidence}</p>}
            </div>
            {s.needsScreening && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold shrink-0">Dépistage</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Arbres décisionnels cliniques ──────────────────────────────────────────

function ClinicalRulesCard({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const { data: pw } = useQuery({
    queryKey: ["pathway", careCaseId],
    queryFn: () => api.pathway.get(careCaseId),
    enabled: !!accessToken,
  })
  const rules = pw?.rules ?? []
  const [expandedId, setExpandedId] = useState<string | null>(null)
  if (rules.length === 0) return null

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <FileText size={12} /> Protocoles décisionnels ({rules.length})
        </p>
      </div>
      <div className="divide-y">
        {rules.map((r: any) => {
          const rule = r.ruleDefinition ?? r
          const pred = typeof rule.predicate === "string" ? (() => { try { return JSON.parse(rule.predicate) } catch { return null } })() : rule.predicate
          const isOpen = expandedId === rule.id
          return (
            <div key={rule.id}>
              <button onClick={() => setExpandedId(isOpen ? null : rule.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{rule.label}</p>
                  <p className="text-xs text-muted-foreground">{rule.scopeFamily}</p>
                </div>
                <span className="text-xs text-muted-foreground">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && pred && (
                <div className="px-4 pb-4 space-y-2">
                  {pred.steps?.map((step: any, i: number) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-xs font-semibold text-primary mb-1">Étape {step.step ?? i + 1}</p>
                      <p className="text-sm">{step.q ?? step.question}</p>
                      {step.yes && <p className="text-xs text-green-700 mt-1">Oui → {step.yes}</p>}
                      {step.no && <p className="text-xs text-red-700 mt-1">Non → {step.no}</p>}
                      {step.options?.map((opt: any, j: number) => (
                        <div key={j} className="text-xs mt-1 pl-3 border-l-2 border-muted">
                          <span className="font-medium">{opt.r ?? opt.label}</span> → <span className="text-muted-foreground">{opt.a ?? opt.action}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {pred.cascade?.map((step: any, i: number) => (
                    <div key={i} className="text-xs pl-3 border-l-2 border-primary/20 py-1">
                      <span className="font-medium">{typeof step === "string" ? step : step.etape}</span>
                      {typeof step !== "string" && step.detail && <span className="text-muted-foreground"> — {step.detail}</span>}
                    </div>
                  ))}
                  {pred.complications?.map((c: any, i: number) => (
                    <div key={i} className="rounded-lg border p-2.5 text-xs">
                      <p className="font-medium">{c.type}</p>
                      {c.prev && <p className="text-muted-foreground">Prévalence : {c.prev}</p>}
                      {c.ttt && <p className="text-muted-foreground">Traitement : {c.ttt}</p>}
                    </div>
                  ))}
                  {pred.refs && <p className="text-[10px] text-muted-foreground/50 mt-2">Réf : {Array.isArray(pred.refs) ? pred.refs.join(", ") : pred.refs}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Widget adressages dans l'overview ───────────────────────────────────────

function ReferralsOverviewCard({ careCaseId, api }: {
  careCaseId: string; api: ReturnType<typeof apiWithToken>;
}) {
  const { data: outgoing, isLoading } = useQuery({
    queryKey: ["referrals", "outgoing", careCaseId],
    queryFn: () => api.referrals.outgoing({ careCaseId }),
  });

  const referrals = outgoing ?? [];
  if (!isLoading && referrals.length === 0) return null;

  const active = referrals.filter((r: Referral) => getStatusMeta(r.status).isActive);
  const completed = referrals.filter((r: Referral) => r.status === "FIRST_VISIT_COMPLETED");

  return (
    <BlockTitle title="Adressages" icon={<ArrowLeftRight size={13} />}
      sub={`${active.length} en cours · ${completed.length} terminé${completed.length > 1 ? "s" : ""}`}
      action={
        <Link href="/adressages" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
          Tous les adressages <ChevronRight size={11} />
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : (
        <div className="space-y-2">
          {referrals.slice(0, 4).map((r: Referral) => {
            const sm = getStatusMeta(r.status);
            const pm = getPriorityMeta(r.priority);
            const target = r.targetProvider
              ? `${r.targetProvider.person.firstName} ${r.targetProvider.person.lastName}`
              : r.preferredSpecialty ?? "Pool";
            return (
              <div key={r.id} className={`rounded-lg border px-3.5 py-2.5 ${sm.isBlocked ? "border-l-[3px] border-l-red-400" : ""}`}>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${sm.badgeClass}`}>{sm.label}</span>
                  {r.priority !== "ROUTINE" && <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${pm.badgeClass}`}>{pm.label}</span>}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{target}</span>
                  {r.preferredSpecialty && <span className="text-xs text-muted-foreground">({r.preferredSpecialty})</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.clinicalReason}</p>
              </div>
            );
          })}
          {referrals.length > 4 && (
            <Link href="/adressages" className="text-[11px] text-primary hover:underline">
              +{referrals.length - 4} autres adressages
            </Link>
          )}
        </div>
      )}
    </BlockTitle>
  );
}

function SummaryBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">{title}</p>
      <p className="text-sm leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPOSANTS UTILITAIRES
// ═════════════════════════════════════════════════════════════════════════════

function BlockTitle({ title, sub, icon, action, children }: {
  title: string; sub?: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">{icon} {title}</div>
          {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function PanelSection({ title, icon, count, titleClass, warning, children }: {
  title: string; icon: React.ReactNode; count?: number; titleClass?: string; warning?: string; children: React.ReactNode;
}) {
  return (
    <div className="pt-4 border-t space-y-2.5">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${titleClass ?? "text-muted-foreground"}`}>
          {icon} {title}
          {count !== undefined && <span className="ml-1 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">{count}</span>}
        </div>
        {warning && <span className="text-[10px] text-yellow-600 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded">{warning}</span>}
      </div>
      {children}
    </div>
  );
}

function SeeMore({ label }: { label: string }) {
  return <button className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">{label} <ChevronRight size={11} /></button>;
}

function EmptyView({ icon, msg, desc }: { icon: React.ReactNode; msg: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{msg}</p>
      {desc && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{desc}</p>}
    </div>
  );
}

function LoadingCards() {
  return <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
}

function DetailSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4 space-y-3 bg-white">
        <Skeleton className="h-3 w-16" />
        <div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-1.5"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-64" /></div></div>
      </div>
      <div className="flex-1 flex">
        <div className="w-40 border-r bg-white" />
        <div className="flex-1 p-6 space-y-5">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <div className="w-72 bg-white p-4 space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}</div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TRAJECTOIRE — Courbes d'évolution clinique
// ═════════════════════════════════════════════════════════════════════════════

function TrajectoireSection({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore();

  // Charger les métriques du pathway pour le sélecteur
  const { data: pathwayData } = useQuery({
    queryKey: ["pathway", careCaseId],
    queryFn: () => apiWithToken(accessToken!).pathway.get(careCaseId),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-jakarta)" }}>
          Trajectoire clinique
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Évolution des paramètres dans le temps
        </p>
      </div>
      <TrajectoryView
        careCaseId={careCaseId}
        pathwayMetrics={pathwayData?.metrics}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PATHWAY SELECTOR — Assigner un parcours au dossier
// ═════════════════════════════════════════════════════════════════════════════

function PathwaySelector({ careCaseId, onAssigned }: { careCaseId: string; onAssigned: () => void }) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const [open, setOpen] = useState(false)

  const { data: allPathways = [] } = useQuery({
    queryKey: ["all-pathways"],
    queryFn: () => api.intelligence.pathways(),
    enabled: !!accessToken && open,
  })

  const assignMut = useMutation({
    mutationFn: (pathwayTemplateId: string) =>
      api.careCases.update(careCaseId, { pathwayTemplateId } as any),
    onSuccess: () => {
      onAssigned()
      setOpen(false)
      toast.success("Parcours assigné")
    },
    onError: () => toast.error("Erreur lors de l'assignation"),
  })

  const grouped = (allPathways as any[]).reduce((acc: Record<string, any[]>, p: any) => {
    const f = p.family ?? "other"
    if (!acc[f]) acc[f] = []
    acc[f].push(p)
    return acc
  }, {} as Record<string, any[]>)

  const FAMILY_LABELS: Record<string, string> = {
    tca: "Troubles du Comportement Alimentaire",
    obesity: "Obésité",
    metabolic: "Métabolique",
  }

  if (!open) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/10 p-6 text-center">
        <Crosshair size={20} className="text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm font-medium text-muted-foreground">Aucun parcours de soins assigné</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Assignez un parcours pour activer le suivi structuré (métriques, questionnaires, alertes).</p>
        <Button size="sm" className="mt-3 text-xs gap-1.5" onClick={() => setOpen(true)}>
          <Crosshair size={11} /> Choisir un parcours
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Crosshair size={14} className="text-primary" /> Choisir un parcours de soins
        </h3>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Annuler</button>
      </div>
      {Object.entries(grouped).map(([family, pathways]) => (
        <div key={family}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{FAMILY_LABELS[family] ?? family}</p>
          <div className="space-y-1.5">
            {(pathways as any[]).map((p: any) => {
              const bp = p.baselinePlan as any
              return (
                <button key={p.id} onClick={() => assignMut.mutate(p.id)} disabled={assignMut.isPending}
                  className="w-full text-left rounded-lg border p-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <p className="text-sm font-medium">{p.label}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {bp?.duration && <span>{bp.duration}</span>}
                    {bp?.phases && <span>· {bp.phases.length} phases</span>}
                    {p.questionnaires?.length > 0 && <span>· {p.questionnaires.length} questionnaires</span>}
                    {p.metrics?.length > 0 && <span>· {p.metrics.length} métriques</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SUIVI — Observations + Dashboard + Formulaire de saisie
// ═════════════════════════════════════════════════════════════════════════════

function SuiviSection({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [quickMetric, setQuickMetric] = useState<string | null>(null);

  const { data: pathwayData, isLoading: loadingPathway } = useQuery({
    queryKey: ["pathway", careCaseId],
    queryFn: () => apiWithToken(accessToken!).pathway.get(careCaseId),
  });

  const { data: latestData, isLoading: loadingLatest } = useQuery({
    queryKey: ["observations-latest", careCaseId],
    queryFn: () => observationsApi.latest(accessToken!, careCaseId),
  });

  const { data: alertsData } = useQuery({
    queryKey: ["alerts", careCaseId],
    queryFn: () => apiWithToken(accessToken!).alerts.list(careCaseId),
  });

  const mutation = useMutation({
    mutationFn: (observations: ObservationInput[]) =>
      observationsApi.create(accessToken!, careCaseId, observations),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["observations-latest", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["pathway", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["alerts", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["care-case", careCaseId] });
      setShowForm(false);
      setQuickMetric(null);
      if (data.summary.alertsTriggered > 0) {
        toast.warning(`${data.summary.alertsTriggered} indicateur(s) mis à jour`);
      } else {
        toast.success(`${data.summary.observationsCreated} observation(s) enregistrée(s)`);
      }
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  if (loadingPathway || loadingLatest) {
    return <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  }

  const pw = pathwayData;
  const STATUS_ICON: Record<string, { icon: string; color: string; bg: string }> = {
    up_to_date: { icon: "✓", color: "text-green-700", bg: "bg-green-50 border-green-200" },
    due_soon:   { icon: "◔", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    overdue:    { icon: "!", color: "text-red-700",   bg: "bg-red-50 border-red-200" },
    never:      { icon: "—", color: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
  };

  const DOMAIN_LABELS: Record<string, string> = {
    anthropometry: "Anthropométrie", vital: "Vitaux", biology: "Biologie",
    nutrition_behavior: "Comportement alimentaire", purging_behavior: "Conduites purgatives",
    binge_behavior: "Accès hyperphagiques", psychological: "Psychique",
    endocrinology: "Endocrinologie", growth: "Croissance", pediatric_context: "Contexte pédiatrique",
    engagement: "Engagement",
  };

  // Grouper les métriques par domaine
  const metricsByDomain = (pw?.metrics ?? []).reduce((acc, m) => {
    const d = m.domain;
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {} as Record<string, typeof pw extends null ? never : NonNullable<typeof pw>["metrics"]>);

  return (
    <div className="p-6 space-y-5">
      {/* En-tête pathway — sélecteur si aucun pathway */}
      {!pw?.pathway && (
        <PathwaySelector careCaseId={careCaseId} onAssigned={() => {
          queryClient.invalidateQueries({ queryKey: ["pathway", careCaseId] });
          queryClient.invalidateQueries({ queryKey: ["care-case", careCaseId] });
        }} />
      )}
      {pw?.pathway && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crosshair size={14} className="text-primary" />
                <h2 className="text-sm font-semibold">{pw.pathway.label}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pw.summary.metricsUpToDate}/{pw.summary.metricsTotal} métriques à jour
                {pw.summary.metricsOverdue > 0 && (
                  <span className="text-amber-600 ml-2">{pw.summary.metricsOverdue} en retard</span>
                )}
                {pw.summary.rulesTriggered > 0 && (
                  <span className="text-red-600 ml-2">{pw.summary.rulesTriggered} indicateur(s) actif(s)</span>
                )}
              </p>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Fermer" : "Nouvelle saisie"}
            </Button>
          </div>

          {/* Barre de progression */}
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden flex">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${(pw.summary.metricsUpToDate / Math.max(pw.summary.metricsTotal, 1)) * 100}%` }} />
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${((pw.summary.metricsTotal - pw.summary.metricsUpToDate - pw.summary.metricsOverdue - pw.summary.metricsNever) / Math.max(pw.summary.metricsTotal, 1)) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Formulaire d'observation */}
      {showForm && (
        <ObservationForm
          professionalRole="medecin-generaliste"
          careCaseId={careCaseId}
          onSubmit={(obs) => mutation.mutate(obs)}
        />
      )}

      {/* Saisie rapide pour une métrique spécifique */}
      {quickMetric && !showForm && (
        <QuickObservationEntry
          metricKey={quickMetric}
          metric={pw?.metrics.find((m) => m.metricKey === quickMetric) ?? null}
          onSubmit={(obs) => mutation.mutate(obs)}
          onClose={() => setQuickMetric(null)}
          isPending={mutation.isPending}
        />
      )}

      {/* Métriques par domaine */}
      {pw?.pathway && Object.entries(metricsByDomain).length > 0 && (
        <div className="space-y-4">
          {Object.entries(metricsByDomain).map(([domain, metrics]) => (
            <div key={domain}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
                {DOMAIN_LABELS[domain] ?? domain}
              </p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                {metrics.map((m) => {
                  const st = STATUS_ICON[m.status];
                  return (
                    <button
                      key={m.metricKey}
                      onClick={() => { setQuickMetric(m.metricKey); setShowForm(false); }}
                      className={`text-left p-3 rounded-lg border transition-all hover:shadow-sm ${st.bg}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate">{m.label}</span>
                        <span className={`text-xs font-bold ${st.color}`}>{st.icon}</span>
                      </div>
                      <div className="mt-1">
                        {m.lastValue !== null ? (
                          <span className="text-sm font-semibold tabular-nums">
                            {typeof m.lastValue === "number" ? m.lastValue.toFixed(m.unit === "kg" || m.unit === "kg/m²" ? 1 : 0) : String(m.lastValue)}
                            {m.unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{m.unit}</span>}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Non mesuré</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {m.cadence === "daily" ? "Quotidien" : m.cadence === "weekly" ? "Hebdo" : m.cadence === "monthly" ? "Mensuel" : m.cadence === "quarterly" ? "Trimestriel" : m.cadence}
                        </span>
                        {m.lastDate && (
                          <span className="text-[10px] text-muted-foreground">
                            &middot; {new Date(m.lastDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        )}
                        {m.required && <span className="text-[10px] text-primary font-medium ml-auto">requis</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Questionnaires */}
      {pw?.questionnaires && pw.questionnaires.length > 0 && (
        <QuestionnaireSection
          questionnaires={pw.questionnaires}
          careCaseId={careCaseId}
          latestByDomain={latestData?.latest ?? {}}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["observations-latest", careCaseId] });
            queryClient.invalidateQueries({ queryKey: ["alerts", careCaseId] });
          }}
        />
      )}

      {/* Règles actives */}
      {pw?.rules && pw.rules.filter((r) => r.enabled).length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Indicateurs de complétude actifs</p>
          <div className="space-y-1.5">
            {pw.rules.filter((r) => r.enabled).map((r) => (
              <div key={r.key} className={`flex items-center justify-between p-2.5 rounded-lg border ${r.triggered ? "bg-amber-50 border-amber-200" : "bg-card"}`}>
                <p className="text-xs font-medium">{r.label}</p>
                <span className={`text-[10px] font-medium ${r.triggered ? "text-amber-700" : "text-green-600"}`}>
                  {r.triggered ? "Déclenché" : "OK"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard observations brut (en-dessous, pour le détail) */}
      <ObservationDashboard
        latestByDomain={latestData?.latest ?? {}}
        alerts={(alertsData ?? []).map((a: Alert) => ({ title: a.title, severity: a.severity, status: a.status }))}
      />
    </div>
  );
}

// ── Saisie rapide d'une observation ──────────────────────────────────────────

function QuickObservationEntry({ metricKey, metric, onSubmit, onClose, isPending }: {
  metricKey: string;
  metric: PathwayMetric | null;
  onSubmit: (obs: ObservationInput[]) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    const obs: ObservationInput = {
      metricKey,
      source: "PROVIDER_ENTRY" as const,
    };
    if (metric?.valueType === "numeric") {
      obs.valueNumeric = parseFloat(value);
    } else if (metric?.valueType === "boolean") {
      obs.valueBoolean = value === "true" || value === "1" || value === "oui";
    } else {
      obs.valueText = value;
    }
    onSubmit([obs]);
  };

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{metric?.label ?? metricKey}</p>
          {metric?.unit && <p className="text-xs text-muted-foreground">Unité : {metric.unit}</p>}
          {metric?.normalMin != null && metric?.normalMax != null && (
            <p className="text-[10px] text-muted-foreground">Plage normale : {metric.normalMin} — {metric.normalMax} {metric.unit}</p>
          )}
        </div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Fermer</button>
      </div>
      <div className="flex gap-2">
        <input
          type={metric?.valueType === "numeric" ? "number" : "text"}
          step={metric?.valueType === "numeric" ? "any" : undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={metric?.valueType === "numeric" ? "Valeur" : "Saisir..."}
          className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button size="sm" onClick={handleSubmit} disabled={!value.trim() || isPending}>
          {isPending ? "..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// QUESTIONNAIRES — section interactive avec scoring auto
// ═════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
// BIOLOGIE — Vue comparée N vs N-1
// ═════════════════════════════════════════════════════════════════════════════

const DOMAIN_LABELS: Record<string, string> = {
  anthropometry: "Anthropométrie",
  biology:       "Biologie",
  clinical:      "Clinique",
  questionnaire: "Questionnaires",
  nutrition:     "Nutrition",
  cardiac:       "Cardio",
  respiratory:   "Respiratoire",
};

const METRIC_PREF: Record<string, "up_good" | "down_good" | "neutral"> = {
  weight_kg: "neutral", bmi: "neutral", waist_cm: "down_good", hip_cm: "neutral",
  fat_mass_pct: "down_good", muscle_mass_kg: "up_good",
  phq9_score: "down_good", gad7_score: "down_good", eat26_score: "down_good", scoff_score: "down_good",
  heart_rate: "neutral", blood_pressure_systolic: "down_good", blood_pressure_diastolic: "down_good",
  hba1c: "down_good", glycemia: "down_good",
  total_cholesterol: "down_good", ldl_cholesterol: "down_good", hdl_cholesterol: "up_good", triglycerides: "down_good",
  potassium: "neutral", sodium: "neutral", albumin: "up_good", hemoglobin: "up_good",
  ferritin: "up_good", vitamin_d: "up_good", tsh: "neutral", creatinine: "down_good",
};

function getDeltaStyle(d: DeltaObservation): { text: string; bg: string } {
  if (d.direction === "stable") return { text: "text-gray-500", bg: "bg-gray-50 border-gray-100" };
  const pref = METRIC_PREF[d.metricKey] ?? "neutral";
  if (pref === "neutral") return { text: "text-blue-600", bg: "bg-blue-50/40 border-blue-100" };
  const good = pref === "up_good" ? d.direction === "up" : d.direction === "down";
  return good
    ? { text: "text-emerald-600", bg: "bg-emerald-50/40 border-emerald-100" }
    : { text: "text-red-500", bg: "bg-red-50/40 border-red-100" };
}

function MiniSparkline({ values, pref }: { values: number[]; pref: "up_good" | "down_good" | "neutral" }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const w = 56, h = 20;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const trend = values[values.length - 1] >= values[0] ? "up" : "down";
  const color = pref === "neutral" ? "#2563EB"
    : (pref === "up_good" ? (trend === "up" ? "#059669" : "#DC2626") : (trend === "down" ? "#059669" : "#DC2626"));
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 opacity-75">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function LaboDeltaSection({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore();
  const [activeDomain, setActiveDomain] = useState("all");

  const { data: deltaData, isLoading } = useQuery({
    queryKey: ["observations-delta", careCaseId],
    queryFn: () => observationsApi.delta(accessToken!, careCaseId),
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  const { data: histData } = useQuery({
    queryKey: ["observations-history", careCaseId],
    queryFn: () => observationsApi.list(accessToken!, careCaseId, { limit: 300 }),
    enabled: !!accessToken,
    staleTime: 120_000,
  });

  const sparklines = useMemo<Record<string, number[]>>(() => {
    if (!histData?.observations) return {};
    const grouped: Record<string, { v: number; t: string }[]> = {};
    for (const obs of histData.observations) {
      if (obs.valueNumeric == null || !obs.metric?.key) continue;
      if (!grouped[obs.metric.key]) grouped[obs.metric.key] = [];
      grouped[obs.metric.key].push({ v: obs.valueNumeric, t: obs.effectiveAt });
    }
    const out: Record<string, number[]> = {};
    for (const [k, arr] of Object.entries(grouped)) {
      out[k] = arr.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime()).slice(-8).map((e) => e.v);
    }
    return out;
  }, [histData]);

  const deltas = deltaData?.deltas ?? [];
  const refDate = deltaData?.referenceDate
    ? new Date(deltaData.referenceDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const domains = useMemo(() => [...new Set(deltas.map((d) => d.domain))], [deltas]);

  const byDomain = useMemo(() => {
    const src = activeDomain === "all" ? deltas : deltas.filter((d) => d.domain === activeDomain);
    return src.reduce<Record<string, DeltaObservation[]>>((acc, d) => {
      (acc[d.domain] ||= []).push(d);
      return acc;
    }, {});
  }, [deltas, activeDomain]);

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl border bg-white animate-pulse" />)}
    </div>
  );

  if (!deltas.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ArrowLeftRight size={28} className="text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">Aucune donnée comparative</p>
      <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
        Enregistrez au moins 2 observations d&apos;une même métrique pour voir l&apos;évolution N vs N-1.
      </p>
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <ArrowLeftRight size={14} /> Biologie — N vs N-1
          </h2>
          {refDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Référence : {refDate} · {deltas.length} indicateur{deltas.length > 1 ? "s" : ""} comparé{deltas.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {domains.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...domains].map((dm) => (
            <button
              key={dm}
              onClick={() => setActiveDomain(dm)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                activeDomain === dm
                  ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {dm === "all" ? "Tout" : (DOMAIN_LABELS[dm] ?? dm)}
            </button>
          ))}
        </div>
      )}

      {Object.entries(byDomain).map(([dm, rows]) => (
        <div key={dm} className="rounded-xl border bg-white overflow-hidden shadow-sm">
          {Object.keys(byDomain).length > 1 && (
            <div className="px-4 py-2 bg-muted/30 border-b">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {DOMAIN_LABELS[dm] ?? dm}
              </p>
            </div>
          )}
          <div className="divide-y">
            {rows.map((d) => {
              const pref = METRIC_PREF[d.metricKey] ?? "neutral";
              const { text: deltaColor, bg } = getDeltaStyle(d);
              const spark = sparklines[d.metricKey] ?? [];
              const sign = d.delta > 0 ? "+" : "";
              const arrow = d.direction === "up" ? "↑" : d.direction === "down" ? "↓" : "→";

              return (
                <div key={d.metricKey} className={`flex items-center gap-3 px-4 py-3 ${bg}`}>
                  {/* Label + dates */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{d.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(d.previousDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      {" → "}
                      {new Date(d.currentDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>

                  {/* Sparkline */}
                  {spark.length >= 2 && <MiniSparkline values={spark} pref={pref} />}

                  {/* N-1 */}
                  <div className="text-right w-20 shrink-0">
                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Préc.</p>
                    <p className="text-xs font-mono text-gray-500">{d.previous}{d.unit ? ` ${d.unit}` : ""}</p>
                  </div>

                  {/* N */}
                  <div className="text-right w-20 shrink-0">
                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Actuel</p>
                    <p className="text-sm font-bold font-mono text-gray-900">{d.current}{d.unit ? ` ${d.unit}` : ""}</p>
                  </div>

                  {/* Delta */}
                  <div className={`text-right w-24 shrink-0 ${deltaColor}`}>
                    <p className="text-sm font-bold font-mono">{sign}{d.delta}{d.unit ? ` ${d.unit}` : ""} {arrow}</p>
                    <p className="text-[10px] font-mono opacity-75">{sign}{d.deltaPercent}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionnaireSection({
  questionnaires, careCaseId, latestByDomain, onSaved,
}: {
  questionnaires: { key: string; label: string; cadence: string; required: boolean }[];
  careCaseId: string;
  latestByDomain: Record<string, LatestObservation[]>;
  onSaved: () => void;
}) {
  const { accessToken } = useAuthStore();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: ({ metricKey, score }: { metricKey: string; score: number }) =>
      observationsApi.create(accessToken!, careCaseId, [{
        metricKey,
        valueNumeric: score,
        unit: "score",
        source: "PROVIDER_ENTRY" as const,
      }]),
    onSuccess: () => {
      toast.success("Score enregistré");
      setActiveKey(null);
      onSaved();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  const cadenceLabel = (c: string) =>
    c === "initial" ? "Initial" : c === "monthly" ? "Mensuel" : c === "quarterly" ? "Trimestriel" : c === "weekly" ? "Hebdo" : c;

  // Dernier score connu pour un questionnaire
  function getLastScore(metricKey: string): number | null {
    for (const domain of Object.values(latestByDomain)) {
      for (const obs of domain) {
        if ((obs as any).metricKey === metricKey && (obs as any).valueNumeric != null)
          return (obs as any).valueNumeric;
      }
    }
    return null;
  }

  if (activeKey) {
    const def = QUESTIONNAIRE_CATALOG[activeKey];
    if (!def) {
      setActiveKey(null);
      return null;
    }
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-3">
          {def.shortLabel}
        </p>
        <div className="rounded-xl border bg-card p-4">
          <LikertQuestionnaire
            def={def}
            isSaving={saveMutation.isPending}
            onCancel={() => setActiveKey(null)}
            onSave={(score) => saveMutation.mutate({ metricKey: def.metricKey, score })}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
        Questionnaires recommandés
      </p>
      <div className="space-y-1.5">
        {questionnaires.map((q) => {
          const def = QUESTIONNAIRE_CATALOG[q.key];
          const lastScore = def ? getLastScore(def.metricKey) : null;
          const band = def && lastScore !== null ? getBand(def, lastScore) : null;

          return (
            <div key={q.key} className="flex items-center justify-between p-2.5 rounded-lg border bg-card gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-medium">{q.label}</p>
                  {q.required && <span className="text-[10px] text-primary font-medium">requis</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <p className="text-[10px] text-muted-foreground">{cadenceLabel(q.cadence)}</p>
                  {band && lastScore !== null && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${BAND_COLORS[band.color]}`}>
                      {lastScore}/{def!.maxScore} — {band.label}
                    </span>
                  )}
                </div>
              </div>
              {def ? (
                <Button
                  size="sm" variant="outline"
                  className="text-[10px] h-7 px-2 shrink-0"
                  onClick={() => setActiveKey(q.key)}
                >
                  {lastScore !== null ? "Refaire" : "Remplir"}
                </Button>
              ) : (
                <span className="text-[10px] text-muted-foreground shrink-0">Bientôt</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
