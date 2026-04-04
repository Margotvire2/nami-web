"use client";

import { useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { Appointment } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  CalendarDays, Clock, MapPin, Video, Phone,
  CheckCircle2, XCircle, AlertTriangle, User,
} from "lucide-react";

// ─── Constantes ──────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING:   { label: "En attente",  icon: <Clock size={12} />,          className: "text-amber-600 bg-amber-50 border-amber-200" },
  CONFIRMED: { label: "Confirmé",   icon: <CheckCircle2 size={12} />,   className: "text-blue-600 bg-blue-50 border-blue-200" },
  COMPLETED: { label: "Terminé",    icon: <CheckCircle2 size={12} />,   className: "text-green-600 bg-green-50 border-green-200" },
  CANCELLED: { label: "Annulé",     icon: <XCircle size={12} />,        className: "text-red-500 bg-red-50 border-red-200" },
  NO_SHOW:   { label: "Absent",     icon: <AlertTriangle size={12} />,  className: "text-red-600 bg-red-50 border-red-200" },
};

const LOCATION_META: Record<string, { label: string; icon: React.ReactNode }> = {
  IN_PERSON: { label: "Présentiel", icon: <MapPin size={12} /> },
  VIDEO:     { label: "Visio",      icon: <Video size={12} /> },
  PHONE:     { label: "Téléphone",  icon: <Phone size={12} /> },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dayKey(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isFuture(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}

function groupByDay(appointments: Appointment[]): { day: string; dateRef: string; appointments: Appointment[] }[] {
  const map = new Map<string, { dateRef: string; appointments: Appointment[] }>();
  for (const a of appointments) {
    const key = dayKey(a.startAt);
    if (!map.has(key)) map.set(key, { dateRef: a.startAt, appointments: [] });
    map.get(key)!.appointments.push(a);
  }
  return Array.from(map.entries()).map(([day, { dateRef, appointments }]) => ({
    day,
    dateRef,
    appointments: appointments.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
  }));
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const { data, isLoading } = useAppointments();
  const appointments = data ?? [];

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const up = appointments.filter((a) => new Date(a.startAt) >= new Date(now.toDateString()) && a.status !== "CANCELLED");
    const pa = appointments.filter((a) => new Date(a.startAt) < new Date(now.toDateString()) || a.status === "CANCELLED");
    return { upcoming: up, past: pa };
  }, [appointments]);

  const upcomingDays = useMemo(() => groupByDay(upcoming), [upcoming]);
  const pastDays = useMemo(() => groupByDay(past).reverse(), [past]);

  // Stats rapides
  const todayCount = appointments.filter((a) => isToday(a.startAt) && a.status !== "CANCELLED").length;
  const weekCount = upcoming.length;
  const pendingCount = appointments.filter((a) => a.status === "PENDING" && isFuture(a.startAt)).length;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold flex items-center gap-2">
              <CalendarDays size={16} /> Agenda
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vos consultations et rendez-vous
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="border-b bg-card px-6 py-2.5 shrink-0">
        <div className="flex items-center gap-6 text-[11px]">
          <span className="text-muted-foreground">Aujourd'hui : <strong className="text-foreground">{todayCount}</strong></span>
          <span className="text-muted-foreground">À venir : <strong className="text-foreground">{weekCount}</strong></span>
          {pendingCount > 0 && (
            <span className="text-amber-600 font-medium">{pendingCount} en attente de confirmation</span>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <CalendarDays size={28} className="text-muted-foreground/25 mb-3" />
            <p className="text-sm text-muted-foreground">Aucun rendez-vous.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-8">
            {/* À venir */}
            {upcomingDays.length > 0 && (
              <div className="space-y-5">
                {upcomingDays.map(({ day, dateRef, appointments: dayAppts }) => (
                  <DayGroup key={day} day={day} dateRef={dateRef} appointments={dayAppts} />
                ))}
              </div>
            )}

            {/* Passés */}
            {pastDays.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-3">Passés</p>
                <div className="space-y-5 opacity-60">
                  {pastDays.map(({ day, dateRef, appointments: dayAppts }) => (
                    <DayGroup key={day} day={day} dateRef={dateRef} appointments={dayAppts} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Groupe jour ─────────────────────────────────────────────────────────────

function DayGroup({ day, dateRef, appointments }: {
  day: string; dateRef: string; appointments: Appointment[];
}) {
  const today = isToday(dateRef);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className={`text-xs font-semibold capitalize ${today ? "text-primary" : "text-foreground"}`}>
          {today ? "Aujourd'hui" : day}
        </p>
        {today && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        <span className="text-[10px] text-muted-foreground">{appointments.length} RDV</span>
      </div>
      <div className="space-y-2">
        {appointments.map((a) => <AppointmentCard key={a.id} appointment={a} />)}
      </div>
    </div>
  );
}

// ─── Carte RDV ───────────────────────────────────────────────────────────────

function AppointmentCard({ appointment: a }: { appointment: Appointment }) {
  const start = new Date(a.startAt);
  const end = new Date(a.endAt);
  const statusMeta = STATUS_META[a.status] ?? STATUS_META.PENDING;
  const locMeta = LOCATION_META[a.locationType] ?? LOCATION_META.IN_PERSON;
  const isPast = new Date(a.startAt) < new Date();

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-start gap-4 ${
      isPast && a.status !== "COMPLETED" ? "opacity-50" : ""
    }`}>
      {/* Heure */}
      <div className="text-center min-w-[52px] shrink-0">
        <p className="text-lg font-bold tabular-nums leading-none">
          {start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 ${statusMeta.className}`}>
            {statusMeta.icon} {statusMeta.label}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            {locMeta.icon} {locMeta.label}
          </span>
          {a.isFirstConsultation && (
            <span className="text-[10px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5">1re consultation</span>
          )}
        </div>

        {/* Patient */}
        <Link href={`/patients/${a.careCaseId ?? ""}`} className="group">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {a.patient.firstName[0]}{a.patient.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {a.patient.firstName} {a.patient.lastName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {a.consultationType?.name ?? "Consultation"} · {a.provider.person.firstName} {a.provider.person.lastName}
              </p>
            </div>
          </div>
        </Link>

        {/* Notes */}
        {a.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-1 italic">{a.notes}</p>
        )}
      </div>
    </div>
  );
}
