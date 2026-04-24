"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type Activity, type CareCaseMember } from "@/lib/api"
import { format, isToday, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

// ─── Profession → color ───────────────────────────────────────────────────────

const PROFESSION_RULES: [string[], string][] = [
  [["généraliste", "générale", "médecin traitant", "mt"], "#4A90D9"],
  [["diétét", "nutrition", "diét"],                       "#2BA89C"],
  [["psycholog", "psychothérap", "psy "],                 "#5B4EC4"],
  [["psychiatr"],                                          "#7B6FD4"],
  [["biolog", "labo"],                                     "#6B7280"],
  [["activité physique", "apa", "kinésith", "kiné"],      "#E6993E"],
  [["psychomotr"],                                         "#D94F78"],
  [["endocrinolog"],                                       "#2B98AC"],
  [["orthophon"],                                          "#D97706"],
  [["infirmier", "infirmière"],                            "#0284C7"],
]

function getColor(specialty: string | undefined): string {
  if (!specialty) return "#5B4EC4"
  const s = specialty.toLowerCase()
  for (const [keywords, color] of PROFESSION_RULES) {
    if (keywords.some((k) => s.includes(k))) return color
  }
  return "#5B4EC4"
}

// ─── Activity types shown on the lifeline ────────────────────────────────────

const LIFELINE_TYPES = new Set([
  "APPOINTMENT_CREATED",
  "APPOINTMENT_COMPLETED",
  "NOTE_ADDED",
  "REFERRAL_ACCEPTED",
  "CARE_PLAN_UPDATED",
])

// ─── Derived event type ───────────────────────────────────────────────────────

interface LifelineEvent {
  id: string
  date: Date
  actorId: string
  actorName: string
  specialty: string
  color: string
  status: "past" | "today" | "upcoming"
  title: string
  summary: string | null
}

function buildEvents(activities: Activity[], members: CareCaseMember[]): LifelineEvent[] {
  // Build member specialty map
  const memberMap = new Map<string, { specialty: string; color: string }>()
  members.forEach((m) => {
    const specialty = m.provider?.specialties?.[0] ?? ""
    memberMap.set(m.person.id, { specialty, color: getColor(specialty) })
  })

  return activities
    .filter((a) => LIFELINE_TYPES.has(a.activityType?.toUpperCase?.() ?? ""))
    .map((a) => {
      const date = parseISO(a.occurredAt)
      const memberInfo = memberMap.get(a.person.id)
      const status: "past" | "today" | "upcoming" = isToday(date)
        ? "today"
        : date > new Date()
        ? "upcoming"
        : "past"
      return {
        id: a.id,
        date,
        actorId: a.person.id,
        actorName: `${a.person.firstName} ${a.person.lastName}`,
        specialty: memberInfo?.specialty ?? "",
        color: memberInfo?.color ?? "#5B4EC4",
        status,
        title: a.title,
        summary: a.summary,
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function EventTooltip({ event, x, containerWidth }: { event: LifelineEvent; x: number; containerWidth: number }) {
  const isRight = x > containerWidth * 0.6
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        left: isRight ? "auto" : 0,
        right: isRight ? 0 : "auto",
        transform: isRight ? "none" : "none",
        width: 220,
        background: "#1A1A2E",
        borderRadius: 12,
        padding: "10px 14px",
        zIndex: 50,
        boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
        pointerEvents: "none",
        animation: "tooltipIn 180ms cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      <style>{`
        @keyframes tooltipIn {
          from { opacity:0; transform: scale(0.92) translateY(-4px) }
          to   { opacity:1; transform: scale(1)    translateY(0) }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: event.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#FAFAF8", lineHeight: 1.2 }}>
          {event.actorName}
        </span>
      </div>
      {event.specialty && (
        <div style={{ fontSize: 10, color: event.color, marginBottom: 4, opacity: 0.9 }}>
          {event.specialty}
        </div>
      )}
      <div style={{ fontSize: 10, color: "#6B7280", marginBottom: event.summary ? 6 : 0 }}>
        {format(event.date, "d MMMM yyyy", { locale: fr })}
      </div>
      {event.summary && (
        <div style={{ fontSize: 11, color: "#FAFAF8", lineHeight: 1.5, opacity: 0.85 }}>
          &ldquo;{event.summary.slice(0, 100)}{event.summary.length > 100 ? "…" : ""}&rdquo;
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CareLifelineProps {
  careCaseId: string
  members: CareCaseMember[]
  startDate: string
  caseTitle?: string
}

export function CareLifeline({ careCaseId, members, startDate, caseTitle }: CareLifelineProps) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [lineDrawn, setLineDrawn] = useState(false)

  const { data: timelineData } = useQuery({
    queryKey: ["timeline", careCaseId],
    queryFn: () => api.careCases.timeline(careCaseId, 1, 50),
    enabled: !!accessToken,
    staleTime: 60_000,
  })

  const activities = timelineData?.data ?? []
  const events = buildEvents(activities, members)

  // Animate the line after mount
  useEffect(() => {
    const t = setTimeout(() => setLineDrawn(true), 300)
    return () => clearTimeout(t)
  }, [events.length])

  // Scroll to TODAY on mount
  useEffect(() => {
    if (!scrollRef.current || events.length === 0) return
    const todayIdx = events.findIndex((e) => e.status === "today")
    if (todayIdx >= 0) {
      const el = scrollRef.current.querySelectorAll("[data-event]")[todayIdx] as HTMLElement
      if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    } else {
      // Scroll to end (most recent)
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [events.length]) // eslint-disable-line

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" })
  }

  if (events.length === 0) {
    return (
      <div style={{
        background: "#FAFAF8",
        borderBottom: "1px solid #E8ECF4",
        padding: "12px 24px",
        fontSize: 12,
        color: "#6B7280",
        fontStyle: "italic",
      }}>
        Ligne de vie — aucun événement enregistré pour ce dossier
      </div>
    )
  }

  // Compute date range for positioning
  const minTime = Math.min(...events.map((e) => e.date.getTime()))
  const maxTime = Math.max(Date.now(), ...events.map((e) => e.date.getTime()))
  const range = maxTime - minTime || 1

  const MIN_WIDTH = Math.max(900, events.length * 80)

  return (
    <div
      style={{
        background: "#FAFAF8",
        borderBottom: "1px solid #E8ECF4",
        padding: "16px 0 20px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 24, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Ligne de vie · {caseTitle ?? "Parcours de soin"}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => scroll("left")}
            style={{ background: "none", border: "1px solid #E8ECF4", borderRadius: 8, padding: "3px 6px", cursor: "pointer", color: "#6B7280", display: "flex" }}
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => scroll("right")}
            style={{ background: "none", border: "1px solid #E8ECF4", borderRadius: 8, padding: "3px 6px", cursor: "pointer", color: "#6B7280", display: "flex" }}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          overflowY: "visible",
          paddingInline: 24,
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          style={{
            position: "relative",
            width: MIN_WIDTH,
            height: 96,
            minWidth: "100%",
          }}
        >
          {/* SVG line */}
          <svg
            style={{ position: "absolute", top: 32, left: 0, width: "100%", height: 4, overflow: "visible" }}
            preserveAspectRatio="none"
          >
            <style>{`
              @keyframes lineGrow { from { stroke-dashoffset: ${MIN_WIDTH} } to { stroke-dashoffset: 0 } }
            `}</style>
            <line
              x1={0} y1={2} x2={MIN_WIDTH} y2={2}
              stroke="#E8ECF4" strokeWidth={2}
            />
            {/* Animated colored segment (past events) */}
            {events.filter((e) => e.status !== "upcoming").map((e, i, arr) => {
              if (i === 0) return null
              const prev = arr[i - 1]
              const x1 = ((prev.date.getTime() - minTime) / range) * MIN_WIDTH
              const x2 = ((e.date.getTime() - minTime) / range) * MIN_WIDTH
              return (
                <line
                  key={e.id}
                  x1={x1} y1={2} x2={x2} y2={2}
                  stroke={e.color} strokeWidth={2} opacity={0.4}
                  strokeDasharray={lineDrawn ? "none" : MIN_WIDTH}
                  strokeDashoffset={lineDrawn ? 0 : MIN_WIDTH}
                  style={{ transition: `stroke-dashoffset 1.5s ease ${i * 80}ms` }}
                />
              )
            })}
            {/* Dotted future line */}
            {events.some((e) => e.status === "upcoming") && (() => {
              const lastPast = [...events].reverse().find((e) => e.status !== "upcoming")
              if (!lastPast) return null
              const x1 = ((lastPast.date.getTime() - minTime) / range) * MIN_WIDTH
              return (
                <line
                  key="future"
                  x1={x1} y1={2} x2={MIN_WIDTH} y2={2}
                  stroke="#C7C4F0" strokeWidth={1.5} strokeDasharray="4 4"
                />
              )
            })()}
          </svg>

          {/* TODAY marker */}
          {(() => {
            const nowX = ((Date.now() - minTime) / range) * MIN_WIDTH
            if (nowX < 20 || nowX > MIN_WIDTH - 20) return null
            return (
              <div
                style={{
                  position: "absolute",
                  left: nowX,
                  top: 18,
                  transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{
                  width: 1, height: 32, background: "#D94F4F",
                  opacity: 0.6,
                }}/>
                <span style={{
                  fontSize: 8, fontWeight: 700, color: "#D94F4F",
                  letterSpacing: "0.05em", marginTop: 2,
                  textTransform: "uppercase",
                }}>
                  Aujourd'hui
                </span>
              </div>
            )
          })()}

          {/* Event dots */}
          {events.map((event) => {
            const x = ((event.date.getTime() - minTime) / range) * MIN_WIDTH
            const isHovered = hoveredId === event.id
            const isCurrentDay = event.status === "today"

            return (
              <div
                key={event.id}
                data-event
                style={{
                  position: "absolute",
                  left: x,
                  top: 24,
                  transform: "translate(-50%, -50%)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  cursor: "pointer",
                  zIndex: isHovered ? 20 : 5,
                }}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Dot */}
                <div style={{ position: "relative" }}>
                  {isCurrentDay && (
                    <div style={{
                      position: "absolute",
                      inset: -6,
                      borderRadius: "50%",
                      border: `2px solid ${event.color}`,
                      opacity: 0.3,
                      animation: "pulse 2s ease infinite",
                    }} />
                  )}
                  <style>{`
                    @keyframes pulse { 0%,100% { transform: scale(1); opacity:0.3 } 50% { transform: scale(1.3); opacity:0.1 } }
                  `}</style>
                  <div style={{
                    width: isCurrentDay ? 16 : 12,
                    height: isCurrentDay ? 16 : 12,
                    borderRadius: "50%",
                    background: event.status === "upcoming" ? "transparent" : event.color,
                    border: `2px solid ${event.color}`,
                    transition: "transform 150ms",
                    transform: isHovered ? "scale(1.3)" : "scale(1)",
                    boxShadow: isHovered ? `0 0 0 4px ${event.color}20` : "none",
                  }} />
                </div>

                {/* Check mark for past */}
                {event.status === "past" && (
                  <span style={{ fontSize: 8, lineHeight: 1 }}>✓</span>
                )}

                {/* Label */}
                <div style={{
                  fontSize: 9,
                  color: "#6B7280",
                  textAlign: "center",
                  maxWidth: 60,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {event.actorName.split(" ")[1] ?? event.actorName}
                </div>
                <div style={{ fontSize: 8, color: "#AAAAAA" }}>
                  {format(event.date, "d MMM", { locale: fr })}
                </div>

                {/* Tooltip */}
                {isHovered && (
                  <EventTooltip event={event} x={x} containerWidth={MIN_WIDTH} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, paddingInline: 24, marginTop: 8, flexWrap: "wrap" }}>
        {[...new Map(events.filter(e => e.specialty).map(e => [e.specialty, e.color])).entries()].map(([spec, color]) => (
          <div key={spec} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 9, color: "#6B7280" }}>{spec}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
