"use client"

import { format, parseISO } from "date-fns"
import type { AgendaAppointment } from "../hooks/useAgenda"

interface Props {
  apt: AgendaAppointment
  style: { top: number; height: number }
  colorClass: string
  locationColor?: string | null
  locationName?: string | null
  cancelled?: boolean
  past?: boolean
  onClick: () => void
}

export function AppointmentBlock({ apt, style, colorClass, locationColor, locationName, cancelled, past, onClick }: Props) {
  const name = `${apt.patient.firstName} ${apt.patient.lastName}`
  const time = format(parseISO(apt.startAt), "HH:mm")
  const showType = style.height >= 40
  const showLocation = style.height >= 55 && locationName

  const accentColor = cancelled ? "#9CA3AF" : (locationColor ?? "#5A47C9")

  const inlineStyle: React.CSSProperties = {
    top: style.top,
    height: style.height,
    background: cancelled
      ? "rgba(243,244,246,0.9)"
      : `linear-gradient(115deg, ${accentColor}22 0%, #FFFFFF 58%)`,
    borderColor: `${accentColor}35`,
    color: cancelled ? "#9CA3AF" : accentColor,
    opacity: past && !cancelled ? 0.55 : 1,
  }

  return (
    <button
      onClick={onClick}
      className="absolute left-1 right-1 rounded-xl border px-1.5 py-0.5 text-left overflow-hidden cursor-pointer transition-all hover:brightness-95 hover:-translate-y-px"
      style={inlineStyle}
    >
      {!cancelled && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}55 100%)`,
            borderRadius: "10px 10px 0 0",
          }}
        />
      )}
      <div style={{ paddingTop: style.height >= 30 && !cancelled ? 4 : 0 }}>
        <p className={`text-[11px] font-semibold truncate leading-tight${cancelled ? " line-through" : ""}`}>{name}</p>
        {showType && (
          <p className="text-[10px] truncate opacity-75">
            {time} · {apt.consultationType?.name ?? "RDV"}
          </p>
        )}
        {showLocation && (
          <p className="text-[9px] truncate opacity-60">
            {locationName}
          </p>
        )}
      </div>
    </button>
  )
}
