"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardEdit, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { N, cardStyle } from "@/lib/design-tokens";
import { ApplicationDetails } from "@/components/admin/applications/ApplicationDetails";
import { ApproveModal } from "@/components/admin/applications/ApproveModal";
import { RejectModal } from "@/components/admin/applications/RejectModal";
import {
  useAdminApplicationDetail,
  useApproveApplication,
  useRejectApplication,
  useStartReview,
} from "@/hooks/useAdminApplications";

type ModalType = "APPROVE" | "REJECT" | null;

export default function OrganizationApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: application, isLoading, isError, refetch } = useAdminApplicationDetail(id);
  const [modal, setModal] = useState<ModalType>(null);

  const startReview = useStartReview();
  const approve = useApproveApplication();
  const reject = useRejectApplication();

  if (isLoading) {
    return (
      <div
        style={{
          ...cardStyle,
          padding: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          color: N.textLight,
          fontSize: 13,
        }}
      >
        <Loader2 size={16} className="animate-spin" />
        Chargement…
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div
        role="alert"
        style={{
          ...cardStyle,
          padding: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: N.danger,
          background: N.dangerBg,
          border: `1px solid ${N.dangerBorder}`,
        }}
      >
        <AlertCircle size={18} />
        <div style={{ flex: 1, fontSize: 13 }}>
          {application === null ? "Candidature introuvable." : "Impossible de charger la candidature."}
        </div>
        <Link
          href="/admin/organization-applications"
          style={{
            padding: "6px 12px",
            background: N.card,
            border: `1px solid ${N.dangerBorder}`,
            borderRadius: 8,
            color: N.danger,
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Retour à la queue
        </Link>
      </div>
    );
  }

  const canStartReview = application.status === "PENDING_REVIEW";
  const canDecide = application.status === "IN_REVIEW";

  async function handleStartReview() {
    if (!application || startReview.isPending) return;
    try {
      await startReview.mutateAsync(application.id);
      await refetch();
    } catch {
      // Erreur affichée via state d'erreur de la mutation ci-dessous
    }
  }

  async function handleApprove(reviewNotes: string | null) {
    if (!application) return;
    try {
      await approve.mutateAsync({ id: application.id, reviewNotes });
      setModal(null);
      await refetch();
    } catch {
      // Garde la modal ouverte pour montrer l'erreur
    }
  }

  async function handleReject(rejectionReason: string) {
    if (!application) return;
    try {
      await reject.mutateAsync({ id: application.id, rejectionReason });
      setModal(null);
      await refetch();
    } catch {
      // Garde la modal ouverte pour montrer l'erreur
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Breadcrumb + back */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <Link
          href="/admin/organization-applications"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: N.textLight,
            textDecoration: "none",
            padding: "4px 8px",
            borderRadius: 6,
            transition: "color 0.2s",
          }}
        >
          <ArrowLeft size={13} /> Toutes les candidatures
        </Link>
      </div>

      <ApplicationDetails application={application} />

      {/* Action bar */}
      {(canStartReview || canDecide) && (
        <div
          style={{
            ...cardStyle,
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            position: "sticky",
            bottom: 24,
          }}
        >
          <div style={{ fontSize: 12, color: N.textLight, maxWidth: 480 }}>
            {canStartReview &&
              "Démarrez la review pour bloquer la candidature et l'attribuer à votre compte."}
            {canDecide &&
              "Vous pouvez approuver pour créer la structure ou rejeter avec un motif."}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {canStartReview && (
              <button
                type="button"
                onClick={handleStartReview}
                disabled={startReview.isPending}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: N.primary,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: startReview.isPending ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: startReview.isPending ? 0.7 : 1,
                }}
              >
                {startReview.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ClipboardEdit size={14} />
                )}
                Commencer la review
              </button>
            )}
            {canDecide && (
              <>
                <button
                  type="button"
                  onClick={() => setModal("REJECT")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: `1px solid ${N.dangerBorder}`,
                    background: N.card,
                    color: N.danger,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <XCircle size={14} /> Rejeter
                </button>
                <button
                  type="button"
                  onClick={() => setModal("APPROVE")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: N.success,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={14} /> Approuver
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Erreur startReview */}
      {startReview.isError && (
        <div
          role="alert"
          style={{
            ...cardStyle,
            padding: 12,
            background: N.dangerBg,
            border: `1px solid ${N.dangerBorder}`,
            color: N.danger,
            fontSize: 12,
          }}
        >
          {startReview.error instanceof Error
            ? startReview.error.message
            : "Impossible de démarrer la review."}
        </div>
      )}

      {modal === "APPROVE" && (
        <ApproveModal
          applicantEmail={application.applicantEmail}
          proposedName={application.proposedName}
          onConfirm={handleApprove}
          onCancel={() => {
            if (!approve.isPending) setModal(null);
          }}
          isSubmitting={approve.isPending}
          errorMessage={
            approve.isError && approve.error instanceof Error
              ? approve.error.message
              : null
          }
        />
      )}

      {modal === "REJECT" && (
        <RejectModal
          applicantEmail={application.applicantEmail}
          proposedName={application.proposedName}
          onConfirm={handleReject}
          onCancel={() => {
            if (!reject.isPending) setModal(null);
          }}
          isSubmitting={reject.isPending}
          errorMessage={
            reject.isError && reject.error instanceof Error
              ? reject.error.message
              : null
          }
        />
      )}
    </div>
  );
}
