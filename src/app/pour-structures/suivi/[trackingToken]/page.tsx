"use client";

import { use, useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  useApplicationStatus,
  useWithdrawApplication,
  type ApplicationStatus,
} from "@/hooks/useApplicationStatus";

interface PageProps {
  params: Promise<{ trackingToken: string }>;
}

const STATUS_LABELS: Record<ApplicationStatus, { label: string; tone: "neutral" | "info" | "warn" | "ok" | "ko" }> = {
  DRAFT: { label: "Brouillon", tone: "neutral" },
  PENDING_REVIEW: { label: "En attente de revue", tone: "info" },
  IN_REVIEW: { label: "En cours d'examen", tone: "info" },
  APPROVED: { label: "Approuvée", tone: "ok" },
  REJECTED: { label: "Refusée", tone: "ko" },
  WITHDRAWN: { label: "Retirée", tone: "neutral" },
};

const TONE_COLORS: Record<
  "neutral" | "info" | "warn" | "ok" | "ko",
  { bg: string; fg: string; border: string }
> = {
  neutral: { bg: "#F5F3EF", fg: "#374151", border: "rgba(26,26,46,0.08)" },
  info: { bg: "#EEF2FF", fg: "#3730A3", border: "#C7D2FE" },
  warn: { bg: "#FEF3C7", fg: "#92400E", border: "#FDE68A" },
  ok: { bg: "#ECFDF5", fg: "#065F46", border: "#A7F3D0" },
  ko: { bg: "#FEF2F2", fg: "#991B1B", border: "#FECACA" },
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, tone } = STATUS_LABELS[status];
  const c = TONE_COLORS[tone];
  return (
    <span
      data-testid="status-badge"
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function SuiviPage({ params }: PageProps) {
  const { trackingToken } = use(params);
  const status = useApplicationStatus(trackingToken);
  const withdraw = useWithdrawApplication(trackingToken);
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);

  const canWithdraw =
    status.data?.status === "PENDING_REVIEW" ||
    status.data?.status === "IN_REVIEW";

  return (
    <>
      <PublicNavbar />
      <main
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          background: "#FAFAF8",
          color: "#1A1A2E",
          minHeight: "100vh",
          padding: "120px 24px 80px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link
            href="/pour-structures"
            style={{
              fontSize: 13,
              color: "#5B4EC4",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            ← Retour
          </Link>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
              fontWeight: 700,
              marginTop: 16,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Suivi de votre candidature
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 24,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            Token : {trackingToken}
          </p>

          {status.isLoading ? (
            <div
              data-testid="suivi-loading"
              style={{
                padding: 32,
                textAlign: "center",
                background: "#FFFFFF",
                borderRadius: 14,
                border: "1px solid rgba(26,26,46,0.06)",
                color: "#6B7280",
              }}
            >
              Chargement de la candidature…
            </div>
          ) : null}

          {status.isError ? (
            <div
              role="alert"
              data-testid="suivi-error"
              style={{
                padding: 24,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 14,
                color: "#991B1B",
              }}
            >
              <strong style={{ display: "block", marginBottom: 4 }}>
                {status.error.status === 404
                  ? "Candidature introuvable"
                  : "Erreur de chargement"}
              </strong>
              <span style={{ fontSize: 14 }}>
                {status.error.status === 404
                  ? "Vérifiez le lien de suivi reçu par email. Si le problème persiste, contactez l'équipe Nami."
                  : status.error.message}
              </span>
            </div>
          ) : null}

          {status.data ? (
            <div
              style={{
                padding: 24,
                background: "#FFFFFF",
                borderRadius: 14,
                border: "1px solid rgba(26,26,46,0.06)",
                display: "grid",
                gap: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                  {status.data.proposedName}
                </h2>
                <StatusBadge status={status.data.status} />
              </div>

              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr",
                  gap: "8px 16px",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                <dt style={{ color: "#6B7280", fontWeight: 500 }}>Type</dt>
                <dd style={{ margin: 0 }}>{status.data.proposedType}</dd>

                <dt style={{ color: "#6B7280", fontWeight: 500 }}>SIRET</dt>
                <dd style={{ margin: 0 }}>{status.data.proposedSiret}</dd>

                {status.data.proposedFiness ? (
                  <>
                    <dt style={{ color: "#6B7280", fontWeight: 500 }}>FINESS</dt>
                    <dd style={{ margin: 0 }}>{status.data.proposedFiness}</dd>
                  </>
                ) : null}

                <dt style={{ color: "#6B7280", fontWeight: 500 }}>Adresse</dt>
                <dd style={{ margin: 0 }}>
                  {status.data.proposedAddress}, {status.data.proposedZipCode}{" "}
                  {status.data.proposedCity}
                </dd>

                <dt style={{ color: "#6B7280", fontWeight: 500 }}>
                  Référent
                </dt>
                <dd style={{ margin: 0 }}>
                  {status.data.applicantFirstName}{" "}
                  {status.data.applicantLastName} ·{" "}
                  {status.data.applicantRoleInOrg}
                </dd>

                <dt style={{ color: "#6B7280", fontWeight: 500 }}>Email</dt>
                <dd style={{ margin: 0 }}>{status.data.applicantEmail}</dd>

                <dt style={{ color: "#6B7280", fontWeight: 500 }}>Reçue le</dt>
                <dd style={{ margin: 0 }}>
                  {formatDate(
                    status.data.submittedAt ?? status.data.createdAt,
                  )}
                </dd>

                {status.data.decidedAt ? (
                  <>
                    <dt style={{ color: "#6B7280", fontWeight: 500 }}>
                      Décision
                    </dt>
                    <dd style={{ margin: 0 }}>
                      {formatDate(status.data.decidedAt)}
                    </dd>
                  </>
                ) : null}
              </dl>

              {status.data.status === "REJECTED" &&
              status.data.rejectionReason ? (
                <div
                  style={{
                    padding: 14,
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 10,
                    fontSize: 14,
                    color: "#991B1B",
                  }}
                >
                  <strong>Motif du refus :</strong>{" "}
                  {status.data.rejectionReason}
                </div>
              ) : null}

              {withdraw.isSuccess ? (
                <div
                  role="status"
                  data-testid="withdraw-success"
                  style={{
                    padding: 14,
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    borderRadius: 10,
                    fontSize: 14,
                    color: "#065F46",
                  }}
                >
                  Votre candidature a bien été retirée.
                </div>
              ) : null}

              {withdraw.isError ? (
                <div
                  role="alert"
                  style={{
                    padding: 14,
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 10,
                    fontSize: 14,
                    color: "#991B1B",
                  }}
                >
                  {withdraw.error.message}
                </div>
              ) : null}

              {canWithdraw && !withdraw.isSuccess ? (
                <div style={{ borderTop: "1px solid rgba(26,26,46,0.06)", paddingTop: 16 }}>
                  {confirmingWithdraw ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      <p style={{ fontSize: 14, color: "#1A1A2E", margin: 0 }}>
                        Confirmer le retrait de votre candidature&nbsp;? Cette
                        action est irréversible.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          data-testid="withdraw-confirm"
                          disabled={withdraw.isPending}
                          onClick={() => withdraw.mutate()}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 999,
                            background: "#DC2626",
                            color: "#FFFFFF",
                            fontSize: 13,
                            fontWeight: 600,
                            border: "none",
                            cursor: withdraw.isPending ? "wait" : "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {withdraw.isPending
                            ? "Retrait en cours…"
                            : "Oui, retirer ma demande"}
                        </button>
                        <button
                          type="button"
                          disabled={withdraw.isPending}
                          onClick={() => setConfirmingWithdraw(false)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 999,
                            background: "#FFFFFF",
                            border: "1px solid rgba(26,26,46,0.12)",
                            color: "#1A1A2E",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      data-testid="withdraw-button"
                      onClick={() => setConfirmingWithdraw(true)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 999,
                        background: "#FFFFFF",
                        border: "1px solid #DC2626",
                        color: "#DC2626",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Retirer ma demande
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
