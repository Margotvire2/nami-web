"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type Activity } from "@/lib/api"
import { format, parseISO, isPast } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Calendar, Send, CheckCircle2, AlertTriangle, Stethoscope,
  ClipboardList, ChevronDown,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// ─── Config ─────────────────────────────────────────────────────────────────

type Filter = "all" | "appointments" | "referrals" | "alerts"

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Tout" },
  { key: "appointments", label: "RDV" },
  { key: "referrals", label: "Adressages" },
  { key: "alerts", label: "Rappels" },
]

const CLINICAL_TYPES = new Set([
  "APPOINTMENT_CREATED", "APPOINTMENT_COMPLETED", "APPOINTMENT_CANCELLED",
  "REFERRAL_CREATED", "REFERRAL_ACCEPTED", "REFERRAL_DECLINED",
  "ALERT_TRIGGERED", "ALERT_RESOLVED",
  "CARE_CASE_CREATED", "CARE_PLAN_UPDATED",
  "NOTE_ADDED", "TASK_COMPLETED",
])

// Patient journal entries we exclude from clinical timeline
const JOURNAL_TYPES = new Set([
  "MEAL_LOGGED", "EMOTION_LOGGED", "SYMPTOM_LOGGED", "PATIENT_JOURNAL_ENTRY",
])

interface EventConfig {
  icon: typeof Calendar
  color: string
  bgColor: string
  label: string
}

const EVENT_CONFIG: Record<string, EventConfig> = {
  CARE_CASE_CREATED: { icon: ClipboardList, color: "text-indigo-600", bgColor: "bg-indigo-100", label: "Début de suivi" },
  CARE_PLAN_UPDATED: { icon: ClipboardList, color: "text-indigo-600", bgColor: "bg-indigo-100", label: "Plan mis à jour" },
  APPOINTMENT_CREATED: { icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-100", label: "RDV programmé" },
  APPOINTMENT_COMPLETED: { icon: Stethoscope, color: "text-emerald-600", bgColor: "bg-emerald-100", label: "Consultation" },
  APPOINTMENT_CANCELLED: { icon: Calendar, color: "text-muted-foreground", bgColor: "bg-muted", label: "RDV annulé" },
  REFERRAL_CREATED: { icon: Send, color: "text-amber-600", bgColor: "bg-amber-100", label: "Adressage envoyé" },
  REFERRAL_ACCEPTED: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-100", label: "Adressage accepté" },
  REFERRAL_DECLINED: { icon: Send, color: "text-red-600", bgColor: "bg-red-100", label: "Adressage décliné" },
  ALERT_TRIGGERED: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-100", label: "Rappel" },
  ALERT_RESOLVED: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-100", label: "Rappel traité" },
  NOTE_ADDED: { icon: ClipboardList, color: "text-violet-600", bgColor: "bg-violet-100", label: "Note clinique" },
  TASK_COMPLETED: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-100", label: "Tâche complétée" },
}

const DEFAULT_CONFIG: EventConfig = { icon: ClipboardList, color: "text-muted-foreground", bgColor: "bg-muted", label: "Événement" }

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  careCaseId: string
  startDate?: string
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ClinicalTimeline({ careCaseId, startDate }: Props) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const [filter, setFilter] = useState<Filter>("all")
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["timeline", careCaseId, "clinical"],
    queryFn: () => api.careCases.timeline(careCaseId, 1, 100),
  })

  const events = useMemo(() => {
    if (!data?.data) return []

    return (data.data as Activity[])
      .filter((a) => {
        // Exclude patient journal entries
        if (JOURNAL_TYPES.has(a.activityType)) return false
        // Include clinical types + any unknown type
        if (!CLINICAL_TYPES.has(a.activityType) && a.source === "PATIENT") return false

        // Filter
        if (filter === "appointments") return a.activityType.includes("APPOINTMENT")
        if (filter === "referrals") return a.activityType.includes("REFERRAL")
        if (filter === "alerts") return a.activityType.includes("ALERT")
        return true
      })
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  }, [data, filter])

  // Group by month
  const grouped = useMemo(() => {
    const groups: Array<{ month: string; items: Activity[] }> = []
    let currentMonth = ""
    for (const e of events) {
      const m = format(parseISO(e.occurredAt), "MMMM yyyy", { locale: fr })
      if (m !== currentMonth) {
        currentMonth = m
        groups.push({ month: m, items: [] })
      }
      groups[groups.length - 1].items.push(e)
    }
    return groups
  }, [events])

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold">Ligne de vie clinique</h2>
          {startDate && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Depuis le {format(parseISO(startDate), "d MMMM yyyy", { locale: fr })}
            </p>
          )}
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors ${filter === f.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar size={24} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucun événement clinique</p>
        </div>
      )}

      {/* Timeline */}
      {grouped.map((group) => (
        <div key={group.month} className="mb-6">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 capitalize">{group.month}</p>
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

            {group.items.map((event, i) => {
              const config = EVENT_CONFIG[event.activityType] ?? DEFAULT_CONFIG
              const Icon = config.icon
              const isExpanded = expanded === event.id
              const isFuture = !isPast(parseISO(event.occurredAt))
              const payload = ((event as unknown as Record<string, unknown>).payload ?? {}) as Record<string, unknown>

              return (
                <div key={event.id} className={`relative mb-4 ${isFuture ? "opacity-50" : ""}`}>
                  {/* Dot */}
                  <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center ${isFuture ? "border-2 border-dashed border-border bg-card" : ""}`}>
                    <Icon size={12} className={config.color} />
                  </div>

                  {/* Content */}
                  <button onClick={() => setExpanded(isExpanded ? null : event.id)} className="w-full text-left group">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium shrink-0 w-16">
                        {format(parseISO(event.occurredAt), "d MMM", { locale: fr })}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {event.title}
                        </p>
                        {event.summary && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{event.summary}</p>
                        )}
                        {event.person && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {event.person.firstName} {event.person.lastName}
                          </p>
                        )}
                      </div>
                      <ChevronDown size={12} className={`text-muted-foreground/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-2 ml-[72px] bg-muted/30 rounded-lg p-3 text-[11px] text-muted-foreground leading-relaxed">
                        {event.summary && <p>{event.summary}</p>}
                        {!!payload.noteId && <p className="mt-1 text-primary">Voir la note clinique →</p>}
                        {!!payload.referralId && <p className="mt-1">Adressage #{String(payload.referralId).slice(0, 8)}</p>}
                        {!event.summary && !payload.noteId && <p>Aucun détail supplémentaire</p>}
                      </div>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
