"use client";

import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { secretaryApi, type SecretaryAppointment, type SecretaryAgendasResponse } from "@/lib/api";
import { addDays, format, parseISO, isToday, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  ApptDetailModal,
  STATUS_CONFIG,
  isConsultationLifecycleStatus,
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

export function WeekAgendaView({ weekStart, api, accessToken, onRefresh }: WeekAgendaViewProps) {
  const [selectedAppt, setSelectedAppt] = useState<SecretaryAppointment | null>(null);

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

  return (
    <div className="flex-1 overflow-auto bg-[#F5F3EF]">
      <div className="grid grid-cols-7 gap-px bg-[#E8ECF4] min-w-[840px]">
        {days.map((day, idx) => {
          const dayAppts = apptsByDay[idx];
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="bg-white min-h-[400px] flex flex-col">
              {/* Header jour */}
              <div
                className={cn(
                  "sticky top-0 z-10 px-3 py-2 border-b border-[#E8ECF4]",
                  today ? "bg-[#EEEDFB]" : "bg-white",
                )}
              >
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                  {format(day, "EEE", { locale: fr })}
                </p>
                <p
                  className={cn(
                    "text-[15px] font-semibold leading-tight",
                    today ? "text-[#5B4EC4]" : "text-[#1A1A2E]",
                  )}
                >
                  {format(day, "d MMM", { locale: fr })}
                </p>
                {dayAppts.length > 0 && (
                  <p className="text-[9px] text-[#6B7280] mt-0.5">
                    {dayAppts.length} RDV
                  </p>
                )}
              </div>

              {/* Liste RDV compacte */}
              <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
                {queries[idx]?.isLoading ? (
                  <p className="text-[10px] text-[#6B7280] italic text-center py-4">
                    Chargement…
                  </p>
                ) : queries[idx]?.isError ? (
                  <p className="text-[10px] text-red-600 italic text-center py-4">
                    Erreur
                  </p>
                ) : dayAppts.length === 0 ? (
                  <p className="text-[10px] text-[#6B7280] italic text-center py-4">
                    Aucun RDV
                  </p>
                ) : (
                  dayAppts.map(({ appt, providerInitials }) => {
                    const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.PENDING;
                    const sStyle = getStatusStyle(appt.status);
                    const start = parseISO(appt.startAt);
                    return (
                      <button
                        key={appt.id}
                        onClick={() => setSelectedAppt(appt)}
                        className="w-full text-left rounded-md border px-2 py-1.5 cursor-pointer hover:shadow-md transition-shadow"
                        style={{
                          backgroundColor: sStyle.bg,
                          borderColor: appt.status === "IN_PROGRESS" ? "var(--nami-primary)" : sStyle.border,
                        }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[10px] font-semibold" style={{ color: sStyle.color }}>
                            {format(start, "HH:mm")}
                          </p>
                          <span
                            className="text-[8px] font-semibold rounded px-1 py-px"
                            style={{ backgroundColor: "var(--nami-primary-light)", color: "var(--nami-primary)" }}
                            title={providerInitials}
                          >
                            {providerInitials}
                          </span>
                        </div>
                        {appt.patient && (
                          <p className="text-[10px] truncate mt-0.5" style={{ color: sStyle.color }}>
                            {appt.patient.firstName} {appt.patient.lastName}
                          </p>
                        )}
                        {isConsultationLifecycleStatus(appt.status) && (
                          <span
                            data-testid="consultation-lifecycle-pill"
                            className="inline-block mt-1 text-[8px] font-semibold uppercase tracking-wider px-1 py-px rounded border"
                            style={{
                              backgroundColor: sStyle.bg,
                              color: sStyle.color,
                              borderColor: sStyle.border,
                            }}
                          >
                            {cfg.label}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
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
