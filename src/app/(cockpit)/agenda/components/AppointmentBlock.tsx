"use client"

import { format, parseISO } from "date-fns"
import type { AgendaAppointment } from "../hooks/useAgenda"

interface Props {
  apt: AgendaAppointment
  style: { top: number; height: number }
  colorClass: string
  locationColor?: string | null
  locationName?: string | null
  onClick: () => void
}

export function AppointmentBlock({ apt, style, colorClass, locationColor, locationName, onClick }: Props) {
  const name = `${apt.patient.firstName} ${apt.patient.lastName}`
  const time = format(parseISO(apt.startAt), "HH:mm")
  const showType = style.height >= 40
  const showLocation = style.height >= 55 && locationName

  // If locationColor is set, use inline styles instead of Tailwind classes
  const inlineStyle: React.CSSProperties = {
    top: style.top,
    height: style.height,
    ...(locationColor && !colorClass ? {
      backgroundColor: `${locationColor}18`,
      borderColor: locationColor,
      color: locationColor,
    } : {}),
  }

  return (
    <button
      onClick={onClick}
      className={`absolute left-1 right-1 rounded border-l-2 px-1.5 py-0.5 text-left overflow-hidden cursor-pointer transition-opacity hover:opacity-80 ${colorClass}`}
      style={inlineStyle}
    >
      <p className="text-[11px] font-semibold truncate leading-tight">{name}</p>
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
    </button>
  )
}
