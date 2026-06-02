"use client";

import { useEffect, useRef } from "react";
import { Building2, Calendar, MailX, Circle } from "lucide-react";
import type { ReceivedBroadcastItem } from "@/hooks/useMyReceivedBroadcasts";

interface ReceivedBroadcastCardProps {
  item: ReceivedBroadcastItem;
  /** Appelé une seule fois quand la carte devient visible (mark as read auto) */
  onSeen?: (recipientId: string) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function OrgTypeLabel({ type }: { type: string }) {
  const map: Record<string, string> = {
    CPTS: "CPTS",
    MSP: "MSP",
    HOSPITAL: "Hôpital",
    PRIVATE_PRACTICE: "Cabinet",
    NETWORK: "Réseau",
  };
  return <>{map[type] ?? type}</>;
}

export function ReceivedBroadcastCard({
  item,
  onSeen,
}: ReceivedBroadcastCardProps) {
  const ref = useRef<HTMLElement | null>(null);
  const seenRef = useRef(false);
  const isUnread = item.openedAt === null;
  const senderName = item.broadcast.sender
    ? `${item.broadcast.sender.firstName} ${item.broadcast.sender.lastName}`
    : "—";

  // Mark as read auto à l'apparition (intersection observer, une seule fois)
  useEffect(() => {
    if (!isUnread || !onSeen || seenRef.current) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !seenRef.current) {
            seenRef.current = true;
            onSeen(item.recipientId);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isUnread, onSeen, item.recipientId]);

  return (
    <article
      ref={ref}
      className="rounded-xl border bg-white p-5 transition-all"
      style={{
        fontFamily: "var(--font-jakarta)",
        borderColor: isUnread ? "#5B4EC4" : "#E8ECF4",
        boxShadow: isUnread ? "0 1px 0 rgba(91,78,196,0.08)" : "none",
      }}
      data-testid={`received-broadcast-card-${item.recipientId}`}
      data-unread={isUnread ? "true" : "false"}
    >
      {/* Bandeau org + état lu */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs text-[#6B7280] min-w-0">
          <Building2 size={12} className="shrink-0" />
          <span className="font-medium text-[#374151] truncate">
            {item.broadcast.organization.name}
          </span>
          <span className="text-[#94A3B8]">·</span>
          <span className="text-[#94A3B8] shrink-0">
            <OrgTypeLabel type={item.broadcast.organization.type} />
          </span>
        </div>
        {isUnread && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{ color: "#5B4EC4", backgroundColor: "rgba(91,78,196,0.08)" }}
            aria-label="Non lu"
          >
            <Circle size={8} fill="#5B4EC4" stroke="#5B4EC4" />
            Non lu
          </span>
        )}
      </div>

      {/* Sujet */}
      <h3 className="font-semibold text-base text-[#0F172A] mb-2 leading-snug">
        {item.broadcast.subject}
      </h3>

      {/* Corps message — preview limitée, line-clamp via Tailwind */}
      <div
        className="text-sm text-[#374151] mb-3 line-clamp-3 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: item.broadcast.body }}
      />

      {/* Footer : date + sender + badge opt-out */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280] pt-3 border-t border-[#F1F5F9]">
        <span className="inline-flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(item.broadcast.sentAt)}
        </span>
        <span className="truncate">par {senderName}</span>
        {item.optedOut && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ml-auto"
            style={{ color: "#92400E", backgroundColor: "#FEF3C7" }}
            title="Vous avez désactivé les emails de cette structure. L'archive in-app reste accessible."
          >
            <MailX size={11} />
            Email désactivé
          </span>
        )}
      </div>
    </article>
  );
}
