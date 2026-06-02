"use client";

import type { ParticipantStatus } from "@/hooks/useEvent";

// MyParticipationBadge — affiche l'état de MA participation à un Event.
// Visuels alignés avec la palette Nami (violet primary + teal accent),
// pas de wording clinique MDR.
//
// Variants :
//  - "Inscrit"   (REGISTERED)
//  - "Liste d'attente" (WAITLIST)
//  - "Confirmé" (CONFIRMED) — post-DPC ou jour J
//  - "Désinscrit" (CANCELLED)
//  - "Absent"    (NO_SHOW)

interface MyParticipationBadgeProps {
  status: ParticipantStatus;
  size?: "sm" | "md";
}

interface BadgeVisual {
  label: string;
  bg: string;
  text: string;
  border: string;
}

const VISUAL_BY_STATUS: Record<ParticipantStatus, BadgeVisual> = {
  REGISTERED: {
    label: "Inscrit",
    bg: "#EEEDFB",
    text: "#5B4EC4",
    border: "#D7D2F3",
  },
  WAITLIST: {
    label: "Liste d'attente",
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FDE68A",
  },
  CONFIRMED: {
    label: "Confirmé",
    bg: "#E8F4F2",
    text: "#1F7368",
    border: "#BDE3DC",
  },
  CANCELLED: {
    label: "Désinscrit",
    bg: "#F5F3EF",
    text: "#6B7280",
    border: "#E8ECF4",
  },
  NO_SHOW: {
    label: "Absent",
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#FECACA",
  },
};

export function MyParticipationBadge({
  status,
  size = "sm",
}: MyParticipationBadgeProps) {
  const v = VISUAL_BY_STATUS[status];
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const fontSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span
      data-testid="my-participation-badge"
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
