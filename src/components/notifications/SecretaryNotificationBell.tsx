"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Calendar,
  MessageCircle,
  FileText,
  UserPlus,
  Link as LinkIcon,
  Users,
} from "lucide-react";
import type { PatientNotification } from "@/lib/api";
import { useSecretaryNotifications } from "@/hooks/useSecretaryNotifications";

/**
 * SecretaryNotificationBell — cloche du header /secretariat.
 *
 * Consomme GET /secretary/notifications/feed via useSecretaryNotifications.
 * Affiche les 10 dernières notifications dont SECRETARIAT_LINK_* (demandes
 * de rattachement, acceptations, révocations). Wording MDR-safe (organisation
 * du dossier, jamais d'alerte clinique).
 *
 * Pattern miroir PatientHeader.tsx + PatientNotificationsPanel.tsx, fusionné
 * en un seul composant car le secrétariat n'a ni délégation ni mark-read V1.
 */

const POPOVER_LIMIT = 10;

const TYPE_ICONS: Record<string, React.ElementType> = {
  SECRETARIAT_LINK_REQUESTED: UserPlus,
  SECRETARIAT_LINK_ACCEPTED: LinkIcon,
  SECRETARIAT_LINK_REJECTED: LinkIcon,
  SECRETARIAT_LINK_REVOKED: LinkIcon,
  APPOINTMENT_CREATED: Calendar,
  APPOINTMENT_CONFIRMED: Calendar,
  APPOINTMENT_CANCELLED: Calendar,
  APPOINTMENT_RESCHEDULED: Calendar,
  APPOINTMENT_NO_SHOW: Calendar,
  APPOINTMENT_REMINDER: Calendar,
  MESSAGE_RECEIVED: MessageCircle,
  DOCUMENT_SHARED: FileText,
  CARE_TEAM_MEMBER_ADDED: Users,
  CARE_TEAM_MEMBER_REMOVED: Users,
};

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD} j`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function SecretaryNotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useSecretaryNotifications({ limit: 20 });

  const unread = data?.counts.unread ?? 0;
  const items: PatientNotification[] = (data?.items ?? []).slice(0, POPOVER_LIMIT);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={
          unread > 0
            ? `Notifications (${unread} non lue${unread > 1 ? "s" : ""})`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative p-2 rounded-full text-[#6B7280] hover:bg-[rgba(91,78,196,0.08)] hover:text-[#5B4EC4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
      >
        <Bell className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-live="polite"
            className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#5B4EC4] text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications secrétariat"
          className="absolute right-0 top-full mt-2 w-80 max-h-[480px] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8ECF4] shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="px-4 py-3 border-b border-[#E8ECF4] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md">
            <h2 className="text-sm font-bold text-[#1A1A2E]">Notifications</h2>
            {unread > 0 && (
              <span className="text-xs text-[#6B7280]">
                {unread} non lue{unread > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="w-8 h-8 mx-auto text-[#E5E7EB] mb-2" aria-hidden="true" />
              <p className="text-sm text-[#6B7280]">Aucune notification</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E8ECF4]">
              {items.map((notif) => {
                const Icon = TYPE_ICONS[notif.type] || Bell;
                const isUnread = !notif.readAt;
                return (
                  <li
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      isUnread ? "bg-[rgba(91,78,196,0.04)]" : ""
                    }`}
                  >
                    <div
                      className={`shrink-0 mt-0.5 ${
                        isUnread ? "text-[#5B4EC4]" : "text-[#6B7280]"
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
