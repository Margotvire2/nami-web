"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

/**
 * F-CROSS-GAP-Notification-SECRETARIAT (audit cross-espaces §5.6).
 *
 * Cloche de notifications ORGANISATIONNELLES pour le rôle SECRETARY.
 * Distinct de /notifications/feed (cockpit soignant — provider-centric + PHI).
 * Endpoint dédié : GET /secretary/notifications (cf. backend secretary.ts).
 */

type SecretaryNotificationKind =
  | "appointment_request_pending"
  | "appointment_cancelled_by_patient";

export interface SecretaryNotificationItem {
  id: string;
  kind: SecretaryNotificationKind;
  createdAt: string;
  providerName: string;
  patientName: string | null;
  label: string;
}

interface FeedResponse {
  items: SecretaryNotificationItem[];
  unread: number;
}

async function fetchSecretaryNotifications(token: string): Promise<FeedResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const res = await fetch(`${base}/secretary/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Notif fetch failed: ${res.status}`);
  return res.json();
}

export function SecretariatNotifBell({ accessToken }: { accessToken: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["secretary-notifications"],
    queryFn: () => fetchSecretaryNotifications(accessToken),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = data?.items ?? [];
  const unread = data?.unread ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications du secrétariat"
        aria-expanded={open}
        className="relative p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#374151]"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            data-testid="notif-unread-badge"
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#5B4EC4] text-white text-[9px] font-bold flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Liste des notifications"
          className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E8ECF4] rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#E8ECF4] bg-[#F5F3EF]">
            <p className="text-[12px] font-semibold text-[#1A1A2E]">Notifications</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">
              Organisation du dossier — pas de données cliniques
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-[11px] text-[#6B7280]">
                Chargement…
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-[11px] text-[#6B7280]">
                Aucune notification
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "px-4 py-2.5 border-b border-[#E8ECF4] last:border-0 hover:bg-[#F5F3EF]",
                  )}
                >
                  <p className="text-[11px] font-semibold text-[#1A1A2E]">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-[#374151] mt-0.5 truncate">
                    {item.patientName ? `${item.patientName} · ` : ""}
                    {item.providerName}
                  </p>
                  <p className="text-[9px] text-[#6B7280] mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
