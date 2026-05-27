"use client";

import { Calendar, MapPin, User, Clock, AlertCircle } from "lucide-react";

export interface PendingRequestSummary {
  providerName?: string | null;
  requestedAt?: string | null;
  consultationType?: string | null;
  locationLabel?: string | null;
  reason?: string | null;
}

interface ConfirmDetailsProps {
  requestId: string;
  summary: PendingRequestSummary | null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ConfirmDetails({ requestId, summary }: ConfirmDetailsProps) {
  const hasSummary =
    !!summary &&
    (summary.providerName ||
      summary.requestedAt ||
      summary.consultationType ||
      summary.locationLabel);

  return (
    <section
      aria-labelledby="confirm-details-title"
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <h2
          id="confirm-details-title"
          className="text-lg md:text-xl font-bold"
          style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
        >
          Résumé de votre demande
        </h2>
        <span
          role="status"
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{
            background: "#FEF3C7",
            color: "#92400E",
            border: "1px solid #FDE68A",
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#D97706" }}
            aria-hidden="true"
          />
          En attente de réponse
        </span>
      </div>

      {hasSummary && summary ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.providerName && (
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(91,78,196,0.10)",
                  color: "#5B4EC4",
                }}
                aria-hidden="true"
              >
                <User size={14} />
              </div>
              <div>
                <dt
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#6B7280", letterSpacing: "0.06em" }}
                >
                  Soignant
                </dt>
                <dd className="text-sm mt-0.5" style={{ color: "#1A1A2E" }}>
                  {summary.providerName}
                </dd>
              </div>
            </div>
          )}

          {summary.requestedAt && (
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(91,78,196,0.10)",
                  color: "#5B4EC4",
                }}
                aria-hidden="true"
              >
                <Calendar size={14} />
              </div>
              <div>
                <dt
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#6B7280", letterSpacing: "0.06em" }}
                >
                  Date demandée
                </dt>
                <dd className="text-sm mt-0.5" style={{ color: "#1A1A2E" }}>
                  {formatDate(summary.requestedAt)}
                </dd>
              </div>
            </div>
          )}

          {summary.consultationType && (
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(91,78,196,0.10)",
                  color: "#5B4EC4",
                }}
                aria-hidden="true"
              >
                <Clock size={14} />
              </div>
              <div>
                <dt
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#6B7280", letterSpacing: "0.06em" }}
                >
                  Motif
                </dt>
                <dd className="text-sm mt-0.5" style={{ color: "#1A1A2E" }}>
                  {summary.consultationType}
                </dd>
              </div>
            </div>
          )}

          {summary.locationLabel && (
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(91,78,196,0.10)",
                  color: "#5B4EC4",
                }}
                aria-hidden="true"
              >
                <MapPin size={14} />
              </div>
              <div>
                <dt
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#6B7280", letterSpacing: "0.06em" }}
                >
                  Lieu
                </dt>
                <dd className="text-sm mt-0.5" style={{ color: "#1A1A2E" }}>
                  {summary.locationLabel}
                </dd>
              </div>
            </div>
          )}
        </dl>
      ) : (
        <div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{
            background: "#FAFAF8",
            border: "1px dashed rgba(26,26,46,0.12)",
          }}
        >
          <AlertCircle
            size={16}
            aria-hidden="true"
            className="shrink-0 mt-0.5"
            style={{ color: "#6B7280" }}
          />
          <p className="text-sm" style={{ color: "#374151", lineHeight: 1.6 }}>
            Le détail de votre demande vous a été envoyé par email. Conservez
            cette page : la référence de votre demande est{" "}
            <span
              className="font-mono font-semibold"
              style={{ color: "#1A1A2E" }}
            >
              {requestId.slice(-8).toUpperCase()}
            </span>
            .
          </p>
        </div>
      )}
    </section>
  );
}
