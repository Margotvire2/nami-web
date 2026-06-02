"use client";

import { N } from "@/lib/design-tokens";
import type { ApplicationStatus } from "@/hooks/useAdminApplications";

const STYLE: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  PENDING_REVIEW: { label: "À reviewer",   bg: N.warningBg, color: N.warning },
  IN_REVIEW:      { label: "En cours",     bg: N.infoBg,    color: N.info },
  APPROVED:       { label: "Approuvée",    bg: N.successBg, color: N.success },
  REJECTED:       { label: "Rejetée",      bg: N.dangerBg,  color: N.danger },
  WITHDRAWN:      { label: "Retirée",      bg: N.bgAlt,     color: N.textLight },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const s = STYLE[status];
  return (
    <span
      data-testid="application-status-badge"
      data-status={status}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 6,
        background: s.bg,
        color: s.color,
        letterSpacing: "0.01em",
      }}
    >
      {s.label}
    </span>
  );
}
