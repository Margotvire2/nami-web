"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, MapPin, Monitor, Building2,
  Plus, X, CalendarDays, Ban, Check, XCircle, Settings, Pencil, Trash2,
  ArrowLeftRight,
} from "lucide-react";
import type { Appointment, Block, Location, ConsultationType, TimeSlot } from "@/components/nami/agenda/types";
import {
  LOCATIONS as INIT_LOCS, CONSULTATION_TYPES as INIT_CTS, APPOINTMENTS as INIT_APTS,
  BLOCKS as INIT_BLOCKS, OPEN_HOURS, TIME_SLOTS as INIT_SLOTS,
} from "@/components/nami/agenda/mock-data";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const DAYS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const STATUS_LABEL: Record<string, string> = { CONFIRMED: "Confirmé", PENDING: "En attente", CANCELLED: "Annulé", NO_SHOW: "Absent", DONE: "Terminé" };
const STATUS_STYLE: Record<string, string> = { CONFIRMED: "bg-[#DCFCE7] text-[#16A34A]", PENDING: "bg-[#FEF9C3] text-[#CA8A04]", CANCELLED: "bg-[#FEE2E2] text-[#DC2626]", NO_SHOW: "bg-[#FEE2E2] text-[#DC2626]", DONE: "bg-[#EEF1FF] text-[#4F6AF5]" };
const CELL_H = 72; // px per hour slot — more readable

function getMonday(d: Date): Date { const date = new Date(d); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); date.setHours(0,0,0,0); return date; }
function formatTime(iso: string): string { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
function isSameDay(d1: Date, d2: Date): boolean { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }

export default function AgendaPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>(INIT_APTS);
  const [blocks] = useState<Block[]>(INIT_BLOCKS);
  const [locations, setLocations] = useState<Location[]>(INIT_LOCS);
  const [consultTypes, setConsultTypes] = useState<ConsultationType[]>(INIT_CTS);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(INIT_SLOTS);
  const [activeLocations, setActiveLocations] = useState<Set<string>>(new Set(INIT_LOCS.map((l) => l.id)));
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [createSlot, setCreateSlot] = useState<{ day: number; hour: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"lieux" | "consultations" | "horaires">("lieux");
  const gridRef = useRef<HTMLDivElement>(null);

  const monday = useMemo(() => { const m = getMonday(new Date()); m.setDate(m.getDate() + weekOffset * 7); return m; }, [weekOffset]);
  const weekDates = useMemo(() => Array.from({ length: 5 }, (_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return d; }), [monday]);
  const hours = Array.from({ length: OPEN_HOURS.end - OPEN_HOURS.start }, (_, i) => OPEN_HOURS.start + i);
  const now = new Date();
  const filteredApts = appointments.filter((a) => activeLocations.has(a.location.id));
  const todayApts = filteredApts.filter((a) => isSameDay(new Date(a.startTime), now) && a.status !== "CANCELLED");

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (gridRef.current) {
      const scrollTo = Math.max(0, (now.getHours() - OPEN_HOURS.start - 1) * CELL_H);
      gridRef.current.scrollTop = scrollTo;
    }
  }, []);

  function toggleLocation(id: string) { setActiveLocations((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  function handleCreateApt(patient: string, typeId: string, locationId: string) {
    if (!createSlot) return;
    const ct = consultTypes.find((t) => t.id === typeId)!;
    const loc = locations.find((l) => l.id === locationId)!;
    const start = new Date(weekDates[createSlot.day]); start.setHours(createSlot.hour, 0, 0, 0);
    const end = new Date(start.getTime() + ct.duration * 60000);
    const [first, last] = patient.split(" ");
    setAppointments((prev) => [...prev, { id: `apt-${Date.now()}`, patient: { firstName: first || "Patient", lastName: last || "" }, consultationType: ct, location: loc, startTime: start.toISOString(), endTime: end.toISOString(), status: "CONFIRMED" }]);
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
      {/* ── Sidebar gauche ── */}
      <div className="w-[260px] shrink-0 bg-white flex flex-col overflow-y-auto">
        <div className="p-4">
          <MiniCalendar currentMonday={monday} onSelectWeek={(d) => setWeekOffset(Math.round((getMonday(d).getTime() - getMonday(new Date()).getTime()) / (7 * 86400000)))} />
        </div>

        <div className="px-4 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">Mes lieux</p>
          <div className="space-y-1.5">
            {locations.filter((l) => l.isActive).map((loc) => (
              <label key={loc.id} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleLocation(loc.id)}>
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${activeLocations.has(loc.id) ? "" : "opacity-25"}`} style={{ backgroundColor: loc.color }}>
                  {activeLocations.has(loc.id) && <Check size={9} className="text-white" />}
                </div>
                <span className={`text-sm ${activeLocations.has(loc.id) ? "text-[#1E293B]" : "text-[#94A3B8]"}`}>{loc.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-[#F0F2F8] rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Aujourd'hui</p>
            <p className="text-sm text-[#1E293B] font-medium">{todayApts.length} RDV</p>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2 mt-auto">
          <button onClick={() => setCreateSlot({ day: Math.min((now.getDay() + 6) % 7, 4), hour: Math.max(OPEN_HOURS.start, Math.min(now.getHours() + 1, OPEN_HOURS.end - 1)) })} className="w-full h-9 rounded-xl bg-[#4F6AF5] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#3B55E0] transition-colors">
            <Plus size={14} /> Nouveau RDV
          </button>
          <button onClick={() => toast.info("Blocage de créneau bientôt disponible")} className="w-full h-9 rounded-xl bg-[#EEF1FF] text-[#4F6AF5] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#E0E5FF] transition-colors">
            <Ban size={14} /> Bloquer un créneau
          </button>
          <button onClick={() => setSettingsOpen(true)} className="w-full h-9 rounded-xl bg-[#F0F2F8] text-[#64748B] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#E8EBF0] transition-colors">
            <Settings size={14} /> Paramétrer mon agenda
          </button>
        </div>
      </div>

      {/* ── Grille agenda ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Week nav */}
        <div className="bg-white px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((p) => p - 1)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8]"><ChevronLeft size={16} /></button>
            <button onClick={() => setWeekOffset(0)} className="text-sm font-medium text-[#4F6AF5] px-3 py-1 rounded-lg hover:bg-[#EEF1FF] transition-colors">Aujourd'hui</button>
            <button onClick={() => setWeekOffset((p) => p + 1)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8]"><ChevronRight size={16} /></button>
          </div>
          <h2 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: "var(--font-bricolage), system-ui" }}>
            {monday.getDate()} — {weekDates[4].getDate()} {MONTHS_FR[weekDates[4].getMonth()]} {weekDates[4].getFullYear()}
          </h2>
          <div className="flex items-center gap-1 bg-[#F0F2F8] rounded-full p-1">
            <button className="px-3 py-1 rounded-full text-xs font-medium text-[#94A3B8]">Jour</button>
            <button className="px-3 py-1 rounded-full bg-[#4F6AF5] text-white text-xs font-semibold">Semaine</button>
          </div>
        </div>

        {/* Day headers — 5 days */}
        <div className="bg-white shrink-0" style={{ display: "grid", gridTemplateColumns: "52px repeat(5, 1fr)" }}>
          <div />
          {weekDates.map((d, i) => {
            const isToday = isSameDay(d, now);
            return (
              <div key={i} className={`text-center py-2 ${isToday ? "bg-[#FAFBFF]" : ""}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${isToday ? "text-[#4F46E5]" : "text-[#94A3B8]"}`} style={{ fontFamily: "var(--font-inter)" }}>{DAYS_FR[i]}</p>
                <p className={`text-lg font-bold ${isToday ? "text-[#4F46E5]" : "text-[#0F172A]"}`} style={{ fontFamily: "var(--font-jakarta)" }}>{d.getDate()}</p>
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div ref={gridRef} className="flex-1 overflow-y-auto bg-[#F0F2F8]">
          <div style={{ display: "grid", gridTemplateColumns: "52px repeat(5, 1fr)", position: "relative" }}>
            {hours.map((hour) => (
              <div key={hour} style={{ display: "contents" }}>
                <div style={{ height: CELL_H }} className="flex items-start justify-end pr-2 pt-0.5">
                  <span className="text-[10px] text-[#94A3B8] font-medium tabular-nums">{hour}:00</span>
                </div>
                {weekDates.map((d, dayIdx) => {
                  const isOpen = OPEN_HOURS.days.includes(dayIdx) && !(hour >= OPEN_HOURS.lunchStart && hour < OPEN_HOURS.lunchEnd);
                  const isBlocked = blocks.some((b) => { const bs = new Date(b.startTime); const cs = new Date(d); cs.setHours(hour,0,0,0); return isSameDay(bs, d) && cs >= bs && cs < new Date(b.endTime); });
                  const block = blocks.find((b) => isSameDay(new Date(b.startTime), d) && new Date(b.startTime).getHours() === hour);
                  // Check if this slot accepts referrals
                  const slot = timeSlots.find((s) => s.dayOfWeek === dayIdx && hour >= s.startHour && hour < s.endHour);
                  return (
                    <div key={`${hour}-${dayIdx}`} style={{ height: CELL_H, borderBottom: "1px solid #F1F5F9", borderRight: "1px solid #F1F5F9" }} className={`transition-colors relative ${isBlocked ? "bg-[#FEE2E2]" : isOpen ? "bg-white hover:bg-[#F8F9FF]" : "bg-[#F0F2F8]"} cursor-pointer`} onClick={() => isOpen && !isBlocked && setCreateSlot({ day: dayIdx, hour })}>
                      {isBlocked && block && <div className="px-1.5 py-1"><p className="text-[10px] font-semibold text-[#DC2626]">Bloqué</p><p className="text-[9px] text-[#DC2626]">{block.reason}</p></div>}
                      {!isBlocked && isOpen && slot?.acceptsReferral && (
                        <div className="absolute top-0.5 right-1"><ArrowLeftRight size={9} className="text-[#4F6AF5]" /></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Now line */}
            {weekDates.some((d) => isSameDay(d, now)) && now.getHours() >= OPEN_HOURS.start && now.getHours() < OPEN_HOURS.end && (
              <div className="absolute left-[52px] right-0 z-20 pointer-events-none" style={{ top: `${(now.getHours() - OPEN_HOURS.start + now.getMinutes() / 60) * CELL_H}px` }}>
                <div className="relative flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] -ml-1" /><div className="flex-1 h-[2px] bg-[#EF4444]" /></div>
              </div>
            )}

            {/* Appointments */}
            {filteredApts.filter((a) => a.status !== "CANCELLED").map((apt) => {
              const ad = new Date(apt.startTime);
              const dayIdx = weekDates.findIndex((d) => isSameDay(d, ad));
              if (dayIdx < 0) return null;
              const startH = ad.getHours() + ad.getMinutes() / 60;
              const durH = apt.consultationType.duration / 60;
              const top = (startH - OPEN_HOURS.start) * CELL_H;
              const height = Math.max(durH * CELL_H - 2, 24);
              return (
                <div key={apt.id} onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); }} className="absolute rounded-lg px-2.5 py-1.5 cursor-pointer overflow-hidden z-10 transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]" style={{
                  backgroundColor: apt.consultationType.bgColor,
                  color: apt.consultationType.textColor,
                  borderLeft: `3px solid ${apt.consultationType.borderColor}`,
                  top: `${top}px`, height: `${height}px`,
                  left: `calc(52px + ${dayIdx} * ((100% - 52px) / 5) + 3px)`,
                  width: `calc((100% - 52px) / 5 - 6px)`,
                }}>
                  <p className="text-[13px] font-medium truncate">{apt.patient.firstName} {apt.patient.lastName}</p>
                  {height > 35 && <p className="text-[11px] truncate" style={{ fontFamily: "var(--font-inter)" }}>{apt.consultationType.name}</p>}
                  {height > 50 && <p className="text-[11px] truncate" style={{ fontFamily: "var(--font-inter)", opacity: 0.7 }}>{formatTime(apt.startTime)} — {formatTime(apt.endTime)}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Panel détail ── */}
      {selectedApt && <DetailPanel apt={selectedApt} onClose={() => setSelectedApt(null)} onStatus={(s) => updateStatus(selectedApt.id, s)} />}
      {/* ── Modal création ── */}
      {createSlot && <CreateModal day={weekDates[createSlot.day]} hour={createSlot.hour} consultTypes={consultTypes} locations={locations} onClose={() => setCreateSlot(null)} onCreate={handleCreateApt} />}
      {/* ── Settings drawer ── */}
      {settingsOpen && <SettingsDrawer tab={settingsTab} onTabChange={setSettingsTab} locations={locations} setLocations={setLocations} consultTypes={consultTypes} setConsultTypes={setConsultTypes} timeSlots={timeSlots} setTimeSlots={setTimeSlots} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════

function MiniCalendar({ currentMonday, onSelectWeek }: { currentMonday: Date; onSelectWeek: (d: Date) => void }) {
  const [vm, setVm] = useState(new Date(currentMonday));
  const y = vm.getFullYear(); const m = vm.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const cells: (number|null)[] = [...Array(offset).fill(null), ...Array.from({length:dim},(_,i)=>i+1)];
  while (cells.length % 7) cells.push(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setVm(new Date(y,m-1,1))} className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"><ChevronLeft size={14} /></button>
        <p className="text-sm font-semibold text-[#1E293B] capitalize">{MONTHS_FR[m]} {y}</p>
        <button onClick={() => setVm(new Date(y,m+1,1))} className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["L","M","M","J","V","S","D"].map((d,i) => <div key={i} className="text-[10px] font-medium text-[#94A3B8] py-0.5">{d}</div>)}
        {cells.map((day,i) => {
          if (!day) return <div key={i} />;
          const date = new Date(y,m,day);
          const isT = isSameDay(date, today);
          const isW = date >= currentMonday && date < new Date(currentMonday.getTime() + 5 * 86400000);
          return <button key={i} onClick={() => onSelectWeek(date)} className={`w-6 h-6 rounded-md text-xs font-medium transition-colors ${isT ? "bg-[#4F6AF5] text-white" : isW ? "bg-[#EEF1FF] text-[#4F6AF5]" : "text-[#1E293B] hover:bg-[#F0F2F8]"}`}>{day}</button>;
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function CreateModal({ day, hour, consultTypes, locations, onClose, onCreate }: { day: Date; hour: number; consultTypes: ConsultationType[]; locations: Location[]; onClose: () => void; onCreate: (p: string, t: string, l: string) => void }) {
  const [patient, setPatient] = useState(""); const [typeId, setTypeId] = useState(consultTypes[1]?.id ?? ""); const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/20" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[460px] mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#1E293B]" style={{ fontFamily: "var(--font-bricolage), system-ui" }}>Nouveau RDV</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8]"><X size={16} /></button>
        </div>
        <div className="px-6 pb-2"><div className="bg-[#EEF1FF] rounded-xl px-4 py-2 text-sm text-[#4F6AF5] font-medium flex items-center gap-2"><CalendarDays size={14} />{DAYS_FULL[(day.getDay()+6)%7]} {day.getDate()} {MONTHS_FR[day.getMonth()]} · {hour}:00</div></div>
        <div className="px-6 py-4 space-y-4">
          <div><label className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Patient</label><input value={patient} onChange={(e)=>setPatient(e.target.value)} placeholder="Nom du patient" autoFocus className="w-full h-10 rounded-xl bg-[#F0F2F8] px-4 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-[#4F6AF5]/20" /></div>
          <div><label className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Type</label><div className="space-y-1 mt-1.5">{consultTypes.filter(t=>t.isActive).map(c=>(
            <button key={c.id} onClick={()=>setTypeId(c.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${typeId===c.id?"bg-[#EEF1FF]":"hover:bg-[#F0F2F8]"}`}>
              <div className="w-3 h-3 rounded-full" style={{backgroundColor:c.color}} /><span className={`text-sm flex-1 ${typeId===c.id?"font-semibold text-[#1E293B]":"text-[#64748B]"}`}>{c.name}</span><span className="text-xs text-[#94A3B8]">{c.duration}min · {c.price}€</span>
            </button>))}</div></div>
          <div><label className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Lieu</label><select value={locationId} onChange={e=>setLocationId(e.target.value)} className="w-full h-10 rounded-xl bg-[#F0F2F8] px-4 text-sm mt-1.5 focus:outline-none">{locations.filter(l=>l.isActive).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[#64748B] hover:bg-[#F0F2F8]">Annuler</button>
          <button onClick={()=>{if(patient.trim())onCreate(patient.trim(),typeId,locationId)}} disabled={!patient.trim()} className={`px-6 py-2.5 rounded-xl text-sm font-semibold ${patient.trim()?"bg-[#4F6AF5] text-white hover:bg-[#3B55E0]":"bg-[#E8EBF0] text-[#94A3B8] cursor-not-allowed"}`}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function DetailPanel({ apt, onClose, onStatus }: { apt: Appointment; onClose: () => void; onStatus: (s: Appointment["status"]) => void }) {
  const [notes, setNotes] = useState(apt.notes ?? "");
  return (
    <div className="w-[380px] shrink-0 bg-white flex flex-col h-full z-20">
      <div className="px-5 py-3 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-[#1E293B]">Détail du RDV</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8]"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white" style={{backgroundColor:apt.consultationType.color}}>{apt.patient.firstName[0]}{apt.patient.lastName[0]}</div>
          <div><p className="text-base font-semibold text-[#1E293B]">{apt.patient.firstName} {apt.patient.lastName}</p><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[apt.status]}`}>{STATUS_LABEL[apt.status]}</span></div>
        </div>
        <div className="bg-[#F0F2F8] rounded-2xl p-4 space-y-2.5 text-sm text-[#1E293B]">
          <p className="flex items-center gap-2"><CalendarDays size={14} className="text-[#94A3B8]" />{DAYS_FULL[(new Date(apt.startTime).getDay()+6)%7]} {new Date(apt.startTime).getDate()} {MONTHS_FR[new Date(apt.startTime).getMonth()]} · {formatTime(apt.startTime)} → {formatTime(apt.endTime)}</p>
          <p className="flex items-center gap-2"><MapPin size={14} className="text-[#94A3B8]" />{apt.location.name}</p>
          <p className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:apt.consultationType.color}} />{apt.consultationType.name} · {apt.consultationType.duration}min</p>
          <p className="font-semibold">{apt.consultationType.price}€</p>
        </div>
        <div className="flex items-center gap-2">
          {apt.status==="CONFIRMED"&&<button onClick={()=>onStatus("DONE")} className="flex-1 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#BBF7D0]"><Check size={14} />Présent</button>}
          {apt.status==="PENDING"&&<button onClick={()=>onStatus("CONFIRMED")} className="flex-1 h-9 rounded-xl bg-[#4F6AF5] text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#3B55E0]"><Check size={14} />Confirmer</button>}
          {["CONFIRMED","PENDING"].includes(apt.status)&&<button onClick={()=>onStatus("CANCELLED")} className="h-9 px-3 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-sm font-semibold flex items-center gap-1.5 hover:bg-[#FECACA]"><XCircle size={14} />Annuler</button>}
        </div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1.5">Note de séance</p><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes…" rows={3} className="w-full bg-[#F0F2F8] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4F6AF5]/20" /></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS DRAWER — lieux, types de consultation, créneaux adressage
// ═══════════════════════════════════════════════════════════════════════════════

function SettingsDrawer({ tab, onTabChange, locations, setLocations, consultTypes, setConsultTypes, timeSlots, setTimeSlots, onClose }: {
  tab: string; onTabChange: (t: any) => void;
  locations: Location[]; setLocations: (fn: (l: Location[]) => Location[]) => void;
  consultTypes: ConsultationType[]; setConsultTypes: (fn: (c: ConsultationType[]) => ConsultationType[]) => void;
  timeSlots: TimeSlot[]; setTimeSlots: (fn: (s: TimeSlot[]) => TimeSlot[]) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="w-[440px] bg-white h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="text-base font-semibold text-[#1E293B]" style={{ fontFamily: "var(--font-bricolage), system-ui" }}>Paramètres de l'agenda</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8]"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1 bg-[#F0F2F8] mx-6 rounded-full p-1 shrink-0">
          {([["lieux", "Lieux"], ["consultations", "Consultations"], ["horaires", "Horaires & adressage"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => onTabChange(k)} className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === k ? "bg-[#4F6AF5] text-white" : "text-[#64748B] hover:text-[#1E293B]"}`}>{label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "lieux" && <LocationsTab locations={locations} setLocations={setLocations} />}
          {tab === "consultations" && <ConsultationsTab consultTypes={consultTypes} setConsultTypes={setConsultTypes} />}
          {tab === "horaires" && <HorairesTab timeSlots={timeSlots} setTimeSlots={setTimeSlots} locations={locations} />}
        </div>
      </div>
      <div className="flex-1 bg-[#1E293B]/20" />
    </div>
  );
}

function LocationsTab({ locations, setLocations }: { locations: Location[]; setLocations: (fn: (l: Location[]) => Location[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<Location["type"]>("CABINET");
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#64748B]">Vos lieux de consultation. Chaque lieu a une couleur pour le distinguer dans l'agenda.</p>
      <div className="space-y-2">
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center gap-3 bg-[#F0F2F8] rounded-xl px-4 py-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: loc.color }} />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1E293B]">{loc.name}</p>
              <p className="text-xs text-[#94A3B8]">{loc.type === "CABINET" ? "Cabinet" : loc.type === "HOPITAL" ? "Hôpital" : loc.type === "TELECONSULT" ? "Téléconsultation" : "Domicile"}</p>
            </div>
            <button onClick={() => { setLocations((prev) => prev.map((l) => l.id === loc.id ? { ...l, isActive: !l.isActive } : l)); toast.success(loc.isActive ? "Lieu désactivé" : "Lieu activé"); }} className={`text-xs font-medium px-2.5 py-1 rounded-full ${loc.isActive ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
              {loc.isActive ? "Actif" : "Inactif"}
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="bg-[#F0F2F8] rounded-xl p-4 space-y-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du lieu" autoFocus className="w-full h-9 rounded-lg bg-white px-3 text-sm focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            {(["CABINET", "HOPITAL", "TELECONSULT", "DOMICILE"] as const).map((t) => (
              <button key={t} onClick={() => setNewType(t)} className={`py-2 rounded-lg text-xs font-medium ${newType === t ? "bg-[#4F6AF5] text-white" : "bg-white text-[#64748B]"}`}>
                {t === "CABINET" ? "🏢 Cabinet" : t === "HOPITAL" ? "🏥 Hôpital" : t === "TELECONSULT" ? "💻 Téléconsult" : "🏠 Domicile"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 h-9 rounded-lg text-sm text-[#64748B] hover:bg-white">Annuler</button>
            <button onClick={() => {
              if (!newName.trim()) return;
              const colors = ["#4F6AF5", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
              setLocations((prev) => [...prev, { id: `loc-${Date.now()}`, name: newName.trim(), type: newType, color: colors[prev.length % colors.length], isActive: true }]);
              setNewName(""); setAdding(false);
              toast.success("Lieu ajouté");
            }} disabled={!newName.trim()} className={`flex-1 h-9 rounded-lg text-sm font-semibold ${newName.trim() ? "bg-[#4F6AF5] text-white" : "bg-[#E8EBF0] text-[#94A3B8]"}`}>Ajouter</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full h-10 rounded-xl bg-[#EEF1FF] text-[#4F6AF5] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#E0E5FF]">
          <Plus size={14} /> Ajouter un lieu
        </button>
      )}
    </div>
  );
}

function ConsultationsTab({ consultTypes, setConsultTypes }: { consultTypes: ConsultationType[]; setConsultTypes: (fn: (c: ConsultationType[]) => ConsultationType[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDuration, setEditDuration] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#64748B]">Vos types de consultations avec durée et tarif. Modifiez en cliquant sur un type.</p>
      <div className="space-y-2">
        {consultTypes.map((ct) => (
          <div key={ct.id}>
            <button onClick={() => { if (editingId === ct.id) { setEditingId(null); } else { setEditingId(ct.id); setEditDuration(ct.duration); setEditPrice(ct.price); } }} className="w-full flex items-center gap-3 bg-[#F0F2F8] rounded-xl px-4 py-3 text-left hover:bg-[#E8EBF0] transition-colors">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ct.color }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1E293B]">{ct.name}</p>
                <p className="text-xs text-[#94A3B8]">{ct.duration} min · {ct.price}€</p>
              </div>
              <Pencil size={12} className="text-[#94A3B8]" />
            </button>
            {editingId === ct.id && (
              <div className="bg-white rounded-xl p-4 mt-1 space-y-3" style={{ border: "1px solid #E2E8F0" }}>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-[#94A3B8]">Durée (min)</label><input type="number" value={editDuration} onChange={(e) => setEditDuration(+e.target.value)} className="w-full h-9 rounded-lg bg-[#F0F2F8] px-3 text-sm mt-1 focus:outline-none" /></div>
                  <div><label className="text-xs text-[#94A3B8]">Prix (€)</label><input type="number" value={editPrice} onChange={(e) => setEditPrice(+e.target.value)} className="w-full h-9 rounded-lg bg-[#F0F2F8] px-3 text-sm mt-1 focus:outline-none" /></div>
                </div>
                <button onClick={() => { setConsultTypes((prev) => prev.map((c) => c.id === ct.id ? { ...c, duration: editDuration, price: editPrice } : c)); setEditingId(null); toast.success("Type modifié"); }} className="w-full h-9 rounded-lg bg-[#4F6AF5] text-white text-sm font-semibold">Enregistrer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HorairesTab({ timeSlots, setTimeSlots, locations }: { timeSlots: TimeSlot[]; setTimeSlots: (fn: (s: TimeSlot[]) => TimeSlot[]) => void; locations: Location[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#64748B]">Vos créneaux d'ouverture par jour. L'icône <ArrowLeftRight size={12} className="inline text-[#4F6AF5]" /> indique que vous acceptez l'adressage sur ce créneau.</p>
      {DAYS_FULL.map((dayName, dayIdx) => {
        const daySlots = timeSlots.filter((s) => s.dayOfWeek === dayIdx);
        return (
          <div key={dayIdx}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">{dayName}</p>
            {daySlots.length === 0 ? (
              <p className="text-sm text-[#94A3B8] italic">Pas de créneau configuré</p>
            ) : (
              <div className="space-y-1.5">
                {daySlots.map((slot) => {
                  const loc = locations.find((l) => l.id === slot.locationId);
                  return (
                    <div key={slot.id} className="flex items-center gap-3 bg-[#F0F2F8] rounded-xl px-4 py-2.5">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: loc?.color ?? "#94A3B8" }} />
                      <span className="text-sm text-[#1E293B] flex-1">
                        {slot.startHour}:00 — {slot.endHour}:00
                        <span className="text-xs text-[#94A3B8] ml-2">{loc?.name}</span>
                      </span>
                      <button
                        onClick={() => {
                          setTimeSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, acceptsReferral: !s.acceptsReferral } : s));
                          toast.success(slot.acceptsReferral ? "Adressage désactivé sur ce créneau" : "Adressage activé sur ce créneau");
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${slot.acceptsReferral ? "bg-[#EEF1FF] text-[#4F6AF5]" : "bg-[#F0F2F8] text-[#94A3B8]"}`}
                      >
                        <ArrowLeftRight size={10} /> {slot.acceptsReferral ? "Adressage ON" : "Adressage OFF"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
