"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { parseISO, format, isSameDay, addDays, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { useAgenda, type AgendaAppointment, type AppointmentStatus } from "./hooks/useAgenda"
import { AgendaSetup } from "./components/AgendaSetup"
import { CreateAppointmentModal } from "./components/CreateAppointmentModal"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type ConsultationLocation, type CareCase, type Appointment } from "@/lib/api"
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

import { getCareTypeColor, getCareTypeLabel } from "@/lib/caseType"
const getPathologyColor = getCareTypeColor
const getPathologyLabel = getCareTypeLabel

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const HOUR_H = 64; const MIN_H = 8; const MAX_H = 21

const LOCATION_LABELS: Record<string, string> = {
  IN_PERSON: "En cabinet",
  VIDEO: "Téléconsultation",
  PHONE: "Consultation téléphonique",
  HOME_VISIT: "À domicile",
  REMOTE: "À distance",
}
const ACTIVITY_CFG: Record<string, { emoji: string; color: string }> = {
  APPOINTMENT_COMPLETED: { emoji: "✓", color: "#4E9A7C" },
  NOTE_ADDED:            { emoji: "📝", color: "#5B4EC4" },
  REFERRAL_ACCEPTED:     { emoji: "↗", color: "#2BA89C" },
  CARE_PLAN_UPDATED:     { emoji: "📋", color: "#E6993E" },
  APPOINTMENT_CREATED:   { emoji: "📅", color: "#4A90D9" },
}

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
   APPOINTMENT BLOCK — RICH
   ═══════════════════════════════════════════ */
function ApptBlock({ appt, top, height, onClick, width, left, getColor, careCase, isNext }: {
  appt: AgendaAppointment; top: number; height: number;
  onClick: (a: AgendaAppointment) => void; width?: string; left?: string;
  getColor: (a: AgendaAppointment) => string;
  careCase?: CareCase | null;
  isNext?: boolean;
}) {
  const [hovered, setHovered] = useState(false)
  const bandColor = careCase ? getPathologyColor(careCase.caseType) : getColor(appt)
  const isCancelled = appt.status === "CANCELLED"
  const isPending = appt.status === "PENDING"
  const isVideo = appt.locationType === "VIDEO" || appt.locationType === "PHONE"
  const name = `${appt.patient.firstName} ${appt.patient.lastName}`
  const start = parseISO(appt.startAt)
  const duration = getApptDuration(appt)
  const isRich = height >= 72
  const isMedium = height >= 40

  const lastActivityLabel = careCase?.lastActivityAt
    ? formatDistanceToNow(new Date(careCase.lastActivityAt), { locale: fr, addSuffix: true })
    : null

  return (
    <div
      draggable={!isCancelled}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", appt.id) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !hovered || onClick(appt)}
      style={{
        position: "absolute", top, left: left || "4px",
        width: width || "calc(100% - 8px)",
        height: Math.max(height, 24),
        background: isCancelled ? "#f7f7f7" : "#FFFFFF",
        borderLeft: `4px solid ${isCancelled ? "#ccc" : bandColor}`,
        borderTop: `1px solid ${isCancelled ? "#e0e0e0" : bandColor + "30"}`,
        borderRight: `1px solid ${isCancelled ? "#e0e0e0" : bandColor + "20"}`,
        borderBottom: `1px solid ${isCancelled ? "#e0e0e0" : bandColor + "20"}`,
        borderRadius: "0 10px 10px 0",
        padding: isRich ? "7px 10px 6px" : isMedium ? "4px 8px" : "2px 8px",
        cursor: "pointer", overflow: "hidden",
        transition: "box-shadow 150ms, transform 120ms",
        zIndex: hovered ? 10 : 2,
        boxShadow: isNext
          ? `0 0 0 2px ${bandColor}50, 0 4px 20px ${bandColor}25`
          : hovered ? `0 4px 18px ${bandColor}35` : "0 1px 3px rgba(0,0,0,0.05)",
        transform: hovered ? "translateX(1px) scale(1.01)" : "none",
        opacity: isCancelled ? 0.45 : 1,
      }}
    >
      {/* Pathology badge + location icon */}
      {isRich && careCase && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{
            fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
            background: `${bandColor}18`, color: bandColor, letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            {getPathologyLabel(careCase.caseType)}
          </span>
          <span style={{ fontSize: 9, opacity: 0.6 }}>
            {isVideo ? "📹" : "🏥"}
          </span>
        </div>
      )}

      {/* Patient name */}
      <div style={{
        fontSize: isRich ? 12 : 11, fontWeight: 700,
        color: isCancelled ? "#aaa" : "#1A1A2E",
        lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        {isPending && <span style={{ fontSize: 9 }}>⏳</span>}
        {isNext && <span style={{ width: 5, height: 5, borderRadius: "50%", background: bandColor, display: "inline-block", flexShrink: 0 }} />}
        {name}
      </div>

      {/* Consultation type + time */}
      {isMedium && (
        <div style={{ fontSize: 10, color: N.textSoft, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {appt.consultationType?.name ?? "Consultation"} · {format(start, "HH:mm")}
          {isRich && <span> · {duration}min</span>}
        </div>
      )}

      {/* Last activity */}
      {isRich && lastActivityLabel && (
        <div style={{ fontSize: 9, color: "#AAAAAA", marginTop: 3 }}>
          Dernière activité {lastActivityLabel}
        </div>
      )}

      {/* Phase dots */}
      {isRich && (
        <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: "50%",
              background: i === 0 ? bandColor : i === 1 ? `${bandColor}55` : "#E8ECF4",
            }} />
          ))}
        </div>
      )}

      {/* Hover action buttons */}
      {hovered && isRich && !isCancelled && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: `linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.97) 50%)`,
            padding: "10px 6px 5px",
            display: "flex", gap: 3,
            animation: "apptBtnsIn 90ms ease both",
          }}
        >
          <style>{`@keyframes apptBtnsIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }`}</style>
          {appt.careCaseId && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("nami-prep-mode", {
                detail: { careCaseId: appt.careCaseId, patientName: name, time: format(start, "HH:mm") }
              }))}
              style={{ flex: 1, fontSize: 9, fontWeight: 700, padding: "4px 2px", borderRadius: 5,
                border: "none", background: bandColor, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
            >
              🎯 Préparer
            </button>
          )}
          <button
            onClick={() => onClick(appt)}
            style={{ flex: 1, fontSize: 9, fontWeight: 600, padding: "4px 2px", borderRadius: 5,
              border: `1px solid ${bandColor}40`, background: "#fff", color: bandColor, cursor: "pointer", fontFamily: "inherit" }}
          >
            Dossier
          </button>
          <button
            onClick={() => {
              if (appt.careCaseId) window.dispatchEvent(new CustomEvent("nami-start-consultation", {
                detail: { careCaseId: appt.careCaseId, patientName: name }
              }))
            }}
            style={{ flex: 1, fontSize: 9, fontWeight: 700, padding: "4px 2px", borderRadius: 5,
              border: "none", background: "#1A1A2E", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
          >
            ▶ Démarrer
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   DAY VIEW — Rich cards for today
   ═══════════════════════════════════════════ */
function DayView({
  appointments, careCases, getColor, onSelect, onCreateNow,
}: {
  appointments: AgendaAppointment[]
  careCases: CareCase[]
  getColor: (a: AgendaAppointment) => string
  onSelect: (a: AgendaAppointment) => void
  onCreateNow: () => void
}) {
  const today = new Date()
  const todayAppts = appointments
    .filter(a => isSameDay(parseISO(a.startAt), today))
    .sort((a, b) => parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime())

  const caseMap = new Map<string, CareCase>()
  for (const cc of careCases) caseMap.set(cc.id, cc)

  const nowTs = Date.now()
  const videoCount = todayAppts.filter(a => a.locationType === "VIDEO" || a.locationType === "PHONE").length
  const inPersonCount = todayAppts.filter(a => a.status !== "CANCELLED").length - videoCount
  const nextAppt = todayAppts.filter(a => parseISO(a.startAt).getTime() > nowTs && a.status !== "CANCELLED")[0]
  const nextInLabel = nextAppt ? formatDistanceToNow(parseISO(nextAppt.startAt), { locale: fr, addSuffix: false }) : null

  if (todayAppts.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 40, opacity: 0.15 }}>📅</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: N.textSoft }}>Aucun rendez-vous aujourd&apos;hui</div>
        <button onClick={onCreateNow} style={{ fontSize: 13, fontWeight: 600, padding: "9px 20px", borderRadius: 8, border: "none", background: N.primary, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>+ Créer un rendez-vous</button>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
      {/* Day summary card */}
      <div style={{ background: N.card, borderRadius: 12, border: `1px solid ${N.border}`, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: N.primary }}>{todayAppts.filter(a => a.status !== "CANCELLED").length} patients</span>
        <span style={{ fontSize: 13, color: N.textSoft }}>
          {inPersonCount > 0 && `${inPersonCount} consult${inPersonCount > 1 ? "s" : ""} cabinet`}
          {videoCount > 0 && ` · ${videoCount} téléconsult${videoCount > 1 ? "s" : ""}`}
        </span>
        {nextAppt && nextInLabel && (
          <span style={{ marginLeft: "auto", fontSize: 13, color: N.textSoft }}>
            Prochain dans <span style={{ fontWeight: 700, color: N.primary }}>{nextInLabel}</span>
            {" · "}{format(parseISO(nextAppt.startAt), "HH:mm")}
          </span>
        )}
        <button onClick={onCreateNow} style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, border: "none", background: N.primary, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>+ Nouveau RDV</button>
      </div>

      {/* Appointment cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {todayAppts.map((appt) => {
          const name = `${appt.patient.firstName} ${appt.patient.lastName}`
          const start = parseISO(appt.startAt)
          const dur = getApptDuration(appt)
          const careCase = appt.careCaseId ? (caseMap.get(appt.careCaseId) ?? null) : null
          const bandColor = careCase ? getPathologyColor(careCase.caseType) : getColor(appt)
          const status = STATUS_CFG[appt.status] ?? { label: appt.status, color: N.textSoft, bg: N.bg, icon: "·" }
          const isNow = parseISO(appt.startAt).getTime() <= nowTs && parseISO(appt.endAt).getTime() > nowTs
          const isDone = appt.status === "COMPLETED" || appt.status === "CANCELLED"
          const isPending = appt.status === "PENDING"
          const initials = `${appt.patient.firstName[0] ?? ""}${appt.patient.lastName?.[0] ?? ""}`.toUpperCase()

          return (
            <div key={appt.id} style={{
              background: N.card, borderRadius: 14, overflow: "hidden",
              border: isNow ? `2px solid rgba(91,78,196,0.25)` : `1px solid ${N.border}`,
              boxShadow: isNow ? `0 0 0 4px rgba(91,78,196,0.06), 0 2px 8px rgba(0,0,0,0.04)` : "0 1px 4px rgba(0,0,0,0.04)",
              opacity: appt.status === "CANCELLED" ? 0.45 : 1,
              transition: "box-shadow 0.2s",
            }}>
              <div style={{ display: "flex" }}>
                {/* Left color bar */}
                <div style={{ width: 5, background: bandColor, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Time column */}
                    <div style={{ textAlign: "center", minWidth: 52, flexShrink: 0 }}>
                      <div style={{ fontSize: 19, fontWeight: 700, color: N.text, fontVariantNumeric: "tabular-nums" }}>{format(start, "HH:mm")}</div>
                      <div style={{ fontSize: 11, color: N.textSoft }}>{dur} min</div>
                    </div>
                    {/* Status dot */}
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: status.color, flexShrink: 0, border: isNow ? `2px solid ${N.primary}` : "none" }} />
                    {/* Avatar */}
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: N.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: N.primary, flexShrink: 0 }}>{initials}</div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: N.text }}>{name}</span>
                        {isNow && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: N.primaryLight, color: N.primary }}>Maintenant</span>}
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: status.bg, color: status.color }}>{status.icon} {status.label}</span>
                        {isPending && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: N.warningBg, color: N.warning }}>À confirmer</span>}
                      </div>
                      <div style={{ fontSize: 12, color: N.textSoft, marginTop: 3 }}>
                        {appt.consultationType?.name ?? "Consultation"}
                        {careCase && ` · ${getPathologyLabel(careCase.caseType)}`}
                        {" · "}{LOCATION_LABELS[appt.locationType ?? ""] ?? "Cabinet"}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {appt.status === "CONFIRMED" && appt.careCaseId && (
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent("nami-prep-mode", {
                            detail: { careCaseId: appt.careCaseId, patientName: name, time: format(start, "HH:mm") }
                          }))}
                          style={{ fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "none", background: N.primary, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Préparer →
                        </button>
                      )}
                      {appt.status === "CONFIRMED" && appt.careCaseId && (
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent("nami-start-consultation", {
                            detail: { careCaseId: appt.careCaseId, patientName: name }
                          }))}
                          style={{ fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: `1px solid ${N.border}`, background: N.card, color: N.text, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          🎙 Démarrer
                        </button>
                      )}
                      {!isDone && !isPending && (
                        <button onClick={() => onSelect(appt)} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 8, border: `1px solid ${N.border}`, background: N.card, color: N.textSoft, cursor: "pointer", fontFamily: "inherit" }}>
                          ···
                        </button>
                      )}
                      {appt.status === "COMPLETED" && appt.careCaseId && (
                        <Link href={`/patients/${appt.patient.id}`} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 8, border: `1px solid ${N.border}`, background: N.card, color: N.primary, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "flex", alignItems: "center" }}>
                          Voir dossier →
                        </Link>
                      )}
                      {isPending && (
                        <>
                          <button
                            onClick={() => onSelect(appt)}
                            style={{ fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "none", background: N.success, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => onSelect(appt)}
                            style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, border: `1px solid ${N.border}`, background: N.card, color: N.danger, cursor: "pointer", fontFamily: "inherit" }}
                          >
                            Refuser
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SLOT CATCHER — click to create + "+" hover
   ═══════════════════════════════════════════ */
function SlotCatcher({ date, onSlotClick }: { date: Date; onSlotClick: (h: number, m: number) => void }) {
  const plusRef = useRef<HTMLDivElement>(null)
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
      {/* "+" indicator — positioned imperatively to avoid re-renders */}
      <div ref={plusRef} style={{
        position: "absolute", pointerEvents: "none",
        width: 22, height: 22, borderRadius: "50%",
        background: "rgba(91,78,196,0.1)", border: "1.5px dashed #5B4EC4",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: "#5B4EC4", fontWeight: 700,
        opacity: 0, transform: "translate(-50%, -50%)",
        transition: "opacity 80ms",
        zIndex: 1,
      }}>+</div>
      {/* Click area */}
      <div
        style={{ position: "absolute", inset: 0, cursor: "cell" }}
        onMouseMove={(e) => {
          if (!plusRef.current) return
          const rect = e.currentTarget.getBoundingClientRect()
          plusRef.current.style.top = (e.clientY - rect.top) + "px"
          plusRef.current.style.left = (e.clientX - rect.left) + "px"
          plusRef.current.style.opacity = "0.85"
        }}
        onMouseLeave={() => { if (plusRef.current) plusRef.current.style.opacity = "0" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const rawH = MIN_H + (e.clientY - rect.top) / HOUR_H
          const h = Math.floor(rawH)
          const m = Math.round((rawH - h) * 4) * 15
          onSlotClick(h, m)
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════
   NOW LINE — real-time, pulsing
   ═══════════════════════════════════════════ */
function NowLine() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const h = now.getHours() + now.getMinutes() / 60
  if (h < MIN_H || h > MAX_H) return null
  const top = (h - MIN_H) * HOUR_H
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, zIndex: 5, pointerEvents: "none" }}>
      <style>{`
        @keyframes nowGlow { 0%,100%{box-shadow:0 0 0 3px rgba(217,79,79,0.2)} 50%{box-shadow:0 0 0 7px rgba(217,79,79,0.08)} }
        @keyframes nowLabel { from{opacity:0;transform:translateY(-3px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      {/* Floating time label */}
      <div style={{
        position: "absolute", right: 4, top: -16,
        fontSize: 9, fontWeight: 700, color: "#D94F4F",
        background: "rgba(255,255,255,0.9)",
        padding: "1px 5px", borderRadius: 4,
        animation: "nowLabel 300ms ease both",
        border: "1px solid rgba(217,79,79,0.2)",
      }}>
        {format(now, "HH:mm")}
      </div>
      {/* Dot */}
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: "#D94F4F", position: "absolute", left: -5, top: -4,
        animation: "nowGlow 2s ease infinite",
      }} />
      {/* Line */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, #D94F4F 0%, rgba(217,79,79,0.4) 60%, transparent 100%)",
        borderRadius: 1,
      }} />
    </div>
  )
}

/* ═══════════════════════════════════════════
   DAY SUMMARY BAR
   ═══════════════════════════════════════════ */
function DaySummaryBar({ appointments }: { appointments: AgendaAppointment[] }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const todayAppts = appointments.filter(a =>
    isSameDay(parseISO(a.startAt), now) && a.status !== "CANCELLED"
  )
  if (todayAppts.length === 0) return null

  const videoCount = todayAppts.filter(a => a.locationType === "VIDEO" || a.locationType === "PHONE").length
  const inPersonCount = todayAppts.length - videoCount
  const nextAppt = [...todayAppts]
    .filter(a => parseISO(a.startAt) > now)
    .sort((a, b) => parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime())[0]
  const nextInLabel = nextAppt
    ? formatDistanceToNow(parseISO(nextAppt.startAt), { locale: fr, addSuffix: false })
    : null
  const bookedMin = todayAppts.reduce((s, a) => s + getApptDuration(a), 0)
  const freeH = Math.max(0, Math.round((480 - bookedMin) / 60 * 2) / 2)

  return (
    <div style={{
      background: "#F0EDF9", borderBottom: `1px solid ${N.border}`,
      padding: "7px 24px", display: "flex", alignItems: "center", gap: 14,
      fontSize: 12, flexShrink: 0, flexWrap: "wrap",
    }}>
      <span style={{ fontWeight: 700, color: N.primary }}>
        {todayAppts.length} patient{todayAppts.length > 1 ? "s" : ""}
      </span>
      <span style={{ color: N.textSoft }}>·</span>
      <span style={{ color: "#4A4A5A" }}>
        {inPersonCount} consult{inPersonCount > 1 ? "s" : ""}
        {videoCount > 0 ? ` + ${videoCount} téléconsult` : ""}
      </span>
      {nextAppt && nextInLabel && (
        <>
          <span style={{ color: N.textSoft }}>·</span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#5B4EC4", color: "#fff",
            padding: "3px 12px", borderRadius: 999,
            fontWeight: 600, fontSize: 12,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", flexShrink: 0 }} />
            {nextAppt.patient?.firstName
              ? `${nextAppt.patient.firstName} ${nextAppt.patient.lastName ?? ""}`.trim()
              : "Prochain RDV"}
            {" · "}
            {format(parseISO(nextAppt.startAt), "HH:mm")}
            {" · dans "}
            {nextInLabel}
          </span>
        </>
      )}
      <span style={{ color: N.textSoft }}>·</span>
      <span style={{ color: N.textSoft }}>{freeH}h libres</span>
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
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const color = getColor(appt)
  const typeName = appt.consultationType?.name ?? "Consultation"
  const startDate = parseISO(appt.startAt)
  const endDate = parseISO(appt.endAt)
  const duration = getApptDuration(appt)
  const st = STATUS_CFG[appt.status] ?? STATUS_CFG.CONFIRMED
  const loc = appt.location

  // Mini parcours de soin — UNIQUEMENT les vrais RDV de l'équipe (pas de notes ni bilans)
  const { data: caseAppts = [] } = useQuery({
    queryKey: ["appts-care-case", appt.careCaseId],
    queryFn: () => api.appointments.list({ careCaseId: appt.careCaseId! }),
    enabled: !!accessToken && !!appt.careCaseId,
    staleTime: 60_000,
  })
  const recentAppts = (caseAppts as Appointment[])
    .filter((a) => a.status === "COMPLETED" && a.id !== appt.id)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    .slice(0, 6)

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
              {loc?.name ?? LOCATION_LABELS[appt.locationType] ?? appt.locationType}
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

        {/* Fiche patient + Préparer */}
        {appt.careCaseId && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("nami-prep-mode", {
                detail: {
                  careCaseId: appt.careCaseId,
                  patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
                  time: format(parseISO(appt.startAt), "HH:mm"),
                }
              }))}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "none", background: N.primary, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}
            >
              🎯 Préparer
            </button>
            <Link href={`/patients/${appt.careCaseId}`}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${N.border}`, fontSize: 13, fontWeight: 500, color: N.primary, textAlign: "center", textDecoration: "none", display: "block" }}>
              Fiche →
            </Link>
          </div>
        )}

        {/* Mini parcours de soin — RDV réels de l'équipe uniquement */}
        {recentAppts.length > 0 && (
          <div>
            <div style={dL}>Consultations passées</div>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              {/* Vertical line */}
              <div style={{ position: "absolute", left: 7, top: 4, bottom: 4, width: 1, background: "#E8ECF4" }} />
              {recentAppts.map((a, i) => {
                return (
                  <div key={a.id} style={{
                    display: "flex", gap: 8, paddingBottom: 10,
                    animation: `feedItemIn 200ms ${i * 50}ms both`,
                  }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%",
                      background: N.success, flexShrink: 0, zIndex: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 7, color: "#fff", marginLeft: -20,
                    }}>
                      ✓
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: N.text, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.consultationType?.name ?? "Consultation"}
                      </div>
                      <div style={{ fontSize: 10, color: N.textSoft, marginTop: 1 }}>
                        {a.provider.person.firstName} {a.provider.person.lastName} · {format(parseISO(a.startAt), "d MMM yyyy", { locale: fr })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {appt.careCaseId && (
              <Link href={`/patients/${appt.careCaseId}`}
                style={{ fontSize: 11, color: N.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                Voir tout le parcours →
              </Link>
            )}
          </div>
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
  const { careCases } = agenda
  const [view, setView] = useState<"semaine" | "jour">("semaine")
  const [selectedAppt, setSelectedAppt] = useState<AgendaAppointment | null>(null)
  const [createCtx, setCreateCtx] = useState<{
    date: Date; hour: number; minute: number; location: ConsultationLocation | null
  } | null>(null)
  const [dragAppt, setDragAppt] = useState<AgendaAppointment | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

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
        <AgendaSetup onComplete={() => router.refresh()} />
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

  // ── Care case map: careCaseId → CareCase ──────────────────────
  const caseMap = new Map<string, CareCase>()
  for (const cc of careCases) caseMap.set(cc.id, cc)

  // ── Next appointment today ─────────────────────────────────────
  const nowTs = Date.now()
  const nextApptId = agenda.appointments
    .filter(a => isSameDay(parseISO(a.startAt), today) && a.status !== "CANCELLED" && parseISO(a.startAt).getTime() > nowTs)
    .sort((a, b) => parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime())[0]?.id ?? null

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
            {([["jour", "Jour"], ["semaine", "Semaine"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setView(id)}
                style={{ padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  background: view === id ? N.primary : "transparent",
                  color: view === id ? "#fff" : N.textSoft,
                  fontWeight: view === id ? 600 : 400, transition: "all 0.15s",
                }}>
                {label}
              </button>
            ))}
          </div>
          <Link href="/agenda/parametrage" style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${N.border}`, background: N.card, fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: N.textSoft, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
            ⚙️ Paramètres
          </Link>
        </div>
      </div>

      {/* DAY SUMMARY */}
      <DaySummaryBar appointments={agenda.appointments} />

      {/* DAY VIEW */}
      {view === "jour" && (
        <DayView
          appointments={agenda.appointments}
          careCases={careCases}
          getColor={agenda.getColor}
          onSelect={setSelectedAppt}
          onCreateNow={() => {
            const now = new Date()
            setCreateCtx({ date: now, hour: now.getHours() + 1, minute: 0, location: agenda.locations[0] ?? null })
          }}
        />
      )}

      {/* GRID (semaine) */}
      {view === "semaine" && (<div style={{ flex: 1, display: "flex", overflowX: "auto", overflowY: "auto" }}>
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
                <SlotCatcher date={date} onSlotClick={(h, m) => {
                  const dayName = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][date.getDay()]
                  const loc = agenda.locations.find(l => {
                    const sched = l.schedule ?? {}
                    return Array.isArray(sched[dayName]) && (sched[dayName] as Array<unknown>).length > 0
                  }) ?? agenda.locations[0] ?? null
                  setCreateCtx({ date, hour: h, minute: m, location: loc })
                }} />

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

                  return <ApptBlock key={appt.id} appt={appt} top={top} height={height} width={w} left={l} onClick={setSelectedAppt} getColor={agenda.getColor} careCase={appt.careCaseId ? (caseMap.get(appt.careCaseId) ?? null) : null} isNext={appt.id === nextApptId} />
                })}

                {/* Now line */}
                {isToday && <NowLine />}
              </div>
            </div>
          )
        })}
      </div>)}

      {/* Empty state — semaine only */}
      {view === "semaine" && !agenda.isLoading && agenda.appointments.length === 0 && (
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
