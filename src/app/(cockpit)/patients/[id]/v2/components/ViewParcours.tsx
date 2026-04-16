"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import {
  Route, CheckCircle2, Circle, ChevronDown, ChevronUp,
  ClipboardList, PenLine, Zap, Flame, Users, CalendarClock,
  Loader2, Activity, AlertTriangle, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  title: string;
  type: "questionnaire" | "free_text" | "action" | "streak" | string;
  code?: string;
  trigger?: string;
  target?: number;
}

interface Phase {
  key: string;
  label: string;
  order: number;
  exercises?: Exercise[];
}

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
    phases: Phase[];
    currentPhase: string | null;
    dayInPathway: number;
    startedAt: string;
  } | null;
  team: TeamMember[];
  nextAppointment: NextAppointment | null;
}

interface LatestObs {
  metricKey: string;
  label: string;
  value: number | string | boolean | null;
  unit: string | null;
  normalMin: number | null;
  normalMax: number | null;
  effectiveAt: string;
}

interface ObservationsLatestResponse {
  latest: Record<string, LatestObs[]>;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveActiveIndex(phases: Phase[], currentPhase: string | null): number {
  if (!currentPhase) return 0;
  let idx = phases.findIndex((p) => p.key === currentPhase);
  if (idx >= 0) return idx;
  idx = phases.findIndex((p) => p.label === currentPhase);
  if (idx >= 0) return idx;
  const lower = currentPhase.toLowerCase();
  idx = phases.findIndex(
    (p) =>
      p.label.toLowerCase().includes(lower) ||
      lower.includes(p.label.toLowerCase())
  );
  return idx >= 0 ? idx : 0;
}

const EXERCISE_ICONS: Record<string, React.ReactNode> = {
  questionnaire: <ClipboardList size={12} className="text-indigo-500 shrink-0" />,
  free_text:     <PenLine       size={12} className="text-sky-500 shrink-0" />,
  action:        <Zap           size={12} className="text-amber-500 shrink-0" />,
  streak:        <Flame         size={12} className="text-orange-500 shrink-0" />,
};

function ExerciseIcon({ type }: { type: string }) {
  return <>{EXERCISE_ICONS[type] ?? <Circle size={12} className="text-neutral-400 shrink-0" />}</>;
}

// ─── ViewParcours ─────────────────────────────────────────────────────────────

export function ViewParcours({ careCaseId }: { careCaseId: string }) {
  const { data, isLoading } = useQuery<PatientConfig>({
    queryKey: ["patient-config", careCaseId],
    queryFn: async () => {
      const res = await api.get<PatientConfig>(`/care-cases/${careCaseId}/patient-config`);
      return res.data;
    },
    staleTime: 60_000,
  });

  const { data: obsData } = useQuery<ObservationsLatestResponse>({
    queryKey: ["observations-latest", careCaseId],
    queryFn: async () => {
      const res = await api.get<ObservationsLatestResponse>(
        `/care-cases/${careCaseId}/observations/latest`
      );
      return res.data;
    },
    staleTime: 60_000,
    enabled: !!data?.pathway,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.pathway) {
    return <EmptyState />;
  }

  // Flatten all latest obs into a single map: metricKey → LatestObs
  const obsMap = new Map<string, LatestObs>();
  if (obsData?.latest) {
    for (const domain of Object.values(obsData.latest)) {
      for (const obs of domain) {
        obsMap.set(obs.metricKey, obs);
      }
    }
  }

  return (
    <PathwayView
      pathway={data.pathway}
      team={data.team}
      nextAppointment={data.nextAppointment}
      obsMap={obsMap}
    />
  );
}

// ─── PathwayView ──────────────────────────────────────────────────────────────

function PathwayView({
  pathway,
  team,
  nextAppointment,
  obsMap,
}: {
  pathway: NonNullable<PatientConfig["pathway"]>;
  team: TeamMember[];
  nextAppointment: NextAppointment | null;
  obsMap: Map<string, LatestObs>;
}) {
  const { name, phases, currentPhase, dayInPathway, startedAt } = pathway;
  const activeIndex = resolveActiveIndex(phases, currentPhase);
  const completionPercent =
    phases.length > 0
      ? Math.round((activeIndex / phases.length) * 100)
      : 0;

  // Section C — collecter les métriques mesurées (bio + vital)
  const trackedMetrics: LatestObs[] = Array.from(obsMap.values()).filter(
    (o) => o.value !== null && o.value !== undefined
  );

  // Section D — extraire les questionnaires uniques des phases
  const questionnairesMap = new Map<string, Exercise>();
  for (const phase of phases) {
    for (const ex of (phase.exercises ?? [])) {
      if (ex.type === "questionnaire" && !questionnairesMap.has(ex.title)) {
        questionnairesMap.set(ex.title, ex);
      }
    }
  }
  const questionnaires = Array.from(questionnairesMap.values());

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ─── A. HEADER ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
              <Route size={18} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-800 leading-tight">{name}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Démarré le {formatDate(startedAt)}
                {dayInPathway >= 0 && ` · J+${dayInPathway}`}
                {" · "}Phase {activeIndex + 1} / {phases.length}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
            {completionPercent}% accompli
          </span>
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {phases.map((ph, i) => (
              <span
                key={ph.key}
                className={`text-[9px] font-medium ${
                  i === activeIndex
                    ? "text-teal-600"
                    : i < activeIndex
                    ? "text-neutral-400"
                    : "text-neutral-300"
                }`}
              >
                {ph.label.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── B. PHASES ─────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-1">
          Phases du parcours
        </p>
        {phases.map((phase, idx) => (
          <PhaseCard
            key={phase.key}
            phase={phase}
            status={
              idx < activeIndex
                ? "COMPLETED"
                : idx === activeIndex
                ? "ACTIVE"
                : "UPCOMING"
            }
            defaultOpen={idx === activeIndex}
          />
        ))}
      </div>

      {/* ─── C. MÉTRIQUES SURVEILLÉES ──────────────────────── */}
      {trackedMetrics.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={13} className="text-neutral-400" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Métriques surveillées ({trackedMetrics.length})
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {trackedMetrics.slice(0, 12).map((obs) => {
              const val =
                typeof obs.value === "number"
                  ? obs.value
                  : null;
              const isLow =
                val !== null && obs.normalMin !== null && val < obs.normalMin;
              const isHigh =
                val !== null && obs.normalMax !== null && val > obs.normalMax;
              const isAbnormal = isLow || isHigh;

              return (
                <div
                  key={obs.metricKey}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${
                    isAbnormal
                      ? "bg-amber-50 border-amber-100"
                      : "bg-neutral-50 border-neutral-100"
                  }`}
                >
                  {isAbnormal ? (
                    <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 size={12} className="text-teal-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`text-[10px] font-medium truncate ${
                        isAbnormal ? "text-amber-700" : "text-neutral-700"
                      }`}
                    >
                      {obs.label}
                    </p>
                    <p
                      className={`text-[10px] ${
                        isAbnormal ? "text-amber-600" : "text-neutral-500"
                      }`}
                    >
                      {val !== null
                        ? `${Number.isInteger(val) ? val : val.toFixed(1)} ${obs.unit ?? ""}`
                        : obs.value !== null
                        ? String(obs.value)
                        : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {trackedMetrics.length > 12 && (
            <p className="text-[10px] text-neutral-400 mt-2 text-center">
              + {trackedMetrics.length - 12} autre{trackedMetrics.length - 12 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* ─── D. QUESTIONNAIRES ─────────────────────────────── */}
      {questionnaires.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={13} className="text-neutral-400" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Questionnaires ({questionnaires.length})
            </p>
          </div>
          <div className="space-y-1.5">
            {questionnaires.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100"
              >
                <Clock size={12} className="text-neutral-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-700 truncate">
                    {q.title}
                  </p>
                  {q.code && (
                    <span className="inline-block mt-0.5 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500 uppercase">
                      {q.code}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ÉQUIPE + PROCHAIN RDV ─────────────────────────── */}
      {(team.length > 0 || nextAppointment) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} className="text-neutral-400" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Équipe de soins
                </p>
              </div>
              <div className="space-y-2">
                {team.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-semibold text-indigo-600 shrink-0">
                      {m.firstName[0]}
                      {m.lastName[0]}
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

          {nextAppointment && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock size={13} className="text-neutral-400" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Prochain rendez-vous
                </p>
              </div>
              <p className="text-sm font-semibold text-neutral-800">
                {new Date(nextAppointment.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {new Date(nextAppointment.date).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" · "}
                {nextAppointment.provider}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {nextAppointment.type}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PhaseCard ────────────────────────────────────────────────────────────────

type PhaseStatus = "COMPLETED" | "ACTIVE" | "UPCOMING";

const STATUS_CONFIG: Record<
  PhaseStatus,
  { icon: React.ReactNode; border: string; bg: string; label: string; labelCls: string }
> = {
  COMPLETED: {
    icon: <CheckCircle2 size={16} className="text-teal-500 shrink-0" />,
    border: "border-teal-100",
    bg: "bg-white",
    label: "Terminée",
    labelCls: "bg-teal-50 text-teal-600 border-teal-100",
  },
  ACTIVE: {
    icon: (
      <div className="w-4 h-4 rounded-full bg-amber-400 ring-2 ring-amber-200 shrink-0" />
    ),
    border: "border-amber-200",
    bg: "bg-amber-50/30",
    label: "En cours",
    labelCls: "bg-amber-50 text-amber-600 border-amber-200",
  },
  UPCOMING: {
    icon: (
      <div className="w-4 h-4 rounded-full border-2 border-neutral-200 shrink-0" />
    ),
    border: "border-neutral-100",
    bg: "bg-white",
    label: "À venir",
    labelCls: "bg-neutral-50 text-neutral-400 border-neutral-200",
  },
};

function PhaseCard({
  phase,
  status,
  defaultOpen,
}: {
  phase: Phase;
  status: PhaseStatus;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden shadow-sm`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {cfg.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.labelCls}`}
            >
              Phase {phase.order}
            </span>
            <span className="text-sm font-medium text-neutral-700">
              {phase.label}
            </span>
          </div>
          {(phase.exercises ?? []).length > 0 && (
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {(phase.exercises ?? []).length} activité
              {(phase.exercises ?? []).length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <span
          className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${cfg.labelCls} shrink-0 hidden sm:inline-block`}
        >
          {cfg.label}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-neutral-400 shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-neutral-400 shrink-0" />
        )}
      </button>

      {open && (phase.exercises ?? []).length > 0 && (
        <div className="px-4 pb-4 pt-1 border-t border-neutral-100">
          <div className="space-y-2">
            {(phase.exercises ?? []).map((ex) => (
              <div
                key={ex.id}
                className="flex items-start gap-2 py-1.5 px-2 rounded-lg bg-white border border-neutral-50"
              >
                <div className="mt-0.5">
                  <ExerciseIcon type={ex.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-700 leading-snug">
                    {ex.title}
                  </p>
                  {ex.target && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Objectif : {ex.target} jours
                    </p>
                  )}
                  {ex.code && (
                    <span className="inline-block mt-1 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500 uppercase">
                      {ex.code}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {open && (phase.exercises ?? []).length === 0 && (
        <div className="px-4 pb-3 pt-1 border-t border-neutral-100">
          <p className="text-[11px] text-neutral-400 italic">
            Aucune activité définie pour cette phase.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
        <Route size={28} className="text-teal-400" />
      </div>
      <h3 className="text-sm font-medium text-neutral-700 mb-1">
        Aucun modèle de parcours sélectionné
      </h3>
      <p className="text-xs text-neutral-400 max-w-xs">
        Sélectionnez un modèle de parcours lors de la création du dossier
        pour structurer le suivi avec des phases, activités et échéances.
      </p>
    </div>
  );
}
