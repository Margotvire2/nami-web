"use client"

import { addDays, format, isSameDay, differenceInMinutes, parseISO, startOfDay, getDay } from "date-fns"
import { fr } from "date-fns/locale"
import type { AgendaAppointment, ViewMode } from "../hooks/useAgenda"
import type { AvailabilitySlotDTO, ConsultationLocation } from "@/lib/api"
import { AppointmentBlock } from "./AppointmentBlock"
import { cn } from "@/lib/utils"

const HOUR_START = 8
const HOUR_END = 20
const TOTAL_MINS = (HOUR_END - HOUR_START) * 60
const PX_PER_MIN = 2

const CANCELLED_COLOR = "bg-gray-100 border-gray-300 text-gray-500 line-through"
const DEFAULT_COLOR = "#6366F1" // indigo fallback

interface Props {
  from: Date
  appointments: AgendaAppointment[]
  slots?: AvailabilitySlotDTO[]
  locations?: ConsultationLocation[]
  viewMode: ViewMode
  onSelect: (apt: AgendaAppointment) => void
}

export function WeekGrid({ from, appointments, slots = [], locations = [], viewMode, onSelect }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i))
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
  const gridHeight = TOTAL_MINS * PX_PER_MIN

  // Slot map by weekday
  const slotsByDay = new Map<number, AvailabilitySlotDTO[]>()
  for (const s of slots) {
    if (!s.isActive) continue
    const existing = slotsByDay.get(s.weekday) ?? []
    existing.push(s)
    slotsByDay.set(s.weekday, existing)
  }

  // Location map
  const locationMap = new Map<string, ConsultationLocation>()
  for (const loc of locations) locationMap.set(loc.id, loc)

  return (
    <div className="flex overflow-x-auto border rounded-xl bg-card">
      {/* Time gutter */}
      <div className="w-14 shrink-0 border-r">
        <div className="h-14 border-b" />
        <div className="relative" style={{ height: gridHeight }}>
          {hours.map((h) => (
            <div
              key={h}
              className="absolute w-full text-right pr-2"
              style={{ top: (h - HOUR_START) * 60 * PX_PER_MIN - 7 }}
            >
              <span className="text-[10px] text-muted-foreground">
                {String(h).padStart(2, "0")}h
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day columns */}
      {days.map((day) => {
        const dayApts = appointments.filter((a) => isSameDay(parseISO(a.startAt), day))
        const activeApts = dayApts.filter((a) => a.status !== "CANCELLED")
        const isToday = isSameDay(day, new Date())
        const dayStart = startOfDay(day)
        const weekday = getDay(day)
        const daySlots = slotsByDay.get(weekday) ?? []

        // Fill rate
        const totalSlotMins = daySlots.reduce((sum, s) => {
          const [sh, sm] = s.startTime.split(":").map(Number)
          const [eh, em] = s.endTime.split(":").map(Number)
          return sum + (eh * 60 + em) - (sh * 60 + sm)
        }, 0)
        const totalApptMins = activeApts.reduce((sum, a) =>
          sum + differenceInMinutes(parseISO(a.endAt), parseISO(a.startAt)), 0)
        const fillRate = totalSlotMins > 0 ? Math.min(1, totalApptMins / totalSlotMins) : 0

        // In location mode, split by location
        if (viewMode === "location" && locations.length > 1) {
          return (
            <div key={day.toISOString()} className="flex-1 min-w-[120px] border-r last:border-r-0">
              <DayHeader day={day} isToday={isToday} count={activeApts.length} fillRate={fillRate} totalSlotMins={totalSlotMins} />
              <div className="flex" style={{ height: gridHeight }}>
                {locations.map((loc) => {
                  const locApts = dayApts.filter((a) => a.location?.id === loc.id)
                  return (
                    <div key={loc.id} className="flex-1 relative border-r last:border-r-0 border-dashed border-border/30">
                      {/* Location label */}
                      <div
                        className="absolute top-0 left-0 right-0 text-center py-0.5 text-[8px] font-medium truncate z-10"
                        style={{ color: loc.color ?? DEFAULT_COLOR, backgroundColor: `${loc.color ?? DEFAULT_COLOR}08` }}
                      >
                        {loc.name.length > 12 ? loc.name.slice(0, 12) + "…" : loc.name}
                      </div>
                      <HourLines hours={hours} />
                      {locApts.map((apt) => renderBlock(apt, dayStart, locationMap, onSelect))}
                    </div>
                  )
                })}
                {/* Unassigned */}
                {dayApts.some((a) => !a.location) && (
                  <div className="flex-1 relative border-r last:border-r-0 border-dashed border-border/30">
                    <div className="absolute top-0 left-0 right-0 text-center py-0.5 text-[8px] font-medium text-muted-foreground z-10">
                      —
                    </div>
                    <HourLines hours={hours} />
                    {dayApts.filter((a) => !a.location).map((apt) => renderBlock(apt, dayStart, locationMap, onSelect))}
                  </div>
                )}
              </div>
            </div>
          )
        }

        // Default: "day" mode — single column with location badges
        return (
          <div key={day.toISOString()} className="flex-1 min-w-[120px] border-r last:border-r-0">
            <DayHeader day={day} isToday={isToday} count={activeApts.length} fillRate={fillRate} totalSlotMins={totalSlotMins} />
            <div className="relative" style={{ height: gridHeight }}>
              {/* Slot backgrounds */}
              {daySlots.map((s, idx) => {
                const [sh, sm] = s.startTime.split(":").map(Number)
                const [eh, em] = s.endTime.split(":").map(Number)
                const slotStart = (sh * 60 + sm) - HOUR_START * 60
                const slotEnd = (eh * 60 + em) - HOUR_START * 60
                return (
                  <div
                    key={idx}
                    className="absolute left-0 right-0 bg-primary/[0.03]"
                    style={{ top: Math.max(0, slotStart) * PX_PER_MIN, height: (slotEnd - Math.max(0, slotStart)) * PX_PER_MIN }}
                  />
                )
              })}

              <HourLines hours={hours} />
              <NowLine isToday={isToday} />
              {dayApts.map((apt) => renderBlock(apt, dayStart, locationMap, onSelect))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DayHeader({ day, isToday, count, fillRate, totalSlotMins }: {
  day: Date; isToday: boolean; count: number; fillRate: number; totalSlotMins: number
}) {
  return (
    <div className={cn("h-14 border-b flex flex-col items-center justify-center relative", isToday ? "bg-primary/5" : "")}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {format(day, "EEE", { locale: fr })}
      </span>
      <span className={cn("text-sm font-semibold leading-tight", isToday ? "text-primary" : "text-foreground")}>
        {format(day, "d")}
      </span>
      {count > 0 && <span className="text-[9px] text-muted-foreground">{count} RDV</span>}
      {totalSlotMins > 0 && (
        <div className="absolute bottom-0 left-2 right-2 h-1 bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", fillRate > 0.8 ? "bg-emerald-400" : fillRate > 0.4 ? "bg-primary/60" : "bg-primary/30")}
            style={{ width: `${fillRate * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

function HourLines({ hours }: { hours: number[] }) {
  return (
    <>
      {hours.map((h) => (
        <div key={h} className="absolute w-full border-t border-border/30" style={{ top: (h - HOUR_START) * 60 * PX_PER_MIN }} />
      ))}
    </>
  )
}

function NowLine({ isToday }: { isToday: boolean }) {
  if (!isToday) return null
  const now = new Date()
  const nowMins = (now.getHours() * 60 + now.getMinutes()) - HOUR_START * 60
  if (nowMins < 0 || nowMins > TOTAL_MINS) return null
  return (
    <div className="absolute left-0 right-0 border-t-2 border-primary z-10" style={{ top: nowMins * PX_PER_MIN }}>
      <div className="w-2 h-2 rounded-full bg-primary -translate-y-1 -translate-x-1" />
    </div>
  )
}

function renderBlock(
  apt: AgendaAppointment,
  dayStart: Date,
  locationMap: Map<string, ConsultationLocation>,
  onSelect: (apt: AgendaAppointment) => void,
) {
  const start = parseISO(apt.startAt)
  const end = parseISO(apt.endAt)
  const topMins = differenceInMinutes(start, new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), HOUR_START, 0, 0))
  const durMins = differenceInMinutes(end, start)
  const top = Math.max(0, topMins) * PX_PER_MIN
  const height = Math.max(20, durMins * PX_PER_MIN)

  const isPast = new Date(apt.endAt) < new Date()
  const isCancelled = apt.status === "CANCELLED"

  // Color from location if available, else fallback by locationType
  const loc = apt.location
  const locColor = loc?.color ?? null
  let colorClass: string
  if (isCancelled) {
    colorClass = CANCELLED_COLOR
  } else if (locColor) {
    colorClass = "" // handled via inline style
  } else {
    const fallback: Record<string, string> = {
      IN_PERSON: "bg-indigo-100 border-indigo-400 text-indigo-800",
      VIDEO: "bg-teal-100 border-teal-400 text-teal-800",
      PHONE: "bg-amber-100 border-amber-400 text-amber-800",
    }
    colorClass = fallback[apt.locationType] ?? "bg-gray-100 border-gray-300 text-gray-700"
  }
  if (isPast && !isCancelled) colorClass += " opacity-50"

  return (
    <AppointmentBlock
      key={apt.id}
      apt={apt}
      style={{ top, height }}
      colorClass={colorClass}
      locationColor={locColor}
      locationName={loc?.name ?? null}
      onClick={() => onSelect(apt)}
    />
  )
}
