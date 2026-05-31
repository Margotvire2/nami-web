"use client";

import { useState } from "react";
import { Calendar, Video, MapPin, Loader2, X } from "lucide-react";
import type { PatientAppointmentRequest } from "@/lib/api";
import { DemandeStatusBadge } from "./DemandeStatusBadge";

interface DemandeCardProps {
  request: PatientAppointmentRequest;
  onWithdraw: (id: string) => void;
  isWithdrawing?: boolean;
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
  return DATE_FORMATTER.format(new Date(iso));
}

function formatRelativeDate(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  return `le ${DATETIME_SHORT_FORMATTER.format(then)}`;
}

export function DemandeCard({ request, onWithdraw, isWithdrawing }: DemandeCardProps) {
  const [confirming, setConfirming] = useState(false);
  const { firstName, lastName } = request.provider.person;
  const providerFullName = `${firstName} ${lastName}`;
  const providerSpecialty = request.provider.specialties[0] ?? "";
  const locationLabel = request.locationType === "VIDEO" ? "Vidéo" : "En cabinet";
  const canWithdraw = request.status === "PENDING";

  return (
    <article
      aria-label={`Demande de rendez-vous avec ${providerFullName}`}
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 12,
        }}
      >
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
          {providerSpecialty && (
            <p style={{ fontSize: 13, color: "#6B7280" }}>{providerSpecialty}</p>
          )}
        </div>
        <DemandeStatusBadge status={request.status} />
      </div>

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

      {canWithdraw && (
        <div style={{ marginTop: 12 }}>
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={isWithdrawing}
              aria-label={`Retirer la demande de rendez-vous avec ${providerFullName}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                background: "#FFFFFF",
                color: "#9F1239",
                border: "1px solid rgba(159,18,57,0.25)",
                fontSize: 13,
                fontWeight: 600,
                cursor: isWithdrawing ? "not-allowed" : "pointer",
                opacity: isWithdrawing ? 0.6 : 1,
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239]/30 transition-colors hover:bg-[rgba(159,18,57,0.04)]"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
              Retirer la demande
            </button>
          ) : (
            <div
              role="group"
              aria-label="Confirmer le retrait de la demande"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "rgba(159,18,57,0.04)",
                border: "1px solid rgba(159,18,57,0.15)",
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 13, color: "#374151", flex: 1, minWidth: 180 }}>
                Confirmer le retrait de cette demande ?
              </span>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={isWithdrawing}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#FFFFFF",
                  color: "#374151",
                  border: "1px solid rgba(26,26,46,0.12)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: isWithdrawing ? "not-allowed" : "pointer",
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => onWithdraw(request.id)}
                disabled={isWithdrawing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#9F1239",
                  color: "#FFFFFF",
                  border: "1px solid #9F1239",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isWithdrawing ? "not-allowed" : "pointer",
                  opacity: isWithdrawing ? 0.7 : 1,
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239]/40"
              >
                {isWithdrawing && (
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                )}
                Retirer
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
