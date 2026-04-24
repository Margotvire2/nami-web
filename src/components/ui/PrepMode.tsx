"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type ClinicalNote } from "@/lib/api"
import { format, parseISO, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"
import { X, Mic, ChevronRight, Clock } from "lucide-react"
import { useConsultation } from "@/contexts/ConsultationContext"
import { useRouter } from "next/navigation"

// ─── Prep event type ──────────────────────────────────────────────────────────

interface PrepModeEvent {
  careCaseId: string
  patientName: string
  time?: string
}

// ─── Delta indicator ──────────────────────────────────────────────────────────

function Delta({ label, value, unit, prev }: {
  label: string
  value: number | null
  unit: string
  prev?: number | null
}) {
  if (value === null) return null
  const diff = prev != null ? +(value - prev).toFixed(1) : null
  const color = diff == null ? "#374151"
    : diff > 0.5 ? "#D97706"
    : diff < -0.5 ? "#059669"
    : "#6366F1"
  const arrow = diff == null ? null : diff > 0.5 ? "↑" : diff < -0.5 ? "↓" : "="

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px",
      background: "#FAFAF8",
      borderRadius: 10,
      border: "1px solid #E8ECF4",
      animation: "deltaIn 200ms ease both",
    }}>
      <style>{`@keyframes deltaIn { from { opacity:0; transform:translateX(-4px) } to { opacity:1; transform:translateX(0) } }`}</style>
      <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>{value} {unit}</span>
        {arrow && diff !== null && (
          <span style={{ fontSize: 12, fontWeight: 700, color, display: "flex", alignItems: "center", gap: 2 }}>
            {arrow} {Math.abs(diff)} {unit}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── PrepMode ─────────────────────────────────────────────────────────────────

export function PrepMode() {
  const [event, setEvent] = useState<PrepModeEvent | null>(null)
  const { accessToken } = useAuthStore()
  const { startConsultation } = useConsultation()
  const router = useRouter()
  const api = apiWithToken(accessToken ?? "")

  // Listen for global trigger
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<PrepModeEvent>).detail
      setEvent(detail)
    }
    window.addEventListener("nami-prep-mode", handler)
    return () => window.removeEventListener("nami-prep-mode", handler)
  }, [])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && event) setEvent(null) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [event])

  const { data: careCase } = useQuery({
    queryKey: ["care-case", event?.careCaseId],
    queryFn: () => api.careCases.get(event!.careCaseId),
    enabled: !!event?.careCaseId && !!accessToken,
    staleTime: 60_000,
  })

  const { data: timelineData } = useQuery({
    queryKey: ["timeline", event?.careCaseId],
    queryFn: () => api.careCases.timeline(event!.careCaseId, 1, 30),
    enabled: !!event?.careCaseId && !!accessToken,
    staleTime: 60_000,
  })

  const { data: latestObs } = useQuery<{ latest: Record<string, unknown[]>; total: number } | null>({
    queryKey: ["obs-latest", event?.careCaseId],
    queryFn: () => api.observations.latest(event!.careCaseId),
    enabled: !!event?.careCaseId && !!accessToken,
    staleTime: 60_000,
  })

  const { data: allTasks = [] } = useQuery({
    queryKey: ["tasks-mine"],
    queryFn: () => api.tasksMine.list(),
    enabled: !!accessToken,
    staleTime: 60_000,
  })

  // Fetch notes for AI fallback (only when no clinicalSummary)
  const needsNotesFallback = !!event?.careCaseId && !careCase?.clinicalSummary
  const { data: notes = [] } = useQuery<ClinicalNote[]>({
    queryKey: ["notes", event?.careCaseId],
    queryFn: () => api.notes.list(event!.careCaseId),
    enabled: !!event?.careCaseId && !!accessToken && needsNotesFallback,
    staleTime: 60_000,
  })

  if (!event) return null

  const activities = timelineData?.data ?? []

  // Find last consultation (APPOINTMENT_COMPLETED)
  const lastConsultAct = activities.find((a) =>
    a.activityType?.toUpperCase() === "APPOINTMENT_COMPLETED" ||
    a.activityType?.toUpperCase() === "APPOINTMENT_CREATED"
  )
  const lastConsultDate = lastConsultAct ? parseISO(lastConsultAct.occurredAt) : null
  const daysSince = lastConsultDate ? differenceInDays(new Date(), lastConsultDate) : null

  // Events since last consultation
  const eventsSince = lastConsultDate
    ? activities.filter((a) => parseISO(a.occurredAt) > lastConsultDate!).slice(0, 5)
    : activities.slice(0, 5)

  // Tasks for this care case
  const caseTasks = (allTasks as any[]).filter(
    (t: any) => t.careCase?.id === event.careCaseId && t.status !== "COMPLETED" && t.status !== "CANCELLED"
  ).slice(0, 4)

  // Observation metrics — latestObs = { latest: Record<string, LatestObservation[]>, total: number }
  const latestMap = (latestObs as any)?.latest ?? {}
  function getLatestVal(key: string): number | null {
    const entries: any[] = latestMap[key] ?? []
    return entries[0]?.valueNumeric ?? null
  }
  const weight = getLatestVal("weight_kg")
  const bmi = getLatestVal("bmi")
  const phq9 = getLatestVal("phq9_score")

  // Last AI-generated note (EVOLUTION with AI title, or AI_SUMMARY type)
  const aiNote = (notes as ClinicalNote[])
    .filter((n) =>
      n.noteType === "AI_SUMMARY" ||
      (n.noteType === "EVOLUTION" && (n.title?.toLowerCase().includes("compte-rendu") || n.title?.toLowerCase().includes("résumé")))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null

  const activityIcon: Record<string, string> = {
    APPOINTMENT_CREATED: "📅",
    APPOINTMENT_COMPLETED: "✅",
    NOTE_ADDED: "📝",
    DOCUMENT_UPLOADED: "📄",
    REFERRAL_CREATED: "↗",
    REFERRAL_ACCEPTED: "✓",
    CARE_PLAN_UPDATED: "🔄",
    TEAM_MEMBER_ADDED: "👤",
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9980,
          background: "rgba(15,10,30,0.45)",
          backdropFilter: "blur(6px)",
          animation: "prepBgIn 200ms ease forwards",
        }}
        onClick={() => setEvent(null)}
      />
      <style>{`
        @keyframes prepBgIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes prepSlideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes prepSection { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9981,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
          pointerEvents: "none",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(660px, 96vw)",
            maxHeight: "85vh",
            background: "#FFFFFF",
            borderRadius: 20,
            boxShadow: "0 32px 80px rgba(15,10,30,0.22), 0 0 0 1px rgba(91,78,196,0.08)",
            display: "flex", flexDirection: "column",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            animation: "prepSlideUp 280ms cubic-bezier(0.16,1,0.3,1) forwards",
            pointerEvents: "all",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #F1F5F9",
            flexShrink: 0,
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                Préparation
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>
                {event.patientName}
              </h2>
              {event.time && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 12, color: "#5B4EC4" }}>
                  <Clock size={12} />
                  Aujourd&apos;hui {event.time}
                </div>
              )}
            </div>
            <button
              onClick={() => setEvent(null)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#6B7280", display: "flex", borderRadius: 8 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Section 1 — Résumé IA (clinicalSummary) ou activité récente */}
              <div style={{ animation: "prepSection 300ms 80ms both" }}>
                <div style={{
                  background: "#FAFAF8", border: "1px solid #E8ECF4",
                  borderRadius: 14, padding: "14px 16px",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 10,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Résumé
                    </div>
                    {careCase?.clinicalSummary || aiNote ? (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                        background: "#E8F5EC", color: "#059669",
                        letterSpacing: "0.04em",
                      }}>
                        Résumé IA — à vérifier
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                        background: "#F0EDF9", color: "#5B4EC4",
                        letterSpacing: "0.04em",
                      }}>
                        Activité récente
                      </span>
                    )}
                  </div>

                  {careCase?.clinicalSummary ? (
                    /* Résumé IA dossier disponible → l'afficher en priorité */
                    <div>
                      <p style={{
                        fontSize: 13, color: "#1A1A2E", lineHeight: 1.6,
                        margin: 0, fontStyle: "italic",
                      }}>
                        &ldquo;{careCase.clinicalSummary.slice(0, 320)}{careCase.clinicalSummary.length > 320 ? "…" : ""}&rdquo;
                      </p>
                      {/* Activité récente condensée sous le résumé */}
                      {eventsSince.length > 0 && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E8ECF4" }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>
                            {lastConsultDate
                              ? `Depuis le ${format(lastConsultDate, "d MMM", { locale: fr })} (${daysSince}j)`
                              : "Récemment"}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {eventsSince.slice(0, 3).map((a) => (
                              <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11 }}>
                                <span style={{ fontSize: 12, flexShrink: 0 }}>{activityIcon[a.activityType?.toUpperCase()] ?? "·"}</span>
                                <span style={{ color: "#374151" }}>{a.title}</span>
                                <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 9, color: "#6B7280" }}>
                                  {format(parseISO(a.occurredAt), "d MMM", { locale: fr })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : aiNote ? (
                    /* Dernier compte-rendu IA → afficher le contenu textuel */
                    <div>
                      <p style={{
                        fontSize: 13, color: "#1A1A2E", lineHeight: 1.6,
                        margin: 0, fontStyle: "italic",
                        display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      } as React.CSSProperties}>
                        &ldquo;{aiNote.body}&rdquo;
                      </p>
                      <div style={{ marginTop: 8, fontSize: 10, color: "#6B7280" }}>
                        {aiNote.title ?? "Compte-rendu"} · {format(parseISO(aiNote.createdAt), "d MMM yyyy", { locale: fr })}
                        {aiNote.author && ` · ${aiNote.author.firstName} ${aiNote.author.lastName}`}
                      </div>
                    </div>
                  ) : (
                    /* Pas de résumé ni de note IA → activité récente comme dernier recours */
                    <div>
                      {eventsSince.length === 0 ? (
                        <p style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>Aucune activité enregistrée depuis le dernier RDV.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {eventsSince.map((a) => (
                            <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                              <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.2 }}>
                                {activityIcon[a.activityType?.toUpperCase()] ?? "·"}
                              </span>
                              <div>
                                <span style={{ color: "#1A1A2E", fontWeight: 500 }}>{a.title}</span>
                                {a.summary && (
                                  <span style={{ color: "#6B7280", marginLeft: 6 }}>— {a.summary.slice(0, 80)}{a.summary.length > 80 ? "…" : ""}</span>
                                )}
                              </div>
                              <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 10, color: "#6B7280" }}>
                                {format(parseISO(a.occurredAt), "d MMM", { locale: fr })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #E8ECF4", fontSize: 10, color: "#6B7280" }}>
                        {eventsSince.length} événement{eventsSince.length !== 1 ? "s" : ""} · {daysSince !== null ? `${daysSince} jours depuis votre dernière consultation` : "Nouveau dossier"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2 — Ce qui a bougé */}
              {(weight !== null || bmi !== null || phq9 !== null) && (
                <div style={{ animation: "prepSection 300ms 180ms both" }}>
                  <div style={{
                    background: "#FAFAF8", border: "1px solid #E8ECF4",
                    borderRadius: 14, padding: "14px 16px",
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: "#6B7280",
                      letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10,
                    }}>
                      CE QUI A BOUGÉ
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Delta label="Poids" value={weight} unit="kg" />
                      <Delta label="IMC" value={bmi} unit="" />
                      <Delta label="PHQ-9" value={phq9} unit="" />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3 — Points à aborder */}
              <div style={{ animation: "prepSection 300ms 280ms both" }}>
                <div style={{
                  background: "#FAFAF8", border: "1px solid #E8ECF4",
                  borderRadius: 14, padding: "14px 16px",
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "#6B7280",
                    letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10,
                  }}>
                    POINTS À ABORDER
                  </div>

                  {caseTasks.length === 0 && !careCase?.nextStepSummary ? (
                    <p style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>Aucune tâche en attente pour ce dossier.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {careCase?.nextStepSummary && (
                        <div style={{ display: "flex", gap: 8, fontSize: 12, alignItems: "flex-start" }}>
                          <span style={{ color: "#5B4EC4", flexShrink: 0 }}>☐</span>
                          <span style={{ color: "#1A1A2E" }}>{careCase.nextStepSummary}</span>
                        </div>
                      )}
                      {caseTasks.map((t: any) => (
                        <div key={t.id} style={{ display: "flex", gap: 8, fontSize: 12, alignItems: "flex-start" }}>
                          <span style={{ color: "#5B4EC4", flexShrink: 0 }}>☐</span>
                          <span style={{ color: "#1A1A2E" }}>{t.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #E8ECF4", fontSize: 10, color: "#6B7280" }}>
                    Suggestions — à valider par le soignant
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer actions */}
          <div style={{
            padding: "14px 24px",
            borderTop: "1px solid #F1F5F9",
            display: "flex", gap: 10, flexShrink: 0,
          }}>
            <button
              onClick={async () => {
                setEvent(null)
                try {
                  await startConsultation({ careCaseId: event.careCaseId, patientName: event.patientName })
                } catch {/* ignore */}
              }}
              style={{
                flex: 1, padding: "10px 16px", borderRadius: 12, border: "none",
                background: "#5B4EC4", color: "#FFF",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 150ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#4A3DB3" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#5B4EC4" }}
            >
              <Mic size={14} /> Démarrer la consultation
            </button>
            <button
              onClick={() => { setEvent(null); router.push(`/patients/${event.careCaseId}`) }}
              style={{
                flex: "0 0 auto", padding: "10px 16px", borderRadius: 12,
                border: "1px solid #E8ECF4", background: "transparent",
                fontSize: 13, fontWeight: 600, color: "#5B4EC4", fontFamily: "inherit",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Voir le dossier <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
