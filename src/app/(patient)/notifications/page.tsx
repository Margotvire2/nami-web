"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ArrowLeft,
  Calendar,
  MessageCircle,
  FileText,
  Users,
  ClipboardCheck,
  Shield,
  MapPin,
  Loader2,
} from "lucide-react";
import { usePatientNotifications } from "@/hooks/usePatientNotifications";
import type { PatientNotification } from "@/lib/api";

// Map NotificationType → icône lucide. MDR-safe (cohérent avec
// PatientNotificationsPanel du PR #43 — pas d'AlertTriangle/Siren).
const TYPE_ICONS: Record<string, React.ElementType> = {
  APPOINTMENT_CREATED: Calendar,
  APPOINTMENT_CONFIRMED: Calendar,
  APPOINTMENT_CANCELLED: Calendar,
  APPOINTMENT_RESCHEDULED: Calendar,
  APPOINTMENT_NO_SHOW: Calendar,
  APPOINTMENT_REMINDER: Calendar,
  MESSAGE_RECEIVED: MessageCircle,
  DOCUMENT_SHARED: FileText,
  QUESTIONNAIRE_REQUESTED: ClipboardCheck,
  QUESTIONNAIRE_COMPLETED: ClipboardCheck,
  CARE_TEAM_MEMBER_ADDED: Users,
  CARE_TEAM_MEMBER_REMOVED: Users,
  CONSENT_REQUESTED: Shield,
  CONSENT_GRANTED: Shield,
  CONSENT_REVOKED: Shield,
  PATHWAY_STEP_DUE: MapPin,
};

function getNotifLink(notif: PatientNotification): string {
  if (notif.appointmentId) return `/rendez-vous/${notif.appointmentId}`;
  if (notif.messageId) return "/mes-messages";
  if (notif.documentId) return "/mes-documents";
  return "/accueil";
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD} j`;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type FilterMode = "all" | "unread";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterMode>("all");

  // Hook PR #43 — supporte { limit, section }. Graceful 404 si backend
  // PR #59 pas mergée (retourne items: [] sans throw).
  const { data, isLoading } = usePatientNotifications({
    limit: 50,
    section: filter,
  });

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-12">
      {/* Breadcrumb retour */}
      <Link
        href="/accueil"
        className="inline-flex items-center gap-2 text-sm text-[var(--nami-text-muted)] hover:text-[var(--nami-dark)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Retour à l&apos;accueil
      </Link>

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--nami-dark)] tracking-tight">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <p className="text-sm text-[var(--nami-text-muted)] mt-1">
            {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
          </p>
        )}
      </header>

      {/* Filtres tabs */}
      <nav
        role="tablist"
        aria-label="Filtrer les notifications"
        className="flex gap-2 mb-6 border-b border-[var(--nami-border)]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          aria-current={filter === "all" ? "page" : undefined}
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "all"
              ? "border-[var(--nami-primary)] text-[var(--nami-primary)]"
              : "border-transparent text-[var(--nami-text-muted)] hover:text-[var(--nami-dark)]"
          }`}
        >
          Toutes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "unread"}
          aria-current={filter === "unread" ? "page" : undefined}
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "unread"
              ? "border-[var(--nami-primary)] text-[var(--nami-primary)]"
              : "border-transparent text-[var(--nami-text-muted)] hover:text-[var(--nami-dark)]"
          }`}
        >
          Non lues
          {unreadCount > 0 && (
            <span className="ml-1 text-xs">({unreadCount})</span>
          )}
        </button>
      </nav>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2
            size={24}
            className="animate-spin text-[var(--nami-primary)]"
            aria-label="Chargement des notifications"
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div
          className="text-center py-16 px-6 bg-white/50 rounded-2xl border border-[var(--nami-border)]"
          role="status"
          aria-label="Aucune notification"
        >
          <Bell
            size={32}
            className="mx-auto mb-3 text-[var(--nami-text-muted)] opacity-40"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--nami-dark)] mb-1">
            {filter === "unread"
              ? "Aucune notification non lue"
              : "Aucune notification"}
          </p>
          <p className="text-xs text-[var(--nami-text-muted)]">
            {filter === "unread"
              ? "Tout est à jour. Revenez plus tard."
              : "Vos notifications de rendez-vous et messages apparaîtront ici."}
          </p>
        </div>
      )}

      {/* Liste notifications */}
      {!isLoading && items.length > 0 && (
        <ul
          className="bg-white border border-[var(--nami-border)] rounded-2xl divide-y divide-[var(--nami-border)] overflow-hidden"
          aria-label="Liste des notifications"
        >
          {items.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const isUnread = !notif.readAt;
            return (
              <li key={notif.id}>
                <Link
                  href={getNotifLink(notif)}
                  className={`flex items-start gap-3 px-4 py-4 hover:bg-[rgba(91,78,196,0.04)] transition-colors ${
                    isUnread ? "bg-[rgba(91,78,196,0.02)]" : ""
                  }`}
                  aria-label={`${notif.title}${isUnread ? " — non lue" : ""}`}
                >
                  <div
                    className={`shrink-0 mt-0.5 ${
                      isUnread
                        ? "text-[var(--nami-primary)]"
                        : "text-[var(--nami-text-muted)]"
                    }`}
                    aria-hidden="true"
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        isUnread
                          ? "font-semibold text-[var(--nami-dark)]"
                          : "font-medium text-[#374151]"
                      }`}
                    >
                      {notif.title}
                    </p>
                    {notif.body && (
                      <p className="text-xs text-[var(--nami-text-muted)] mt-1 leading-relaxed">
                        {notif.body}
                      </p>
                    )}
                    <p className="text-[11px] text-[#9CA3AF] mt-1.5">
                      {formatRelative(notif.createdAt)}
                    </p>
                  </div>
                  {isUnread && (
                    <span
                      className="shrink-0 w-2 h-2 mt-2 rounded-full bg-[var(--nami-primary)]"
                      aria-label="Non lue"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer info — limite atteinte */}
      {!isLoading && items.length >= 50 && (
        <p className="text-xs text-[var(--nami-text-muted)] text-center mt-4">
          Affichage des 50 dernières notifications. L&apos;historique complet
          sera disponible prochainement.
        </p>
      )}
    </main>
  );
}
