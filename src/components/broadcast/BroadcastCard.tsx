"use client";

import Link from "next/link";
import { Mail, FileText, AlertCircle, Calendar, Users } from "lucide-react";
import type { BroadcastListItem } from "@/hooks/useOrgBroadcasts";

interface BroadcastCardProps {
  orgId: string;
  broadcast: BroadcastListItem;
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

function StatusBadge({ status }: { status: BroadcastListItem["status"] }) {
  const config = {
    DRAFT: { label: "Brouillon", icon: FileText, color: "#6B7280", bg: "#F3F4F6" },
    SENT: { label: "Envoyé", icon: Mail, color: "#059669", bg: "#D1FAE5" },
    FAILED: { label: "Échec", icon: AlertCircle, color: "#DC2626", bg: "#FEE2E2" },
  }[status];
  const Icon = config.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
}

export function BroadcastCard({ orgId, broadcast }: BroadcastCardProps) {
  const senderName = broadcast.sender
    ? `${broadcast.sender.firstName} ${broadcast.sender.lastName}`
    : "—";
  const dateLabel =
    broadcast.status === "SENT" ? broadcast.sentAt : broadcast.createdAt;
  const dateHint = broadcast.status === "SENT" ? "Envoyé le" : "Créé le";

  return (
    <Link
      href={`/structure/${orgId}/admin/communications/${broadcast.id}`}
      className="block rounded-xl border border-[#E8ECF4] bg-white p-4 hover:border-[#5B4EC4] hover:shadow-sm transition-all"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-sm text-[#0F172A] line-clamp-2 flex-1">
          {broadcast.subject}
        </h3>
        <StatusBadge status={broadcast.status} />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
        <span className="inline-flex items-center gap-1">
          <Calendar size={11} />
          {dateHint} {formatDate(dateLabel)}
        </span>
        {broadcast.status === "SENT" && (
          <span className="inline-flex items-center gap-1">
            <Users size={11} />
            {broadcast.recipientCount} destinataire
            {broadcast.recipientCount > 1 ? "s" : ""}
          </span>
        )}
        <span className="truncate">par {senderName}</span>
      </div>
    </Link>
  );
}
