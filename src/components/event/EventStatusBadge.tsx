"use client";

import type { EventUiStatus } from "@/hooks/useEvent";

interface EventStatusBadgeProps {
  status: EventUiStatus;
  size?: "sm" | "md";
}

interface StatusVisual {
  label: string;
  bg: string;
  text: string;
  border: string;
}

// Cohérence palette Nami : violet primary + teal accent + neutres désaturés.
// On évite tout wording clinique (MDR) — "annulé/terminé" sont neutres.
const VISUAL_BY_STATUS: Record<EventUiStatus, StatusVisual> = {
  SCHEDULED: {
    label: "Brouillon",
    bg: "#F5F3EF",
    text: "#6B7280",
    border: "#E8ECF4",
  },
  OPEN: {
    label: "Inscriptions ouvertes",
    bg: "#EEEDFB",
    text: "#5B4EC4",
    border: "#D7D2F3",
  },
  FULL: {
    label: "Complet",
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FDE68A",
  },
  CANCELLED: {
    label: "Annulé",
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#FECACA",
  },
  PAST: {
    label: "Terminé",
    bg: "#E8F4F2",
    text: "#1F7368",
    border: "#BDE3DC",
  },
};

export function EventStatusBadge({ status, size = "sm" }: EventStatusBadgeProps) {
  const v = VISUAL_BY_STATUS[status];
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const fontSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span
      data-testid="event-status-badge"
      data-status={status}
      className={`inline-flex items-center gap-1 rounded-md border ${padding} ${fontSize} font-medium`}
      style={{
        backgroundColor: v.bg,
        color: v.text,
        borderColor: v.border,
        fontFamily: "var(--font-jakarta)",
      }}
    >
      {v.label}
    </span>
  );
}
