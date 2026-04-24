"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, type PathwayNode, type PathwayNodeStatus, type PathwayTemplateStep, type ProtocolContent } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { groupByFamily, getFamilyLabel, getPhaseLabel } from "@/lib/pathwayFamilyLabels";
import { toast } from "sonner";
import {
  Route, CheckCircle2, Circle, ChevronDown, ChevronUp,
  Users, CalendarClock, Loader2, Activity, AlertTriangle,
  Clock, Search, Plus, Stethoscope, FlaskConical, FileText,
  ClipboardList, Pill, BarChart3, Zap, Play,
  BookOpen, X, Timer, AlertCircle, PlusCircle, ListChecks,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  firstName: string;
  lastName: string;
  role: string;
  specialty: string | null;
}

interface NextAppointment {
  date: string;
  provider: string;
  type: string;
}

interface PatientConfig {
  pathway: {
    name: string;
    family: string;
    phases: unknown[];
    currentPhase: string | null;
    dayInPathway: number;
    startedAt: string;
  } | null;
  team: TeamMember[];
  nextAppointment: NextAppointment | null;
}

// ─── Act type helpers ─────────────────────────────────────────────────────────

const ACT_ICONS: Record<string, React.ReactNode> = {
  CONSULTATION: <Stethoscope size={11} className="shrink-0" />,
  BILAN:        <FlaskConical size={11} className="shrink-0" />,
  QUESTIONNAIRE: <ClipboardList size={11} className="shrink-0" />,
  PRESCRIPTION: <Pill size={11} className="shrink-0" />,
  SUIVI:        <BarChart3 size={11} className="shrink-0" />,
  DOCUMENT:     <FileText size={11} className="shrink-0" />,
};

const ACT_COLORS: Record<string, string> = {
  CONSULTATION: "bg-indigo-50 text-indigo-600 border-indigo-100",
  BILAN:        "bg-blue-50 text-blue-600 border-blue-100",
  QUESTIONNAIRE: "bg-purple-50 text-purple-600 border-purple-100",
  PRESCRIPTION: "bg-emerald-50 text-emerald-600 border-emerald-100",
  SUIVI:        "bg-teal-50 text-teal-600 border-teal-100",
  DOCUMENT:     "bg-neutral-100 text-neutral-500 border-neutral-200",
};

function ActBadge({ type }: { type: string }) {
  const icon = ACT_ICONS[type] ?? <Zap size={11} className="shrink-0" />;
  const cls = ACT_COLORS[type] ?? "bg-neutral-100 text-neutral-500 border-neutral-200";
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cls}`}>
      {icon}
      {type}
    </span>
  );
}

// ─── Node status config ───────────────────────────────────────────────────────

const NODE_STATUS_CFG: Record<PathwayNodeStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  FUTURE:     { label: "À venir",    cls: "bg-neutral-50 text-neutral-400 border-neutral-200",  icon: <Circle size={13} className="text-neutral-300 shrink-0" /> },
  APPROACHING:{ label: "Bientôt",    cls: "bg-amber-50 text-amber-600 border-amber-200",         icon: <Clock size={13} className="text-amber-400 shrink-0" /> },
  IN_WINDOW:  { label: "En cours",   cls: "bg-blue-50 text-blue-600 border-blue-200",            icon: <div className="w-3 h-3 rounded-full bg-blue-400 ring-2 ring-blue-200 shrink-0" /> },
  OVERDUE:    { label: "En retard",  cls: "bg-red-50 text-red-600 border-red-200",               icon: <AlertTriangle size={13} className="text-red-400 shrink-0" /> },
  COMPLETED:  { label: "Réalisé",    cls: "bg-teal-50 text-teal-600 border-teal-100",            icon: <CheckCircle2 size={13} className="text-teal-500 shrink-0" /> },
  SKIPPED:    { label: "Ignoré",     cls: "bg-neutral-50 text-neutral-400 border-neutral-200",   icon: <Circle size={13} className="text-neutral-200 shrink-0" /> },
};

// ─── StepProtocolPanel — "Comment faire" drawer inline ───────────────────────

const PROTOCOL_TYPE_ICONS: Record<string, string> = {
  note_consultation: "📝",
  prescription: "💊",
  adressage: "📬",
  observation: "👁",
};

function StepProtocolPanel({
  actLabel,
  clinicalActType,
  protocol,
  onClose,
}: {
  actLabel: string;
  clinicalActType: string;
  protocol: ProtocolContent;
  onClose: () => void;
}) {
  const hasPrescribe = (protocol.toPrescribe?.length ?? 0) > 0;
  const hasOrder = (protocol.toOrder?.length ?? 0) > 0;
  const hasCreate = (protocol.toCreateInNami?.length ?? 0) > 0;
  const hasRedFlags = (protocol.redFlags?.length ?? 0) > 0;
  const hasSources = (protocol.sources?.length ?? 0) > 0;

  return (
    <div className="rounded-xl border border-[rgba(91,78,196,0.18)] bg-[rgba(91,78,196,0.02)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[rgba(91,78,196,0.1)]"
        style={{ background: "rgba(91,78,196,0.04)" }}>
        <div className="flex items-start gap-2.5 min-w-0">
          <BookOpen size={14} className="text-[#5B4EC4] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B4EC4]">Protocole · {clinicalActType}</p>
            <p className="text-sm font-semibold text-[#1A1A2E] leading-snug mt-0.5 truncate">{actLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {protocol.duration && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-[rgba(91,78,196,0.15)] text-[#5B4EC4]">
              <Timer size={9} /> {protocol.duration}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700">
            Brouillon IA — à vérifier
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[rgba(91,78,196,0.1)] transition-colors"
          >
            <X size={13} className="text-neutral-400" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Checklist */}
        {protocol.checklist.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ListChecks size={12} className="text-[#5B4EC4]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B4EC4]">Checklist</p>
            </div>
            <div className="space-y-3">
              {protocol.checklist.map((cat, ci) => (
                <div key={ci}>
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">{cat.category}</p>
                  <ul className="space-y-1">
                    {cat.items.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded border border-[rgba(91,78,196,0.25)] bg-white flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-sm bg-[rgba(91,78,196,0.3)]" />
                        </div>
                        <span className="text-xs text-neutral-700 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* À prescrire */}
        {hasPrescribe && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Pill size={11} className="text-emerald-600" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">À prescrire</p>
            </div>
            <ul className="space-y-1">
              {protocol.toPrescribe!.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs text-neutral-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* À commander */}
        {hasOrder && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FlaskConical size={11} className="text-blue-600" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Examens à prescrire</p>
            </div>
            <ul className="space-y-1">
              {protocol.toOrder!.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-xs text-neutral-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* À créer dans Nami */}
        {hasCreate && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <PlusCircle size={11} className="text-indigo-600" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">À créer dans Nami après</p>
            </div>
            <div className="space-y-1">
              {protocol.toCreateInNami!.map((item, i) => (
                <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="text-sm shrink-0">{PROTOCOL_TYPE_ICONS[item.type] ?? "📌"}</span>
                  <span className="text-xs text-indigo-800 leading-snug">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critères d'escalade */}
        {hasRedFlags && (
          <div className="rounded-lg border border-red-100 bg-red-50/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle size={11} className="text-red-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Critères d'escalade</p>
            </div>
            <ul className="space-y-1">
              {protocol.redFlags!.map((flag, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 text-xs">›</span>
                  <span className="text-xs text-red-700 leading-snug">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {hasSources && (
          <div className="pt-1 border-t border-neutral-100">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Sources</p>
            <div className="flex flex-wrap gap-1">
              {protocol.sources.map((src, i) => (
                <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 border border-neutral-200">
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ViewParcours ─────────────────────────────────────────────────────────────

export function ViewParcours({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  // Patient config (team, nextAppointment, pathway header)
  const { data: config, isLoading: configLoading } = useQuery<PatientConfig>({
    queryKey: ["patient-config", careCaseId],
    queryFn: async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
      const res = await fetch(`${API_URL}/care-cases/${careCaseId}/patient-config`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("patient-config failed");
      return res.json() as Promise<PatientConfig>;
    },
    staleTime: 60_000,
  });

  // Pathway graph (CIE nodes — instantiated)
  const { data: graphData, isLoading: graphLoading } = useQuery({
    queryKey: ["pathway-graph", careCaseId],
    queryFn: () => api.careCases.pathwayGraph(careCaseId).catch(() => null),
    staleTime: 30_000,
  });

  // Template steps fallback (when no nodes instantiated)
  const hasNodes = (graphData?.nodes?.length ?? 0) > 0;
  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: ["pathway-template-steps", careCaseId],
    queryFn: () => api.careCases.pathwayTemplateSteps(careCaseId),
    staleTime: 300_000,
    enabled: !graphLoading && !hasNodes,
  });

  const isLoading = configLoading || graphLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!config?.pathway && !graphData?.pathway && !templateData?.pathway) {
    return <EmptyState careCaseId={careCaseId} />;
  }

  const pathway = graphData?.pathway ?? templateData?.pathway ?? null;
  const pathwayName = pathway?.label ?? config?.pathway?.name ?? "Parcours de soins";
  const startedAt = config?.pathway?.startedAt ?? graphData?.pathwayStartedAt ?? null;
  const dayInPathway = config?.pathway?.dayInPathway ?? 0;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* ─── Header ─── */}
      <PathwayHeader
        careCaseId={careCaseId}
        name={pathwayName}
        startedAt={startedAt}
        dayInPathway={dayInPathway}
        summary={graphData?.summary ?? null}
        hasNodes={hasNodes}
        totalSteps={templateData?.steps.length ?? 0}
      />

      {/* ─── Steps ─── */}
      {hasNodes ? (
        <CIEStepsSection nodes={graphData!.nodes} careCaseId={careCaseId} />
      ) : (
        <TemplateStepsSection
          steps={templateData?.steps ?? []}
          loading={templateLoading}
          careCaseId={careCaseId}
        />
      )}

      {/* ─── À anticiper ─── */}
      {hasNodes && graphData?.nodes && (
        <AnticipateSection nodes={graphData.nodes} />
      )}

      {/* ─── Équipe + RDV ─── */}
      {(config?.team?.length || config?.nextAppointment) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(config.team?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} className="text-neutral-400" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Équipe de soins
                </p>
              </div>
              <div className="space-y-2">
                {config.team.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-semibold text-indigo-600 shrink-0">
                      {m.firstName[0]}{m.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-700 truncate">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {m.specialty ?? m.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {config?.nextAppointment && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock size={13} className="text-neutral-400" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Prochain rendez-vous
                </p>
              </div>
              <p className="text-sm font-semibold text-neutral-800">
                {new Date(config.nextAppointment.date).toLocaleDateString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {new Date(config.nextAppointment.date).toLocaleTimeString("fr-FR", {
                  hour: "2-digit", minute: "2-digit",
                })}
                {" · "}{config.nextAppointment.provider}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {config.nextAppointment.type}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── À anticiper — étapes APPROACHING (préparation soignant) ─────────────────

const ANTICIPATE_HINTS: Partial<Record<string, { hint: string; icon: string }>> = {
  CONSULTATION: { hint: "Planifier une consultation", icon: "📅" },
  BILAN:        { hint: "Prescrire le bilan dès maintenant", icon: "🧪" },
  QUESTIONNAIRE:{ hint: "Envoyer le questionnaire au patient", icon: "📋" },
  PRESCRIPTION: { hint: "Préparer l'ordonnance", icon: "💊" },
  SUIVI:        { hint: "Prévoir le suivi", icon: "📈" },
  DOCUMENT:     { hint: "Rassembler les documents", icon: "📄" },
};

function AnticipateSection({ nodes }: { nodes: PathwayNode[] }) {
  const approaching = nodes.filter(n => n.status === "APPROACHING").slice(0, 3);
  if (approaching.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">⏳</span>
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">À anticiper</p>
        <span className="text-[10px] text-amber-500 font-medium">— à préparer dans les prochains jours</span>
      </div>
      <div className="space-y-2">
        {approaching.map((node) => {
          const hint = ANTICIPATE_HINTS[node.clinicalActType];
          return (
            <div
              key={node.id}
              className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-amber-100 shadow-sm"
            >
              <span className="text-lg shrink-0 mt-0.5">{hint?.icon ?? "📌"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-neutral-800 leading-snug">{node.actLabel}</p>
                <p className="text-[11px] text-amber-600 mt-0.5">{hint?.hint}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {node.specialty && <span className="text-[10px] text-neutral-400">{node.specialty}</span>}
                  {node.expectedDate && (
                    <span className="text-[10px] text-amber-500 font-medium">
                      · À faire avant le {new Date(node.expectedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </span>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded border bg-amber-50 text-amber-600 border-amber-200">
                Bientôt
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PathwayHeader ────────────────────────────────────────────────────────────

function PathwayHeader({
  careCaseId,
  name,
  startedAt,
  dayInPathway,
  summary,
  hasNodes,
  totalSteps,
}: {
  careCaseId: string;
  name: string;
  startedAt: string | null;
  dayInPathway: number;
  summary: { total: number; completed: number; overdue: number; inWindow: number; skipped: number; pending: number } | null;
  hasNodes: boolean;
  totalSteps: number;
}) {
  const [showChangePanel, setShowChangePanel] = useState(false);
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const instantiate = useMutation({
    mutationFn: () => apiWithToken(accessToken!).careCases.instantiatePathway(careCaseId),
    onSuccess: (res) => {
      toast.success(`Parcours instancié — ${res.nodesCreated} étapes créées`);
      qc.invalidateQueries({ queryKey: ["pathway-graph", careCaseId] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Erreur lors de l'instanciation"),
  });

  const completionPercent = summary
    ? Math.round((summary.completed / Math.max(summary.total, 1)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <Route size={18} className="text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-800 leading-tight">{name}</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {startedAt ? <>Démarré le {formatDate(startedAt)}{dayInPathway >= 0 && ` · J+${dayInPathway}`}</> : "Parcours non démarré"}
              {summary && ` · ${summary.completed}/${summary.total} étapes`}
              {!hasNodes && totalSteps > 0 && ` · ${totalSteps} étapes planifiées`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {!hasNodes && (
            <button
              type="button"
              onClick={() => instantiate.mutate()}
              disabled={instantiate.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-all shadow-sm shadow-teal-200 hover:shadow-teal-300 disabled:opacity-50"
            >
              {instantiate.isPending ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
              Démarrer le suivi
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowChangePanel(!showChangePanel)}
            className="text-[10px] font-medium px-2 py-1 rounded-lg border border-neutral-200 text-neutral-500 hover:border-teal-300 hover:text-teal-600 transition-colors"
          >
            Modifier
          </button>
          {hasNodes && summary && (
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full border",
              summary.overdue > 0
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-teal-50 text-teal-600 border-teal-100"
            )}>
              {summary.overdue > 0 ? `${summary.overdue} en retard` : `${completionPercent}% accompli`}
            </span>
          )}
        </div>
      </div>

      {showChangePanel && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <PathwayAssignPanel careCaseId={careCaseId} onClose={() => setShowChangePanel(false)} />
        </div>
      )}

      {hasNodes && summary && (
        <div className="mt-4">
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%`, background: "linear-gradient(90deg, #5B4EC4, #2BA89C)" }}
            />
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-400">
            <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-teal-500" /> {summary.completed} réalisés</span>
            {summary.overdue > 0 && <span className="flex items-center gap-1"><AlertTriangle size={10} className="text-red-400" /> {summary.overdue} en retard</span>}
            {summary.inWindow > 0 && <span className="flex items-center gap-1"><Activity size={10} className="text-blue-400" /> {summary.inWindow} en cours</span>}
            <span>{summary.pending} à venir</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CIE Nodes — groupés par phaseLabel ───────────────────────────────────────

function NextStepHero({
  node,
  protocolOpen,
  onToggleProtocol,
  onMarkDone,
  markingDone,
}: {
  node: PathwayNode;
  protocolOpen: boolean;
  onToggleProtocol: () => void;
  onMarkDone: () => void;
  markingDone: boolean;
}) {
  const isOverdue = node.status === "OVERDUE";
  const accentColor = isOverdue ? "#D94F4F" : "#5B4EC4";

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        border: `2px solid ${isOverdue ? "rgba(217,79,79,0.2)" : "rgba(91,78,196,0.15)"}`,
        background: isOverdue ? "rgba(217,79,79,0.02)" : "rgba(91,78,196,0.015)",
      }}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
        {isOverdue ? "⚠ Étape en retard" : "Votre prochaine étape"}
      </p>
      <p className="text-[16px] font-bold text-[#1A1A2E] leading-snug">{node.actLabel}</p>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {node.specialty && <span className="text-[12px] text-[#4A4A5A]">{node.specialty}</span>}
        {node.phaseLabel && <span className="text-[12px] text-[#8A8A96]">· {node.phaseLabel}</span>}
        {node.expectedDate && (
          <span className="text-[12px] text-[#8A8A96]">
            · à faire avant le {new Date(node.expectedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          </span>
        )}
        {isOverdue && node.daysOverdue !== null && (
          <span className="text-[12px] font-semibold text-[#D94F4F]">· {node.daysOverdue}j de retard</span>
        )}
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          onClick={onToggleProtocol}
          className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg text-white transition-all"
          style={{ background: accentColor, border: "none", cursor: "pointer", opacity: protocolOpen ? 0.85 : 1 }}
        >
          <BookOpen size={13} />
          {protocolOpen ? "Fermer le protocole" : "Comment faire →"}
        </button>
        <button
          onClick={onMarkDone}
          disabled={markingDone}
          className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          style={{ border: "1px solid rgba(26,26,46,0.12)", background: "transparent", color: "#4A4A5A", cursor: markingDone ? "not-allowed" : "pointer" }}
        >
          {markingDone ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} className="text-teal-500" />}
          Marquer comme fait
        </button>
      </div>
    </div>
  );
}

function CIEStepsSection({ nodes, careCaseId }: { nodes: PathwayNode[]; careCaseId: string }) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [heroProtocolOpen, setHeroProtocolOpen] = useState(false);

  const nextStep =
    nodes.find(n => n.status === "OVERDUE") ??
    nodes.find(n => n.status === "IN_WINDOW") ??
    nodes.find(n => n.status === "APPROACHING") ??
    null;

  const markDone = useMutation({
    mutationFn: (nodeId: string) =>
      apiWithToken(accessToken!).careCases.patchNode(careCaseId, nodeId, {
        status: "COMPLETED",
        realizedDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      toast.success("Étape marquée comme réalisée");
      setHeroProtocolOpen(false);
      qc.invalidateQueries({ queryKey: ["pathway-graph", careCaseId] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  // Group by phaseLabel
  const phases: { label: string; nodes: PathwayNode[] }[] = [];
  const seen = new Map<string, PathwayNode[]>();
  for (const node of nodes) {
    const key = getPhaseLabel(node.phaseLabel ?? "");
    if (!seen.has(key)) { seen.set(key, []); phases.push({ label: key, nodes: seen.get(key)! }); }
    seen.get(key)!.push(node);
  }

  const activeStatuses = new Set<PathwayNodeStatus>(["OVERDUE", "IN_WINDOW", "APPROACHING"]);

  return (
    <div className="space-y-3">
      {nextStep && (
        <NextStepHero
          node={nextStep}
          protocolOpen={heroProtocolOpen}
          onToggleProtocol={() => setHeroProtocolOpen(prev => !prev)}
          onMarkDone={() => markDone.mutate(nextStep.id)}
          markingDone={markDone.isPending}
        />
      )}
      {/* Panel protocole du hero — contenu ou placeholder */}
      {heroProtocolOpen && nextStep && (
        nextStep.PathwayTemplateStep?.protocolContent
          ? (
            <StepProtocolPanel
              actLabel={nextStep.actLabel}
              clinicalActType={nextStep.clinicalActType}
              protocol={nextStep.PathwayTemplateStep.protocolContent}
              onClose={() => setHeroProtocolOpen(false)}
            />
          ) : (
            <div className="rounded-xl border border-[rgba(91,78,196,0.15)] bg-[rgba(91,78,196,0.02)] px-4 py-5 flex items-center gap-3">
              <BookOpen size={16} className="text-[#5B4EC4] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1A1A2E]">Protocole en cours de génération</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Le protocole clinique pour cette étape sera disponible sous peu. Il est généré à partir des recommandations HAS/FFAB.
                </p>
              </div>
            </div>
          )
      )}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-1">
        Toutes les étapes ({nodes.length})
      </p>
      {phases.map((phase) => {
        const hasActive = phase.nodes.some(n => activeStatuses.has(n.status));
        return (
          <CIEPhaseGroup
            key={phase.label}
            label={phase.label}
            nodes={phase.nodes}
            defaultOpen={hasActive}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(prev => prev === id ? null : id)}
            careCaseId={careCaseId}
          />
        );
      })}
    </div>
  );
}

function CIEPhaseGroup({
  label, nodes, defaultOpen, selectedNodeId, onSelectNode, careCaseId,
}: {
  label: string;
  nodes: PathwayNode[];
  defaultOpen?: boolean;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  careCaseId: string;
}) {
  const completed = nodes.filter(n => n.status === "COMPLETED").length;
  const overdue = nodes.filter(n => n.status === "OVERDUE").length;
  const [open, setOpen] = useState(defaultOpen ?? false);

  const phaseStatus: PathwayNodeStatus = overdue > 0 ? "OVERDUE"
    : completed === nodes.length ? "COMPLETED"
    : nodes.some(n => n.status === "IN_WINDOW" || n.status === "APPROACHING") ? "IN_WINDOW"
    : "FUTURE";
  const cfg = NODE_STATUS_CFG[phaseStatus];

  return (
    <div className={`rounded-xl border ${overdue > 0 ? "border-red-100" : completed === nodes.length ? "border-teal-100" : "border-neutral-100"} bg-white overflow-hidden shadow-sm`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {cfg.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-neutral-700">{label}</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            {completed}/{nodes.length} étape{nodes.length > 1 ? "s" : ""}
            {overdue > 0 && <span className="ml-2 text-red-500 font-medium">· {overdue} en retard</span>}
          </p>
        </div>
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${cfg.cls} shrink-0`}>
          {cfg.label}
        </span>
        {open ? <ChevronUp size={14} className="text-neutral-400 shrink-0" /> : <ChevronDown size={14} className="text-neutral-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
          <div className="space-y-1.5 pt-2">
            {nodes.map((node) => (
              <CIENodeRow
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onToggleProtocol={() => onSelectNode(node.id)}
                careCaseId={careCaseId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CIENodeRow({
  node, isSelected, onToggleProtocol, careCaseId,
}: {
  node: PathwayNode;
  isSelected: boolean;
  onToggleProtocol: () => void;
  careCaseId: string;
}) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const cfg = NODE_STATUS_CFG[node.status] ?? NODE_STATUS_CFG.FUTURE;
  const protocol = node.PathwayTemplateStep?.protocolContent ?? null;

  const markDone = useMutation({
    mutationFn: () =>
      apiWithToken(accessToken!).careCases.patchNode(careCaseId, node.id, {
        status: "COMPLETED",
        realizedDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      toast.success("Étape réalisée");
      qc.invalidateQueries({ queryKey: ["pathway-graph", careCaseId] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  return (
    <div>
      <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${
        node.status === "OVERDUE" ? "bg-red-50/50 border-red-100"
        : node.status === "COMPLETED" ? "bg-teal-50/30 border-teal-100"
        : node.status === "IN_WINDOW" ? "bg-blue-50/30 border-blue-100"
        : "bg-neutral-50 border-neutral-100"
      } ${isSelected ? "border-[rgba(91,78,196,0.3)]" : ""}`}>
        <div className="mt-0.5">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs font-medium leading-snug ${node.status === "SKIPPED" ? "line-through text-neutral-400" : "text-neutral-700"}`}>
              {node.actLabel}
              {node.isRequired && <span className="ml-1 text-[9px] text-red-400">*</span>}
            </p>
            <span className={`shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded border ${cfg.cls}`}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <ActBadge type={node.clinicalActType} />
            {node.specialty && (
              <span className="text-[10px] text-neutral-400">{node.specialty}</span>
            )}
            {node.status === "OVERDUE" && node.daysOverdue !== null && (
              <span className="text-[10px] font-medium text-red-500">{node.daysOverdue}j de retard</span>
            )}
            {node.status === "COMPLETED" && node.realizedDate && (
              <span className="text-[10px] text-teal-600">{formatDate(node.realizedDate)}</span>
            )}
            {node.expectedDate && node.status !== "COMPLETED" && (
              <span className="text-[10px] text-neutral-400">Prévu {formatDate(node.expectedDate)}</span>
            )}
            <button
              onClick={onToggleProtocol}
              className={cn(
                "text-[9px] font-medium px-1.5 py-0.5 rounded border transition-colors",
                isSelected
                  ? "bg-[rgba(91,78,196,0.1)] border-[rgba(91,78,196,0.3)] text-[#5B4EC4]"
                  : "bg-white border-neutral-200 text-neutral-400 hover:border-[rgba(91,78,196,0.3)] hover:text-[#5B4EC4]"
              )}
            >
              {isSelected ? "✕ Fermer" : "Comment faire →"}
            </button>
            {node.status !== "COMPLETED" && node.status !== "SKIPPED" && (
              <button
                onClick={() => markDone.mutate()}
                disabled={markDone.isPending}
                className="text-[9px] font-medium px-1.5 py-0.5 rounded border border-neutral-200 bg-white text-neutral-400 hover:border-teal-300 hover:text-teal-600 transition-colors disabled:opacity-50"
              >
                {markDone.isPending ? "…" : "✓ Fait"}
              </button>
            )}
          </div>
          {node.ProviderProfile && (
            <p className="text-[10px] text-indigo-500 mt-0.5">
              {node.ProviderProfile.person.firstName} {node.ProviderProfile.person.lastName}
            </p>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="mt-1.5">
          {protocol
            ? (
              <StepProtocolPanel
                actLabel={node.actLabel}
                clinicalActType={node.clinicalActType}
                protocol={protocol}
                onClose={onToggleProtocol}
              />
            ) : (
              <div className="rounded-lg border border-[rgba(91,78,196,0.15)] bg-[rgba(91,78,196,0.02)] px-3 py-3 flex items-center gap-2.5">
                <BookOpen size={13} className="text-[#5B4EC4] shrink-0" />
                <p className="text-xs text-neutral-500">
                  Protocole en cours de génération — disponible sous peu.
                </p>
                <button onClick={onToggleProtocol} className="ml-auto shrink-0">
                  <X size={11} className="text-neutral-400" />
                </button>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

// ─── Template Steps — blueprint statique ─────────────────────────────────────

function TemplateStepsSection({
  steps,
  loading,
  careCaseId,
}: {
  steps: PathwayTemplateStep[];
  loading: boolean;
  careCaseId: string;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6 text-center">
        <p className="text-sm text-neutral-500">Aucune étape définie pour ce parcours.</p>
      </div>
    );
  }

  // Group by phaseLabel
  const phases: { label: string; steps: PathwayTemplateStep[] }[] = [];
  const seen = new Map<string, PathwayTemplateStep[]>();
  for (const step of steps) {
    const key = getPhaseLabel(step.phaseLabel ?? "");
    if (!seen.has(key)) { seen.set(key, []); phases.push({ label: key, steps: seen.get(key)! }); }
    seen.get(key)!.push(step);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs font-semibold text-neutral-600">
          Plan de soins · <span className="text-teal-600">{steps.length} étapes</span>
        </p>
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 mb-2 rounded-xl bg-amber-50 border border-amber-100">
        <Play size={11} className="text-amber-600 shrink-0" fill="currentColor" />
        <p className="text-[11px] font-medium text-amber-700">
          Cliquez <strong>Démarrer le suivi</strong> pour activer le suivi en temps réel et assigner les étapes à l'équipe.
        </p>
      </div>
      {phases.map((phase, i) => (
        <TemplatePhaseGroup key={phase.label} label={phase.label} steps={phase.steps} defaultOpen={i === 0} />
      ))}

    </div>
  );
}

function TemplatePhaseGroup({ label, steps, defaultOpen = false }: { label: string; steps: PathwayTemplateStep[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const required = steps.filter(s => s.isRequired).length;

  return (
    <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-neutral-800">{label}</span>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {steps.length} étape{steps.length > 1 ? "s" : ""}
            {required > 0 && ` · ${required} obligatoire${required > 1 ? "s" : ""}`}
          </p>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
          Planifié
        </span>
        {open ? <ChevronUp size={14} className="text-neutral-400 shrink-0" /> : <ChevronDown size={14} className="text-neutral-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
          <div className="space-y-1.5 pt-2">
            {steps.map((step) => {
              const isSelected = selectedStepId === step.id;
              const hasProtocol = !!step.protocolContent;
              return (
                <div key={step.id}>
                  <div
                    className={cn(
                      "flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-white border transition-colors",
                      isSelected ? "border-[rgba(91,78,196,0.25)] bg-[rgba(91,78,196,0.02)]" : "border-neutral-100 hover:border-teal-100 hover:bg-teal-50/30"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-teal-200 shrink-0 mt-0.5 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 leading-snug">
                        {step.actLabel}
                        {step.isRequired && <span className="ml-1 text-[9px] font-bold text-teal-500 uppercase">Requis</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <ActBadge type={step.clinicalActType} />
                        {step.specialty && (
                          <span className="text-[10px] text-neutral-400">{step.specialty}</span>
                        )}
                        {step.expectedDayOffset > 0 && (
                          <span className="text-[10px] text-neutral-400">J+{step.expectedDayOffset}</span>
                        )}
                        {step.sourceRef && (
                          <span className="text-[9px] font-mono text-neutral-300">{step.sourceRef}</span>
                        )}
                        {hasProtocol && (
                          <button
                            onClick={() => setSelectedStepId(prev => prev === step.id ? null : step.id)}
                            className={cn(
                              "text-[9px] font-medium px-1.5 py-0.5 rounded border transition-colors",
                              isSelected
                                ? "bg-[rgba(91,78,196,0.1)] border-[rgba(91,78,196,0.3)] text-[#5B4EC4]"
                                : "bg-white border-neutral-200 text-neutral-400 hover:border-[rgba(91,78,196,0.3)] hover:text-[#5B4EC4]"
                            )}
                          >
                            {isSelected ? "✕ Fermer" : "Comment faire →"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSelected && step.protocolContent && (
                    <div className="mt-1.5">
                      <StepProtocolPanel
                        actLabel={step.actLabel}
                        clinicalActType={step.clinicalActType}
                        protocol={step.protocolContent}
                        onClose={() => setSelectedStepId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PathwayAssignPanel ───────────────────────────────────────────────────────

function PathwayAssignPanel({ careCaseId, onClose }: { careCaseId: string; onClose?: () => void }) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const apiClient = apiWithToken(accessToken!);

  const [search, setSearch] = useState("");

  const { data: pathways = [], isLoading } = useQuery<{ id: string; key: string; label: string; family: string }[]>({
    queryKey: ["pathways-all-slim"],
    queryFn: () => apiClient.intelligence.pathways(undefined, undefined, true),
    staleTime: 5 * 60 * 1000,
  });

  const filtered = pathways.filter((p) =>
    !search || p.label.toLowerCase().includes(search.toLowerCase()) || p.family.toLowerCase().includes(search.toLowerCase())
  );

  const assignMutation = useMutation({
    mutationFn: (pathwayTemplateId: string) => apiClient.careCases.assignPathway(careCaseId, pathwayTemplateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-config", careCaseId] });
      qc.invalidateQueries({ queryKey: ["pathway-template-steps", careCaseId] });
      qc.invalidateQueries({ queryKey: ["pathway-graph", careCaseId] });
      toast.success("Parcours assigné");
      onClose?.();
    },
    onError: () => toast.error("Erreur lors de l'assignation"),
  });

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Choisir un parcours de soins
      </p>
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou famille…"
          className="w-full pl-7 pr-3 h-8 text-xs rounded-lg border border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
        />
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 size={16} className="animate-spin text-neutral-400" />
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-3 italic">Aucun parcours trouvé</p>
        )}
        {!isLoading && !search && filtered.length > 0 && (
          groupByFamily(filtered).map(({ family: fam, label: famLabel, items }) => (
            <div key={fam}>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 px-1 pt-2 pb-0.5">
                {famLabel}
              </p>
              {items.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  disabled={assignMutation.isPending}
                  onClick={() => assignMutation.mutate(p.id)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg border border-neutral-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all",
                    assignMutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-xs font-medium text-neutral-700 truncate">{p.label}</span>
                </button>
              ))}
            </div>
          ))
        )}
        {!isLoading && search && filtered.map((p) => (
          <button
            key={p.key}
            type="button"
            disabled={assignMutation.isPending}
            onClick={() => assignMutation.mutate(p.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg border border-neutral-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all",
              assignMutation.isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-700 truncate">{p.label}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 shrink-0">
                {getFamilyLabel(p.family)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ careCaseId }: { careCaseId: string }) {
  const [showPanel, setShowPanel] = useState(false);

  if (showPanel) {
    return (
      <div className="space-y-3 max-w-3xl">
        <PathwayAssignPanel careCaseId={careCaseId} onClose={() => setShowPanel(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 to-white p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mb-5 mx-auto shadow-md shadow-teal-200">
          <Route size={28} className="text-white" />
        </div>
        <h3 className="text-base font-bold text-neutral-800 mb-2">
          Aucun parcours de soins assigné
        </h3>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6 leading-relaxed">
          Sélectionnez un protocole HAS, FFAB ou Orphanet pour structurer les phases, les étapes et les délais du suivi.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          {["Anorexie mentale", "Obésité complexe", "PCR Nutrition", "Épilepsie pédiatrique"].map((ex) => (
            <span key={ex} className="text-[11px] font-medium px-3 py-1 rounded-full bg-teal-100 text-teal-700 border border-teal-200">{ex}</span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-all shadow-sm shadow-teal-200 mx-auto"
        >
          <Plus size={14} />
          Assigner un parcours structuré
        </button>
      </div>
    </div>
  );
}
