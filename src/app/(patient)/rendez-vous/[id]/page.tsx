"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Video,
  Stethoscope,
  Clock,
  MessageCircle,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointment } from "@/lib/api";
import { STATUS_CFG, type AppointmentStatus } from "@/lib/appointment-status";
import { getProviderName, getLocationLabel } from "@/lib/appointment-helpers";
import { CancelAppointmentModal } from "@/components/patient/CancelAppointmentModal";

export default function RdvDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [cancelOpen, setCancelOpen] = useState(false);

  const id = typeof params?.id === "string" ? params.id : "";

  // Pas de get(id) backend — on filtre depuis list({status: "all"})
  const { data: appointments, isLoading, refetch } = useQuery<PatientAppointment[]>({
    queryKey: ["patient-appointments-all"],
    queryFn: () => apiWithToken(token!).patient.appointments.list({ status: "all" }),
    enabled: !!token,
    staleTime: 30_000,
  });

  const appointment = appointments?.find((a) => a.id === id);

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[var(--nami-primary)]" size={24} />
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/rendez-vous"
          className="inline-flex items-center gap-2 text-sm text-[var(--nami-text-muted)] hover:text-[var(--nami-dark)] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour à mes rendez-vous
        </Link>
        <div className="text-center py-12 px-6 bg-white/50 rounded-2xl border border-[var(--nami-border)]">
          <AlertCircle
            size={32}
            className="mx-auto mb-3 text-[var(--nami-text-muted)] opacity-50"
          />
          <p className="text-sm text-[var(--nami-text-muted)]">Rendez-vous introuvable.</p>
          <Link
            href="/rendez-vous"
            className="inline-block mt-4 text-sm font-medium text-[var(--nami-primary)] hover:underline"
          >
            Voir tous mes rendez-vous
          </Link>
        </div>
      </main>
    );
  }

  const cfg =
    STATUS_CFG[appointment.status as AppointmentStatus] ?? {
      label: appointment.status,
      badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
      dotColor: "bg-stone-400",
      isPast: false,
      canCancel: false,
    };

  const startDate = parseISO(appointment.startAt);
  const endDate = appointment.endAt ? parseISO(appointment.endAt) : null;
  const providerName = getProviderName(appointment);
  const locationLabel = getLocationLabel(appointment);
  const isTele =
    appointment.locationType === "TELECONSULTATION" ||
    appointment.locationType === "VIDEO";

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-12">
      {/* Breadcrumb retour */}
      <Link
        href="/rendez-vous"
        className="inline-flex items-center gap-2 text-sm text-[var(--nami-text-muted)] hover:text-[var(--nami-dark)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à mes rendez-vous
      </Link>

      {/* Header avec statut */}
      <header className="mb-8 flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--nami-dark)] tracking-tight">
          Rendez-vous
        </h1>
        <span
          className={`inline-block text-[11px] px-3 py-1 rounded-full border whitespace-nowrap ${cfg.badgeClass}`}
        >
          {cfg.label}
        </span>
      </header>

      {/* Bloc principal — détails */}
      <section
        className="bg-white border border-[var(--nami-border)] rounded-2xl p-6 mb-6 space-y-5"
        aria-label="Détails du rendez-vous"
      >
        {/* Date / heure */}
        <div className="flex items-start gap-3">
          <Calendar
            size={20}
            className="text-[var(--nami-primary)] mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--nami-text-muted)] mb-0.5">
              Date et heure
            </p>
            <p className="text-base font-semibold text-[var(--nami-dark)]">
              {format(startDate, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            <p className="text-sm text-[var(--nami-text-muted)]">
              à {format(startDate, "HH:mm", { locale: fr })}
              {endDate && ` — ${format(endDate, "HH:mm", { locale: fr })}`}
            </p>
          </div>
        </div>

        {/* Soignant */}
        <div className="flex items-start gap-3">
          <Stethoscope
            size={20}
            className="text-[var(--nami-primary)] mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--nami-text-muted)] mb-0.5">
              Soignant
            </p>
            <p className="text-base font-semibold text-[var(--nami-dark)]">
              {providerName}
            </p>
          </div>
        </div>

        {/* Motif */}
        {appointment.consultationType?.name && (
          <div className="flex items-start gap-3">
            <Clock
              size={20}
              className="text-[var(--nami-primary)] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--nami-text-muted)] mb-0.5">
                Motif
              </p>
              <p className="text-base text-[var(--nami-dark)]">
                {appointment.consultationType.name}
                {appointment.consultationType.durationMinutes && (
                  <span className="text-sm text-[var(--nami-text-muted)] ml-2">
                    · {appointment.consultationType.durationMinutes} min
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Lieu */}
        <div className="flex items-start gap-3">
          {isTele ? (
            <Video
              size={20}
              className="text-[var(--nami-primary)] mt-0.5 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <MapPin
              size={20}
              className="text-[var(--nami-primary)] mt-0.5 shrink-0"
              aria-hidden="true"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--nami-text-muted)] mb-0.5">
              Lieu
            </p>
            {isTele ? (
              <p className="text-base text-[var(--nami-dark)]">{locationLabel}</p>
            ) : appointment.location ? (
              <>
                <p className="text-base font-medium text-[var(--nami-dark)]">
                  {appointment.location.name}
                </p>
                {appointment.location.address && (
                  <p className="text-sm text-[var(--nami-text-muted)]">
                    {appointment.location.address}
                    {appointment.location.city && `, ${appointment.location.city}`}
                  </p>
                )}
              </>
            ) : (
              <p className="text-base text-[var(--nami-text-muted)]">{locationLabel}</p>
            )}
          </div>
        </div>
      </section>

      {/* Bloc actions */}
      <section
        className="flex flex-col sm:flex-row gap-3 mb-6"
        aria-label="Actions"
      >
        <Link
          href="/mes-messages"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--nami-border)] bg-white text-sm font-medium text-[var(--nami-dark)] hover:bg-[rgba(91,78,196,0.04)] transition-colors"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Contacter mon soignant
        </Link>
        {cfg.canCancel && (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.04)] text-sm font-medium text-[#DC2626] hover:bg-[rgba(220,38,38,0.08)] transition-colors"
            aria-label="Annuler ce rendez-vous"
          >
            <X size={16} aria-hidden="true" />
            Annuler le rendez-vous
          </button>
        )}
      </section>

      {/* Préparation placeholder (futurs questionnaires pré-consult) */}
      {cfg.canCancel && (
        <section
          className="bg-[rgba(91,78,196,0.04)] border border-[rgba(91,78,196,0.16)] rounded-xl p-4"
          aria-label="Préparation du rendez-vous"
        >
          <p className="text-sm font-semibold text-[var(--nami-dark)] mb-1">
            À préparer
          </p>
          <p className="text-xs text-[var(--nami-text-muted)] leading-relaxed">
            Aucune préparation requise pour ce rendez-vous. Si votre soignant
            vous envoie un questionnaire à compléter, vous le retrouverez ici
            et dans vos notifications.
          </p>
        </section>
      )}

      {/* Modal annulation — réutilise composant existant tel quel */}
      {cancelOpen && (
        <CancelAppointmentModal
          appointment={{ ...appointment, providerName }}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onSuccess={() => {
            setCancelOpen(false);
            refetch();
            router.push("/rendez-vous");
          }}
        />
      )}
    </main>
  );
}
