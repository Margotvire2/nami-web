"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { notificationsApi, type NotificationItem } from "@/lib/api";
import {
  Bell,
  FileText,
  Upload,
  CheckSquare,
  ArrowLeftRight,
  AlertTriangle,
  UserPlus,
  FolderOpen,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = "nami_notif_seen_at";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  NOTE_ADDED:        { icon: FileText,      label: "Note ajoutée",       color: "#5B4EC4" },
  DOCUMENT_UPLOADED: { icon: Upload,        label: "Document ajouté",    color: "#2563EB" },
  TASK_COMPLETED:    { icon: CheckSquare,   label: "Tâche complétée",    color: "#059669" },
  REFERRAL_CREATED:  { icon: ArrowLeftRight,label: "Adressage créé",     color: "#D97706" },
  REFERRAL_ACCEPTED: { icon: ArrowLeftRight,label: "Adressage accepté",  color: "#059669" },
  REFERRAL_DECLINED: { icon: ArrowLeftRight,label: "Adressage refusé",   color: "#DC2626" },
  ALERT_TRIGGERED:   { icon: AlertTriangle, label: "Indicateur",         color: "#D97706" },
  TEAM_MEMBER_ADDED: { icon: UserPlus,      label: "Nouveau membre",     color: "#2BA89C" },
  CARE_CASE_CREATED: { icon: FolderOpen,    label: "Dossier créé",       color: "#5B4EC4" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLastSeenAt(): Date | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LS_KEY);
  return stored ? new Date(stored) : null;
}

function setLastSeenAt(date: Date): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, date.toISOString());
}

// ─── NotificationRow ──────────────────────────────────────────────────────────

function NotificationRow({
  item,
  isUnread,
  onClick,
}: {
  item: NotificationItem;
  isUnread: boolean;
  onClick: () => void;
}) {
  const cfg = TYPE_CONFIG[item.activityType] ?? {
    icon: Bell, label: item.activityType, color: "#64748B",
  };
  const Icon = cfg.icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[rgba(91,78,196,0.04)] transition-colors text-left"
      style={{ borderBottom: "1px solid #F1F5F9" }}
    >
      {/* Icône type */}
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${cfg.color}14` }}
      >
        <Icon size={14} style={{ color: cfg.color }} strokeWidth={1.75} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[12px] leading-snug"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              fontWeight: isUnread ? 600 : 400,
            }}
          >
            {item.person.firstName} {item.person.lastName}
            <span className="font-normal text-[#64748B]"> · {cfg.label}</span>
          </p>
          {isUnread && (
            <span
              className="w-2 h-2 rounded-full shrink-0 mt-1"
              style={{ background: "#5B4EC4" }}
            />
          )}
        </div>

        {/* Patient + dossier */}
        <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
          {item.careCase.patient.firstName} {item.careCase.patient.lastName}
        </p>

        {/* Titre de l'activité */}
        {item.title && (
          <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{item.title}</p>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-[#CBD5E1] mt-1">
          {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true, locale: fr })}
        </p>
      </div>
    </button>
  );
}

// ─── NotificationCenter ───────────────────────────────────────────────────────

export function NotificationCenter() {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAtState] = useState<Date | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Charger lastSeenAt depuis localStorage au mount
  useEffect(() => {
    setSeenAtState(getLastSeenAt());
  }, []);

  // Fermer sur clic extérieur
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(accessToken!),
    enabled: !!accessToken,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const items = data?.items ?? [];

  // Unread = activités plus récentes que lastSeenAt
  const unreadCount = seenAt
    ? items.filter((i) => new Date(i.occurredAt) > seenAt).length
    : items.length;

  const markAllSeen = useCallback(() => {
    const now = new Date();
    setLastSeenAt(now);
    setSeenAtState(now);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) markAllSeen();
  };

  const handleNotifClick = (item: NotificationItem) => {
    setOpen(false);
    router.push(`/patients/${item.careCase.id}`);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-8 h-8 rounded-[8px] transition-colors"
        style={{ color: open ? "#5B4EC4" : "#64748B" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(91,78,196,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "#5B4EC4"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = open ? "#5B4EC4" : "#64748B"; }}
        aria-label="Notifications"
      >
        <Bell size={16} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-white font-bold"
            style={{
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              fontSize: 9,
              background: "#DC2626",
              borderRadius: 8,
              fontFamily: "var(--font-jakarta)",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute left-full ml-2 top-0 bg-white rounded-xl border border-[rgba(26,26,46,0.08)] z-50 flex flex-col"
          style={{
            width: 340,
            maxHeight: 480,
            boxShadow: "0 8px 32px rgba(26,26,46,0.12), 0 2px 8px rgba(26,26,46,0.06)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] shrink-0">
            <span
              className="text-[13px] font-semibold"
              style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#5B4EC415", color: "#5B4EC4" }}
                >
                  {unreadCount} nouvelles
                </span>
              )}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-[#94A3B8] hover:text-[#5B4EC4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded"
              aria-label="Fermer les notifications"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-4 h-4 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell size={24} className="text-[#E2E8F0]" strokeWidth={1.25} />
                <p className="text-[12px] text-[#94A3B8]">Aucune activité récente</p>
              </div>
            )}

            {!isLoading &&
              items.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  isUnread={seenAt ? new Date(item.occurredAt) > seenAt : true}
                  onClick={() => handleNotifClick(item)}
                />
              ))}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[#F1F5F9] shrink-0">
              <p className="text-[10px] text-[#CBD5E1] text-center">
                Activités de vos dossiers — 30 dernières entrées
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
