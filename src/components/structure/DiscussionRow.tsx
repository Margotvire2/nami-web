"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface DiscussionRowProps {
  // L'id sera passé en query param dès que /messages le lit. Pour l'instant
  // (V1) on renvoie vers la liste — la page existante ne consomme pas encore
  // ?conversationId=.
  id: string;
  name: string | null;
  messageCount: number;
  lastActivityAt?: string;
}

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return "—";
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return `il y a ${d} j`;
}

export function DiscussionRow({
  id,
  name,
  messageCount,
  lastActivityAt,
}: DiscussionRowProps) {
  return (
    <Link
      href={`/messages?conversationId=${id}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F0F2FA] transition-colors"
      aria-label={`Ouvrir la discussion ${name ?? id}`}
    >
      <div className="w-8 h-8 rounded-lg bg-[#5B4EC4]/10 text-[#5B4EC4] flex items-center justify-center shrink-0">
        <MessageSquare size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-medium text-[#0F172A] truncate"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {name || "Discussion sans titre"}
        </div>
        <div className="text-xs text-[#6B7280]">
          {messageCount} {messageCount > 1 ? "messages" : "message"} ·{" "}
          {timeAgo(lastActivityAt)}
        </div>
      </div>
    </Link>
  );
}
