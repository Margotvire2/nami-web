import Link from "next/link";
import { Calendar, Video, MapPin, ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { MockAppointmentRequest } from "./mock-data";

interface DemandeCardProps {
  request: MockAppointmentRequest;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATETIME_SHORT_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatRequestedDate(iso: string | null): string {
  if (!iso) return "Pas de date précise";
  return DATE_FORMATTER.format(new Date(`${iso}T00:00:00`));
}

function formatRelativeDate(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return `Le ${DATETIME_SHORT_FORMATTER.format(then)}`;
}

export function DemandeCard({ request }: DemandeCardProps) {
  const providerFullName = `${request.providerFirstName} ${request.providerLastName}`;
  const locationLabel = request.locationType === "VIDEO" ? "Vidéo" : "En cabinet";

  return (
    <article
      role="listitem"
      aria-label={`Demande de rendez-vous avec ${providerFullName}`}
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      {/* Header — provider + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#1A1A2E",
              marginBottom: 2,
              fontFamily: "var(--font-jakarta)",
            }}
          >
            {providerFullName}
          </p>
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            {request.providerSpecialty}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Motif (optionnel) */}
      {request.motif && (
        <p
          style={{
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.5,
            marginBottom: 12,
            padding: "10px 14px",
            background: "rgba(91,78,196,0.04)",
            borderLeft: "3px solid rgba(91,78,196,0.4)",
            borderRadius: 8,
          }}
        >
          {request.motif}
        </p>
      )}

      {/* Metadata row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 13,
          color: "#6B7280",
          marginBottom: 12,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Calendar size={14} strokeWidth={1.8} aria-hidden="true" />
          {formatRequestedDate(request.requestedDate)}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {request.locationType === "VIDEO" ? (
            <Video size={14} strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <MapPin size={14} strokeWidth={1.8} aria-hidden="true" />
          )}
          {locationLabel}
        </span>
      </div>

      {/* Footer — demande créée + status-specific info */}
      <div
        style={{
          borderTop: "1px solid rgba(26,26,46,0.06)",
          paddingTop: 12,
          fontSize: 12,
          color: "#9CA3AF",
        }}
      >
        Demande envoyée {formatRelativeDate(request.createdAt)}
      </div>

      {/* Status-specific details + CTA */}
      {request.status === "ACCEPTED" && request.acceptedAt && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#065F46" }}>
            Acceptée {formatRelativeDate(request.acceptedAt)}
          </p>
          <a
            href="#"
            aria-label={`Voir le rendez-vous confirmé avec ${providerFullName}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
              fontWeight: 600,
              color: "#5B4EC4",
              textDecoration: "none",
            }}
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded-md px-1"
          >
            Voir le rendez-vous <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      )}

      {request.status === "DECLINED" && (
        <div style={{ marginTop: 12 }}>
          {request.declinedAt && (
            <p style={{ fontSize: 13, color: "#9F1239", marginBottom: 4 }}>
              Refusée {formatRelativeDate(request.declinedAt)}
            </p>
          )}
          {request.declineReason && (
            <p
              style={{
                fontSize: 13,
                color: "#374151",
                marginBottom: 12,
                padding: "8px 12px",
                background: "rgba(159,18,57,0.04)",
                borderRadius: 8,
                lineHeight: 1.5,
              }}
            >
              {request.declineReason}
            </p>
          )}
          <Link
            href="/trouver-un-soignant"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 999,
              background: "#5B4EC4",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(91,78,196,0.25)",
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
          >
            Choisir un autre soignant
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      )}
    </article>
  );
}
