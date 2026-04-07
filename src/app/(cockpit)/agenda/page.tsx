"use client"

import { useState, useMemo } from "react"
import { isSameDay, parseISO, format } from "date-fns"
import { useAgenda, type AgendaAppointment, type ViewMode } from "./hooks/useAgenda"
import { AgendaHeader } from "./components/AgendaHeader"
import { WeekGrid } from "./components/WeekGrid"
import { AppointmentDrawer } from "./components/AppointmentDrawer"
import { AgendaSetup } from "./components/AgendaSetup"
import { AgendaSettings } from "./components/AgendaSettings"
import { CalendarDays, Clock, Settings, LayoutList, Columns3, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import Link from "next/link"

export default function AgendaPage() {
  const agenda = useAgenda()
  const [selected, setSelected] = useState<AgendaAppointment | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const { data: agendaSettings } = useQuery({
    queryKey: ["agenda-settings"],
    queryFn: () => api.agendaSettings.get(),
    enabled: !!accessToken,
  })

  const today = new Date()
  const todayAppts = useMemo(
    () => agenda.appointments
      .filter((a) => isSameDay(parseISO(a.startAt), today) && a.status !== "CANCELLED")
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [agenda.appointments]
  )
  const nextAppt = todayAppts.find((a) => new Date(a.startAt) > today)

  // Détection setup : si agendaConfiguredAt est null → wizard
  const needsSetup = !agenda.isLoading && agendaSettings !== undefined && !agendaSettings.isConfigured

  if (needsSetup) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <AgendaSetup onComplete={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Config banner */}
      {agendaSettings && !agendaSettings.isConfigured && (
        <Link href="/agenda/parametrage" className="bg-primary/5 border-b border-primary/10 px-6 py-2.5 flex items-center gap-2 text-xs text-primary hover:bg-primary/10 transition-colors shrink-0">
          <AlertCircle size={14} />
          <span className="font-medium">Configurez votre agenda pour commencer</span>
          <span className="ml-auto text-primary/70">Configurer maintenant →</span>
        </Link>
      )}

      {/* Header */}
      <div className="bg-card border-b px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarDays size={16} /> Agenda
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Vos rendez-vous de la semaine</p>
          </div>
          <div className="flex items-center gap-3">
            {todayAppts.length > 0 ? (
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">
                  {todayAppts.length} RDV aujourd&apos;hui
                </p>
                {nextAppt && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock size={10} />
                    Prochain : {format(parseISO(nextAppt.startAt), "HH:mm")} — {nextAppt.patient.firstName} {nextAppt.patient.lastName}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Aucun rendez-vous aujourd&apos;hui</p>
            )}

            {/* View mode toggle */}
            <div className="flex bg-muted/50 rounded-lg p-0.5">
              <button
                onClick={() => agenda.setViewMode("day")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all",
                  agenda.viewMode === "day"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Ma journée"
              >
                <LayoutList size={11} /> Ma journée
              </button>
              <button
                onClick={() => agenda.setViewMode("location")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all",
                  agenda.viewMode === "location"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Par lieu"
              >
                <Columns3 size={11} /> Par lieu
              </button>
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Paramétrage de l'agenda"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-6">
        <AgendaHeader
          from={agenda.from}
          to={agenda.to}
          onPrev={agenda.prevWeek}
          onNext={agenda.nextWeek}
          onToday={agenda.goToday}
          onNewAppointment={() => {/* TODO */}}
        />

        {agenda.isLoading && (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Chargement...
          </div>
        )}

        {agenda.isError && (
          <div className="flex-1 flex items-center justify-center text-xs text-destructive">
            Erreur de chargement
          </div>
        )}

        {!agenda.isLoading && !agenda.isError && agenda.appointments.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <CalendarDays size={28} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Aucun rendez-vous cette semaine</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              Les rendez-vous planifiés avec vos patients apparaîtront ici.
            </p>
          </div>
        )}

        {!agenda.isLoading && !agenda.isError && agenda.appointments.length > 0 && (
          <div className="flex-1 overflow-auto">
            <WeekGrid
              from={agenda.from}
              appointments={agenda.appointments}
              slots={agenda.slots}
              locations={agenda.locations}
              viewMode={agenda.viewMode}
              onSelect={setSelected}
            />
          </div>
        )}
      </div>

      <AppointmentDrawer
        apt={selected}
        onClose={() => setSelected(null)}
        onPatch={async (id, data) => {
          await agenda.patchAppointment({ id, ...data })
          setSelected(null)
        }}
        isPatching={agenda.isPatching}
      />

      <AgendaSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
