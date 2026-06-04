"use client";

/**
 * F-COCKPIT-PATIENT-360-REFONTE — ViewOverview
 *
 * Vue d'ensemble condensée. 6 cards:
 *   1. Prochain RDV          (dashboard.actions.upcomingAppointments[0])
 *   2. Dernière consultation (dashboard.recentActivity → premier NOTE/OBSERVATION)
 *   3. Bilans en attente     (indicateurs OVERDUE/DUE_SOON required)
 *   4. Tâches assignées      (dashboard.actions.urgentTasks)
 *   5. RCPs récents          (recentActivity REFERRAL — proxy)
 *   6. Documents récents     (careCase._count.documents)
 *
 * Chaque card propose "Voir tout →" qui appelle onNavigateToTab(key).
 *
 * Wording légal:
 *   - On dit "Indicateurs à compléter" plutôt que "Alertes"
 *   - On dit "Tâches à valider" plutôt que "Actions urgentes"
 * (conforme MDR — pas de "Risque clinique", "Anormal", etc.)
 */

import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  MessageSquareText,
  Users,
} from "lucide-react";
import type { CareCaseDetail } from "@/lib/api";
import type { PatientDashboard } from "@/hooks/usePatientDashboard";

interface Props {
  patient: CareCaseDetail;
  dashboard: PatientDashboard;
  onNavigateToTab: (tabKey: string) => void;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ViewOverview({ patient, dashboard, onNavigateToTab }: Props) {
  const nextAppt = dashboard.actions.upcomingAppointments[0] ?? null;
  const lastConsult =
    dashboard.recentActivity.find(
      (a) => a.type === "NOTE" || a.type === "OBSERVATION",
    ) ?? null;
  const pendingBilans = dashboard.indicators.filter(
    (i) => i.required && (i.timeStatus === "OVERDUE" || i.timeStatus === "DUE_SOON"),
  );
  const tasks = dashboard.actions.urgentTasks;
  const recentRcps = dashboard.recentActivity.filter((a) => a.type === "REFERRAL");
  const documentsCount = patient._count?.documents ?? 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* 1. Prochain RDV */}
        <OverviewCard
          testId="overview-card-next-appointment"
          icon={<CalendarDays size={16} />}
          title="Prochain RDV"
          actionLabel="Voir le dossier"
          onAction={() => onNavigateToTab("parcours")}
        >
          {nextAppt ? (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {formatDateTime(nextAppt.date)}
              </div>
              {nextAppt.providerName && (
                <div className="text-xs text-gray-500 mt-0.5">
                  avec {nextAppt.providerName}
                </div>
              )}
              {nextAppt.type && (
                <div className="text-xs text-gray-400 mt-0.5">{nextAppt.type}</div>
              )}
            </div>
          ) : (
            <EmptyState>Aucun RDV planifié</EmptyState>
          )}
        </OverviewCard>

        {/* 2. Dernière consultation */}
        <OverviewCard
          testId="overview-card-last-consultation"
          icon={<ClipboardList size={16} />}
          title="Dernière consultation"
          actionLabel="Voir les consultations"
          onAction={() => onNavigateToTab("consultations")}
        >
          {lastConsult ? (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {formatDate(lastConsult.date)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {lastConsult.summary}
              </div>
              {lastConsult.authorName && (
                <div className="text-xs text-gray-400 mt-0.5">
                  par {lastConsult.authorName}
                </div>
              )}
            </div>
          ) : (
            <EmptyState>Aucune consultation récente</EmptyState>
          )}
        </OverviewCard>

        {/* 3. Bilans en attente */}
        <OverviewCard
          testId="overview-card-bilans"
          icon={<FlaskConical size={16} />}
          title="Bilans à compléter"
          actionLabel="Ouvrir les bilans"
          onAction={() => onNavigateToTab("bilans")}
        >
          {pendingBilans.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-gray-900">
                {pendingBilans.length} bilan{pendingBilans.length > 1 ? "s" : ""}
              </div>
              <ul className="text-xs text-gray-500 space-y-0.5">
                {pendingBilans.slice(0, 3).map((b) => (
                  <li key={b.metricKey} className="truncate">
                    · {b.label}
                  </li>
                ))}
                {pendingBilans.length > 3 && (
                  <li className="text-gray-400">
                    + {pendingBilans.length - 3} autre
                    {pendingBilans.length - 3 > 1 ? "s" : ""}
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <EmptyState>Tous les bilans sont à jour</EmptyState>
          )}
        </OverviewCard>

        {/* 4. Tâches assignées */}
        <OverviewCard
          testId="overview-card-tasks"
          icon={<ClipboardList size={16} />}
          title="Tâches à valider"
          actionLabel="Voir le dossier"
          onAction={() => onNavigateToTab("observations")}
        >
          {tasks.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-gray-900">
                {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
              </div>
              <ul className="text-xs text-gray-500 space-y-0.5">
                {tasks.slice(0, 3).map((t) => (
                  <li key={t.id} className="truncate">
                    · {t.label}
                  </li>
                ))}
                {tasks.length > 3 && (
                  <li className="text-gray-400">
                    + {tasks.length - 3} autre{tasks.length - 3 > 1 ? "s" : ""}
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <EmptyState>Aucune tâche en attente</EmptyState>
          )}
        </OverviewCard>

        {/* 5. RCPs récents */}
        <OverviewCard
          testId="overview-card-rcps"
          icon={<Users size={16} />}
          title="Réunions de concertation récentes"
          actionLabel="Voir la coordination"
          onAction={() => onNavigateToTab("messages")}
        >
          {recentRcps.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-gray-900">
                {recentRcps.length} échange{recentRcps.length > 1 ? "s" : ""}
              </div>
              <ul className="text-xs text-gray-500 space-y-0.5">
                {recentRcps.slice(0, 2).map((r, idx) => (
                  <li
                    key={`${r.date}-${idx}`}
                    className="truncate"
                  >
                    · {formatDate(r.date)} — {r.summary}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState>Aucune réunion récente</EmptyState>
          )}
        </OverviewCard>

        {/* 6. Documents récents */}
        <OverviewCard
          testId="overview-card-documents"
          icon={<FileText size={16} />}
          title="Documents au dossier"
          actionLabel="Ouvrir le dossier"
          onAction={() => onNavigateToTab("observations")}
        >
          {documentsCount > 0 ? (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {documentsCount} document{documentsCount > 1 ? "s" : ""}
              </div>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToTab("observations");
                }}
                className="text-xs text-[#4F46E5] hover:underline mt-0.5 inline-block"
              >
                Parcourir →
              </Link>
            </div>
          ) : (
            <EmptyState>Aucun document partagé</EmptyState>
          )}
        </OverviewCard>
      </div>

      {/* Note légale */}
      <div className="rounded-lg border border-[#E8ECF4] bg-[#F7F8FB] px-4 py-3 text-xs text-gray-500 flex items-start gap-2">
        <MessageSquareText size={14} className="shrink-0 mt-0.5 text-gray-400" />
        <span>
          Vue de synthèse — chaque carte renvoie à la section détaillée
          correspondante. Toute information issue d&apos;une assistance IA reste
          un brouillon à valider par le soignant.
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function OverviewCard({
  testId,
  icon,
  title,
  actionLabel,
  onAction,
  children,
}: {
  testId: string;
  icon: React.ReactNode;
  title: string;
  actionLabel: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <article
      data-testid={testId}
      className="rounded-xl border border-[#E8ECF4] bg-white shadow-sm px-4 py-3.5 flex flex-col gap-2 min-h-[120px]"
    >
      <header className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
        <span className="text-[#4F46E5]" aria-hidden="true">
          {icon}
        </span>
        {title}
      </header>
      <div className="flex-1">{children}</div>
      <button
        type="button"
        onClick={onAction}
        className="self-start text-xs font-medium text-[#4F46E5] hover:underline"
      >
        {actionLabel} →
      </button>
    </article>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-gray-400 italic">{children}</div>
  );
}
