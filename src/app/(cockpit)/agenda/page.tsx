"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { parseISO, format, isSameDay, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { useAgenda, type AgendaAppointment, type AppointmentStatus } from "./hooks/useAgenda"
import { AgendaSetup } from "./components/AgendaSetup"
import { CreateAppointmentModal } from "./components/CreateAppointmentModal"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type ConsultationLocation } from "@/lib/api"
import Link from "next/link"
import { Loader2 } from "lucide-react"

/* ═══════════════════════════════════════════
   NAMI DESIGN TOKENS
   ═══════════════════════════════════════════ */
const N = {
  bg: "#F6F5FB", card: "#FFF", primary: "#5B4EC4", primaryLight: "#EDE9FC", primaryMid: "#8B7FD9",
  text: "#2D2B3D", textSoft: "#8A879C", border: "#ECEAF5",
  danger: "#C4574E", dangerBg: "#FDF0EF",
  success: "#4E9A7C", successBg: "#EDF7F2",
  warning: "#E6A23C", warningBg: "#FFF8EC",
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  CONFIRMED: { label: "Confirmé", color: N.success, bg: N.successBg, icon: "✓" },
  PENDING: { label: "En attente", color: N.warning, bg: N.warningBg, icon: "⏳" },
  CANCELLED: { label: "Annulé", color: N.danger, bg: N.dangerBg, icon: "✕" },
  COMPLETED: { label: "Terminé", color: N.primary, bg: N.primaryLight, icon: "✓" },
  NO_SHOW: { label: "Absent", color: N.danger, bg: N.dangerBg, icon: "✕" },
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const HOUR_H = 64; const MIN_H = 8; const MAX_H = 21

function getApptDuration(appt: AgendaAppointment) {
  if (appt.consultationType?.durationMinutes) return appt.consultationType.durationMinutes
  return Math.round((new Date(appt.endAt).getTime() - new Date(appt.startAt).getTime()) / 60000)
}

/* ═══════════════════════════════════════════
   FILL BAR
   ═══════════════════════════════════════════ */
function FillBar({ ratio }: { ratio: number }) {
  const segs = 6; const filled = Math.round(ratio * segs)
  return (
    <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
      {Array.from({ length: segs }).map((_, i) => (
        <div key={i} style={{ width: 8, height: 4, borderRadius: 2, background: i < filled ? (ratio > 0.8 ? N.success : N.primary) : "#E0DFE8" }} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   APPOINTMENT BLOCK
   ═══════════════════════════════════════════ */
function ApptBlock({ appt, top, height, onClick, width, left, getColor }: {
  appt: AgendaAppointment; top: number; height: number; onClick: (a: AgendaAppointment) => void; width?: string; left?: string; getColor: (a: AgendaAppointment) => string
}) {
  const color = getColor(appt)
  const isShort = height < 38
  const isPending = appt.status === "PENDING"
  const isCancelled = appt.status === "CANCELLED"
  const name = `${appt.patient.firstName} ${appt.patient.lastName}`
  const start = parseISO(appt.startAt)

  return (
    <div onClick={() => onClick(appt)}
      draggable={appt.status !== "CANCELLED"}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", appt.id) }}
      style={{
        position: "absolute", top, left: left || "4px", width: width || "calc(100% - 8px)",
        height: Math.max(height, 22), background: isCancelled ? "#f5f5f5" : color + "18",
        borderLeft: `3px ${isPending ? "dashed" : "solid"} ${isCancelled ? "#ccc" : color}`,
        borderRadius: "0 8px 8px 0", padding: isShort ? "2px 8px" : "6px 10px",
        cursor: appt.status !== "CANCELLED" ? "grab" : "pointer", overflow: "hidden", transition: "box-shadow 0.15s", zIndex: 2,
        opacity: isCancelled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!isCancelled) e.currentTarget.style.boxShadow = `0 2px 12px ${color}30` }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: isCancelled ? "#aaa" : color, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {isPending && <span style={{ fontSize: 10 }}>⏳</span>}
        {name}
      </div>
      {!isShort && (
        <div style={{ fontSize: 10, color: N.textSoft, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {appt.consultationType?.name ?? "Consultation"} · {format(start, "HH:mm")}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   DRAWER
   ═══════════════════════════════════════════ */
function Drawer({ appt, onClose, onPatch, isPatching, getColor }: {
  appt: AgendaAppointment; onClose: () => void;
  onPatch: (id: string, data: { status?: string }) => void; isPatching: boolean; getColor: (a: AgendaAppointment) => string
}) {
  const color = getColor(appt)
  const typeName = appt.consultationType?.name ?? "Consultation"
  const startDate = parseISO(appt.startAt)
  const endDate = parseISO(appt.endAt)
  const duration = getApptDuration(appt)
  const st = STATUS_CFG[appt.status] ?? STATUS_CFG.CONFIRMED
  const loc = appt.location

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 410, maxWidth: "92vw", background: N.card, boxShadow: "-8px 0 32px rgba(0,0,0,0.08)", zIndex: 100, display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", borderLeft: `1px solid ${N.border}` }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${N.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: N.text }}>{appt.patient.firstName} {appt.patient.lastName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 13, color, fontWeight: 500 }}>{typeName}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: N.textSoft, cursor: "pointer", padding: 4 }}>✕</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Status */}
        <div>
          <div style={dL}>Statut</div>
          <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>{st.icon} {st.label}</span>
        </div>

        {/* Notes/motif */}
        {appt.notes && (
          <div>
            <div style={dL}>Motif</div>
            <div style={{ padding: "8px 12px", background: N.primaryLight, borderRadius: 8, fontSize: 14, color: N.primary, fontWeight: 500 }}>{appt.notes}</div>
          </div>
        )}

        {/* Horaire + Lieu */}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={dL}>Horaire</div>
            <div style={{ fontSize: 14, color: N.text }}>
              {format(startDate, "HH:mm")} → {format(endDate, "HH:mm")} ({duration} min)
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={dL}>Lieu</div>
            <div style={{ fontSize: 14, color: N.text, display: "flex", alignItems: "center", gap: 5 }}>
              {loc && <div style={{ width: 7, height: 7, borderRadius: "50%", background: loc.color ?? N.primary }} />}
              {loc?.name ?? appt.locationType}
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <div style={dL}>Date</div>
          <div style={{ fontSize: 14, color: N.text }}>{format(startDate, "EEEE d MMMM yyyy", { locale: fr })}</div>
        </div>

        {/* Patient info */}
        <div style={{ background: "#FAFAFD", borderRadius: 10, border: `1px solid ${N.border}`, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={dL}>Informations patient</div>
          {appt.patient.birthDate && (
            <InfoRow label="Date de naissance" value={format(parseISO(appt.patient.birthDate), "dd/MM/yyyy")} />
          )}
          {appt.patient.phone && <InfoRow label="Téléphone" value={appt.patient.phone} />}
          {appt.patient.email && <InfoRow label="Email" value={appt.patient.email} />}
        </div>

        {/* Actions */}
        {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
          <div style={{ display: "flex", gap: 8 }}>
            {appt.status === "PENDING" && (
              <button onClick={() => onPatch(appt.id, { status: "CONFIRMED" })} disabled={isPatching}
                style={{ ...actionBtn, background: N.success, opacity: isPatching ? 0.6 : 1 }}>
                ✓ Confirmer
              </button>
            )}
            {appt.status === "CONFIRMED" && (
              <button onClick={() => onPatch(appt.id, { status: "COMPLETED" })} disabled={isPatching}
                style={{ ...actionBtn, background: N.primary, opacity: isPatching ? 0.6 : 1 }}>
                Marquer terminé
              </button>
            )}
            <button onClick={() => onPatch(appt.id, { status: "CANCELLED" })} disabled={isPatching}
              style={{ ...actionBtn, background: N.dangerBg, color: N.danger }}>
              Annuler
            </button>
          </div>
        )}

        {/* Fiche patient */}
        {appt.careCaseId && (
          <Link href={`/patients/${appt.careCaseId}`}
            style={{ display: "block", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${N.border}`, fontSize: 13, fontWeight: 500, color: N.primary, textAlign: "center", textDecoration: "none" }}>
            Voir la fiche patient →
          </Link>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: N.textSoft }}>{label}</span>
      <span style={{ color: N.text }}>{value}</span>
    </div>
  )
}

const dL: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: N.textSoft, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }
const actionBtn: React.CSSProperties = { flex: 1, padding: 10, borderRadius: 8, border: "none", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function AgendaPage() {
  const agenda = useAgenda()
  const [selectedAppt, setSelectedAppt] = useState<AgendaAppointment | null>(null)
  const [createCtx, setCreateCtx] = useState<{
    date: Date; hour: number; minute: number; location: ConsultationLocation | null
  } | null>(null)
  const [dragAppt, setDragAppt] = useState<AgendaAppointment | null>(null)
  const searchParams = useSearchParams()

  // Open create modal from ?newAppt=true (e.g. from patient page "planifier")
  useEffect(() => {
    if (searchParams.get("newAppt") && !createCtx) {
      const now = new Date()
      setCreateCtx({
        date: now,
        hour: now.getHours() + 1,
        minute: 0,
        location: agenda.locations[0] ?? null,
      })
    }
  }, [searchParams, agenda.locations, createCtx])

  // ── Drag & drop ──
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  async function handleDrop(e: React.DragEvent, date: Date) {
    e.preventDefault()
    if (!dragAppt) return
    const rect = e.currentTarget.getBoundingClientRect()
    const rawH = MIN_H + (e.clientY - rect.top) / HOUR_H
    const h = Math.floor(rawH)
    const m = Math.round((rawH - h) * 4) * 15
    const newStart = new Date(date)
    newStart.setHours(h, m, 0, 0)
    const dur = getApptDuration(dragAppt)
    const newEnd = new Date(newStart.getTime() + dur * 60000)
    await agenda.patchAppointment({
      id: dragAppt.id,
      startAt: newStart.toISOString(),
      endAt: newEnd.toISOString(),
    })
    setDragAppt(null)
  }

  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const { data: agendaSettings } = useQuery({
    queryKey: ["agenda-settings"],
    queryFn: () => api.agendaSettings.get(),
    enabled: !!accessToken,
  })

  // Setup guard
  const needsSetup = !agenda.isLoading && agendaSettings !== undefined && !agendaSettings.isConfigured
  if (needsSetup) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <AgendaSetup onComplete={() => window.location.reload()} />
      </div>
    )
  }

  if (agenda.isLoading) {
    return (
      <div style={{ height: "100%", background: N.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: N.primary }} />
      </div>
    )
  }

  // Build week
  const weekDays: Array<{ date: Date; dayIdx: number }> = []
  for (let i = 0; i < 7; i++) weekDays.push({ date: addDays(agenda.from, i), dayIdx: i })

  const visibleDays = weekDays.filter((wd) => {
    const jsDay = wd.date.getDay()
    const hasSlots = agenda.slots.some((s) => s.weekday === jsDay)
    const hasAppts = agenda.appointments.some((a) => isSameDay(parseISO(a.startAt), wd.date))
    return hasSlots || hasAppts
  })
  const daysToShow = visibleDays.length > 0 ? visibleDays : weekDays.slice(0, 5)

  const hours: number[] = []
  for (let h = MIN_H; h <= MAX_H; h++) hours.push(h)
  const today = new Date()

  function dayAppts(date: Date) {
    return agenda.appointments.filter((a) => isSameDay(parseISO(a.startAt), date))
  }

  function fillRatio(date: Date) {
    const appts = dayAppts(date).filter((a) => a.status !== "CANCELLED")
    const totalMin = appts.reduce((s, a) => s + getApptDuration(a), 0)
    return Math.min(totalMin / 480, 1)
  }

  function dayLocations(date: Date) {
    const appts = dayAppts(date)
    const locIds = new Set<string>()
    const locs: Array<{ id: string; name: string; color: string }> = []
    for (const a of appts) {
      if (a.location && !locIds.has(a.location.id)) {
        locIds.add(a.location.id)
        locs.push({ id: a.location.id, name: a.location.name, color: a.location.color ?? N.primary })
      }
    }
    return locs
  }

  const weekLabel = format(agenda.from, "MMMM yyyy", { locale: fr })

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: N.bg, fontFamily: "'Plus Jakarta Sans', 'DM Sans', -apple-system, sans-serif" }}>
      {/* TOOLBAR */}
      <div style={{ background: N.card, borderBottom: `1px solid ${N.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={agenda.goToday} style={navBtnStyle}>Aujourd&apos;hui</button>
          <button onClick={agenda.prevWeek} style={navBtnSmall}>‹</button>
          <button onClick={agenda.nextWeek} style={navBtnSmall}>›</button>
          <span style={{ fontSize: 16, fontWeight: 600, color: N.text, textTransform: "capitalize" }}>{weekLabel}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: "#ECEAF5", borderRadius: 8, padding: 3 }}>
            <button style={{ padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: N.primary, color: "#fff", fontWeight: 600 }}>Semaine</button>
          </div>
          <Link href="/agenda/parametrage" style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${N.border}`, background: N.card, fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: N.textSoft, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
            ⚙️ Paramètres
          </Link>
        </div>
      </div>

      {/* GRID */}
      <div style={{ flex: 1, display: "flex", overflowX: "auto", overflowY: "auto" }}>
        {/* Time gutter */}
        <div style={{ width: 56, flexShrink: 0, paddingTop: 80 }}>
          {hours.map((h) => (
            <div key={h} style={{ height: HOUR_H, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 10 }}>
              <span style={{ fontSize: 11, color: N.textSoft, fontWeight: 500, transform: "translateY(-7px)" }}>{String(h).padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {daysToShow.map(({ date, dayIdx }) => {
          const isToday = isSameDay(date, today)
          const appts = dayAppts(date)
          const locs = dayLocations(date)
          const hasMultipleLocs = locs.length > 1

          return (
            <div key={dayIdx} style={{ flex: 1, minWidth: 140, borderLeft: `1px solid ${N.border}` }}>
              {/* Day header */}
              <div style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${N.border}`, background: isToday ? N.primaryLight : N.card, position: "sticky", top: 0, zIndex: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: isToday ? N.primary : N.textSoft, textTransform: "uppercase" }}>{DAY_NAMES[dayIdx]}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: isToday ? N.primary : N.text, lineHeight: 1.2 }}>{date.getDate()}</span>
                <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                  {locs.map((loc) => (
                    <span key={loc.id} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: loc.color + "18", color: loc.color, fontWeight: 600 }}>{loc.name}</span>
                  ))}
                </div>
                <FillBar ratio={fillRatio(date)} />
              </div>

              {/* Time grid */}
              <div
                style={{ position: "relative", height: hours.length * HOUR_H }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
              >
                {/* Hour lines */}
                {hours.map((h) => (
                  <div key={h} style={{ position: "absolute", top: (h - MIN_H) * HOUR_H, left: 0, right: 0, borderTop: `1px solid ${N.border}`, height: HOUR_H, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", top: HOUR_H / 2, left: 0, right: 0, borderTop: "1px dashed #f0eff5", pointerEvents: "none" }} />
                  </div>
                ))}

                {/* Slot backgrounds */}
                {agenda.slots.filter((s) => s.weekday === date.getDay()).map((slot, i) => {
                  const sH = parseInt(slot.startTime.split(":")[0])
                  const eH = parseInt(slot.endTime.split(":")[0])
                  return <div key={i} style={{ position: "absolute", top: (sH - MIN_H) * HOUR_H, left: 0, right: 0, height: (eH - sH) * HOUR_H, background: N.primary + "06", zIndex: 0, pointerEvents: "none" }} />
                })}

                {/* Click catcher — z:1 above lines, below appts (z:2) */}
                <div
                  style={{ position: "absolute", inset: 0, zIndex: 1, cursor: "pointer" }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const rawH = MIN_H + (e.clientY - rect.top) / HOUR_H
                    const h = Math.floor(rawH)
                    const m = Math.round((rawH - h) * 4) * 15
                    const dayName = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][date.getDay()]
                    const loc = agenda.locations.find(l => {
                      const sched = l.schedule ?? {}
                      return Array.isArray(sched[dayName]) && (sched[dayName] as Array<unknown>).length > 0
                    }) ?? agenda.locations[0] ?? null
                    setCreateCtx({ date, hour: h, minute: m, location: loc })
                  }}
                />

                {/* Appointments */}
                {appts.map((appt) => {
                  const s = parseISO(appt.startAt)
                  const startHr = s.getHours() + s.getMinutes() / 60
                  const dur = getApptDuration(appt)
                  const top = (startHr - MIN_H) * HOUR_H
                  const height = (dur / 60) * HOUR_H

                  let w = "calc(100% - 8px)"; let l = "4px"
                  if (hasMultipleLocs && appt.location) {
                    const ci = locs.findIndex((loc) => loc.id === appt.location!.id)
                    if (ci >= 0) {
                      w = `calc(${100 / locs.length}% - 6px)`
                      l = `calc(${(ci * 100) / locs.length}% + 3px)`
                    }
                  }

                  return <ApptBlock key={appt.id} appt={appt} top={top} height={height} width={w} left={l} onClick={setSelectedAppt} getColor={agenda.getColor} />
                })}

                {/* Now indicator */}
                {isToday && (() => {
                  const now = today.getHours() + today.getMinutes() / 60
                  if (now < MIN_H || now > MAX_H) return null
                  return (
                    <div style={{ position: "absolute", top: (now - MIN_H) * HOUR_H, left: 0, right: 0, zIndex: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: N.danger, position: "absolute", left: -4, top: -3 }} />
                      <div style={{ height: 2, background: N.danger, borderRadius: 1 }} />
                    </div>
                  )
                })()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {!agenda.isLoading && agenda.appointments.length === 0 && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.2 }}>📅</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: N.textSoft }}>Aucun rendez-vous cette semaine</div>
          <div style={{ fontSize: 12, color: N.textSoft, opacity: 0.6, marginTop: 4 }}>Les rendez-vous planifiés apparaîtront ici.</div>
        </div>
      )}

      {/* Drawer */}
      {selectedAppt && (
        <>
          <div onClick={() => setSelectedAppt(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.15)", zIndex: 90 }} />
          <Drawer
            appt={selectedAppt}
            onClose={() => setSelectedAppt(null)}
            onPatch={async (id, data) => {
              await agenda.patchAppointment({ id, ...data })
              const updated = { ...selectedAppt!, status: data.status as AppointmentStatus }
              setSelectedAppt(updated)
            }}
            isPatching={agenda.isPatching}
            getColor={agenda.getColor}
          />
        </>
      )}

      {/* Create Modal */}
      {createCtx && (
        <CreateAppointmentModal
          date={createCtx.date}
          hour={createCtx.hour}
          minute={createCtx.minute}
          location={createCtx.location}
          consultationTypes={(() => {
            const allowed = createCtx.location?.allowedConsultTypes
            if (!allowed || allowed.length === 0) return agenda.consultationTypes
            return agenda.consultationTypes.filter(ct => allowed.includes(ct.id ?? ""))
          })()}
          patients={agenda.patients}
          isCreating={agenda.isCreating}
          providerId={agenda.providerId}
          onClose={() => setCreateCtx(null)}
          onSave={async (data) => {
            await agenda.createAppointment(data)
            setCreateCtx(null)
          }}
          onCreateAbsence={async (data) => {
            await agenda.createAbsence(data)
            setCreateCtx(null)
          }}
        />
      )}
    </div>
  )
}

/* ─── STYLES ─── */
const navBtnStyle: React.CSSProperties = { padding: "6px 14px", borderRadius: 8, border: `1px solid ${N.border}`, background: N.card, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: N.text }
const navBtnSmall: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, border: `1px solid ${N.border}`, background: N.card, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: N.text, fontFamily: "inherit" }
