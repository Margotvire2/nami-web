"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Inbox,
  Pencil,
  Ban,
  Loader2,
} from "lucide-react";
import { useEvent, deriveEventUiStatus } from "@/hooks/useEvent";
import { EventStatusBadge } from "@/components/event/EventStatusBadge";
import { EventTypeIcon, eventTypeLabel } from "@/components/event/EventTypeIcon";
import { EventForm } from "@/components/event/EventForm";
import { ParticipantsList } from "@/components/event/ParticipantsList";
import { ApiError } from "@/lib/api";

type Tab = "details" | "participants" | "submissions" | "edit";

const TABS: { value: Tab; label: string; icon: typeof CalendarDays }[] = [
  { value: "details", label: "Détails", icon: CalendarDays },
  { value: "participants", label: "Participants", icon: Users },
  { value: "submissions", label: "Dossiers soumis", icon: Inbox },
  { value: "edit", label: "Édition", icon: Pencil },
];

const DATETIME_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; eventId: string }>;
}) {
  const { orgId, eventId } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("details");
  const [cancelReason, setCancelReason] = useState("");
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const {
    event,
    isLoading,
    isError,
    patch,
    isPatching,
    patchError,
    cancel,
    isCancelling,
    cancelError,
  } = useEvent(eventId);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E8ECF4] bg-white px-5 py-8 text-center text-sm text-[#6B7280]">
        Chargement de l&apos;événement…
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="space-y-3">
        <Link
          href={`/structure/${orgId}/admin/evenements`}
          className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#5B4EC4]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          <ArrowLeft size={12} />
          Retour
        </Link>
        <div className="rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-5 py-6 text-center text-sm text-[#991B1B]">
          Événement introuvable ou accès refusé.
        </div>
      </div>
    );
  }

  const uiStatus = deriveEventUiStatus({
    status: event.status,
    startAt: event.startAt,
    endAt: event.endAt,
    maxParticipants: event.maxParticipants,
    participantsCount: event._count.participants,
  });

  async function handleCancel() {
    try {
      await cancel({ cancelReason: cancelReason.trim() || undefined });
      setConfirmingCancel(false);
      setCancelReason("");
    } catch {
      // affiché via cancelError
    }
  }

  async function handlePatch(input: Parameters<typeof patch>[0]) {
    try {
      await patch(input);
      setTab("details");
    } catch {
      // affiché via patchError
    }
  }

  const patchErrorMessage =
    patchError instanceof ApiError
      ? patchError.message
      : patchError
        ? "Erreur lors de la modification."
        : null;

  const cancelErrorMessage =
    cancelError instanceof ApiError
      ? cancelError.message
      : cancelError
        ? "Impossible d'annuler l'événement."
        : null;

  return (
    <div className="space-y-6">
      <Link
        href={`/structure/${orgId}/admin/evenements`}
        className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#5B4EC4]"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        <ArrowLeft size={12} />
        Retour aux événements
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <EventTypeIcon type={event.type} size={18} />
          <span
            className="text-xs font-medium uppercase tracking-wide text-[#6B7280]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {eventTypeLabel(event.type)}
          </span>
          <EventStatusBadge status={uiStatus} size="md" />
        </div>
        <h1
          className="text-2xl font-bold text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {event.title}
        </h1>
        <p className="text-sm text-[#6B7280]">
          {DATETIME_FMT.format(new Date(event.startAt))}
        </p>
      </header>

      <nav
        aria-label="Onglets événement"
        className="flex flex-wrap gap-1 rounded-xl border border-[#E8ECF4] bg-white p-1.5"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-[#5B4EC4] text-white"
                  : "text-[#374151] hover:bg-[#F0F2FA] hover:text-[#5B4EC4]"
              }`}
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "details" && (
        <DetailsTab
          event={event}
          uiStatus={uiStatus}
          orgId={orgId}
          confirmingCancel={confirmingCancel}
          setConfirmingCancel={setConfirmingCancel}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          isCancelling={isCancelling}
          cancelErrorMessage={cancelErrorMessage}
          onCancel={handleCancel}
        />
      )}

      {tab === "participants" && (
        <Link
          href={`/structure/${orgId}/admin/evenements/${eventId}/participants`}
          className="block rounded-xl border border-[#E8ECF4] bg-white p-4 hover:border-[#5B4EC4]/40"
        >
          <ParticipantsList
            participantsCount={event._count.participants}
            patientSubmissionsCount={event._count.patientSubmissions}
            acceptsPatientSubmissions={event.acceptsPatientSubmissions}
            isDpcEligible={event.isDpcEligible}
          />
          <div className="mt-3 text-right">
            <span className="text-xs text-[#5B4EC4] font-medium">
              Voir la console participants →
            </span>
          </div>
        </Link>
      )}

      {tab === "submissions" && (
        <SubmissionsTab
          event={event}
          orgId={orgId}
          eventId={eventId}
          router={router}
        />
      )}

      {tab === "edit" && (
        <section
          aria-label="Édition de l'événement"
          className="rounded-xl border border-[#E8ECF4] bg-white p-6"
        >
          <EventForm
            initialValues={{
              type: event.type,
              title: event.title,
              description: event.description,
              startAt: event.startAt,
              endAt: event.endAt,
              format: event.format,
              locationLabel: event.locationLabel,
              visioUrl: event.visioUrl,
              visibility: event.visibility,
              status: event.status === "CANCELLED" ? "DRAFT" : event.status,
              maxParticipants: event.maxParticipants,
              isDpcEligible: event.isDpcEligible,
              dpcReferenceCode: event.dpcReferenceCode,
              workingGroupConvId: event.workingGroupConvId,
              acceptsPatientSubmissions: event.acceptsPatientSubmissions,
              patientSubmissionDeadline: event.patientSubmissionDeadline,
            }}
            submitLabel="Enregistrer les modifications"
            submitting={isPatching}
            errorMessage={patchErrorMessage}
            onSubmit={handlePatch}
            onCancel={() => setTab("details")}
          />
        </section>
      )}
    </div>
  );
}

function DetailsTab({
  event,
  uiStatus,
  orgId,
  confirmingCancel,
  setConfirmingCancel,
  cancelReason,
  setCancelReason,
  isCancelling,
  cancelErrorMessage,
  onCancel,
}: {
  event: NonNullable<ReturnType<typeof useEvent>["event"]>;
  uiStatus: ReturnType<typeof deriveEventUiStatus>;
  orgId: string;
  confirmingCancel: boolean;
  setConfirmingCancel: (v: boolean) => void;
  cancelReason: string;
  setCancelReason: (v: string) => void;
  isCancelling: boolean;
  cancelErrorMessage: string | null;
  onCancel: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-[#E8ECF4] bg-white p-5 space-y-3">
          <h2
            className="text-sm font-semibold text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Informations
          </h2>
          <DetailRow label="Format" value={formatFormat(event.format)} />
          {event.locationLabel && (
            <DetailRow label="Lieu" value={event.locationLabel} />
          )}
          {event.visioUrl && <DetailRow label="Lien visio" value={event.visioUrl} />}
          <DetailRow label="Visibilité" value={formatVisibility(event.visibility)} />
          {event.maxParticipants != null && (
            <DetailRow
              label="Capacité"
              value={`${event.maxParticipants} place${event.maxParticipants > 1 ? "s" : ""}`}
            />
          )}
          {event.description && (
            <div className="pt-2 border-t border-[#E8ECF4]">
              <p className="text-xs text-[#6B7280] mb-1">Description</p>
              <p className="text-sm text-[#374151] whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {event.isDpcEligible && (
          <div className="rounded-xl border border-[#FDE68A] bg-[#FEF3C7] p-4">
            <p
              className="text-xs font-semibold text-[#92400E]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Événement éligible DPC
            </p>
            {event.dpcReferenceCode && (
              <p className="text-xs text-[#92400E] mt-1">
                Référence : <code>{event.dpcReferenceCode}</code>
              </p>
            )}
          </div>
        )}

        {event.cancelledAt && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEE2E2] p-4">
            <p
              className="text-xs font-semibold text-[#991B1B]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Annulé le {new Date(event.cancelledAt).toLocaleString("fr-FR")}
            </p>
            {event.cancelReason && (
              <p className="text-xs text-[#991B1B] mt-1">
                Motif : {event.cancelReason}
              </p>
            )}
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-xl border border-[#E8ECF4] bg-white p-5">
          <h2
            className="text-sm font-semibold text-[#0F172A] mb-3"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Actions
          </h2>
          <div className="space-y-2">
            <Link
              href={`/structure/${orgId}/admin/evenements/${event.id}/participants`}
              className="block w-full rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-xs font-medium text-[#374151] hover:border-[#5B4EC4]/40 text-center"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Console participants
            </Link>
            {uiStatus !== "CANCELLED" && uiStatus !== "PAST" && (
              <>
                {!confirmingCancel ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-[#FECACA] bg-white px-3 py-2 text-xs font-medium text-[#991B1B] hover:bg-[#FEE2E2]"
                    style={{ fontFamily: "var(--font-jakarta)" }}
                  >
                    <Ban size={12} />
                    Annuler l&apos;événement
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={2}
                      placeholder="Motif (optionnel)"
                      className="w-full rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-xs"
                    />
                    {cancelErrorMessage && (
                      <p className="text-[11px] text-[#991B1B]">{cancelErrorMessage}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingCancel(false)}
                        className="flex-1 rounded-md border border-[#E8ECF4] bg-white px-2 py-1.5 text-xs text-[#6B7280]"
                      >
                        Retour
                      </button>
                      <button
                        type="button"
                        onClick={onCancel}
                        disabled={isCancelling}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-[#991B1B] px-2 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {isCancelling && <Loader2 size={10} className="animate-spin" />}
                        Confirmer
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#E8ECF4] bg-white p-5 space-y-2">
          <h2
            className="text-sm font-semibold text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Compteurs
          </h2>
          <DetailRow label="Inscriptions" value={String(event._count.participants)} />
          <DetailRow
            label="Dossiers soumis"
            value={String(event._count.patientSubmissions)}
          />
        </div>
      </aside>
    </div>
  );
}

function SubmissionsTab({
  event,
  orgId,
  eventId,
  router,
}: {
  event: NonNullable<ReturnType<typeof useEvent>["event"]>;
  orgId: string;
  eventId: string;
  router: ReturnType<typeof useRouter>;
}) {
  if (!event.acceptsPatientSubmissions) {
    return (
      <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-8 text-center">
        <Inbox size={20} className="mx-auto text-[#6B7280] mb-2" />
        <p className="text-sm font-medium text-[#0F172A]">
          Cet événement n&apos;accepte pas de soumissions de dossiers.
        </p>
        <p className="text-xs text-[#6B7280] mt-1">
          Activable depuis l&apos;onglet Édition (RCP élargie uniquement).
        </p>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() =>
        router.push(`/structure/${orgId}/admin/evenements/${eventId}/participants`)
      }
      className="w-full rounded-xl border border-[#E8ECF4] bg-white p-5 text-left hover:border-[#5B4EC4]/40"
    >
      <div className="flex items-center gap-2 mb-2">
        <Inbox size={16} className="text-[#2BA89C]" />
        <h2
          className="text-sm font-semibold text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {event._count.patientSubmissions} dossier
          {event._count.patientSubmissions > 1 ? "s" : ""} soumis
        </h2>
      </div>
      <p className="text-xs text-[#6B7280]">
        Examinez les soumissions, acceptez ou refusez, et marquez les dossiers
        présentés post-RCP.
      </p>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-[#6B7280]">{label}</span>
      <span
        className="text-right text-[#0F172A] font-medium break-words max-w-[60%]"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {value}
      </span>
    </div>
  );
}

function formatFormat(f: string): string {
  return f === "VISIO" ? "Visio" : f === "IN_PERSON" ? "Présentiel" : "Hybride";
}

function formatVisibility(v: string): string {
  if (v === "PUBLIC") return "Public";
  if (v === "WORKING_GROUP") return "Groupe de travail";
  return "Membres de la structure";
}
