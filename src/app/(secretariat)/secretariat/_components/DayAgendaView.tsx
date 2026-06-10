"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { secretaryApi, type SecretaryAppointment, type SecretaryAgenda, type ConsultationTypeDTO } from "@/lib/api";
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

function apptToStyle(appt: SecretaryAppointment) {
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
  const statusCfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.PENDING;
  const statusSty = getStatusStyle(appt.status);
  const start = parseISO(appt.startAt);
  const end = parseISO(appt.endAt);

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8ECF4]">
          <div>
            <p className="text-[11px] font-semibold text-[#1A1A2E]">
              {format(start, "HH:mm")} – {format(end, "HH:mm")}
            </p>
            <span
              className="text-[9px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: statusSty.bg, color: statusSty.color }}
            >
              {statusCfg.label}
            </span>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A2E]"><X size={16} /></button>
        </div>
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
        <div className="flex gap-2 px-5 pb-4">
          {isActiveStatus(appt.status) && appt.status !== "PATIENT_ARRIVED" && (
            <button
              onClick={() => arrivedMut.mutate()}
              disabled={arrivedMut.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <CheckCircle2 size={13} />
              Patient arrivé
            </button>
          )}
          {!isCancelledLike(appt.status) && appt.status !== "COMPLETED" && (
            <button
              onClick={() => cancelMut.mutate()}
              disabled={cancelMut.isPending}
              className="flex-1 text-[11px] py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Colonne agenda d'un soignant ─────────────────────────────────────────────

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

  const totalRows = DAY_END - DAY_START;

  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.floor(y / SLOT_HEIGHT) + DAY_START;
    if (hour >= DAY_START && hour < DAY_END) setCreateSlot(hour);
  }

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

            return (
              <div
                key={appt.id}
                onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}
                className="absolute left-1 right-1 rounded-md border px-1.5 py-1 cursor-pointer hover:shadow-md transition-shadow"
                style={{
                  top: top + 1,
                  height: height - 2,
                  backgroundColor: sStyle.bg,
                  borderColor: appt.status === "IN_PROGRESS" ? DT.statusConfirmed : sStyle.border,
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

          {/* Bouton + sur créneau libre */}
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
