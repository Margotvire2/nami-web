import type { PatientAppointmentRequestStatus } from "@/lib/api";

interface DemandeStatusBadgeProps {
  status: PatientAppointmentRequestStatus | string;
}

const STATUS_CONFIG: Record<
  PatientAppointmentRequestStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: "En attente",
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FCD34D",
  },
  ACCEPTED: {
    label: "Acceptée",
    bg: "#D1FAE5",
    text: "#065F46",
    border: "#6EE7B7",
  },
  DECLINED: {
    label: "Refusée",
    bg: "#FEE2E2",
    text: "#9F1239",
    border: "#FDA4AF",
  },
  WITHDRAWN_BY_PATIENT: {
    label: "Retirée",
    bg: "#F3F4F6",
    text: "#374151",
    border: "#D1D5DB",
  },
};

export function DemandeStatusBadge({ status }: DemandeStatusBadgeProps) {
  const cfg =
    STATUS_CONFIG[status as PatientAppointmentRequestStatus] ?? STATUS_CONFIG.PENDING;
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
