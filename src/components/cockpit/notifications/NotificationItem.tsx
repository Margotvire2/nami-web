/**
 * NotificationItem — item unitaire du panneau notifications.
 *
 * Variante visuelle par source (icône). Badge "Brouillon IA — à vérifier"
 * conditionnel si `isAiGenerated`. Vocabulaire MDR-safe.
 *
 * Pas d'indicateur visuel de priorité : éviter la confusion avec le pattern
 * "non lu" (Gmail/Outlook). Le tri par priorité est fait côté backend.
 */

import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Inbox,
  CheckSquare,
  UserPlus,
  CircleDot,
  Activity as ActivityIcon,
  MessageSquare,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NotificationFeedItem, NotificationFeedSource } from "@/lib/api";

const SOURCE_ICONS: Record<NotificationFeedSource, LucideIcon> = {
  appointment_request: Calendar,
  referral: Inbox,
  task: CheckSquare,
  team_invitation: UserPlus,
  coordination_anomaly: CircleDot,
  activity: ActivityIcon,
  pro_message: MessageSquare,
  alert: FileText,
};

type Props = {
  item: NotificationFeedItem;
};

export function NotificationItem({ item }: Props) {
  const Icon = SOURCE_ICONS[item.source] ?? ActivityIcon;
  const isClickable = !!item.href && item.href !== "#";

  const content = (
    <>
      <div className="flex gap-3 items-start">
        <Icon className="w-4 h-4 text-[#5B4EC4] mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0 pr-6">
          <p className="text-sm font-medium text-[#1A1A2E] truncate" style={{ fontFamily: "var(--font-sans)" }}>
            {item.title}
          </p>
          {item.subtitle && (
            <p className="text-xs text-[#6B7280] truncate mt-0.5" style={{ fontFamily: "var(--font-data)" }}>
              {item.subtitle}
            </p>
          )}
        </div>
      </div>

      {item.isAiGenerated && (
        <span
          className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: "rgba(43,168,156,0.10)", color: "#2BA89C", fontFamily: "var(--font-data)" }}
          title="Brouillon IA — à vérifier par un soignant"
        >
          <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
          Brouillon IA
        </span>
      )}
    </>
  );

  return isClickable ? (
    <Link
      href={item.href}
      className="block p-3 rounded-[10px] hover:bg-[rgba(91,78,196,0.04)] transition-colors relative"
      style={{ transition: "background-color 0.2s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {content}
    </Link>
  ) : (
    <div className="block p-3 rounded-[10px] relative cursor-default">
      {content}
    </div>
  );
}
