"use client";

import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import type {
  CreateEventInput,
  EventFormat,
  EventStatus,
  EventType,
  EventVisibility,
} from "@/hooks/useOrgEvents";
import { eventTypeLabel } from "./EventTypeIcon";

interface EventFormProps {
  initialValues?: Partial<CreateEventInput>;
  submitLabel?: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (input: CreateEventInput) => void | Promise<void>;
  onCancel?: () => void;
}

const TYPE_OPTIONS: EventType[] = [
  "WEBINAR",
  "RCP_ELARGIE",
  "FORMATION_DPC",
  "WORKING_GROUP_MEET",
  "GENERAL",
];

const FORMAT_OPTIONS: { value: EventFormat; label: string }[] = [
  { value: "VISIO", label: "Visio" },
  { value: "IN_PERSON", label: "Présentiel" },
  { value: "HYBRID", label: "Hybride" },
];

const VISIBILITY_OPTIONS: { value: EventVisibility; label: string }[] = [
  { value: "ORGANIZATION_MEMBERS", label: "Membres de la structure" },
  { value: "PUBLIC", label: "Public" },
  { value: "WORKING_GROUP", label: "Groupe de travail (privé admins)" },
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
];

// Convertit une date ISO en valeur datetime-local (YYYY-MM-DDTHH:mm).
function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  if (!value) return "";
  // datetime-local → ISO local. new Date(value) interprète comme local time.
  const d = new Date(value);
  return d.toISOString();
}

export function EventForm({
  initialValues,
  submitLabel = "Créer l'événement",
  submitting = false,
  errorMessage,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [type, setType] = useState<EventType>(initialValues?.type ?? "RCP_ELARGIE");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [startAt, setStartAt] = useState(toDatetimeLocal(initialValues?.startAt));
  const [endAt, setEndAt] = useState(toDatetimeLocal(initialValues?.endAt));
  const [format, setFormat] = useState<EventFormat>(initialValues?.format ?? "VISIO");
  const [locationLabel, setLocationLabel] = useState(initialValues?.locationLabel ?? "");
  const [visioUrl, setVisioUrl] = useState(initialValues?.visioUrl ?? "");
  const [visibility, setVisibility] = useState<EventVisibility>(
    initialValues?.visibility ?? "ORGANIZATION_MEMBERS",
  );
  const [status, setStatus] = useState<EventStatus>(initialValues?.status ?? "DRAFT");
  const [maxParticipants, setMaxParticipants] = useState<string>(
    initialValues?.maxParticipants != null ? String(initialValues.maxParticipants) : "",
  );
  const [isDpcEligible, setIsDpcEligible] = useState(initialValues?.isDpcEligible ?? false);
  const [dpcReferenceCode, setDpcReferenceCode] = useState(
    initialValues?.dpcReferenceCode ?? "",
  );
  const [acceptsPatientSubmissions, setAcceptsPatientSubmissions] = useState(
    initialValues?.acceptsPatientSubmissions ?? false,
  );
  const [patientSubmissionDeadline, setPatientSubmissionDeadline] = useState(
    toDatetimeLocal(initialValues?.patientSubmissionDeadline),
  );
  const [workingGroupConvId, setWorkingGroupConvId] = useState(
    initialValues?.workingGroupConvId ?? "",
  );

  // Validation locale légère — le backend renvoie 400 explicite si pb.
  const localErrors = useMemo(() => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("Le titre est requis.");
    if (!startAt) errs.push("La date de début est requise.");
    if (!endAt) errs.push("La date de fin est requise.");
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      errs.push("La fin doit être après le début.");
    }
    if (type === "WORKING_GROUP_MEET" && !workingGroupConvId.trim()) {
      errs.push("Identifiant du groupe de travail requis pour ce type.");
    }
    return errs;
  }, [title, startAt, endAt, type, workingGroupConvId]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (localErrors.length > 0) return;

    const payload: CreateEventInput = {
      type,
      title: title.trim(),
      description: description.trim() || null,
      startAt: fromDatetimeLocal(startAt),
      endAt: fromDatetimeLocal(endAt),
      format,
      locationLabel: locationLabel.trim() || null,
      visioUrl: visioUrl.trim() || null,
      visibility,
      status,
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      isDpcEligible,
      dpcReferenceCode: dpcReferenceCode.trim() || null,
      workingGroupConvId:
        type === "WORKING_GROUP_MEET" ? workingGroupConvId.trim() || null : null,
      acceptsPatientSubmissions,
      patientSubmissionDeadline: patientSubmissionDeadline
        ? fromDatetimeLocal(patientSubmissionDeadline)
        : null,
    };
    void onSubmit(payload);
  }

  const showVisioField = format === "VISIO" || format === "HYBRID";
  const showLocationField = format === "IN_PERSON" || format === "HYBRID";
  const showWorkingGroupField = type === "WORKING_GROUP_MEET";
  const showPatientSubmissionsToggle = type === "RCP_ELARGIE";

  return (
    <form
      data-testid="event-form"
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      <Fieldset label="Type d'événement" htmlFor="event-type">
        <select
          id="event-type"
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
          className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {eventTypeLabel(t)}
            </option>
          ))}
        </select>
      </Fieldset>

      <Fieldset label="Titre" htmlFor="event-title" required>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        />
      </Fieldset>

      <Fieldset label="Description" htmlFor="event-description">
        <textarea
          id="event-description"
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={5000}
          className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        />
      </Fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Fieldset label="Début" htmlFor="event-start" required>
          <input
            id="event-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
            className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          />
        </Fieldset>
        <Fieldset label="Fin" htmlFor="event-end" required>
          <input
            id="event-end"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            required
            className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          />
        </Fieldset>
      </div>

      <Fieldset label="Format" htmlFor="event-format">
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((f) => (
            <label
              key={f.value}
              className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                format === f.value
                  ? "border-[#5B4EC4] bg-[#EEEDFB] text-[#5B4EC4]"
                  : "border-[#E8ECF4] bg-white text-[#374151] hover:border-[#5B4EC4]/40"
              }`}
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              <input
                type="radio"
                name="event-format"
                value={f.value}
                checked={format === f.value}
                onChange={() => setFormat(f.value)}
                className="sr-only"
              />
              {f.label}
            </label>
          ))}
        </div>
      </Fieldset>

      {showVisioField && (
        <Fieldset label="Lien visio" htmlFor="event-visio">
          <input
            id="event-visio"
            type="url"
            value={visioUrl ?? ""}
            onChange={(e) => setVisioUrl(e.target.value)}
            placeholder="https://meet.example.com/abc"
            maxLength={2000}
            className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          />
        </Fieldset>
      )}

      {showLocationField && (
        <Fieldset label="Lieu" htmlFor="event-location">
          <input
            id="event-location"
            type="text"
            value={locationLabel ?? ""}
            onChange={(e) => setLocationLabel(e.target.value)}
            maxLength={500}
            placeholder="Salle de réunion 3, RDC, …"
            className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          />
        </Fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Fieldset label="Visibilité" htmlFor="event-visibility">
          <select
            id="event-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as EventVisibility)}
            className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Fieldset>

        <Fieldset label="Statut initial" htmlFor="event-status">
          <select
            id="event-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
            className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Fieldset>
      </div>

      <Fieldset label="Capacité maximale (optionnel)" htmlFor="event-max">
        <input
          id="event-max"
          type="number"
          min={1}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          placeholder="Illimité si vide"
          className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        />
      </Fieldset>

      <div className="rounded-md border border-[#E8ECF4] bg-[#FAFAF8] p-4 space-y-3">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDpcEligible}
            onChange={(e) => setIsDpcEligible(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-[#374151]">
            <span className="font-medium">Éligible DPC</span> — Permet la délivrance
            d&apos;une attestation aux participants confirmés.
          </span>
        </label>
        {isDpcEligible && (
          <Fieldset label="Code de référence DPC (optionnel)" htmlFor="event-dpc-code">
            <input
              id="event-dpc-code"
              type="text"
              value={dpcReferenceCode ?? ""}
              onChange={(e) => setDpcReferenceCode(e.target.value)}
              maxLength={200}
              className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            />
          </Fieldset>
        )}
      </div>

      {showPatientSubmissionsToggle && (
        <div className="rounded-md border border-[#E8ECF4] bg-[#FAFAF8] p-4 space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptsPatientSubmissions}
              onChange={(e) => setAcceptsPatientSubmissions(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-sm text-[#374151]">
              <span className="font-medium">Accepter des soumissions de dossiers</span> —
              Les soignants référents peuvent soumettre un dossier de coordination
              pour discussion en RCP.
            </span>
          </label>
          {acceptsPatientSubmissions && (
            <Fieldset
              label="Date limite de soumission (optionnel)"
              htmlFor="event-submission-deadline"
            >
              <input
                id="event-submission-deadline"
                type="datetime-local"
                value={patientSubmissionDeadline}
                onChange={(e) => setPatientSubmissionDeadline(e.target.value)}
                className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
                style={{ fontFamily: "var(--font-jakarta)" }}
              />
            </Fieldset>
          )}
        </div>
      )}

      {showWorkingGroupField && (
        <Fieldset label="ID conversation groupe de travail" htmlFor="event-wg-conv" required>
          <input
            id="event-wg-conv"
            type="text"
            value={workingGroupConvId ?? ""}
            onChange={(e) => setWorkingGroupConvId(e.target.value)}
            placeholder="conv_xxx"
            required
            className="rounded-md border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          />
        </Fieldset>
      )}

      {(localErrors.length > 0 || errorMessage) && (
        <div className="rounded-md border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
          <ul className="list-disc pl-5 space-y-1">
            {localErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
            {errorMessage && <li>{errorMessage}</li>}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#E8ECF4] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:border-[#5B4EC4]/40"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || localErrors.length > 0}
          className="inline-flex items-center gap-2 rounded-md bg-[#5B4EC4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4A3FB0] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Fieldset({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-[#374151]"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {label}
        {required && <span className="text-[#991B1B] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
