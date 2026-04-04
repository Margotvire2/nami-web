"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Clock, MapPin, Monitor, Building2,
  Plus, X, CalendarDays, Ban, Check, XCircle,
} from "lucide-react";
import type { Appointment, Block, Location, ConsultationType } from "@/components/nami/agenda/types";
import {
  LOCATIONS, CONSULTATION_TYPES, APPOINTMENTS as INIT_APTS,
  BLOCKS as INIT_BLOCKS, OPEN_HOURS,
} from "@/components/nami/agenda/mock-data";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const STATUS_LABEL: Record<string, string> = { CONFIRMED: "Confirmé", PENDING: "En attente", CANCELLED: "Annulé", NO_SHOW: "Absent", DONE: "Terminé" };
const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "bg-[#DCFCE7] text-[#16A34A]",
  PENDING: "bg-[#FEF9C3] text-[#CA8A04]",
  CANCELLED: "bg-[#FEE2E2] text-[#DC2626]",
  NO_SHOW: "bg-[#FEE2E2] text-[#DC2626]",
  DONE: "bg-[#EEF1FF] text-[#4F6AF5]",
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - ((day + 6) % 7));
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

// ═════════════════════════════════════════════════════════════════════════════

export default function AgendaPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>(INIT_APTS);
  const [blocks] = useState<Block[]>(INIT_BLOCKS);
  const [activeLocations, setActiveLocations] = useState<Set<string>>(new Set(LOCATIONS.map((l) => l.id)));
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [createSlot, setCreateSlot] = useState<{ day: number; hour: number } | null>(null);

  const monday = useMemo(() => {
    const m = getMonday(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const weekDates = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    }),
  [monday]);

  const hours = Array.from({ length: OPEN_HOURS.end - OPEN_HOURS.start }, (_, i) => OPEN_HOURS.start + i);
  const now = new Date();

  const filteredApts = appointments.filter((a) => activeLocations.has(a.location.id));
  const todayApts = filteredApts.filter((a) => isSameDay(new Date(a.startTime), now) && a.status !== "CANCELLED");
  const todayMinutes = todayApts.reduce((sum, a) => sum + a.consultationType.duration, 0);

  function toggleLocation(id: string) {
    setActiveLocations((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleCreateApt(patient: string, typeId: string, locationId: string) {
    if (!createSlot) return;
    const ct = CONSULTATION_TYPES.find((t) => t.id === typeId)!;
    const loc = LOCATIONS.find((l) => l.id === locationId)!;
    const start = new Date(weekDates[createSlot.day]);
    start.setHours(createSlot.hour, 0, 0, 0);
    const end = new Date(start.getTime() + ct.duration * 60000);
    const [first, last] = patient.split(" ");
    const apt: Appointment = {
      id: `apt-${Date.now()}`,
      patient: { firstName: first || "Patient", lastName: last || "" },
      consultationType: ct, location: loc,
      startTime: start.toISOString(), endTime: end.toISOString(),
      status: "CONFIRMED",
    };
    setAppointments((prev) => [...prev, apt]);
    setCreateSlot(null);
    toast.success(`RDV créé pour ${patient}`);
  }

  function updateStatus(aptId: string, status: Appointment["status"]) {
    setAppointments((prev) => prev.map((a) => a.id === aptId ? { ...a, status } : a));
    setSelectedApt((prev) => prev?.id === aptId ? { ...prev, status } : prev);
    toast.success(`Statut : ${STATUS_LABEL[status]}`);
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Sidebar ── */}
      <div className="w-[280px] shrink-0 bg-white flex flex-col overflow-y-auto">
        <div className="p-5">
          <MiniCalendar currentMonday={monday} onSelectWeek={(d) => {
            const diff = Math.round((getMonday(d).getTime() - getMonday(new Date()).getTime()) / (7 * 86400000));
            setWeekOffset(diff);
          }} />
        </div>

        <div className="px-5 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-3">Mes lieux</p>
          <div className="space-y-2">
            {LOCATIONS.map((loc) => (
              <label key={loc.id} className="flex items-center gap-2.5 cursor-pointer">
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${activeLocations.has(loc.id) ? "" : "opacity-30"}`} style={{ backgroundColor: loc.color }} onClick={() => toggleLocation(loc.id)}>
                  {activeLocations.has(loc.id) && <Check size={10} className="text-white" />}
                </div>
                <span className={`text-sm ${activeLocations.has(loc.id) ? "text-[#1E293B]" : "text-[#94A3B8]"}`}>{loc.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="bg-[#F0F2F8] rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Aujourd'hui</p>
            <p className="text-sm text-[#1E293B]"><span className="font-bold">{todayApts.length}</span> RDV · <span className="font-bold">{Math.floor(todayMinutes / 60)}h{todayMinutes % 60 > 0 ? (todayMinutes % 60).toString().padStart(2, "0") : ""}</span></p>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-2 mt-auto">
          <button onClick={() => setCreateSlot({ day: (now.getDay() + 6) % 7, hour: Math.max(OPEN_HOURS.start, now.getHours() + 1) })} className="w-full h-10 rounded-xl bg-[#4F6AF5] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#3B55E0] transition-colors">
            <Plus size={16} /> Nouveau RDV
          </button>
          <button onClick={() => toast.info("Blocage de créneau bientôt disponible")} className="w-full h-10 rounded-xl bg-[#EEF1FF] text-[#4F6AF5] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#E0E5FF] transition-colors">
            <Ban size={16} /> Bloquer un créneau
          </button>
        </div>
      </div>

      {/* ── Grille ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setWeekOffset((p) => p - 1)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] transition-colors"><ChevronLeft size={16} /></button>
            <button onClick={() => setWeekOffset(0)} className="text-sm font-medium text-[#4F6AF5] hover:underline px-3 py-1 rounded-lg hover:bg-[#EEF1FF] transition-colors">Aujourd'hui</button>
            <button onClick={() => setWeekOffset((p) => p + 1)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] transition-colors"><ChevronRight size={16} /></button>
          </div>
          <h2 className="text-page-title">{monday.getDate()} {MONTHS_FR[monday.getMonth()]} — {weekDates[6].getDate()} {MONTHS_FR[weekDates[6].getMonth()]} {weekDates[6].getFullYear()}</h2>
          <div className="flex items-center gap-1 bg-[#F0F2F8] rounded-full p-1">
            <button className="px-3 py-1 rounded-full text-xs font-medium text-[#94A3B8]">Jour</button>
            <button className="px-3 py-1 rounded-full bg-[#4F6AF5] text-white text-xs font-semibold">Semaine</button>
            <button className="px-3 py-1 rounded-full text-xs font-medium text-[#94A3B8]">Mois</button>
          </div>
        </div>

        {/* Day headers */}
        <div className="bg-white shrink-0" style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div />
          {weekDates.map((d, i) => {
            const isToday = isSameDay(d, now);
            return (
              <div key={i} className="text-center py-2">
                <p className={`text-xs font-medium ${isToday ? "text-[#4F6AF5]" : "text-[#94A3B8]"}`}>{DAYS_FR[i]}</p>
                <p className={`text-lg font-bold ${isToday ? "text-[#4F6AF5]" : "text-[#1E293B]"}`} style={{ fontFamily: "var(--font-bricolage), system-ui" }}>{d.getDate()}</p>
              </div>
            );
          })}
        </div>

        {/* Grid body */}
        <div className="flex-1 overflow-y-auto bg-[#F0F2F8]">
          <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", position: "relative" }}>
            {hours.map((hour) => (
              <div key={hour} style={{ display: "contents" }}>
                <div className="h-16 flex items-start justify-end pr-2 pt-0.5">
                  <span className="text-[10px] text-[#94A3B8] font-medium">{hour}:00</span>
                </div>
                {weekDates.map((d, dayIdx) => {
                  const isOpen = OPEN_HOURS.days.includes(dayIdx) && !(hour >= OPEN_HOURS.lunchStart && hour < OPEN_HOURS.lunchEnd);
                  const isBlocked = blocks.some((b) => {
                    const bs = new Date(b.startTime); const cellStart = new Date(d); cellStart.setHours(hour, 0, 0, 0);
                    return isSameDay(bs, d) && cellStart >= bs && cellStart < new Date(b.endTime);
                  });
                  const block = blocks.find((b) => isSameDay(new Date(b.startTime), d) && new Date(b.startTime).getHours() === hour);
                  return (
                    <div key={`${hour}-${dayIdx}`} className={`h-16 transition-colors ${isBlocked ? "bg-[#FEE2E2]" : isOpen ? "bg-white hover:bg-[#F8F9FF]" : "bg-[#F0F2F8]"} cursor-pointer`} style={{ borderBottom: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }} onClick={() => isOpen && !isBlocked && setCreateSlot({ day: dayIdx, hour })}>
                      {isBlocked && block && (
                        <div className="px-1.5 py-0.5">
                          <p className="text-[10px] font-semibold text-[#DC2626]">Bloqué</p>
                          <p className="text-[9px] text-[#DC2626]">{block.reason}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Now line */}
            {weekDates.some((d) => isSameDay(d, now)) && now.getHours() >= OPEN_HOURS.start && now.getHours() < OPEN_HOURS.end && (
              <div className="absolute left-[56px] right-0 z-20 pointer-events-none" style={{ top: `${(now.getHours() - OPEN_HOURS.start + now.getMinutes() / 60) * 64}px` }}>
                <div className="relative flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] -ml-1" />
                  <div className="flex-1 h-[2px] bg-[#EF4444]" />
                </div>
              </div>
            )}

            {/* Appointments */}
            {filteredApts.filter((a) => a.status !== "CANCELLED").map((apt) => {
              const aptDate = new Date(apt.startTime);
              const dayIdx = weekDates.findIndex((d) => isSameDay(d, aptDate));
              if (dayIdx < 0) return null;
              const startHour = aptDate.getHours() + aptDate.getMinutes() / 60;
              const durationHours = apt.consultationType.duration / 60;
              const top = (startHour - OPEN_HOURS.start) * 64;
              const height = Math.max(durationHours * 64 - 2, 20);
              return (
                <div key={apt.id} onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); }} className="absolute rounded-xl px-2 py-1.5 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden z-10" style={{
                  backgroundColor: apt.consultationType.color, color: apt.consultationType.textColor,
                  top: `${top}px`, height: `${height}px`,
                  left: `calc(56px + ${dayIdx} * ((100% - 56px) / 7) + 2px)`,
                  width: `calc((100% - 56px) / 7 - 4px)`,
                }}>
                  <p className="text-xs font-semibold truncate">{apt.patient.firstName} {apt.patient.lastName}</p>
                  {height > 30 && <p className="text-[10px] truncate opacity-80">{apt.consultationType.name}</p>}
                  {height > 45 && <p className="text-[10px] truncate opacity-70">{formatTime(apt.startTime)} · {apt.location.name}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Panel détail ── */}
      {selectedApt && <DetailPanel appointment={selectedApt} onClose={() => setSelectedApt(null)} onUpdateStatus={(s) => updateStatus(selectedApt.id, s)} />}

      {/* ── Modal création ── */}
      {createSlot && <CreateModal day={weekDates[createSlot.day]} hour={createSlot.hour} onClose={() => setCreateSlot(null)} onCreate={handleCreateApt} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════

function MiniCalendar({ currentMonday, onSelectWeek }: { currentMonday: Date; onSelectWeek: (d: Date) => void }) {
  const [viewMonth, setViewMonth] = useState(new Date(currentMonday));
  const year = viewMonth.getFullYear(); const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"><ChevronLeft size={14} /></button>
        <p className="text-sm font-semibold text-[#1E293B] capitalize">{MONTHS_FR[month]} {year}</p>
        <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["L","M","M","J","V","S","D"].map((d, i) => <div key={i} className="text-[10px] font-medium text-[#94A3B8] py-1">{d}</div>)}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const date = new Date(year, month, day);
          const isToday = isSameDay(date, today);
          const isInWeek = date >= currentMonday && date < new Date(currentMonday.getTime() + 7 * 86400000);
          return <button key={i} onClick={() => onSelectWeek(date)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${isToday ? "bg-[#4F6AF5] text-white" : isInWeek ? "bg-[#EEF1FF] text-[#4F6AF5]" : "text-[#1E293B] hover:bg-[#F0F2F8]"}`}>{day}</button>;
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════

function CreateModal({ day, hour, onClose, onCreate }: { day: Date; hour: number; onClose: () => void; onCreate: (p: string, t: string, l: string) => void }) {
  const [patient, setPatient] = useState(""); const [typeId, setTypeId] = useState(CONSULTATION_TYPES[1].id); const [locationId, setLocationId] = useState(LOCATIONS[0].id);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const ct = CONSULTATION_TYPES.find((t) => t.id === typeId)!;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/20" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[480px] mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#1E293B]" style={{ fontFamily: "var(--font-bricolage), system-ui" }}>Nouveau rendez-vous</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8]"><X size={16} /></button>
        </div>
        <div className="px-6 pb-4">
          <div className="bg-[#EEF1FF] rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-[#4F6AF5] font-medium">
            <CalendarDays size={14} />
            {DAYS_FULL[(day.getDay() + 6) % 7]} {day.getDate()} {MONTHS_FR[day.getMonth()]} · {hour}:00
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Patient</label>
            <input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Nom du patient" autoFocus className="w-full h-10 rounded-xl bg-[#F0F2F8] px-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF5]/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Type</label>
            <div className="space-y-1">
              {CONSULTATION_TYPES.filter((t) => t.isActive).map((c) => (
                <button key={c.id} onClick={() => setTypeId(c.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${typeId === c.id ? "bg-[#EEF1FF]" : "hover:bg-[#F0F2F8]"}`}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className={`text-sm flex-1 ${typeId === c.id ? "font-semibold text-[#1E293B]" : "text-[#64748B]"}`}>{c.name}</span>
                  <span className="text-xs text-[#94A3B8]">{c.duration}min · {c.price}€</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Lieu</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="w-full h-10 rounded-xl bg-[#F0F2F8] px-4 text-sm text-[#1E293B] focus:outline-none">
              {LOCATIONS.filter((l) => l.isActive).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          {!showAdvanced ? (
            <button onClick={() => setShowAdvanced(true)} className="text-xs text-[#64748B] hover:text-[#4F6AF5]">Options avancées →</button>
          ) : (
            <div className="bg-[#F0F2F8] rounded-xl p-4">
              <label className="text-xs text-[#94A3B8]">Note interne</label>
              <textarea placeholder="Notes…" rows={2} className="w-full bg-white rounded-lg p-3 text-sm mt-1 resize-none focus:outline-none" />
            </div>
          )}
        </div>
        <div className="px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[#64748B] hover:bg-[#F0F2F8]">Annuler</button>
          <button onClick={() => { if (patient.trim()) onCreate(patient.trim(), typeId, locationId); }} disabled={!patient.trim()} className={`px-6 py-2.5 rounded-xl text-sm font-semibold ${patient.trim() ? "bg-[#4F6AF5] text-white hover:bg-[#3B55E0]" : "bg-[#E8EBF0] text-[#94A3B8] cursor-not-allowed"}`}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════

function DetailPanel({ appointment: apt, onClose, onUpdateStatus }: { appointment: Appointment; onClose: () => void; onUpdateStatus: (s: Appointment["status"]) => void }) {
  const [notes, setNotes] = useState(apt.notes ?? "");
  return (
    <div className="w-[420px] shrink-0 bg-white flex flex-col h-full z-20">
      <div className="px-6 py-4 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-[#1E293B]">Détail du rendez-vous</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8]"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: apt.consultationType.color }}>
            {apt.patient.firstName[0]}{apt.patient.lastName[0]}
          </div>
          <div>
            <p className="text-base font-semibold text-[#1E293B]">{apt.patient.firstName} {apt.patient.lastName}</p>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[apt.status]}`}>{STATUS_LABEL[apt.status]}</span>
          </div>
        </div>
        <div className="bg-[#F0F2F8] rounded-2xl p-4 space-y-3 text-sm text-[#1E293B]">
          <p className="flex items-center gap-2.5"><CalendarDays size={14} className="text-[#94A3B8]" /> {DAYS_FULL[(new Date(apt.startTime).getDay() + 6) % 7]} {new Date(apt.startTime).getDate()} {MONTHS_FR[new Date(apt.startTime).getMonth()]} · {formatTime(apt.startTime)} → {formatTime(apt.endTime)}</p>
          <p className="flex items-center gap-2.5"><MapPin size={14} className="text-[#94A3B8]" /> {apt.location.name}</p>
          <p className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: apt.consultationType.color }} /> {apt.consultationType.name} · {apt.consultationType.duration} min</p>
          <p className="font-semibold">{apt.consultationType.price}€</p>
        </div>
        <div className="flex items-center gap-2">
          {apt.status === "CONFIRMED" && <button onClick={() => onUpdateStatus("DONE")} className="flex-1 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#BBF7D0]"><Check size={14} /> Présent</button>}
          {apt.status === "PENDING" && <button onClick={() => onUpdateStatus("CONFIRMED")} className="flex-1 h-10 rounded-xl bg-[#4F6AF5] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#3B55E0]"><Check size={14} /> Confirmer</button>}
          {["CONFIRMED","PENDING"].includes(apt.status) && <button onClick={() => onUpdateStatus("CANCELLED")} className="h-10 px-4 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-sm font-semibold flex items-center gap-2 hover:bg-[#FECACA]"><XCircle size={14} /> Annuler</button>}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Note de séance</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes post-consultation…" rows={4} className="w-full bg-[#F0F2F8] rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4F6AF5]/20" />
        </div>
      </div>
    </div>
  );
}
