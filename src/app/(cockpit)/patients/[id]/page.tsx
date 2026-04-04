"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, CareCaseDetail, Gap, GapAnalysis, SummaryResult, Appointment, JournalEntry, Document, Message, Referral } from "@/lib/api";
import { getStatusMeta, getPriorityMeta } from "@/lib/referrals";
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
  User, ChevronRight, Crosshair, Send, CornerDownRight,
} from "lucide-react";

import { useTimeline } from "@/hooks/useTimeline";
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

// ─── Navigation ──────────────────────────────────────────────────────────────

type Section = "overview" | "timeline" | "notes" | "documents" | "equipe" | "taches" | "rdv" | "journal" | "messages" | "pilotage";

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "overview",  label: "Vue d'ensemble",  icon: <ActivityIcon size={13} /> },
  { key: "pilotage",  label: "Pilotage IA",      icon: <Sparkles size={13} /> },
  { key: "timeline",  label: "Timeline",         icon: <Clock size={13} /> },
  { key: "notes",     label: "Notes",             icon: <FileText size={13} /> },
  { key: "documents", label: "Documents",         icon: <FileText size={13} /> },
  { key: "equipe",    label: "Équipe",            icon: <Users size={13} /> },
  { key: "taches",    label: "Tâches",            icon: <CheckSquare size={13} /> },
  { key: "rdv",       label: "Rendez-vous",       icon: <CalendarDays size={13} /> },
  { key: "journal",   label: "Journal patient",   icon: <BookOpen size={13} /> },
  { key: "messages",  label: "Messages",          icon: <MessageSquare size={13} /> },
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

  const { data: careCase, isLoading } = useQuery({
    queryKey: ["care-case", id],
    queryFn: () => api.careCases.get(id),
  });

  if (isLoading) return <DetailSkeleton />;
  if (!careCase) return <div className="p-8 text-sm text-muted-foreground">Dossier introuvable.</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PatientHeader careCase={careCase} onAddNote={() => setNoteOpen(true)} careCaseId={id} api={api} />
      {noteOpen && <NoteInline careCaseId={id} api={api} onClose={() => setNoteOpen(false)} />}

      <div className="flex-1 flex overflow-hidden">
        <nav className="w-44 shrink-0 border-r bg-card overflow-y-auto py-3 px-2">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13px] transition-all duration-150 text-left ${
                section === item.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto">
          <MainContent section={section} careCaseId={id} careCase={careCase} api={api} />
        </main>

        <aside className="w-72 shrink-0 overflow-y-auto bg-card py-5 px-4">
          <PilotagePanel careCaseId={id} careCase={careCase} api={api} />
        </aside>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PatientHeader({ careCase: c, onAddNote, careCaseId, api }: {
  careCase: CareCaseDetail; onAddNote: () => void;
  careCaseId: string; api: ReturnType<typeof apiWithToken>;
}) {
  const qc = useQueryClient();
  const aiSummarize = useMutation({
    mutationFn: () => api.intelligence.summarize(careCaseId, true),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["care-case", careCaseId] }); toast.success("Résumé IA généré"); },
    onError: () => toast.error("Erreur lors de la génération"),
  });

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
              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${RISK_BADGE[c.riskLevel]}`}>
                {RISK_LABEL[c.riskLevel]}
              </span>
              <span className="text-xs border rounded px-1.5 py-0.5 text-muted-foreground">{c.caseType}</span>
              {c.careStage && <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">{c.careStage}</span>}
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
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5" onClick={() => toast.info("Création de tâche bientôt disponible")}><CheckSquare size={12} /> Tâche</Button>
          <Link href="/adressages"><Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5"><ArrowLeftRight size={12} /> Adresser</Button></Link>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5" onClick={() => toast.info("Envoi de message bientôt disponible")}><MessageSquare size={12} /> Message</Button>
          <Link href="/agenda"><Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5"><CalendarPlus size={12} /> RDV</Button></Link>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5"
            onClick={() => aiSummarize.mutate()} disabled={aiSummarize.isPending}>
            <Sparkles size={12} /> {aiSummarize.isPending ? "Génération…" : "Résumé IA"}
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
    mutationFn: () => api.notes.create(careCaseId, { noteType: "GENERAL", body }),
    onSuccess: () => {
      ["timeline", "notes", "care-case"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
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

// ─── Contenu par section ──────────────────────────────────────────────────────

function MainContent({ section, careCaseId, careCase, api }: {
  section: Section; careCaseId: string; careCase: CareCaseDetail;
  api: ReturnType<typeof apiWithToken>;
}) {
  switch (section) {
    case "overview":  return <OverviewSection careCaseId={careCaseId} careCase={careCase} api={api} />;
    case "pilotage":  return <PilotageIASection careCaseId={careCaseId} careCase={careCase} api={api} />;
    case "timeline":  return <ClinicalLifeline careCaseId={careCaseId} careCase={careCase} />;
    case "notes":     return <NotesSection careCaseId={careCaseId} api={api} />;
    case "equipe":    return <EquipeSection careCaseId={careCaseId} api={api} />;
    case "taches":    return <TachesSection careCaseId={careCaseId} api={api} />;
    case "rdv":       return <RDVSection careCaseId={careCaseId} api={api} />;
    case "journal":   return <JournalSection careCaseId={careCaseId} api={api} />;
    case "documents": return <DocumentsSection careCaseId={careCaseId} api={api} />;
    case "messages":  return <MessagesSection careCaseId={careCaseId} api={api} />;
    default:
      return <div className="flex items-center justify-center h-48"><p className="text-sm text-muted-foreground">Cette section arrive bientôt.</p></div>;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// LIGNE DE VIE CLINIQUE — onglet Timeline
// Consomme uniquement le modèle canonique TimelineEvent via useTimeline.
// ═════════════════════════════════════════════════════════════════════════════

function ClinicalLifeline({ careCaseId, careCase }: {
  careCaseId: string; careCase: CareCaseDetail;
}) {
  const { data: timeline, isLoading } = useTimeline(careCaseId, careCase);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"lifeline" | "list">("lifeline");
  const [categoryFilter, setCategoryFilter] = useState("tout");

  const selected = timeline?.events.find((e) => e.id === selectedId) ?? null;

  if (isLoading || !timeline) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );

  const { events, trajectory, summary } = timeline;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Clock size={14} /> Ligne de vie clinique
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Parcours du patient — {summary.totalEvents} événement{summary.totalEvents !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex rounded-md border overflow-hidden">
          <button
            onClick={() => setViewMode("lifeline")}
            className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
              viewMode === "lifeline" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted/50"
            }`}
          >Trajectoire</button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted/50"
            }`}
          >Détail</button>
        </div>
      </div>

      {viewMode === "lifeline" ? (
        <>
          {/* Bandeau résumé trajectoire */}
          <TrajectoryBanner summary={summary} />

          {/* Frise horizontale — consomme trajectory (= events avec trajectoryVisible) */}
          <HorizontalTimeline
            events={trajectory}
            startDate={summary.startDate}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* Détail événement sélectionné */}
          {selected ? (
            <EventDetailPanel event={selected} allEvents={events} />
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/10 py-10 text-center">
              <Crosshair size={20} className="text-muted-foreground/25 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Cliquez sur un événement de la frise pour voir le détail clinique.</p>
            </div>
          )}
        </>
      ) : (
        /* Vue liste filtrée — même source canonique */
        <TimelineDetailView
          events={events}
          categoryFilter={categoryFilter}
          onFilterChange={setCategoryFilter}
        />
      )}
    </div>
  );
}

// ─── Bandeau résumé trajectoire ──────────────────────────────────────────────

function TrajectoryBanner({ summary }: { summary: NonNullable<ReturnType<typeof useTimeline>["data"]>["summary"] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <TrajectoryCard
        label="Début de suivi"
        value={dateFrShort(summary.startDate)}
        sub={daysAgo(summary.startDate)}
        accent="text-primary"
      />
      <TrajectoryCard
        label="Phase actuelle"
        value={summary.currentPhase ?? "Non définie"}
        accent="text-foreground"
      />
      <TrajectoryCard
        label="Dernier événement"
        value={summary.lastImportantEvent?.title ?? "—"}
        sub={summary.lastImportantEvent ? daysAgo(summary.lastImportantEvent.occurredAt) : undefined}
        accent={summary.lastImportantEvent?.severity === "high" ? "text-destructive" : "text-foreground"}
      />
      <TrajectoryCard
        label="Prochaine étape"
        value={summary.nextPlannedEvent?.title ?? "Non définie"}
        accent="text-primary"
      />
    </div>
  );
}

function TrajectoryCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold mt-1 leading-snug line-clamp-2 ${accent ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Frise horizontale interactive ───────────────────────────────────────────
// Consomme UNIQUEMENT des TimelineEvent[] (trajectoryVisible).
// Chaque node tire son icône + couleur du registre central.

function HorizontalTimeline({ events, startDate, selectedId, onSelect }: {
  events: TimelineEvent[]; startDate: string;
  selectedId: string | null; onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const today = new Date();

  const sorted = useMemo(() =>
    [...events].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
    [events],
  );

  // Compute time range — start = earliest between startDate and oldest event
  const earliestEventMs = sorted.length > 0 ? new Date(sorted[0].occurredAt).getTime() : Infinity;
  const startMs = Math.min(new Date(startDate).getTime(), earliestEventMs);
  const endMs = Math.max(today.getTime(), ...sorted.map((e) => new Date(e.occurredAt).getTime())) + 7 * 86400000;
  const rangeMs = endMs - startMs || 1;
  const getPosition = (d: string | Date) => {
    const ms = typeof d === "string" ? new Date(d).getTime() : d.getTime();
    return Math.max(0, Math.min(100, ((ms - startMs) / rangeMs) * 100));
  };
  const todayPos = getPosition(today);

  // Auto-scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayPx = (todayPos / 100) * scrollRef.current.scrollWidth;
      scrollRef.current.scrollLeft = todayPx - scrollRef.current.clientWidth / 2;
    }
  }, [sorted.length, todayPos]);

  // Derive phase segments
  const phases = derivePhases(sorted, startMs, endMs);

  return (
    <div className="rounded-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Phase bar */}
      <div className="flex h-6 bg-muted/20 border-b relative">
        {phases.map((phase, i) => (
          <div
            key={i}
            className={`h-full flex items-center justify-center text-[9px] font-semibold uppercase tracking-wider border-r last:border-r-0 ${phase.style}`}
            style={{ width: `${phase.widthPct}%` }}
          >
            {phase.label}
          </div>
        ))}
      </div>

      {/* Timeline track */}
      <div ref={scrollRef} className="relative overflow-x-auto py-8 px-6" style={{ minHeight: 130 }}>
        <div className="relative" style={{ minWidth: Math.max(600, sorted.length * 90) }}>
          {/* Central line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />

          {/* Today marker */}
          <div className="absolute top-0 bottom-0 w-px bg-primary/40 z-10" style={{ left: `${todayPos}%` }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
              Aujourd&apos;hui
            </div>
          </div>

          {/* Nodes — chaque événement est rendu via le registre */}
          {sorted.map((event) => {
            const pos = getPosition(event.occurredAt);
            const reg = getRegistryEntry(event.type);
            const Icon = reg.icon;
            const isSelected = event.id === selectedId;
            const isHovered = event.id === hoveredId;
            const isPast = event.status === "past";

            return (
              <div
                key={event.id}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 cursor-pointer"
                style={{ left: `${pos}%` }}
                onClick={() => onSelect(event.id)}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Node */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-sm
                  ${reg.nodeColor}
                  ${isSelected ? `ring-3 ${reg.ringColor} scale-110` : ""}
                  ${!isPast ? "opacity-50 border-2 border-dashed border-white" : ""}
                  ${isHovered && !isSelected ? "scale-110 shadow-md" : ""}
                `}>
                  <Icon size={11} />
                </div>

                {/* Date label */}
                <p className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap font-medium">
                  {dateFrShort(event.occurredAt)}
                </p>

                {/* Hover popover */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="bg-white border rounded-xl shadow-lg px-3 py-2.5 min-w-[200px] max-w-[280px]">
                      <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{reg.label}</span>
                      <p className="text-xs font-semibold leading-snug mt-0.5">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{dateFr(event.occurredAt)}</p>
                      {event.summary && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{event.summary}</p>
                      )}
                      {event.actor && (
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{event.actor.name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende — générée dynamiquement depuis les types présents */}
      <TimelineLegend events={sorted} />
    </div>
  );
}

function TimelineLegend({ events }: { events: TimelineEvent[] }) {
  // Déduire les types présents
  const types = useMemo(() => {
    const seen = new Set<string>();
    return events.filter((e) => {
      if (seen.has(e.type)) return false;
      seen.add(e.type);
      return true;
    }).map((e) => {
      const reg = getRegistryEntry(e.type);
      return { type: e.type, label: reg.label, color: reg.nodeColor };
    });
  }, [events]);

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/10 flex-wrap">
      {types.map(({ type, label, color }) => (
        <div key={type} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <div className={`w-3 h-3 rounded-full ${color}`} /> {label}
        </div>
      ))}
    </div>
  );
}

// ─── Phases de parcours (heuristique) ────────────────────────────────────────

function derivePhases(events: TimelineEvent[], startMs: number, endMs: number) {
  const rangeMs = endMs - startMs || 1;

  if (events.length === 0) {
    return [{ label: "Évaluation", style: "bg-blue-50 text-blue-600", widthPct: 100 }];
  }

  const referralAccepted = events.find((e) => e.type === "referral_accepted");
  const alertEvent = events.find((e) => e.type === "alert");

  const phase1End = referralAccepted ? new Date(referralAccepted.occurredAt).getTime() : startMs + rangeMs * 0.3;
  const phase2End = alertEvent ? new Date(alertEvent.occurredAt).getTime() : startMs + rangeMs * 0.7;

  return [
    { label: "Évaluation", style: "bg-blue-50/80 text-blue-500", widthPct: ((phase1End - startMs) / rangeMs) * 100 },
    { label: "Coordination active", style: "bg-emerald-50/80 text-emerald-600", widthPct: ((phase2End - phase1End) / rangeMs) * 100 },
    { label: "Stabilisation", style: "bg-amber-50/80 text-amber-600", widthPct: ((endMs - phase2End) / rangeMs) * 100 },
  ];
}

// ─── Panneau détail événement ────────────────────────────────────────────────

function EventDetailPanel({ event, allEvents }: {
  event: TimelineEvent; allEvents: TimelineEvent[];
}) {
  const reg = getRegistryEntry(event.type);
  const Icon = reg.icon;

  // Contexte temporel : événement avant / après
  const sorted = useMemo(() =>
    [...allEvents].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
    [allEvents],
  );
  const idx = sorted.findIndex((a) => a.id === event.id);
  const before = idx > 0 ? sorted[idx - 1] : null;
  const after = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <div className="rounded-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${reg.nodeColor}`}>
            <Icon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{reg.label}</span>
              <span className="text-[10px] text-muted-foreground">{dateFr(event.occurredAt)}</span>
              {event.severity === "high" && (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">Important</span>
              )}
            </div>
            <h3 className="text-sm font-semibold mt-1">{event.title}</h3>
            {event.summary && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">{event.summary}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
              {event.actor && (
                <span className="flex items-center gap-1"><User size={10} /> {event.actor.name}</span>
              )}
              <span className="flex items-center gap-1"><Clock size={10} /> {daysAgo(event.occurredAt)}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{event.category}</span>
            </div>
          </div>
        </div>
      </div>

      {(before || after) && (
        <div className="border-t bg-muted/10 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Contexte temporel</p>
          <div className="grid grid-cols-2 gap-3">
            {before && <ContextMini label="Avant" event={before} />}
            {after && <ContextMini label="Après" event={after} />}
          </div>
        </div>
      )}
    </div>
  );
}

function ContextMini({ label, event }: { label: string; event: TimelineEvent }) {
  const reg = getRegistryEntry(event.type);
  const Icon = reg.icon;
  return (
    <div className="flex items-start gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${reg.nodeColor}`}>
        <Icon size={9} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-[11px] font-medium leading-snug truncate">{event.title}</p>
        <p className="text-[10px] text-muted-foreground">{dateFrShort(event.occurredAt)}</p>
      </div>
    </div>
  );
}

// ─── Vue détail verticale filtrée ────────────────────────────────────────────
// Consomme les mêmes TimelineEvent[]. Filtrage via filterByCategory.

function TimelineDetailView({ events, categoryFilter, onFilterChange }: {
  events: TimelineEvent[];
  categoryFilter: string;
  onFilterChange: (f: string) => void;
}) {
  const filtered = useMemo(
    () => filterByCategory(events, categoryFilter),
    [events, categoryFilter],
  );

  return (
    <>
      {/* Filtres par catégorie */}
      <div className="flex rounded-md border overflow-hidden w-fit">
        {TIMELINE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onFilterChange(cat.key)}
            className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
              categoryFilter === cat.key ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted/50"
            }`}
          >{cat.label}</button>
        ))}
      </div>

      {/* Liste */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <ActivityIcon size={18} className="text-muted-foreground/25 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Aucune activité pour ce filtre.</p>
          </div>
        ) : (
          filtered.map((event, i) => {
            const reg = getRegistryEntry(event.type);
            const Icon = reg.icon;
            const isLast = i === filtered.length - 1;
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
                    {event.actor && (
                      <span className="text-[11px] text-muted-foreground shrink-0">{event.actor.name}</span>
                    )}
                  </div>
                  {event.summary && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{event.summary}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-muted-foreground/50">
                      {new Date(event.occurredAt).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-muted/50 text-muted-foreground">{reg.label}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VUE D'ENSEMBLE
// ═════════════════════════════════════════════════════════════════════════════

function OverviewSection({ careCaseId, careCase, api }: {
  careCaseId: string; careCase: CareCaseDetail; api: ReturnType<typeof apiWithToken>;
}) {
  return (
    <div className="p-6 max-w-3xl space-y-8">
      <ClinicalSummaryCard careCase={careCase} careCaseId={careCaseId} api={api} />
      <CompactTimelineView careCaseId={careCaseId} careCase={careCase} />
      <ReferralsOverviewCard careCaseId={careCaseId} api={api} />
      <PatientSignalsCard careCaseId={careCaseId} api={api} />
      <AppointmentsCard careCaseId={careCaseId} api={api} />
    </div>
  );
}

function ClinicalSummaryCard({ careCase: c, careCaseId, api }: {
  careCase: CareCaseDetail; careCaseId: string; api: ReturnType<typeof apiWithToken>;
}) {
  const qc = useQueryClient();
  const summarize = useMutation({
    mutationFn: () => api.intelligence.summarize(careCaseId, true),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["care-case", careCaseId] }); toast.success("Résumé IA généré"); },
    onError: () => toast.error("Erreur"),
  });

  return (
    <BlockTitle title="Résumé clinique" icon={<Sparkles size={13} />}
      action={
        <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 text-muted-foreground"
          onClick={() => summarize.mutate()} disabled={summarize.isPending}>
          <Sparkles size={11} /> {summarize.isPending ? "Génération…" : c.clinicalSummary ? "Actualiser" : "Générer IA"}
        </Button>
      }
    >
      {!c.clinicalSummary && !c.mainConcern ? (
        <div className="rounded-xl border border-dashed bg-muted/10 p-8 text-center">
          <Sparkles size={20} className="text-muted-foreground/30 mx-auto mb-2.5" />
          <p className="text-sm font-medium text-muted-foreground">Aucun résumé clinique disponible</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto leading-relaxed">
            Générez un résumé IA pour transformer le dossier en prose clinique lisible et structurée.
          </p>
          <Button size="sm" className="mt-4 text-xs gap-1.5 h-7" onClick={() => summarize.mutate()} disabled={summarize.isPending}>
            <Sparkles size={11} /> {summarize.isPending ? "Génération…" : "Générer le résumé"}
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
          {c.clinicalSummary && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles size={9} /> Synthèse IA
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{c.clinicalSummary}</p>
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
        <EmptyView icon={<BookOpen size={20} />} msg="Aucune entrée journal." />
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
        <EmptyView icon={<CalendarDays size={20} />} msg="Aucun rendez-vous." />
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
      {isLoading ? <LoadingCards /> : !data?.length ? <EmptyView icon={<FileText size={20} />} msg="Aucune note clinique." /> : (
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
      {isLoading ? <LoadingCards /> : !data?.length ? <EmptyView icon={<Users size={20} />} msg="Aucun membre d'équipe." /> : (
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
          {pending.length === 0 && done.length === 0 && <EmptyView icon={<CheckSquare size={20} />} msg="Aucune tâche." />}
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
      {isLoading ? <LoadingCards /> : (data ?? []).length === 0 ? <EmptyView icon={<CalendarDays size={20} />} msg="Aucun rendez-vous." /> : (
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

const DOC_TYPE_STYLE: Record<string, { label: string; color: string }> = {
  LAB_RESULT:      { label: "Résultat labo",    color: "text-blue-700 bg-blue-50 border-blue-200" },
  IMAGING:         { label: "Imagerie",          color: "text-purple-700 bg-purple-50 border-purple-200" },
  PRESCRIPTION:    { label: "Ordonnance",        color: "text-green-700 bg-green-50 border-green-200" },
  CLINICAL_REPORT: { label: "Compte-rendu",      color: "text-amber-700 bg-amber-50 border-amber-200" },
  CARE_PLAN:       { label: "Plan de soin",      color: "text-teal-700 bg-teal-50 border-teal-200" },
  CONSENT_FORM:    { label: "Consentement",      color: "text-gray-700 bg-gray-50 border-gray-200" },
  OTHER:           { label: "Autre",             color: "text-gray-600 bg-gray-50 border-gray-200" },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function DocumentsSection({ careCaseId, api }: { careCaseId: string; api: ReturnType<typeof apiWithToken> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["documents", careCaseId],
    queryFn: () => api.documents.list(careCaseId),
  });

  return (
    <div className="p-6 max-w-3xl space-y-3">
      <h2 className="text-sm font-semibold">
        Documents {data?.length ? <span className="text-muted-foreground font-normal">({data.length})</span> : ""}
      </h2>
      {isLoading ? <LoadingCards /> : !(data?.length) ? (
        <EmptyView icon={<FileText size={20} />} msg="Aucun document." />
      ) : (
        <div className="space-y-2">
          {data.map((doc) => {
            const style = DOC_TYPE_STYLE[doc.documentType] ?? DOC_TYPE_STYLE.OTHER;
            return (
              <div key={doc.id} className="rounded-xl border p-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${style.color}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatBytes(doc.sizeBytes)}</span>
                    </div>
                    <p className="text-xs font-medium truncate">{doc.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {doc.uploadedBy.firstName} {doc.uploadedBy.lastName} · {daysAgo(doc.createdAt)}
                    </p>
                    {doc.summaryAi && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 italic">
                        <Sparkles size={10} className="inline mr-1 opacity-50" />{doc.summaryAi}
                      </p>
                    )}
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                    <FileText size={16} />
                  </a>
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
      {isLoading ? <LoadingCards /> : !(data?.length) ? <EmptyView icon={<BookOpen size={20} />} msg="Aucune entrée journal." /> : (
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

function MessagesSection({ careCaseId, api }: {
  careCaseId: string; api: ReturnType<typeof apiWithToken>;
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
          <MessageSquare size={14} /> Discussion de l'équipe
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Fil de coordination partagé avec tous les professionnels du dossier
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
            <span className="text-[11px] font-semibold">{careCase.careStage ?? "Non définie"}</span>
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", careCaseId] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts", careCaseId] }),
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

  // Gap analysis
  const { data: gapData, isLoading: gapsLoading, refetch: refetchGaps } = useQuery({
    queryKey: ["care-gaps", careCaseId],
    queryFn: () => api.intelligence.careGaps(careCaseId),
  });

  // AI Summary
  const summarize = useMutation({
    mutationFn: () => api.intelligence.summarize(careCaseId, true),
    onSuccess: (result: SummaryResult) => {
      qc.invalidateQueries({ queryKey: ["care-case", careCaseId] });
      setSummaryData(result);
      toast.success("Résumé IA généré");
    },
    onError: () => toast.error("Erreur lors de la génération du résumé"),
  });

  const [summaryData, setSummaryData] = useState<SummaryResult | null>(null);

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
            onClick={() => summarize.mutate()} disabled={summarize.isPending}>
            <Sparkles size={11} /> {summarize.isPending ? "Génération…" : "Générer résumé IA"}
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

      {/* ── Résumé IA structuré ── */}
      {(summaryData || careCase.clinicalSummary) && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={12} /> Résumé IA
              {summaryData && <span className="font-normal normal-case ml-1">· généré {new Date(summaryData.generatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
            </p>
          </div>

          {summaryData ? (
            <div className="divide-y divide-border/30">
              <SummaryBlock title="Vue d'ensemble" content={summaryData.summary.overview} />
              <SummaryBlock title="Évolution récente" content={summaryData.summary.recentEvolution} />
              <SummaryBlock title="Évaluation de l'équipe" content={summaryData.summary.careTeamAssessment} />
              {summaryData.summary.keyFindings.length > 0 && (
                <div className="px-4 py-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Points clés</p>
                  <ul className="space-y-1.5">
                    {summaryData.summary.keyFindings.map((f, i) => (
                      <li key={i} className="text-sm leading-relaxed flex items-start gap-2">
                        <span className="text-primary shrink-0 mt-1">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {summaryData.summary.recommendations.length > 0 && (
                <div className="px-4 py-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Recommandations</p>
                  <ul className="space-y-1.5">
                    {summaryData.summary.recommendations.map((r, i) => (
                      <li key={i} className="text-sm leading-relaxed flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-1" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <SummaryBlock title="Évaluation des risques" content={summaryData.summary.riskAssessment} />
            </div>
          ) : careCase.clinicalSummary ? (
            <div className="px-4 py-4">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{careCase.clinicalSummary}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-3">Cliquez sur « Générer résumé IA » pour obtenir une analyse structurée complète.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* CTA si pas encore de résumé */}
      {!summaryData && !careCase.clinicalSummary && (
        <div className="rounded-lg border border-dashed bg-muted/10 px-6 py-10 text-center">
          <Sparkles size={24} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucun résumé IA disponible</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm mx-auto leading-relaxed">
            Générez un résumé clinique intelligent pour obtenir une synthèse structurée du parcours, les points clés et les recommandations.
          </p>
          <Button size="sm" className="mt-4 text-xs gap-1.5" onClick={() => summarize.mutate()} disabled={summarize.isPending}>
            <Sparkles size={12} /> {summarize.isPending ? "Génération…" : "Générer le résumé IA"}
          </Button>
        </div>
      )}
    </div>
  );
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

function EmptyView({ icon, msg }: { icon: React.ReactNode; msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-muted-foreground/25 mb-3">{icon}</div>
      <p className="text-sm text-muted-foreground">{msg}</p>
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
