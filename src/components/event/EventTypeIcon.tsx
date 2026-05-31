"use client";

import {
  Video,
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import type { EventType } from "@/hooks/useOrgEvents";

interface EventTypeIconProps {
  type: EventType;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

interface TypeVisual {
  icon: LucideIcon;
  label: string;
  color: string;
}

// Wording UI : on évite tout terme à risque MDR ("clinique", "alerte").
// "RCP élargie" = vocabulaire métier établi (réunion de concertation
// pluridisciplinaire), non concerné par les interdits.
const VISUAL_BY_TYPE: Record<EventType, TypeVisual> = {
  WEBINAR: { icon: Video, label: "Webinaire", color: "#5B4EC4" },
  RCP_ELARGIE: { icon: Users, label: "RCP élargie", color: "#2BA89C" },
  FORMATION_DPC: { icon: GraduationCap, label: "Formation DPC", color: "#D97706" },
  WORKING_GROUP_MEET: { icon: Briefcase, label: "Groupe de travail", color: "#374151" },
  GENERAL: { icon: Calendar, label: "Événement", color: "#6B7280" },
};

export function EventTypeIcon({
  type,
  size = 14,
  showLabel = false,
  className,
}: EventTypeIconProps) {
  const v = VISUAL_BY_TYPE[type];
  const Icon = v.icon;
  return (
    <span
      data-testid="event-type-icon"
      data-type={type}
      className={`inline-flex items-center gap-1.5 ${className ?? ""}`}
      style={{ color: v.color, fontFamily: "var(--font-jakarta)" }}
    >
      <Icon size={size} aria-hidden="true" />
      {showLabel && <span className="text-xs font-medium">{v.label}</span>}
    </span>
  );
}

export function eventTypeLabel(type: EventType): string {
  return VISUAL_BY_TYPE[type].label;
}
