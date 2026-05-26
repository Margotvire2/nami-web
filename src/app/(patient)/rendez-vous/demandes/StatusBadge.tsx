import type { AppointmentRequestStatus } from "./mock-data";

interface StatusBadgeProps {
  status: AppointmentRequestStatus;
}

const STATUS_CONFIG: Record<
  AppointmentRequestStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: "En attente",
    bg: "#FEF3C7", // amber-100
    text: "#92400E", // amber-800
    border: "#FCD34D", // amber-300
  },
  ACCEPTED: {
    label: "Acceptée",
    bg: "#D1FAE5", // emerald-100
    text: "#065F46", // emerald-800
    border: "#6EE7B7", // emerald-300
  },
  DECLINED: {
    label: "Refusée",
    bg: "#FEE2E2", // rose-100 (rose plutôt que red — moins agressif visuellement)
    text: "#9F1239", // rose-800
    border: "#FDA4AF", // rose-300
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      role="status"
      aria-label={`Statut de la demande : ${cfg.label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: 999,
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "0.01em",
      }}
    >
      {cfg.label}
    </span>
  );
}
