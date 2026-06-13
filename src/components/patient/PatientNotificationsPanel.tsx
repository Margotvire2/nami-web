"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  MessageCircle,
  FileText,
  Users,
  ClipboardCheck,
  Shield,
  MapPin,
} from "lucide-react";
import type { PatientNotification } from "@/lib/api";
import { useMarkNotificationAsRead } from "@/hooks/usePatientNotifications";
import { formatNotifDate } from "@/lib/format-notif-date";

interface Props {
  items: PatientNotification[];
  unreadCount: number;
  onClose: () => void;
}

// Map NotificationType.enum → icône lucide. MDR-safe (pas d'AlertTriangle,
// pas de Siren, pas de "danger" iconography).
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

export function PatientNotificationsPanel({ items, unreadCount, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const markRead = useMarkNotificationAsRead();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleNotifClick(notif: PatientNotification) {
    // Best-effort : on déclenche le mark-read mais on ne bloque pas la nav.
    // Backend idempotent (200 si déjà lue) → safe d'appeler même sur lue.
    if (!notif.readAt) {
      markRead.mutate(notif.id);
    }
    onClose();
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full mt-2 w-80 max-h-[480px] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5E7EB] shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md">
        <h2 className="text-sm font-bold text-[#1A1A2E]">Notifications</h2>
        {unreadCount > 0 && (
          <span className="text-xs text-[#6B7280]">
            {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Bell className="w-8 h-8 mx-auto text-[#E5E7EB] mb-2" />
          <p className="text-sm text-[#6B7280]">Aucune notification</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#E5E7EB]">
          {items.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const isUnread = !notif.readAt;
            return (
              <li key={notif.id}>
                <Link
                  href={getNotifLink(notif)}
                  onClick={() => handleNotifClick(notif)}
                  aria-label={
                    isUnread
                      ? `${notif.title} — non lue, marquer comme lue et ouvrir`
                      : notif.title
                  }
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-[rgba(91,78,196,0.04)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 ${
                    isUnread ? "bg-[rgba(91,78,196,0.02)]" : ""
                  }`}
                >
                  <div
                    className={`shrink-0 mt-0.5 ${
                      isUnread ? "text-[#5B4EC4]" : "text-[#6B7280]"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        isUnread
                          ? "font-semibold text-[#1A1A2E]"
                          : "font-medium text-[#374151]"
                      }`}
                    >
                      {notif.title}
                    </p>
                    {notif.body && (
                      <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">
                        {notif.body}
                      </p>
                    )}
                    <p className="text-[10px] text-[#9CA3AF] mt-1">
                      {formatNotifDate(notif.createdAt)}
                    </p>
                  </div>
                  {isUnread && (
                    <span
                      className="shrink-0 w-2 h-2 mt-2 rounded-full bg-[#5B4EC4]"
                      aria-label="Non lue"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer link vers /notifications — toujours visible, même si la liste
          est vide, pour que l'utilisateur sache où trouver l'historique. */}
      <div className="border-t border-[#E5E7EB] px-4 py-3 sticky bottom-0 bg-white/95 backdrop-blur-md">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block w-full text-center text-sm font-medium text-[#5B4EC4] hover:text-[#4A3FB0] rounded-lg py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
        >
          Voir toutes mes notifications
        </Link>
      </div>
    </div>
  );
}
