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
  if (notif.appointmentId) return "/rendez-vous";
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
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function PatientNotificationsPanel({ items, unreadCount, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

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
                  onClick={onClose}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-[rgba(91,78,196,0.04)] transition-colors ${
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
                      {formatRelative(notif.createdAt)}
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
    </div>
  );
}
