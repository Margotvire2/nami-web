"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  from: Date
  to: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNewAppointment: () => void
}

export function AgendaHeader({ from, to, onPrev, onNext, onToday, onNewAppointment }: Props) {
  const label = `${format(from, "d MMM", { locale: fr })} – ${format(to, "d MMM yyyy", { locale: fr })}`

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="text-xs h-7" onClick={onToday}>
          Aujourd&apos;hui
        </Button>
        <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <ChevronLeft size={15} />
        </button>
        <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <ChevronRight size={15} />
        </button>
        <span className="text-xs font-medium text-foreground ml-1">{label}</span>
      </div>

      <Button size="sm" className="text-xs gap-1.5 h-7" onClick={onNewAppointment}>
        <Plus size={13} />
        Nouveau RDV
      </Button>
    </div>
  )
}
