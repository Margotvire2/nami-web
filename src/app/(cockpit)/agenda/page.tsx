"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, MapPin, Monitor, Plus, X, Check, XCircle,
  Settings, Ban, ArrowLeftRight, Clock, Phone, Mail, Video, Sparkles,
  Calendar, FileText, Stethoscope, Eye, Repeat,
} from "lucide-react";
import type { Appointment, Block, Location, ConsultationType, TimeSlot } from "@/components/nami/agenda/types";
import {
  LOCATIONS, CONSULTATION_TYPES, APPOINTMENTS as INIT_APTS,
  BLOCKS as INIT_BLOCKS, OPEN_HOURS, TIME_SLOTS, DAY_CABINET,
} from "@/components/nami/agenda/mock-data";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const CELL_H = 80; // 1 heure = 80px
const STATUS_LABEL: Record<string, string> = { CONFIRMED: "Confirmé", PENDING: "En attente", CANCELLED: "Annulé", NO_SHOW: "Absent", DONE: "Terminé" };
const STATUS_STYLE: Record<string, string> = { CONFIRMED: "bg-[#E8F5E9] text-[#2E7D32]", PENDING: "bg-[#FFF8E1] text-[#F57F17]", CANCELLED: "bg-[#FBE9E7] text-[#C62828]", NO_SHOW: "bg-[#FBE9E7] text-[#C62828]", DONE: "bg-[#EEF2FF] text-[#4F46E5]" };

// Patient detail mock for drawer
interface PatientDetail { age: number; dob: string; phone: string; email: string; motif: string; resumeIA: string; history: { date: string; type: string; motif: string }[]; nextRdv: string | null; }
const PATIENT_DETAILS: Record<string, PatientDetail> = {
  "Sophie Moreau": { age: 34, dob: "12/03/1991", phone: "06 12 34 56 78", email: "sophie.m@email.com", motif: "Anxiété généralisée, difficultés professionnelles", resumeIA: "Patiente suivie depuis 8 mois pour anxiété généralisée. Bonne progression thérapeutique. Dernière séance : travail sur les mécanismes d'évitement.", history: [{ date: "26 mai", type: "Suivi", motif: "Gestion du stress" }, { date: "12 mai", type: "Suivi", motif: "Techniques de respiration" }], nextRdv: "23 juin · 10h00" },
  "Marc Dupont": { age: 28, dob: "15/07/1996", phone: "06 98 76 54 32", email: "marc.d@email.com", motif: "Suivi TCA — boulimie", resumeIA: "Patient motivé, compliance bonne. Épisodes boulimiques réduits de 4 à 1/semaine. Travail en cours sur la gestion émotionnelle.", history: [{ date: "20 mai", type: "Suivi", motif: "Gestion émotionnelle" }], nextRdv: "15 juin · 10h00" },
  "Théo Dufresne": { age: 19, dob: "12/03/1997", phone: "06 44 55 66 77", email: "theo.d@email.com", motif: "Bilan mensuel TCA — orthorexie", resumeIA: "Situation préoccupante. IMC 17.8, perte de 8 kg en 4 mois. Déni actif. Restriction alimentaire sévère centrée sur la pureté des aliments.", history: [{ date: "28 mars", type: "Bilan", motif: "Évaluation initiale" }, { date: "5 avril", type: "Suivi", motif: "Point équipe" }], nextRdv: "21 avril · 14h00" },
  "Margot Vire": { age: 32, dob: "14/05/1992", phone: "06 11 22 33 44", email: "margot.v@email.com", motif: "Bilan mensuel nutrition", resumeIA: "Patiente en phase de stabilisation. Amélioration de la gestion des repas du soir. Stress professionnel à surveiller.", history: [{ date: "10 mai", type: "Suivi", motif: "Gestion repas soir" }], nextRdv: "22 avril · 09h00" },
};

function getMonday(d: Date): Date { const date = new Date(d); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); date.setHours(0, 0, 0, 0); return date; }
function formatTime(iso: string): string { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
function isSameDay(d1: Date, d2: Date): boolean { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AgendaPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>(INIT_APTS);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [createSlot, setCreateSlot] = useState<{ day: number; hour: number } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const monday = useMemo(() => { const m = getMonday(new Date()); m.setDate(m.getDate() + weekOffset * 7); return m; }, [weekOffset]);
  const weekDates = useMemo(() => Array.from({ length: 5 }, (_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return d; }), [monday]);
  const hours = Array.from({ length: OPEN_HOURS.end - OPEN_HOURS.start }, (_, i) => OPEN_HOURS.start + i);
  const now = new Date();

  const filteredApts = activeFilter === "all" ? appointments : appointments.filter((a) => a.location.id === activeFilter);

  // Auto-scroll to current hour
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = Math.max(0, (now.getHours() - OPEN_HOURS.start - 1) * CELL_H);
    }
  }, []);

  // Day appointment counts for fill bars
  const dayAptCounts = weekDates.map((d) => filteredApts.filter((a) => isSameDay(new Date(a.startTime), d) && a.status !== "CANCELLED").length);
  const maxDayApts = Math.max(...dayAptCounts, 1);

  // Drag & drop
  function handleDrop(dayIdx: number, hour: number) {
    if (!dragId) return;
    const apt = appointments.find((a) => a.id === dragId);
    if (!apt) return;
    const newStart = new Date(weekDates[dayIdx]);
    newStart.setHours(hour, 0, 0, 0);
    const durMs = apt.consultationType.duration * 60000;
    setAppointments((prev) => prev.map((a) => a.id === dragId ? { ...a, startTime: newStart.toISOString(), endTime: new Date(newStart.getTime() + durMs).toISOString() } : a));
    setDragId(null);
    toast.success(`RDV déplacé au ${DAYS_FR[dayIdx]} à ${hour}h00`);
  }

  function handleCreateApt(patient: string, typeId: string, locationId: string) {
    if (!createSlot) return;
    const ct = CONSULTATION_TYPES.find((t) => t.id === typeId)!;
    const loc = LOCATIONS.find((l) => l.id === locationId)!;
    const start = new Date(weekDates[createSlot.day]); start.setHours(createSlot.hour, 0, 0, 0);
    setAppointments((prev) => [...prev, { id: `apt-${Date.now()}`, patient: { firstName: patient.split(" ")[0] || "Patient", lastName: patient.split(" ")[1] || "" }, consultationType: ct, location: loc, startTime: start.toISOString(), endTime: new Date(start.getTime() + ct.duration * 60000).toISOString(), status: "CONFIRMED" }]);
    setCreateSlot(null);
    toast.success(`RDV créé pour ${patient}`);
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Sidebar gauche ── */}
      <div className="w-[240px] shrink-0 bg-white border-r border-[#E8ECF4] flex flex-col overflow-y-auto">
        <div className="p-4">
          <MiniCalendar currentMonday={monday} onSelectWeek={(d) => setWeekOffset(Math.round((getMonday(d).getTime() - getMonday(new Date()).getTime()) / (7 * 86400000)))} />
        </div>

        {/* Cabinet filter */}
        <div className="px-4 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>CABINETS</p>
          <div className="space-y-1">
            <button onClick={() => setActiveFilter("all")} className={cn("w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all", activeFilter === "all" ? "bg-[#EEF2FF] text-[#4F46E5] font-medium" : "text-[#64748B] hover:bg-[#F8FAFC]")}>
              Tous les cabinets
            </button>
            {LOCATIONS.map((loc) => (
              <button key={loc.id} onClick={() => setActiveFilter(loc.id)} className={cn("w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all", activeFilter === loc.id ? "bg-[#EEF2FF] text-[#4F46E5] font-medium" : "text-[#64748B] hover:bg-[#F8FAFC]")}>
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: loc.color }} />
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2 mt-auto">
          <button onClick={() => setCreateSlot({ day: Math.min((now.getDay() + 6) % 7, 4), hour: Math.max(OPEN_HOURS.start, Math.min(now.getHours() + 1, OPEN_HOURS.end - 1)) })} className="w-full h-9 rounded-lg bg-[#4F46E5] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors">
            <Plus size={14} /> Ajouter un RDV
          </button>
        </div>
      </div>

      {/* ── Grille agenda ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#E8ECF4] px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((p) => p - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"><ChevronLeft size={16} /></button>
            <button onClick={() => setWeekOffset(0)} className="text-[13px] font-medium text-[#4F46E5] px-3 py-1 rounded-lg hover:bg-[#EEF2FF] transition-colors" style={{ fontFamily: "var(--font-inter)" }}>Aujourd'hui</button>
            <button onClick={() => setWeekOffset((p) => p + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"><ChevronRight size={16} /></button>
          </div>
          <h2 className="text-[16px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>
            Semaine du {monday.getDate()} au {weekDates[4].getDate()} {MONTHS_FR[weekDates[4].getMonth()]} {weekDates[4].getFullYear()}
          </h2>
          <div className="w-32" />
        </div>

        {/* Day headers with fill bars */}
        <div className="bg-white border-b border-[#E8ECF4] shrink-0" style={{ display: "grid", gridTemplateColumns: "48px repeat(5, 1fr)" }}>
          <div />
          {weekDates.map((d, i) => {
            const isToday = isSameDay(d, now);
            const cabinetId = DAY_CABINET[i];
            const cabinet = LOCATIONS.find((l) => l.id === cabinetId);
            const fillPct = (dayAptCounts[i] / maxDayApts) * 100;
            return (
              <div key={i} className={cn("text-center py-2 px-2", isToday ? "bg-[#FAFBFF]" : "")}>
                <p className={cn("text-[11px] font-semibold uppercase tracking-wide", isToday ? "text-[#4F46E5]" : "text-[#94A3B8]")} style={{ fontFamily: "var(--font-inter)" }}>{DAYS_FR[i]} {d.getDate()}</p>
                {cabinet && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: cabinet.color }} />
                    <span className="text-[10px] text-[#94A3B8]">{cabinet.name.replace("Cabinet ", "")}</span>
                  </div>
                )}
                {/* Fill bar */}
                <div className="mt-1.5 mx-auto w-full max-w-[80px] h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, backgroundColor: cabinet?.color ?? "#94A3B8", opacity: 0.6 }} />
                </div>
                <p className="text-[9px] text-[#CBD5E1] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{dayAptCounts[i]} RDV</p>
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div ref={gridRef} className="flex-1 overflow-y-auto" style={{ background: "#F8F7F4" }}>
          <div style={{ display: "grid", gridTemplateColumns: "48px repeat(5, 1fr)", position: "relative" }}>
            {hours.map((hour) => (
              <div key={hour} style={{ display: "contents" }}>
                <div style={{ height: CELL_H }} className="flex items-start justify-end pr-2 pt-1">
                  <span className="text-[10px] text-[#94A3B8] font-medium tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>{hour}h</span>
                </div>
                {weekDates.map((d, dayIdx) => {
                  const slot = TIME_SLOTS.find((s) => s.dayOfWeek === dayIdx && hour >= s.startHour && hour < s.endHour);
                  const isOpen = !!slot && !(hour >= OPEN_HOURS.lunchStart && hour < OPEN_HOURS.lunchEnd);
                  const cabinet = slot ? LOCATIONS.find((l) => l.id === slot.locationId) : null;
                  return (
                    <div
                      key={`${hour}-${dayIdx}`}
                      style={{ height: CELL_H, borderBottom: "1px solid #EEECE8", borderRight: "1px solid #EEECE8" }}
                      className={cn("transition-colors relative", isOpen ? "bg-white hover:bg-[#FAFAF8]" : "bg-[#F8F7F4]", dragId ? "cursor-crosshair" : isOpen ? "cursor-pointer" : "")}
                      onClick={() => isOpen && !dragId && setCreateSlot({ day: dayIdx, hour })}
                      onDragOver={(e) => { if (isOpen) e.preventDefault(); }}
                      onDrop={() => isOpen && handleDrop(dayIdx, hour)}
                    />
                  );
                })}
              </div>
            ))}

            {/* Now line */}
            {weekDates.some((d) => isSameDay(d, now)) && now.getHours() >= OPEN_HOURS.start && now.getHours() < OPEN_HOURS.end && (
              <div className="absolute left-[48px] right-0 z-20 pointer-events-none" style={{ top: `${(now.getHours() - OPEN_HOURS.start + now.getMinutes() / 60) * CELL_H}px` }}>
                <div className="relative flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#DC2626] -ml-1" /><div className="flex-1 h-[2px] bg-[#DC2626]" /></div>
              </div>
            )}

            {/* Appointment blocks */}
            {filteredApts.filter((a) => a.status !== "CANCELLED").map((apt) => {
              const ad = new Date(apt.startTime);
              const dayIdx = weekDates.findIndex((d) => isSameDay(d, ad));
              if (dayIdx < 0) return null;
              const startH = ad.getHours() + ad.getMinutes() / 60;
              const durH = apt.consultationType.duration / 60;
              const top = (startH - OPEN_HOURS.start) * CELL_H;
              const height = Math.max(durH * CELL_H - 2, 28);
              const isSelected = selectedApt?.id === apt.id;
              return (
                <div
                  key={apt.id}
                  draggable
                  onDragStart={() => setDragId(apt.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); }}
                  className={cn(
                    "absolute rounded-lg px-2.5 py-1.5 cursor-grab overflow-hidden z-10 transition-all duration-150",
                    "hover:-translate-y-px hover:shadow-md",
                    isSelected ? "ring-2 ring-[#4F46E5] shadow-lg" : "",
                    dragId === apt.id ? "opacity-50 cursor-grabbing" : ""
                  )}
                  style={{
                    backgroundColor: apt.consultationType.bgColor,
                    borderLeft: `3px solid ${apt.location.color}`,
                    color: apt.consultationType.textColor === "#FFFFFF" ? apt.consultationType.textColor : "#1C1C1E",
                    top: `${top}px`, height: `${height}px`,
                    left: `calc(48px + ${dayIdx} * ((100% - 48px) / 5) + 2px)`,
                    width: `calc((100% - 48px) / 5 - 4px)`,
                  }}
                >
                  <p className="text-[12px] font-semibold truncate" style={{ fontFamily: "var(--font-jakarta)" }}>{apt.patient.firstName} {apt.patient.lastName}</p>
                  {height > 35 && <p className="text-[10px] truncate opacity-70">{apt.consultationType.name} · {apt.consultationType.duration}min</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Panel détail RDV ── */}
      <AnimatePresence>
        {selectedApt && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/10 z-40" onClick={() => setSelectedApt(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-[#E8ECF4]">
              <RdvDetailPanel apt={selectedApt} onClose={() => setSelectedApt(null)} onStatusChange={(s) => { setAppointments((p) => p.map((a) => a.id === selectedApt.id ? { ...a, status: s } : a)); setSelectedApt((p) => p ? { ...p, status: s } : null); toast.success(`Statut : ${STATUS_LABEL[s]}`); }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modal création ── */}
      <AnimatePresence>
        {createSlot && (
          <CreateModal day={weekDates[createSlot.day]} hour={createSlot.hour} onClose={() => setCreateSlot(null)} onCreate={handleCreateApt} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RDV DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function RdvDetailPanel({ apt, onClose, onStatusChange }: { apt: Appointment; onClose: () => void; onStatusChange: (s: Appointment["status"]) => void }) {
  const patientName = `${apt.patient.firstName} ${apt.patient.lastName}`;
  const detail = PATIENT_DETAILS[patientName] ?? { age: 30, dob: "01/01/1995", phone: "06 00 00 00 00", email: "patient@email.com", motif: apt.consultationType.name, resumeIA: "Aucun résumé disponible.", history: [], nextRdv: null };
  const st = STATUS_STYLE[apt.status] ?? STATUS_STYLE.CONFIRMED;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#E8ECF4]">
        <p className="text-[13px] font-semibold text-[#0F172A]">Détail du rendez-vous</p>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: apt.location.color }}>
            {apt.patient.firstName[0]}{apt.patient.lastName[0]}
          </div>
          <div>
            <p className="text-[17px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>{patientName}</p>
            <p className="text-[12px] text-[#64748B]">{detail.age} ans · {detail.dob}</p>
          </div>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto", st)}>{STATUS_LABEL[apt.status]}</span>
        </div>

        <div className="space-y-1.5 text-[12px] text-[#475569]">
          <p className="flex items-center gap-2"><Phone size={12} className="text-[#94A3B8]" /> {detail.phone}</p>
          <p className="flex items-center gap-2"><Mail size={12} className="text-[#94A3B8]" /> {detail.email}</p>
        </div>

        {/* Consultation */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>RENDEZ-VOUS</p>
          <div className="bg-[#F8F7F4] rounded-xl p-4 space-y-2 text-[13px] text-[#374151]">
            <p className="flex items-center gap-2"><Calendar size={13} className="text-[#94A3B8]" /> {formatTime(apt.startTime)} → {formatTime(apt.endTime)} · {apt.consultationType.duration}min</p>
            <p className="flex items-center gap-2">{apt.location.type === "TELECONSULT" ? <Video size={13} className="text-[#94A3B8]" /> : <MapPin size={13} className="text-[#94A3B8]" />} {apt.location.name}</p>
            <p className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: apt.location.color }} /> {apt.consultationType.name}</p>
          </div>
        </div>

        {/* Motif */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>MOTIF</p>
          <p className="text-[13px] text-[#374151] italic leading-relaxed">{detail.motif}</p>
        </div>

        {/* AI Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>RÉSUMÉ PATIENT</p>
            <span className="text-[9px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Sparkles size={8} /> IA</span>
          </div>
          <div className="bg-[#F5F0E8] rounded-xl p-4">
            <p className="text-[13px] text-[#374151] leading-relaxed">{detail.resumeIA}</p>
          </div>
          <Link href="/patients" className="text-[12px] font-medium text-[#4F46E5] hover:underline mt-2 inline-block">Voir fiche complète →</Link>
        </div>

        {/* History */}
        {detail.history.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>CONSULTATIONS RÉCENTES</p>
            <div className="space-y-1.5">
              {detail.history.map((h, i) => (
                <p key={i} className="text-[12px] text-[#64748B]" style={{ fontFamily: "var(--font-inter)" }}>
                  · {h.date} · <span className="text-[#0F172A] font-medium">{h.type}</span> · {h.motif}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Next RDV */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>PROCHAIN RDV</p>
          {detail.nextRdv ? (
            <p className="text-[13px] text-[#374151] font-medium">{detail.nextRdv}</p>
          ) : (
            <div>
              <p className="text-[13px] text-[#94A3B8] italic">Aucun RDV planifié</p>
              <button className="mt-1 text-[12px] font-medium text-[#4F46E5] hover:underline">Planifier →</button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-[#E8ECF4] space-y-2 shrink-0">
        <button onClick={() => toast.info("Démarrage de consultation bientôt disponible")} className="w-full h-10 rounded-xl bg-[#4F46E5] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors">
          Démarrer la consultation
        </button>
        <div className="flex gap-2">
          <button onClick={() => toast.info("Messagerie bientôt disponible")} className="flex-1 h-9 rounded-xl bg-[#F1F5F9] text-[#64748B] text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-[#E8ECF4] transition-colors">
            Envoyer un message
          </button>
          {["CONFIRMED", "PENDING"].includes(apt.status) && (
            <button onClick={() => onStatusChange("CANCELLED")} className="h-9 px-4 rounded-xl bg-[#FBE9E7] text-[#C62828] text-[13px] font-medium flex items-center gap-1.5 hover:bg-[#FECACA] transition-colors">
              <XCircle size={13} /> Annuler
            </button>
          )}
        </div>
      </div>
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
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setVm(new Date(y, m - 1, 1))} className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"><ChevronLeft size={14} /></button>
        <p className="text-[13px] font-semibold text-[#0F172A] capitalize" style={{ fontFamily: "var(--font-jakarta)" }}>{MONTHS_FR[m]} {y}</p>
        <button onClick={() => setVm(new Date(y, m + 1, 1))} className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i} className="text-[9px] font-medium text-[#94A3B8] py-0.5">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(y, m, day);
          const isT = isSameDay(date, today);
          const isW = date >= currentMonday && date < new Date(currentMonday.getTime() + 5 * 86400000);
          return <button key={i} onClick={() => onSelectWeek(date)} className={cn("w-6 h-6 rounded-md text-[11px] font-medium transition-colors", isT ? "bg-[#4F46E5] text-white" : isW ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#374151] hover:bg-[#F1F5F9]")}>{day}</button>;
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function CreateModal({ day, hour, onClose, onCreate }: { day: Date; hour: number; onClose: () => void; onCreate: (p: string, t: string, l: string) => void }) {
  const [patient, setPatient] = useState("");
  const [typeId, setTypeId] = useState(CONSULTATION_TYPES[1].id);
  const [locationId, setLocationId] = useState(LOCATIONS[0].id);
  const [motif, setMotif] = useState("");
  const [origine, setOrigine] = useState<"direct" | "annuaire" | "adresse">("direct");
  const DAYS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/20 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-[480px] mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E8ECF4]">
          <h3 className="text-[16px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Nouveau RDV</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"><X size={16} /></button>
        </div>
        <div className="px-6 pb-2 pt-3">
          <div className="bg-[#EEF2FF] rounded-lg px-4 py-2 text-[13px] text-[#4F46E5] font-medium flex items-center gap-2">
            <Calendar size={14} /> {DAYS_FULL[(day.getDay() + 6) % 7]} {day.getDate()} {MONTHS_FR[day.getMonth()]} · {hour}h00
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Patient</label>
            <input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Nom du patient" autoFocus className="w-full h-10 mt-1.5 rounded-lg bg-[#F8F7F4] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 border border-[#EEECE8]" />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Type</label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {CONSULTATION_TYPES.slice(0, 3).map((ct) => (
                <button key={ct.id} onClick={() => setTypeId(ct.id)} className={cn("py-2.5 rounded-lg text-[12px] font-medium transition-all border text-center", typeId === ct.id ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#EEECE8] text-[#64748B] hover:border-[#94A3B8]")}>
                  {ct.name.split(" ")[0] === "Première" ? "1ère" : ct.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Format</label>
            <div className="flex gap-2 mt-1.5">
              {LOCATIONS.slice(0, 2).map((l) => (
                <button key={l.id} onClick={() => setLocationId(l.id)} className={cn("flex-1 py-2 rounded-lg text-[12px] font-medium transition-all border text-center flex items-center justify-center gap-1.5", locationId === l.id ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#EEECE8] text-[#64748B]")}>
                  <MapPin size={12} /> {l.name.replace("Cabinet ", "")}
                </button>
              ))}
              <button onClick={() => setLocationId("loc-3")} className={cn("flex-1 py-2 rounded-lg text-[12px] font-medium transition-all border text-center flex items-center justify-center gap-1.5", locationId === "loc-3" ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#EEECE8] text-[#64748B]")}>
                <Video size={12} /> Visio
              </button>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Motif</label>
            <textarea value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif de la consultation…" rows={2} className="w-full mt-1.5 rounded-lg bg-[#F8F7F4] p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 border border-[#EEECE8]" />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Origine</label>
            <div className="flex gap-2 mt-1.5">
              {([["direct", "Direct"], ["annuaire", "Annuaire"], ["adresse", "Adressé"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setOrigine(k)} className={cn("flex-1 py-2 rounded-lg text-[12px] font-medium transition-all border", origine === k ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#EEECE8] text-[#64748B]")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E8ECF4] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] text-[#64748B] hover:bg-[#F1F5F9]">Annuler</button>
          <button onClick={() => { if (patient.trim()) onCreate(patient.trim(), typeId, locationId); }} disabled={!patient.trim()} className={cn("px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors", patient.trim() ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]" : "bg-[#E8ECF4] text-[#94A3B8] cursor-not-allowed")}>
            Confirmer le RDV
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
