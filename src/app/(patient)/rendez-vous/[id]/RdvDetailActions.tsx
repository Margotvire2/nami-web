"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, XCircle, FileText, Upload } from "lucide-react";
import { STATUS_CFG, type AppointmentStatus } from "@/lib/appointment-status";
import { getProviderName } from "@/lib/appointment-helpers";
import { CancelAppointmentModal } from "@/components/patient/CancelAppointmentModal";
import { UploadToConsultationDialog } from "@/components/EntityHubDrawer/UploadToConsultationDialog";
import type { PatientAppointmentDetail } from "@/lib/api";

interface RdvDetailActionsProps {
  appointment: PatientAppointmentDetail;
  onCancelled: () => void;
}

export function RdvDetailActions({
  appointment,
  onCancelled,
}: RdvDetailActionsProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const cfg = STATUS_CFG[appointment.status as AppointmentStatus];
  const canCancel = cfg?.canCancel ?? false;
  const providerName = getProviderName(appointment);
  const providerId = appointment.provider?.id;
  const careCaseId = appointment.careCaseId;
  const canUpload = Boolean(careCaseId && providerId);

  const cancelPayload = {
    ...appointment,
    providerName,
  };

  return (
    <>
      <section
        aria-labelledby="rdv-actions-title"
        className="rounded-2xl p-5 md:p-6"
        style={{
          background: "#fff",
          border: "1px solid rgba(26,26,46,0.06)",
        }}
      >
        <h2
          id="rdv-actions-title"
          className="text-sm font-semibold uppercase tracking-wide mb-4"
          style={{ color: "#6B7280", letterSpacing: "0.06em" }}
        >
          Actions
        </h2>

        <div className="flex flex-col gap-3">
          <Link
            href={`/mes-documents${appointment.careCaseId ? `?careCaseId=${appointment.careCaseId}` : ""}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
            style={{
              background: "rgba(91,78,196,0.08)",
              color: "#5B4EC4",
              border: "1px solid rgba(91,78,196,0.18)",
            }}
          >
            <FileText size={16} aria-hidden="true" />
            Voir mes documents partagés
          </Link>

          {canUpload && (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
              style={{
                background: "rgba(91,78,196,0.08)",
                color: "#5B4EC4",
                border: "1px solid rgba(91,78,196,0.18)",
              }}
            >
              <Upload size={16} aria-hidden="true" />
              Transmettre un document pour ce rendez-vous
            </button>
          )}

          {canCancel && providerId && (
            <Link
              href={`/trouver-un-soignant/${providerId}?reschedule=${appointment.id}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
              style={{
                background: "#5B4EC4",
                color: "#fff",
              }}
            >
              <CalendarClock size={16} aria-hidden="true" />
              Reporter ce rendez-vous
            </Link>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              style={{
                color: "#B91C1C",
                border: "1px solid rgba(185,28,28,0.18)",
                background: "#fff",
              }}
            >
              <XCircle size={16} aria-hidden="true" />
              Annuler ce rendez-vous
            </button>
          )}

          {!canCancel && (
            <p
              className="text-xs italic"
              style={{ color: "#9CA3AF" }}
            >
              Ce rendez-vous ne peut plus être modifié depuis votre espace.
            </p>
          )}
        </div>
      </section>

      {canCancel && (
        <CancelAppointmentModal
          appointment={cancelPayload}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onSuccess={() => {
            setCancelOpen(false);
            onCancelled();
          }}
        />
      )}

      {canUpload && careCaseId && providerId && (
        <UploadToConsultationDialog
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          careCaseId={careCaseId}
          consultationId={appointment.id}
          providerId={providerId}
          providerName={providerName}
        />
      )}
    </>
  );
}
