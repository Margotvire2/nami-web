"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { secretaryApi, type SecretaryAppointment, type SecretaryAgenda, type ConsultationTypeDTO, type PatientAdmin, type UpdatePatientInput } from "@/lib/api";
import { isActiveStatus, isCancelledLike } from "@/lib/appointment-status";
import { format, parseISO, set } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  Clock,
  User,
  Phone,
  X,
  CheckCircle2,
  Armchair,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SecretariatSignedDocsSection } from "@/components/secretariat/SecretariatSignedDocsSection";
import { ProviderInfoModal, type ProviderContactInfo } from "./ProviderInfoModal";
import { N as DT, getStatusStyle } from "@/lib/design-tokens";

// INIT-628 — Les endpoints /secretary/agendas + /secretary/waiting-room
// exposent désormais providerPhone/providerEmail/providerPhotoUrl (commit
// 8ba1a34e backend). Les types SDK (SecretaryAgenda, SecretaryWaitingEntry)
// n'ont pas encore été étendus : on type localement le surplus pour rester
// strict sans toucher src/lib/api.ts.
type ProviderContactExtras = {
  providerPhone?: string | null;
  providerEmail?: string | null;
  providerPhotoUrl?: string | null;
};

// ─── Constantes partagées (jour + semaine) ────────────────────────────────────

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const SLOT_HEIGHT = 60;
export const DAY_START = 7;
export const DAY_END = 20;

export const IN_PROGRESS_STYLE: CSSProperties = {
  backgroundColor: DT.primaryLight,
  borderColor: DT.statusConfirmed,
  color: DT.statusConfirmed,
};

// Labels uniquement — couleurs via getStatusStyle() depuis design-tokens
export const STATUS_CONFIG = {
  PENDING:                { label: "En attente"        },
  CONFIRMED:              { label: "Confirmé"          },
  RESCHEDULED:            { label: "Reporté"           },
  IN_PROGRESS:            { label: "En cours"          },
  PATIENT_ARRIVED:        { label: "Arrivé"            },
  COMPLETED:              { label: "Terminé"           },
  CANCELLED:              { label: "Annulé"            },
  CANCELLED_BY_PATIENT:   { label: "Annulé (patient)"  },
  CANCELLED_BY_PROVIDER:  { label: "Annulé (soignant)" },
  CANCELLED_BY_SECRETARY: { label: "Annulé (secrét.)"  },
  CANCELLED_BY_SYSTEM:    { label: "Annulé (système)"  },
  NO_SHOW:                { label: "Non présenté"      },
} as const;

// Statuts du cycle de vie consultation à signaler visuellement sur la card RDV
// (F-CROSS-GAP-Consultation-SECRETARIAT — audit cross-espaces §5.2).
export const CONSULTATION_LIFECYCLE_STATUSES = [
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED_BY_PROVIDER",
] as const satisfies ReadonlyArray<keyof typeof STATUS_CONFIG>;

type ConsultationLifecycleStatus = typeof CONSULTATION_LIFECYCLE_STATUSES[number];

export function isConsultationLifecycleStatus(
  status: SecretaryAppointment["status"],
): status is ConsultationLifecycleStatus {
  return (CONSULTATION_LIFECYCLE_STATUSES as readonly string[]).includes(status);
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function minutesToY(totalMinutes: number): number {
  return ((totalMinutes - DAY_START * 60) / 60) * SLOT_HEIGHT;
}

export function apptToStyle(appt: SecretaryAppointment) {
  const start = parseISO(appt.startAt);
  const end = parseISO(appt.endAt);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const top = minutesToY(startMin);
  const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 20);
  return { top, height };
}

// ─── Modal création RDV ───────────────────────────────────────────────────────

export function CreateApptModal({
  providerId,
  defaultHour,
  date,
  onClose,
  onCreated,
  api,
}: {
  providerId: string;
  defaultHour: number;
  date: Date;
  onClose: () => void;
  onCreated: () => void;
  api: ReturnType<typeof secretaryApi>;
}) {
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [hour, setHour] = useState(defaultHour);
  const [minute, setMinute] = useState(0);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [searching, setSearching] = useState(false);
  const [consultationTypeId, setConsultationTypeId] = useState<string | null>(null);

  const { data: consultationTypes = [] } = useQuery<ConsultationTypeDTO[]>({
    queryKey: ["secretary-consultation-types", providerId],
    queryFn: () => api.consultationTypes(providerId),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (patientSearch.length < 2) { setPatientResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { setPatientResults(await api.searchPatients(patientSearch)); }
      catch { /* ignore */ }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [patientSearch, api]);

  function selectConsultationType(ct: ConsultationTypeDTO) {
    setConsultationTypeId(ct.id);
    setDuration(ct.durationMinutes);
  }

  const mutation = useMutation({
    mutationFn: () => {
      const startAt = set(date, { hours: hour, minutes: minute, seconds: 0 });
      const endAt = new Date(startAt.getTime() + duration * 60_000);
      if (!selectedPatient) throw new Error("Patient requis");
      return api.createAppointment({
        providerId,
        patientId: selectedPatient.id,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        consultationTypeId: consultationTypeId ?? undefined,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Rendez-vous créé");
      onCreated();
      onClose();
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur création RDV"),
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8ECF4]">
          <h3 className="text-sm font-semibold text-[#1A1A2E]">Nouveau rendez-vous</h3>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A2E]"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Patient */}
          <div>
            <label className="text-[11px] font-medium text-[#374151] mb-1 block">Patient</label>
            {selectedPatient ? (
              <div className="flex items-center gap-2 p-2 border border-[#E8ECF4] rounded-lg bg-[#F5F3EF]">
                <User size={13} className="text-[#5B4EC4]" />
                <span className="text-[12px] font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                <button onClick={() => setSelectedPatient(null)} className="ml-auto text-[#6B7280] hover:text-red-500">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Rechercher par nom, email…"
                  className="w-full text-sm border border-[#E8ECF4] rounded-lg px-3 py-2 outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
                />
                {patientResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8ECF4] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {patientResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPatient(p); setPatientSearch(""); setPatientResults([]); }}
                        className="w-full text-left px-3 py-2 hover:bg-[#F5F3EF] text-[11px]"
                      >
                        <p className="font-medium">{p.firstName} {p.lastName}</p>
                        <p className="text-[#6B7280]">{p.email}</p>
                      </button>
                    ))}
                  </div>
                )}
                {searching && <p className="text-[10px] text-[#6B7280] mt-1">Recherche…</p>}
              </div>
            )}
          </div>

          {/* Type de consultation */}
          {consultationTypes.length > 0 && (
            <div>
              <label className="text-[11px] font-medium text-[#374151] mb-1 block">Type de consultation</label>
              <div className="flex gap-1.5 flex-wrap">
                {consultationTypes.map((ct) => {
                  const active = consultationTypeId === ct.id;
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => selectConsultationType(ct)}
                      className={cn(
                        "text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors",
                        active
                          ? "bg-[#5B4EC4] text-white border-[#5B4EC4]"
                          : "bg-white text-[#374151] border-[#E8ECF4] hover:bg-[#F5F3EF]"
                      )}
                    >
                      {ct.name} <span className={active ? "text-white/80" : "text-[#6B7280]"}>· {ct.durationMinutes} min</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Heure */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#374151] mb-1 block">Heure</label>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full text-sm border border-[#E8ECF4] rounded-lg px-2 py-2 outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
              >
                {HOURS.slice(DAY_START, DAY_END + 1).map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, "0")}h</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#374151] mb-1 block">Minutes</label>
              <select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="w-full text-sm border border-[#E8ECF4] rounded-lg px-2 py-2 outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>:{String(m).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#374151] mb-1 block">Durée</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-sm border border-[#E8ECF4] rounded-lg px-2 py-2 outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
              >
                {[15, 20, 30, 45, 60, 90].map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
          </div>

          {/* Motif */}
          <div>
            <label className="text-[11px] font-medium text-[#374151] mb-1 block">Motif (optionnel)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Motif de consultation…"
              className="w-full text-sm border border-[#E8ECF4] rounded-lg px-3 py-2 outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
            />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-4">
          <button onClick={onClose} className="flex-1 text-[12px] py-2 rounded-lg border border-[#E8ECF4] text-[#374151] hover:bg-[#F5F3EF]">
            Annuler
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !selectedPatient}
            className="flex-1 text-[12px] py-2 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3EB0] disabled:opacity-60"
          >
            {mutation.isPending ? "Création…" : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal détail RDV ─────────────────────────────────────────────────────────

const FIELD_CLASS =
  "w-full text-[12px] border border-[#E8ECF4] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 transition-colors";

export function ApptDetailModal({
  appt,
  onClose,
  onRefresh,
  api,
}: {
  appt: SecretaryAppointment;
  onClose: () => void;
  onRefresh: () => void;
  api: ReturnType<typeof secretaryApi>;
}) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);

  const statusCfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.PENDING;
  const statusSty = getStatusStyle(appt.status);
  const startParsed = parseISO(appt.startAt);
  const endParsed = parseISO(appt.endAt);
  const originalDurationMin = Math.round((endParsed.getTime() - startParsed.getTime()) / 60_000);

  // Edit state — initialised from current appointment data
  const [editDate, setEditDate] = useState(format(startParsed, "yyyy-MM-dd"));
  const [editHour, setEditHour] = useState(startParsed.getHours());
  const [editMinute, setEditMinute] = useState(startParsed.getMinutes());
  const [editDuration, setEditDuration] = useState(originalDurationMin);
  const [editPhone, setEditPhone] = useState(appt.patient?.phone ?? "");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPostal, setEditPostal] = useState("");
  const [editCity, setEditCity] = useState("");

  // Fetch full patient data (email, address) when edit mode opens
  const patientQuery = useQuery({
    queryKey: ["secretary-patient", appt.patient?.id],
    queryFn: () => api.getPatient(appt.patient!.id),
    enabled: editMode && !!appt.patient?.id,
    staleTime: 60_000,
  });

  useEffect(() => {
    const p = patientQuery.data?.patient as PatientAdmin | undefined;
    if (!p) return;
    setEditEmail(p.email ?? "");
    setEditPhone(p.phone ?? "");
    setEditAddress(p.addressLine1 ?? "");
    setEditPostal(p.postalCode ?? "");
    setEditCity(p.city ?? "");
  }, [patientQuery.data]);

  const updateApptMut = useMutation({
    mutationFn: ({ startAt, endAt }: { startAt: string; endAt: string }) =>
      api.updateAppointment(appt.id, { startAt, endAt }),
    onError: () => toast.error("Erreur modification RDV"),
  });

  const updatePatientMut = useMutation({
    mutationFn: (input: UpdatePatientInput) => api.updatePatient(appt.patient!.id, input),
    onError: () => toast.error("Erreur modification patient"),
  });

  const isPending = updateApptMut.isPending || updatePatientMut.isPending;

  async function handleSave() {
    const tasks: Array<Promise<unknown>> = [];

    // Appointment time
    const [y, mo, d] = editDate.split("-").map(Number);
    const newStart = new Date(y, mo - 1, d, editHour, editMinute, 0, 0);
    const newEnd = new Date(newStart.getTime() + editDuration * 60_000);
    if (
      newStart.toISOString() !== startParsed.toISOString() ||
      newEnd.toISOString() !== endParsed.toISOString()
    ) {
      tasks.push(updateApptMut.mutateAsync({ startAt: newStart.toISOString(), endAt: newEnd.toISOString() }));
    }

    // Patient info — only fields that actually changed
    if (appt.patient) {
      const p = patientQuery.data?.patient as PatientAdmin | undefined;
      const patch: UpdatePatientInput = {};
      if (editPhone !== (p?.phone ?? appt.patient.phone ?? "")) patch.phone = editPhone || undefined;
      if (editEmail && editEmail !== (p?.email ?? "")) patch.email = editEmail;
      if (editAddress !== (p?.addressLine1 ?? "")) patch.addressLine1 = editAddress || undefined;
      if (editPostal !== (p?.postalCode ?? "")) patch.postalCode = editPostal || undefined;
      if (editCity !== (p?.city ?? "")) patch.city = editCity || undefined;
      if (Object.keys(patch).length > 0) tasks.push(updatePatientMut.mutateAsync(patch));
    }

    if (tasks.length === 0) { setEditMode(false); return; }

    try {
      await Promise.all(tasks);
      toast.success("Modifications enregistrées");
      queryClient.invalidateQueries({ queryKey: ["secretary-agendas"] });
      queryClient.invalidateQueries({ queryKey: ["secretary-patient", appt.patient?.id] });
      onRefresh();
      onClose();
    } catch {
      // errors shown by individual onError handlers
    }
  }

  const cancelMut = useMutation({
    mutationFn: () => api.cancelAppointment(appt.id),
    onSuccess: () => { toast.success("RDV annulé"); onRefresh(); onClose(); },
    onError: () => toast.error("Erreur"),
  });

  const arrivedMut = useMutation({
    mutationFn: () => api.markArrived(appt.id),
    onSuccess: () => { toast.success("Patient marqué arrivé"); onRefresh(); onClose(); },
    onError: () => toast.error("Erreur"),
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8ECF4]">
          <div>
            <p className="text-[11px] font-semibold text-[#1A1A2E]">
              {format(startParsed, "HH:mm")} – {format(endParsed, "HH:mm")}
            </p>
            <span
              className="text-[9px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: statusSty.bg, color: statusSty.color }}
            >
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {!editMode && !isCancelledLike(appt.status) && appt.status !== "COMPLETED" && (
              <button
                onClick={() => setEditMode(true)}
                className="p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#6B7280] transition-colors"
                aria-label="Modifier le rendez-vous"
              >
                <Pencil size={13} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#6B7280] transition-colors"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        {editMode ? (
          <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Section RDV */}
            <div>
              <p className="text-[9px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2.5">
                Rendez-vous
              </p>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-medium text-[#374151] block mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-[#374151] block mb-1">Heure</label>
                    <select
                      value={editHour}
                      onChange={(e) => setEditHour(Number(e.target.value))}
                      className={FIELD_CLASS}
                    >
                      {Array.from({ length: 14 }, (_, i) => i + 7).map((h) => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}h</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#374151] block mb-1">Min.</label>
                    <select
                      value={editMinute}
                      onChange={(e) => setEditMinute(Number(e.target.value))}
                      className={FIELD_CLASS}
                    >
                      {[0, 15, 30, 45].map((m) => (
                        <option key={m} value={m}>:{String(m).padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#374151] block mb-1">Durée</label>
                    <select
                      value={editDuration}
                      onChange={(e) => setEditDuration(Number(e.target.value))}
                      className={FIELD_CLASS}
                    >
                      {[15, 20, 30, 45, 60, 90].map((d) => (
                        <option key={d} value={d}>{d} min</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {appt.patient && <div className="border-t border-[#E8ECF4]" />}

            {/* Section Patient */}
            {appt.patient && (
              <div>
                <p className="text-[9px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2.5">
                  {appt.patient.firstName} {appt.patient.lastName}
                </p>
                {patientQuery.isLoading ? (
                  <p className="text-[11px] text-[#6B7280] italic py-1">Chargement…</p>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-[#374151] block mb-1">Téléphone</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+33 6…"
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-[#374151] block mb-1">Email</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="email@…"
                          className={FIELD_CLASS}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-[#374151] block mb-1">Adresse</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="1 rue de la Paix"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-[#374151] block mb-1">Code postal</label>
                        <input
                          type="text"
                          value={editPostal}
                          onChange={(e) => setEditPostal(e.target.value)}
                          placeholder="75001"
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-[#374151] block mb-1">Ville</label>
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          placeholder="Paris"
                          className={FIELD_CLASS}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            {appt.patient && (
              <div className="flex items-start gap-2">
                <User size={14} className="text-[#5B4EC4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-[#1A1A2E]">
                    {appt.patient.firstName} {appt.patient.lastName}
                  </p>
                  {appt.patient.phone && (
                    <a href={`tel:${appt.patient.phone}`} className="flex items-center gap-1 text-[11px] text-[#5B4EC4] mt-0.5">
                      <Phone size={11} /> {appt.patient.phone}
                    </a>
                  )}
                </div>
              </div>
            )}
            {appt.consultationType && (
              <div className="flex items-center gap-2 text-[11px] text-[#374151]">
                <Clock size={13} className="text-[#6B7280]" />
                {appt.consultationType.name} — {appt.consultationType.durationMinutes} min
              </div>
            )}
            {appt.notes && (
              <p className="text-[11px] text-[#374151] italic bg-[#F5F3EF] rounded-lg px-3 py-2">
                {appt.notes}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-4 pt-1">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 text-[11px] py-2 rounded-lg border border-[#E8ECF4] text-[#374151] hover:bg-[#F5F3EF] active:scale-[0.97] transition-transform"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 text-[11px] py-2 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3EB0] disabled:opacity-60 active:scale-[0.97] transition-transform"
              >
                {isPending ? "Enregistrement…" : "Enregistrer"}
              </button>
            </>
          ) : (
            <>
              {isActiveStatus(appt.status) && appt.status !== "PATIENT_ARRIVED" && (
                <button
                  onClick={() => arrivedMut.mutate()}
                  disabled={arrivedMut.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 active:scale-[0.97] transition-transform"
                >
                  <CheckCircle2 size={13} />
                  Patient arrivé
                </button>
              )}
              {!isCancelledLike(appt.status) && appt.status !== "COMPLETED" && (
                <button
                  onClick={() => cancelMut.mutate()}
                  disabled={cancelMut.isPending}
                  className="flex-1 text-[11px] py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 active:scale-[0.97] transition-transform"
                >
                  Annuler le RDV
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Colonne agenda d'un soignant ─────────────────────────────────────────────

type DragState = {
  apptId: string;
  durationMin: number;
  ghostTop: number;
  startClientY: number;
  moved: boolean;
};

function AgendaColumn({
  agenda,
  date,
  api,
  onRefresh,
  onProviderClick,
}: {
  agenda: SecretaryAgenda;
  date: Date;
  api: ReturnType<typeof secretaryApi>;
  onRefresh: () => void;
  onProviderClick: (provider: ProviderContactInfo) => void;
}) {
  const [createSlot, setCreateSlot] = useState<number | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<SecretaryAppointment | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const queryClient = useQueryClient();
  const gridRef = useRef<HTMLDivElement>(null);

  // Stable refs to avoid stale closures in useEffect
  const dragRef = useRef<DragState | null>(null);
  const appointmentsRef = useRef(agenda.appointments);
  const rescheduleRef = useRef<((apptId: string, ghostTop: number, durationMin: number) => void) | null>(null);

  // Keep refs in sync on every render
  dragRef.current = drag;
  appointmentsRef.current = agenda.appointments;

  const rescheduleMut = useMutation({
    mutationFn: ({ id, startAt, endAt }: { id: string; startAt: string; endAt: string }) =>
      api.updateAppointment(id, { startAt, endAt }),
    onMutate: async ({ id, startAt, endAt }) => {
      const key = ["secretary-agendas", format(date, "yyyy-MM-dd")];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          agendas: old.agendas.map((ag: SecretaryAgenda) => ({
            ...ag,
            appointments: ag.appointments.map((a: SecretaryAppointment) =>
              a.id === id ? { ...a, startAt, endAt } : a
            ),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["secretary-agendas", format(date, "yyyy-MM-dd")], ctx.previous);
      }
      toast.error("Erreur lors du déplacement du RDV");
    },
    onSuccess: () => {
      toast.success("RDV déplacé");
      queryClient.invalidateQueries({ queryKey: ["secretary-agendas"] });
    },
  });

  // Expose reschedule logic via ref so the effect handler can call it without stale closures
  rescheduleRef.current = (apptId: string, ghostTop: number, durationMin: number) => {
    const snappedMin = Math.round(((ghostTop / SLOT_HEIGHT) * 60 + DAY_START * 60) / 15) * 15;
    const newHour = Math.floor(snappedMin / 60);
    const newMinute = snappedMin % 60;
    const newStart = set(date, { hours: newHour, minutes: newMinute, seconds: 0, milliseconds: 0 });
    const newEnd = new Date(newStart.getTime() + durationMin * 60_000);
    rescheduleMut.mutate({
      id: apptId,
      startAt: newStart.toISOString(),
      endAt: newEnd.toISOString(),
    });
  };

  const totalRows = DAY_END - DAY_START;

  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    if (drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.floor(y / SLOT_HEIGHT) + DAY_START;
    if (hour >= DAY_START && hour < DAY_END) setCreateSlot(hour);
  }

  function handleApptMouseDown(e: React.MouseEvent, appt: SecretaryAppointment) {
    if (rescheduleMut.isPending) return;
    e.stopPropagation();
    e.preventDefault();
    const { top, height } = apptToStyle(appt);
    const startMin = parseISO(appt.startAt).getHours() * 60 + parseISO(appt.startAt).getMinutes();
    const endMin = parseISO(appt.endAt).getHours() * 60 + parseISO(appt.endAt).getMinutes();
    const durationMin = endMin - startMin;
    const newDrag: DragState = {
      apptId: appt.id,
      durationMin,
      ghostTop: top,
      startClientY: e.clientY,
      moved: false,
    };
    setDrag(newDrag);
  }

  // Add/remove window listeners only when drag starts/stops (dep: [!!drag])
  useEffect(() => {
    if (!drag) return;

    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    function onMouseMove(e: MouseEvent) {
      const current = dragRef.current;
      if (!current) return;
      const gridEl = gridRef.current;
      if (!gridEl) return;

      const rect = gridEl.getBoundingClientRect();
      const rawY = e.clientY - rect.top;

      // Snap to 15-minute increments
      const rawMin = (rawY / SLOT_HEIGHT) * 60 + DAY_START * 60;
      const snappedMin = Math.round(rawMin / 15) * 15;
      const clampedMin = Math.max(DAY_START * 60, Math.min((DAY_END * 60) - current.durationMin, snappedMin));
      const newGhostTop = ((clampedMin - DAY_START * 60) / 60) * SLOT_HEIGHT;

      const moved = Math.abs(e.clientY - current.startClientY) > 5;

      const updated: DragState = { ...current, ghostTop: newGhostTop, moved };
      dragRef.current = updated;
      setDrag(updated);
    }

    function onMouseUp() {
      const current = dragRef.current;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (!current) {
        setDrag(null);
        return;
      }

      if (!current.moved) {
        // Treat as click — open detail modal
        const appt = appointmentsRef.current.find((a) => a.id === current.apptId);
        if (appt) setSelectedAppt(appt);
      } else {
        // Reschedule
        rescheduleRef.current?.(current.apptId, current.ghostTop, current.durationMin);
      }

      setDrag(null);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag]);

  return (
    <>
      <div className="flex-1 min-w-[180px] border-r border-[#E8ECF4] last:border-r-0 relative">
        {/* Header soignant */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8ECF4] px-3 py-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const extras = agenda as SecretaryAgenda & ProviderContactExtras;
              onProviderClick({
                providerName: agenda.providerName,
                specialties: agenda.specialties,
                providerPhone: extras.providerPhone ?? null,
                providerEmail: extras.providerEmail ?? null,
                providerPhotoUrl: extras.providerPhotoUrl ?? null,
              });
            }}
            className="block w-full text-left rounded hover:bg-[#F5F3EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 -mx-1 px-1 transition-colors"
            aria-label={`Infos ${agenda.providerName}`}
          >
            <p className="text-[11px] font-semibold text-[#1A1A2E] truncate">{agenda.providerName}</p>
            <p className="text-[9px] text-[#6B7280] truncate">{agenda.specialties[0] ?? ""}</p>
          </button>
        </div>

        {/* Grille horaire */}
        <div
          ref={gridRef}
          className="relative cursor-pointer"
          style={{ height: totalRows * SLOT_HEIGHT }}
          onClick={handleColumnClick}
        >
          {/* Lignes heures */}
          {Array.from({ length: totalRows }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-[#E8ECF4]"
              style={{ top: i * SLOT_HEIGHT }}
            />
          ))}

          {/* RDV */}
          {agenda.appointments.map((appt) => {
            const { top, height } = apptToStyle(appt);
            const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.PENDING;
            const sStyle = getStatusStyle(appt.status);
            const start = parseISO(appt.startAt);
            const isDragging = drag?.apptId === appt.id;

            return (
              <div
                key={appt.id}
                onMouseDown={(e) => handleApptMouseDown(e, appt)}
                className={cn(
                  "absolute left-1 right-1 rounded-md border px-1.5 py-1 transition-shadow",
                  isDragging ? "cursor-grabbing" : "cursor-grab hover:shadow-md",
                )}
                style={{
                  top: top + 1,
                  height: height - 2,
                  backgroundColor: sStyle.bg,
                  borderColor: appt.status === "IN_PROGRESS" ? DT.statusConfirmed : sStyle.border,
                  opacity: isDragging ? 0.3 : 1,
                }}
              >
                <p className="text-[10px] font-semibold truncate" style={{ color: sStyle.color }}>
                  {format(start, "HH:mm")} {appt.patient ? `· ${appt.patient.firstName} ${appt.patient.lastName}` : ""}
                </p>
                {isConsultationLifecycleStatus(appt.status) && (
                  <span
                    data-testid="consultation-lifecycle-pill"
                    className="inline-block mt-0.5 text-[8px] font-semibold uppercase tracking-wider px-1 py-px rounded border"
                    style={{
                      backgroundColor: sStyle.bg,
                      color: sStyle.color,
                      borderColor: sStyle.border,
                    }}
                  >
                    {cfg.label}
                  </span>
                )}
                {appt.consultationType && height > 30 && (
                  <p className="text-[9px] text-[#6B7280] truncate">{appt.consultationType.name}</p>
                )}
              </div>
            );
          })}

          {/* Ghost card during drag */}
          {drag?.moved && (() => {
            const appt = agenda.appointments.find(a => a.id === drag.apptId);
            if (!appt) return null;
            const sStyle = getStatusStyle(appt.status);
            const { height } = apptToStyle(appt);
            const ghostMin = Math.round(((drag.ghostTop / SLOT_HEIGHT) * 60 + DAY_START * 60) / 15) * 15;
            return (
              <div
                className="absolute left-1 right-1 rounded-md border px-1.5 py-1 pointer-events-none z-20"
                style={{
                  top: drag.ghostTop + 1,
                  height: height - 2,
                  backgroundColor: sStyle.bg,
                  borderColor: DT.statusConfirmed,
                  boxShadow: DT.shadowAccent,
                  opacity: 0.95,
                  transform: "scale(1.01)",
                }}
              >
                <p className="text-[10px] font-semibold truncate" style={{ color: DT.statusConfirmed }}>
                  {`${String(Math.floor(ghostMin / 60)).padStart(2, "0")}:${String(ghostMin % 60).padStart(2, "0")}`}
                  {appt.patient ? ` · ${appt.patient.firstName} ${appt.patient.lastName}` : ""}
                </p>
              </div>
            );
          })()}

          {/* Bouton + sur créneau libre */}
          {!drag && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: totalRows * 2 }, (_, i) => {
                const hour = Math.floor(i / 2) + DAY_START;
                const mins = (i % 2) * 30;
                const top = (i * SLOT_HEIGHT) / 2;
                const hasAppt = agenda.appointments.some((a) => {
                  const s = parseISO(a.startAt);
                  return s.getHours() === hour && Math.abs(s.getMinutes() - mins) < 20;
                });
                if (hasAppt) return null;
                return (
                  <div
                    key={i}
                    className="absolute left-0 right-0 flex items-center pointer-events-auto opacity-0 hover:opacity-100 transition-opacity"
                    style={{ top, height: SLOT_HEIGHT / 2 }}
                    onClick={(e) => { e.stopPropagation(); setCreateSlot(hour); }}
                  >
                    <div className="mx-1 flex items-center gap-1 text-[9px] text-[#5B4EC4] font-medium">
                      <Plus size={10} />
                      <span>{String(hour).padStart(2, "0")}:{String(mins).padStart(2, "0")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {createSlot !== null && (
        <CreateApptModal
          providerId={agenda.providerId}
          defaultHour={createSlot}
          date={date}
          onClose={() => setCreateSlot(null)}
          onCreated={onRefresh}
          api={api}
        />
      )}

      {selectedAppt && (
        <ApptDetailModal
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onRefresh={onRefresh}
          api={api}
        />
      )}
    </>
  );
}

// ─── Vue Jour ─────────────────────────────────────────────────────────────────

interface DayAgendaViewProps {
  date: Date;
  api: ReturnType<typeof secretaryApi>;
  accessToken: string | null;
  userId: string | null;
  onRefresh: () => void;
}

export function DayAgendaView({ date, api, accessToken, userId, onRefresh }: DayAgendaViewProps) {
  const agendasQuery = useQuery({
    queryKey: ["secretary-agendas", format(date, "yyyy-MM-dd")],
    queryFn: () => api.getAgendas(format(date, "yyyy-MM-dd")),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });

  const waitingQuery = useQuery({
    queryKey: ["secretary-waiting"],
    queryFn: () => api.getWaitingRoom(),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });

  const agendas = agendasQuery.data?.agendas ?? [];
  const waiting = waitingQuery.data ?? [];

  // INIT-628 — modal info soignant partagé (header colonne + card salle d'attente)
  const [selectedProvider, setSelectedProvider] = useState<ProviderContactInfo | null>(null);

  const totalRows = DAY_END - DAY_START;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Axe horaire */}
      <div className="w-12 shrink-0 bg-white border-r border-[#E8ECF4] overflow-hidden">
        <div className="h-[52px]" />
        <div className="relative" style={{ height: totalRows * SLOT_HEIGHT }}>
          {Array.from({ length: totalRows }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 flex items-start justify-end pr-1"
              style={{ top: i * SLOT_HEIGHT - 7 }}
            >
              <span className="text-[9px] text-[#6B7280]">{String(i + DAY_START).padStart(2, "0")}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Colonnes soignants */}
      <div className="flex-1 flex overflow-y-auto overflow-x-auto">
        {agendasQuery.isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[12px] text-[#6B7280]">
            Chargement des agendas…
          </div>
        ) : agendas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[12px] text-[#6B7280]">
            Aucun soignant affecté
          </div>
        ) : (
          agendas.map((agenda) => (
            <AgendaColumn
              key={agenda.providerId}
              agenda={agenda}
              date={date}
              api={api}
              onRefresh={onRefresh}
              onProviderClick={setSelectedProvider}
            />
          ))
        )}
      </div>

      {/* Sidebar organisationnelle droite — salle d'attente + docs signés */}
      <div className="w-64 shrink-0 border-l border-[#E8ECF4] bg-white overflow-y-auto">
        {waiting.length > 0 && (
          <>
            <div className="px-3 py-2 border-b border-[#E8ECF4]">
              <p className="text-[10px] font-semibold text-[#1A1A2E] uppercase tracking-wider flex items-center gap-1.5">
                <Armchair size={11} className="text-blue-600" />
                Salle d'attente
              </p>
            </div>
            <div className="p-2 space-y-2">
              {waiting.map((entry) => {
                const extras = entry as typeof entry & ProviderContactExtras;
                return (
                  <div
                    key={entry.appointmentId}
                    className="rounded-lg p-2"
                    style={{ background: DT.statusArrivedBg, border: `1px solid ${DT.statusArrivedBorder}` }}
                  >
                    <p className="text-[11px] font-semibold truncate" style={{ color: DT.ink }}>{entry.patientName}</p>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProvider({
                          providerName: entry.providerName,
                          providerPhone: extras.providerPhone ?? null,
                          providerEmail: extras.providerEmail ?? null,
                          providerPhotoUrl: extras.providerPhotoUrl ?? null,
                        })
                      }
                      className="block w-full text-left text-[9px] truncate rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 -mx-0.5 px-0.5 transition-colors"
                      style={{ color: DT.ink3 }}
                      aria-label={`Infos ${entry.providerName}`}
                    >
                      {entry.providerName}
                    </button>
                    <p className="text-[9px] mt-0.5 font-medium" style={{ color: DT.statusArrived }}>
                      {entry.waitingMinutes > 0 ? `${entry.waitingMinutes} min` : "À l'instant"}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* F-CROSS-GAP-Document-SIGNED-SECRETARIAT (V1 shell) */}
        <div className="p-2">
          <SecretariatSignedDocsSection
            accessToken={accessToken}
            userId={userId}
          />
        </div>
      </div>

      {/* INIT-628 — Modal info soignant (clic sur providerName) */}
      {selectedProvider && (
        <ProviderInfoModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}

// Export du badge salle d'attente pour le header (header reste dans page.tsx)
export function useWaitingBadge(accessToken: string | null, api: ReturnType<typeof secretaryApi>) {
  const waitingQuery = useQuery({
    queryKey: ["secretary-waiting"],
    queryFn: () => api.getWaitingRoom(),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });
  return waitingQuery.data ?? [];
}
