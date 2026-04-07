"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { format, addMinutes } from "date-fns"
import { fr } from "date-fns/locale"
import type { ConsultationTypeDTO, ConsultationLocation } from "@/lib/api"
import { Loader2 } from "lucide-react"

/* ─── Types ─── */

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  birthDate?: string
  phone?: string
  email?: string
}

interface CreateModalProps {
  date: Date
  hour: number
  minute: number
  location: ConsultationLocation | null
  consultationTypes: ConsultationTypeDTO[]
  patients: PatientOption[]
  isCreating: boolean
  onClose: () => void
  onSave: (data: {
    patientId: string
    providerId: string
    locationType: "IN_PERSON" | "VIDEO" | "PHONE"
    startAt: string
    endAt: string
    consultationTypeId?: string
    isFirstConsultation?: boolean
    notes?: string
    careCaseId?: string
    locationId?: string
  }) => void
  onCreateAbsence: (data: { label: string; startDate: string; endDate: string }) => void
  providerId: string
}

/* ─── Palette ─── */
const N = {
  primary: "#5B4EC4", primaryLight: "#EDE9FC", text: "#2D2B3D", textSoft: "#8A879C",
  border: "#ECEAF5", success: "#4E9A7C", successBg: "#EDF7F2",
  danger: "#C4574E", dangerBg: "#FDF0EF", warning: "#E6A23C",
  card: "#FFF",
}

/* ─── Patient Search ─── */

function PatientSearch({ patients, onSelect }: { patients: PatientOption[]; onSelect: (p: PatientOption) => void }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const results = useMemo(() => {
    if (q.length < 1) return []
    const low = q.toLowerCase()
    return patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(low)).slice(0, 6)
  }, [q, patients])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input type="text" value={q} placeholder="Rechercher un patient…"
        onChange={e => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => q.length >= 1 && setOpen(true)}
        style={inputSt} />
      {open && q.length >= 1 && (
        <div style={dropSt}>
          {results.map(p => (
            <div key={p.id} style={dropItemSt}
              onClick={() => { onSelect(p); setQ(`${p.firstName} ${p.lastName}`); setOpen(false) }}
              onMouseEnter={e => (e.currentTarget.style.background = N.primaryLight)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: N.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: N.primary, flexShrink: 0 }}>
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: N.text }}>{p.firstName} {p.lastName}</div>
                  <div style={{ fontSize: 11, color: N.textSoft }}>
                    {p.birthDate ? format(new Date(p.birthDate), "dd/MM/yyyy") : ""}{p.phone ? ` · ${p.phone}` : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div style={{ padding: "12px 14px", fontSize: 12, color: N.textSoft, textAlign: "center" }}>
              Aucun patient trouvé pour « {q} »
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main Modal ─── */

export function CreateAppointmentModal({
  date, hour, minute, location, consultationTypes, patients,
  isCreating, onClose, onSave, onCreateAbsence, providerId,
}: CreateModalProps) {
  const [mode, setMode] = useState<"rdv" | "absence">("rdv")
  const [patient, setPatient] = useState<PatientOption | null>(null)
  const [ctId, setCtId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [absenceLabel, setAbsenceLabel] = useState("")
  const [startH, setStartH] = useState(hour)
  const [startM, setStartM] = useState(minute)
  const [customDur, setCustomDur] = useState<number | null>(null)

  const ct = consultationTypes.find(c => c.id === ctId)
  const duration = mode === "absence"
    ? (customDur || 60)
    : (customDur || ct?.durationMinutes || 30)

  const startDate = new Date(date)
  startDate.setHours(startH, startM, 0, 0)
  const endDate = addMinutes(startDate, duration)

  const locationType: "IN_PERSON" | "VIDEO" | "PHONE" =
    ct?.consultationMode === "VIDEO" ? "VIDEO"
      : ct?.consultationMode === "PHONE" ? "PHONE"
        : "IN_PERSON"

  const canSave = mode === "rdv" ? !!(patient && ctId) : !!absenceLabel

  function handleSave() {
    if (!canSave) return
    if (mode === "rdv") {
      onSave({
        patientId: patient!.id,
        providerId,
        locationType,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        consultationTypeId: ctId || undefined,
        isFirstConsultation: ct?.isFirstTimeOnly ?? false,
        notes: notes || undefined,
        locationId: location?.id,
      })
    } else {
      onCreateAbsence({
        label: absenceLabel,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
      <div style={{ position: "relative", width: 460, maxWidth: "94vw", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.12)", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: N.text }}>Nouveau créneau</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: N.textSoft, cursor: "pointer" }}>✕</button>
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 4, background: "#ECEAF5", borderRadius: 10, padding: 3, marginBottom: 18 }}>
            {([["rdv", "🩺 Rendez-vous"], ["absence", "🚫 Absence"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setMode(id)}
                style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", fontSize: 13, fontWeight: mode === id ? 600 : 400, cursor: "pointer", fontFamily: "inherit", background: mode === id ? N.primary : "transparent", color: mode === id ? "#fff" : N.textSoft }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Time + Location */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Heure</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select value={startH} onChange={e => setStartH(+e.target.value)} style={{ ...inputSt, flex: 1 }}>
                  {Array.from({ length: 14 }, (_, i) => 8 + i).map(h => <option key={h} value={h}>{String(h).padStart(2, "0")}h</option>)}
                </select>
                <select value={startM} onChange={e => setStartM(+e.target.value)} style={{ ...inputSt, width: 70 }}>
                  {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                </select>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Lieu</label>
              <div style={{ padding: "9px 12px", background: "#FAFAFD", borderRadius: 10, border: `1.5px solid ${N.border}`, fontSize: 13, color: N.text, display: "flex", alignItems: "center", gap: 6 }}>
                {location && <div style={{ width: 8, height: 8, borderRadius: "50%", background: location.color ?? N.primary }} />}
                {location?.name ?? "—"}
              </div>
            </div>
          </div>

          {/* Date */}
          <div style={{ fontSize: 13, color: N.textSoft }}>
            {format(date, "EEEE d MMMM yyyy", { locale: fr })}
          </div>

          {mode === "rdv" ? (
            <>
              {/* Patient search */}
              <div>
                <label style={labelSt}>Patient</label>
                <PatientSearch patients={patients} onSelect={setPatient} />
                {patient && (
                  <div style={{ marginTop: 6, padding: "6px 10px", background: N.successBg, borderRadius: 8, fontSize: 12, color: N.success, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 600 }}>✓ {patient.firstName} {patient.lastName}</span>
                    {patient.phone && <span style={{ color: N.textSoft }}>· {patient.phone}</span>}
                  </div>
                )}
              </div>

              {/* Consultation type */}
              <div>
                <label style={labelSt}>Type de consultation</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {consultationTypes.map(c => (
                    <button key={c.id} onClick={() => { setCtId(c.id); setCustomDur(null) }}
                      style={{ ...chipSt, background: ctId === c.id ? N.primary : "#F3F2FA", color: ctId === c.id ? "#fff" : N.text }}>
                      {c.name} ({c.durationMinutes}min)
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration override */}
              {ct && (
                <div>
                  <label style={labelSt}>Durée (min)</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[15, 20, 30, 45, 60, 90].map(d => (
                      <button key={d} onClick={() => setCustomDur(d)}
                        style={{ ...chipSt, minWidth: 40, justifyContent: "center", background: duration === d ? N.primary : "#F3F2FA", color: duration === d ? "#fff" : N.text }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes / motif */}
              <div>
                <label style={labelSt}>Notes / motif</label>
                <textarea style={{ ...inputSt, minHeight: 60, resize: "vertical" as const, fontFamily: "inherit" }}
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Motif de consultation, remarques…" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={labelSt}>Motif de l&apos;absence</label>
                <input style={inputSt} value={absenceLabel} onChange={e => setAbsenceLabel(e.target.value)}
                  placeholder="Formation, Personnel, Congrès…" />
              </div>
              <div>
                <label style={labelSt}>Durée</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[30, 60, 120, 180, 240, 480].map(d => (
                    <button key={d} onClick={() => setCustomDur(d)}
                      style={{ ...chipSt, minWidth: 44, justifyContent: "center", background: duration === d ? N.primary : "#F3F2FA", color: duration === d ? "#fff" : N.text }}>
                      {d < 60 ? `${d}m` : `${d / 60}h`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Summary */}
          <div style={{ background: N.primaryLight, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: N.primary }}>
            {format(startDate, "HH:mm")} → {format(endDate, "HH:mm")} ({duration} min) · {location?.name ?? "—"}
          </div>

          {/* Submit */}
          <button onClick={handleSave} disabled={!canSave || isCreating}
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: canSave ? (mode === "rdv" ? N.primary : N.textSoft) : "#ddd", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: canSave ? "pointer" : "not-allowed", opacity: isCreating ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {isCreating && <Loader2 size={14} className="animate-spin" />}
            {mode === "rdv" ? "Enregistrer le RDV" : "Bloquer ce créneau"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Styles ─── */
const inputSt: React.CSSProperties = { width: "100%", padding: "9px 12px", border: `1.5px solid ${N.border}`, borderRadius: 10, fontSize: 14, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", color: N.text, background: "#FAFAFD", outline: "none" }
const labelSt: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: N.textSoft, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6, display: "block" }
const chipSt: React.CSSProperties = { padding: "7px 12px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }
const dropSt: React.CSSProperties = { position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 10, marginTop: 4, overflow: "hidden", border: `1px solid ${N.border}`, maxHeight: 280, overflowY: "auto" }
const dropItemSt: React.CSSProperties = { padding: "10px 12px", cursor: "pointer", transition: "background 0.1s" }
