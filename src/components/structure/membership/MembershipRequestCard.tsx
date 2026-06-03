"use client";

import { MapPin, Stethoscope, CalendarClock } from "lucide-react";
import type { MembershipRequestRow } from "@/hooks/useMembershipRequests";

const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; fg: string; border: string }
> = {
  PENDING: {
    label: "À valider",
    bg: "#EEEDFB",
    fg: "#5B4EC4",
    border: "#D7D2F3",
  },
  ACCEPTED: {
    label: "Approuvée",
    bg: "#DCFCE7",
    fg: "#15803D",
    border: "#BBF7D0",
  },
  REJECTED: {
    label: "Refusée",
    bg: "#FEE2E2",
    fg: "#991B1B",
    border: "#FECACA",
  },
  TO_CONTACT: {
    label: "À contacter",
    bg: "#FEF3C7",
    fg: "#92400E",
    border: "#FDE68A",
  },
  IN_REVIEW: {
    label: "En examen",
    bg: "#DBEAFE",
    fg: "#1E40AF",
    border: "#BFDBFE",
  },
  WITHDRAWN: {
    label: "Retirée",
    bg: "#F1F5F9",
    fg: "#475569",
    border: "#E2E8F0",
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface MembershipRequestCardProps {
  request: MembershipRequestRow;
  onExamine?: (request: MembershipRequestRow) => void;
}

export function MembershipRequestCard({
  request,
  onExamine,
}: MembershipRequestCardProps) {
  const { applicant, status, motivationMessage, createdAt, reviewer, reviewedAt } =
    request;
  const fullName = `${applicant.firstName} ${applicant.lastName}`.trim();
  const initials =
    `${applicant.firstName[0] ?? "?"}${applicant.lastName[0] ?? ""}`.toUpperCase();
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.PENDING;
  const isPending = status === "PENDING";

  return (
    <article
      className="rounded-xl border border-[#E8ECF4] bg-white px-4 py-3 transition-shadow hover:shadow-[0_4px_12px_rgba(91,78,196,0.08)]"
      aria-label={`Demande d'adhésion de ${fullName || "demandeur"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full bg-[#5B4EC4]/10 text-[#5B4EC4] flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ fontFamily: "var(--font-jakarta)" }}
          aria-hidden
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="text-sm font-semibold text-[#0F172A] truncate"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              {fullName || "Demandeur"}
            </h3>
            <span
              className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium"
              style={{
                fontFamily: "var(--font-jakarta)",
                background: badge.bg,
                color: badge.fg,
                borderColor: badge.border,
              }}
            >
              {badge.label}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
            {applicant.specialty && (
              <span className="inline-flex items-center gap-1">
                <Stethoscope size={11} aria-hidden />
                {applicant.specialty}
              </span>
            )}
            {applicant.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} aria-hidden />
                {applicant.city}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={11} aria-hidden />
              Demandée le {formatDate(createdAt)}
            </span>
          </div>

          {motivationMessage && (
            <p className="text-xs text-[#374151] mt-2 line-clamp-2">
              « {motivationMessage} »
            </p>
          )}

          {!isPending && reviewer && reviewedAt && (
            <p className="text-[11px] text-[#6B7280] mt-2">
              Examinée par {reviewer.firstName} {reviewer.lastName} le{" "}
              {formatDate(reviewedAt)}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => onExamine?.(request)}
            className="px-3 py-1.5 rounded-md border border-[#E8ECF4] bg-white text-xs font-semibold text-[#0F172A] hover:border-[#5B4EC4] hover:text-[#5B4EC4] transition-colors"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {isPending ? "Examiner" : "Détails"}
          </button>
        </div>
      </div>
    </article>
  );
}
