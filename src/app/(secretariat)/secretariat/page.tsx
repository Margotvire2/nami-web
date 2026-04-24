"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { secretaryApi, type SecretaryAppointment, type SecretaryAgenda } from "@/lib/api";
import { format, addDays, subDays, parseISO, isToday, set } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Phone,
  X,
  CheckCircle2,
  RefreshCw,
  Armchair,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constantes ───────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23
const SLOT_HEIGHT = 60; // px par heure
const DAY_START = 7;   // 7h
const DAY_END = 20;    // 20h

const STATUS_CONFIG = {
  PENDING:         { label: "En attente",    bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
  CONFIRMED:       { label: "Confirmé",      bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  PATIENT_ARRIVED: { label: "Arrivé",        bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"    },
  COMPLETED:       { label: "Terminé",       bg: "bg-gray-50",    border: "border-gray-200",    text: "text-gray-500"    },
  CANCELLED:       { label: "Annulé",        bg: "bg-red-50",     border: "border-red-200",     text: "text-red-500"     },
  NO_SHOW:         { label: "Non présenté",  bg: "bg-red-50",     border: "border-red-200",     text: "text-red-500"     },
} as const;

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

function CreateApptModal({
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
                  className="w-full text-[12px] border border-[#E8ECF4] rounded-lg px-3 py-2 outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]/20"
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

          {/* Heure */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#374151] mb-1 block">Heure</label>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full text-[12px] border border-[#E8ECF4] rounded-lg px-2 py-2 outline-none focus:border-[#5B4EC4]"
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
                className="w-full text-[12px] border border-[#E8ECF4] rounded-lg px-2 py-2 outline-none focus:border-[#5B4EC4]"
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
                className="w-full text-[12px] border border-[#E8ECF4] rounded-lg px-2 py-2 outline-none focus:border-[#5B4EC4]"
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
              className="w-full text-[12px] border border-[#E8ECF4] rounded-lg px-3 py-2 outline-none focus:border-[#5B4EC4]"
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

function ApptDetailModal({
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
            <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded", statusCfg.bg, statusCfg.text)}>
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
          {appt.status !== "PATIENT_ARRIVED" && appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
            <button
              onClick={() => arrivedMut.mutate()}
              disabled={arrivedMut.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <CheckCircle2 size={13} />
              Patient arrivé
            </button>
          )}
          {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
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
}: {
  agenda: SecretaryAgenda;
  date: Date;
  api: ReturnType<typeof secretaryApi>;
  onRefresh: () => void;
}) {
  const [createSlot, setCreateSlot] = useState<number | null>(null); // hour clicked
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
          <p className="text-[11px] font-semibold text-[#1A1A2E] truncate">{agenda.providerName}</p>
          <p className="text-[9px] text-[#6B7280] truncate">{agenda.specialties[0] ?? ""}</p>
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
            const start = parseISO(appt.startAt);

            return (
              <div
                key={appt.id}
                onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}
                className={cn(
                  "absolute left-1 right-1 rounded-md border px-1.5 py-1 cursor-pointer hover:shadow-md transition-shadow",
                  cfg.bg, cfg.border
                )}
                style={{ top: top + 1, height: height - 2 }}
              >
                <p className={cn("text-[10px] font-semibold truncate", cfg.text)}>
                  {format(start, "HH:mm")} {appt.patient ? `· ${appt.patient.firstName} ${appt.patient.lastName}` : ""}
                </p>
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

// ─── Page principale ──────────────────────────────────────────────────────────

export default function SecretariatPage() {
  const { accessToken } = useAuthStore();
  const [date, setDate] = useState(new Date());
  const qc = useQueryClient();

  const api = secretaryApi(accessToken ?? "");

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

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["secretary-agendas"] });
    qc.invalidateQueries({ queryKey: ["secretary-waiting"] });
  }, [qc]);

  const agendas = agendasQuery.data?.agendas ?? [];
  const waiting = waitingQuery.data ?? [];

  const totalRows = DAY_END - DAY_START;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#E8ECF4] px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDate((d) => subDays(d, 1))}
            className="p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#374151]"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <p className="text-[13px] font-semibold text-[#1A1A2E] capitalize">
              {format(date, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            {isToday(date) && (
              <span className="text-[9px] font-medium text-[#5B4EC4] bg-[#EEEDFB] px-1.5 py-0.5 rounded">
                Aujourd'hui
              </span>
            )}
          </div>
          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            className="p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#374151]"
          >
            <ChevronRight size={16} />
          </button>
          {!isToday(date) && (
            <button
              onClick={() => setDate(new Date())}
              className="text-[11px] text-[#5B4EC4] hover:underline ml-1"
            >
              Aujourd'hui
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Salle d'attente badge */}
          {waiting.length > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
              <Armchair size={13} className="text-blue-600" />
              <span className="text-[11px] font-medium text-blue-700">
                {waiting.length} en salle d'attente
              </span>
            </div>
          )}
          <button
            onClick={refresh}
            disabled={agendasQuery.isFetching}
            className="p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#6B7280] disabled:opacity-50"
          >
            <RefreshCw size={14} className={agendasQuery.isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Corps */}
      <div className="flex flex-1 overflow-hidden">
        {/* Axe horaire */}
        <div className="w-12 shrink-0 bg-white border-r border-[#E8ECF4] overflow-hidden">
          <div className="h-[52px]" /> {/* offset header colonne */}
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
                onRefresh={refresh}
              />
            ))
          )}
        </div>

        {/* Salle d'attente sidebar */}
        {waiting.length > 0 && (
          <div className="w-52 shrink-0 border-l border-[#E8ECF4] bg-white overflow-y-auto">
            <div className="px-3 py-2 border-b border-[#E8ECF4]">
              <p className="text-[10px] font-semibold text-[#1A1A2E] uppercase tracking-wider flex items-center gap-1.5">
                <Armchair size={11} className="text-blue-600" />
                Salle d'attente
              </p>
            </div>
            <div className="p-2 space-y-2">
              {waiting.map((entry) => (
                <div key={entry.appointmentId} className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-[11px] font-semibold text-[#1A1A2E] truncate">{entry.patientName}</p>
                  <p className="text-[9px] text-[#6B7280] truncate">{entry.providerName}</p>
                  <p className="text-[9px] text-blue-600 mt-0.5">
                    {entry.waitingMinutes > 0 ? `Attend depuis ${entry.waitingMinutes} min` : "Vient d'arriver"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
