"use client";

import { useState, useMemo } from "react";
import { useQueries, useQueryClient, useMutation } from "@tanstack/react-query";
import { secretaryApi, type SecretaryAppointment, type SecretaryAgendasResponse } from "@/lib/api";
import { addDays, format, parseISO, isToday, set } from "date-fns";
import { toast } from "sonner";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  ApptDetailModal,
  STATUS_CONFIG,
  isConsultationLifecycleStatus,
  SLOT_HEIGHT,
  DAY_START,
  DAY_END,
  apptToStyle,
} from "./DayAgendaView";
import { getStatusStyle } from "@/lib/design-tokens";

interface WeekAgendaViewProps {
  weekStart: Date;
  api: ReturnType<typeof secretaryApi>;
  accessToken: string | null;
  onRefresh: () => void;
}

interface AggregatedAppt {
  appt: SecretaryAppointment;
  providerName: string;
  providerInitials: string;
}

function providerInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type DragData = {
  apptId: string;
  startAt: string;
  endAt: string;
  sourceDayIdx: number;
};

export function WeekAgendaView({ weekStart, api, accessToken, onRefresh }: WeekAgendaViewProps) {
  const [selectedAppt, setSelectedAppt] = useState<SecretaryAppointment | null>(null);
  const [dragOverDayIdx, setDragOverDayIdx] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const queries = useQueries({
    queries: days.map((day) => ({
      queryKey: ["secretary-agendas", format(day, "yyyy-MM-dd")],
      queryFn: () => api.getAgendas(format(day, "yyyy-MM-dd")),
      enabled: !!accessToken,
      refetchInterval: 60_000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const hasError = queries.some((q) => q.isError);

  const rescheduleMut = useMutation({
    mutationFn: ({ id, startAt, endAt }: { id: string; startAt: string; endAt: string }) =>
      api.updateAppointment(id, { startAt, endAt }),
    onSuccess: () => {
      toast.success("RDV déplacé");
      queryClient.invalidateQueries({ queryKey: ["secretary-agendas"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur lors du déplacement du RDV"),
  });

  function handleDrop(e: React.DragEvent<HTMLDivElement>, targetDayIdx: number) {
    e.preventDefault();
    setDragOverDayIdx(null);
    try {
      const data: DragData = JSON.parse(e.dataTransfer.getData("application/json"));
      const targetDay = days[targetDayIdx];
      const originalStart = parseISO(data.startAt);
      const originalEnd = parseISO(data.endAt);
      const durationMin = (originalEnd.getTime() - originalStart.getTime()) / 60_000;

      // Derive drop time from Y position within the grid drop target
      const rect = e.currentTarget.getBoundingClientRect();
      const rawMin = ((e.clientY - rect.top) / SLOT_HEIGHT) * 60 + DAY_START * 60;
      const snappedMin = Math.round(rawMin / 15) * 15;
      const clampedMin = Math.max(DAY_START * 60, Math.min(DAY_END * 60 - durationMin, snappedMin));

      const newStart = set(targetDay, {
        hours: Math.floor(clampedMin / 60),
        minutes: clampedMin % 60,
        seconds: 0,
        milliseconds: 0,
      });
      const newEnd = new Date(newStart.getTime() + durationMin * 60_000);
      rescheduleMut.mutate({
        id: data.apptId,
        startAt: newStart.toISOString(),
        endAt: newEnd.toISOString(),
      });
    } catch {
      // ignore malformed drag data
    }
  }

  // Agrégation par jour : tous les RDV de tous les soignants triés par heure
  const apptsByDay: AggregatedAppt[][] = days.map((_day, idx) => {
    const data = queries[idx]?.data as SecretaryAgendasResponse | undefined;
    if (!data) return [];
    const list: AggregatedAppt[] = [];
    for (const agenda of data.agendas) {
      for (const appt of agenda.appointments) {
        list.push({
          appt,
          providerName: agenda.providerName,
          providerInitials: providerInitials(agenda.providerName),
        });
      }
    }
    list.sort((a, b) => a.appt.startAt.localeCompare(b.appt.startAt));
    return list;
  });

  const totalRows = DAY_END - DAY_START;

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* Sticky header row: time spacer + 7 day labels */}
      <div className="sticky top-0 z-20 flex bg-white border-b border-[#E8ECF4]">
        <div className="w-10 shrink-0" />
        <div className="flex-1 grid grid-cols-7 min-w-[630px]">
          {days.map((day, idx) => {
            const today = isToday(day);
            const dayAppts = apptsByDay[idx];
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "px-2 py-1.5 border-l border-[#E8ECF4] first:border-l-0",
                  today ? "bg-[#EEEDFB]" : "bg-white",
                )}
              >
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                  {format(day, "EEE", { locale: fr })}
                </p>
                <p
                  className={cn(
                    "text-[14px] font-semibold leading-tight",
                    today ? "text-[#5B4EC4]" : "text-[#1A1A2E]",
                  )}
                >
                  {format(day, "d MMM", { locale: fr })}
                </p>
                {dayAppts.length > 0 && (
                  <p className="text-[9px] text-[#6B7280]">{dayAppts.length} RDV</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Body: time axis + day columns */}
      <div className="flex min-w-[670px]">
        {/* Time axis */}
        <div
          className="w-10 shrink-0 border-r border-[#E8ECF4] relative"
          style={{ height: totalRows * SLOT_HEIGHT }}
        >
          {Array.from({ length: totalRows }, (_, i) => (
            <div
              key={i}
              className="absolute right-1 text-[9px] text-[#6B7280] select-none"
              style={{ top: i * SLOT_HEIGHT - 6 }}
            >
              {String(i + DAY_START).padStart(2, "0")}h
            </div>
          ))}
        </div>

        {/* 7 day columns */}
        <div
          className="flex-1 grid grid-cols-7 relative"
          style={{ height: totalRows * SLOT_HEIGHT }}
        >
          {/* Horizontal hour lines spanning all columns */}
          {Array.from({ length: totalRows }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-[#E8ECF4] pointer-events-none"
              style={{ top: i * SLOT_HEIGHT }}
            />
          ))}

          {days.map((day, idx) => {
            const isDragOver = dragOverDayIdx === idx;
            const dayAppts = apptsByDay[idx];
            return (
              <div
                key={day.toISOString()}
                className="relative border-l border-[#E8ECF4] first:border-l-0"
                style={isDragOver ? { backgroundColor: "rgba(91,78,196,0.05)" } : undefined}
                onDragOver={(e) => { e.preventDefault(); setDragOverDayIdx(idx); }}
                onDragLeave={() => setDragOverDayIdx(null)}
                onDrop={(e) => handleDrop(e, idx)}
              >
                {queries[idx]?.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-[#6B7280]">…</span>
                  </div>
                )}
                {queries[idx]?.isError && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-red-400">Erreur</span>
                  </div>
                )}
                {dayAppts.map(({ appt, providerInitials: initials }) => {
                  const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.PENDING;
                  const sStyle = getStatusStyle(appt.status);
                  const start = parseISO(appt.startAt);
                  const { top, height } = apptToStyle(appt);
                  return (
                    <button
                      key={appt.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({
                            apptId: appt.id,
                            startAt: appt.startAt,
                            endAt: appt.endAt,
                            sourceDayIdx: idx,
                          } satisfies DragData),
                        );
                      }}
                      onClick={() => setSelectedAppt(appt)}
                      className="absolute left-0.5 right-0.5 rounded border px-1 py-0.5 text-left cursor-grab hover:shadow-md transition-shadow overflow-hidden z-10"
                      style={{
                        top: top + 1,
                        height: Math.max(height - 2, 18),
                        backgroundColor: sStyle.bg,
                        borderColor: appt.status === "IN_PROGRESS" ? "var(--nami-primary)" : sStyle.border,
                      }}
                    >
                      <p className="text-[9px] font-semibold truncate leading-tight" style={{ color: sStyle.color }}>
                        {format(start, "HH:mm")}
                        {height > 20 && (
                          <span className="font-normal opacity-60 ml-1">{initials}</span>
                        )}
                      </p>
                      {appt.patient && height > 28 && (
                        <p className="text-[9px] truncate leading-tight" style={{ color: sStyle.color }}>
                          {appt.patient.firstName} {appt.patient.lastName}
                        </p>
                      )}
                      {isConsultationLifecycleStatus(appt.status) && height > 42 && (
                        <span
                          data-testid="consultation-lifecycle-pill"
                          className="inline-block text-[7px] font-semibold uppercase tracking-wider px-0.5 rounded"
                          style={{ color: sStyle.color }}
                        >
                          {cfg.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {hasError && !isLoading && (
        <p className="text-[10px] text-red-600 text-center py-2">
          Une partie de la semaine n'a pas pu être chargée
        </p>
      )}

      {selectedAppt && (
        <ApptDetailModal
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onRefresh={onRefresh}
          api={api}
        />
      )}
    </div>
  );
}
