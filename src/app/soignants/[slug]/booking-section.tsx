"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarPlus, Clock, MapPin, Video, Phone,
  ChevronRight, ChevronLeft, X, Check, Loader2,
  User, Mail, Lock, Heart, Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

const PRIMARY = "#4F46E5"

// ─── Types ───────────────────────────────────────────────────────────────────

interface PublicSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  weekday: number
  locationType: string
  consultationType: { name: string; durationMinutes: number } | null
  priority: "recommended" | "available"
}

interface BookingSectionProps {
  providerId: string
  providerFirstName: string
  providerLastName: string
  providerSpecialties: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]

function formatSlotDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function locationIcon(type: string) {
  if (type === "VIDEO") return <Video size={13} className="text-indigo-500" />
  if (type === "PHONE") return <Phone size={13} className="text-orange-500" />
  return <MapPin size={13} className="text-emerald-500" />
}

function locationLabel(type: string) {
  if (type === "VIDEO") return "Téléconsultation"
  if (type === "PHONE") return "Téléphone"
  return "Présentiel"
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function BookingSection({
  providerId,
  providerFirstName,
  providerLastName,
  providerSpecialties,
}: BookingSectionProps) {
  const router = useRouter()
  const { accessToken, user, setAuth } = useAuthStore()

  const [slots, setSlots] = useState<PublicSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState<"slot" | "auth" | "motif" | "done">("slot")
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null)
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup")
  const [submitting, setSubmitting] = useState(false)

  // Auth form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [birthDate, setBirthDate] = useState("")

  // Motif
  const [motif, setMotif] = useState("")

  // ─── Fetch slots ─────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/appointment-requests/public-slots/${providerId}`)
        if (res.ok) {
          const data = await res.json()
          setSlots(data)
        }
      } catch {
        // Silent fail
      } finally {
        setLoadingSlots(false)
      }
    }
    load()
  }, [providerId])

  // ─── Slot selection ──────────────────────────────────────────────────────

  function selectSlot(slot: PublicSlot) {
    setSelectedSlot(slot)
    setModalOpen(true)
    // If already authenticated, skip auth step
    if (accessToken && user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
      setStep("motif")
    } else {
      setStep("auth")
    }
  }

  function openFreeRequest() {
    setSelectedSlot(null)
    setModalOpen(true)
    if (accessToken && user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
      setStep("motif")
    } else {
      setStep("auth")
    }
  }

  // ─── Auth ────────────────────────────────────────────────────────────────

  async function handleAuth() {
    setSubmitting(true)
    try {
      if (authMode === "signup") {
        if (!firstName || !lastName || !email || !password) {
          toast.error("Veuillez remplir tous les champs obligatoires")
          return
        }
        const result = await authApi.signup({
          email,
          password,
          firstName,
          lastName,
          roleType: "PATIENT",
          phone: phone || undefined,
        })
        const me = await authApi.me(result.accessToken)
        setAuth(me, result.accessToken, result.refreshToken)
        setStep("motif")
      } else {
        if (!email || !password) {
          toast.error("Email et mot de passe requis")
          return
        }
        const result = await authApi.login(email, password)
        const me = await authApi.me(result.accessToken)
        setAuth(me, result.accessToken, result.refreshToken)
        setFirstName(me.firstName)
        setLastName(me.lastName)
        setEmail(me.email)
        setStep("motif")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Submit request ──────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        providerId,
        patientFirstName: firstName,
        patientLastName: lastName,
        patientEmail: email,
        patientPhone: phone || undefined,
        patientBirthDate: birthDate || undefined,
        motif: motif || undefined,
      }

      if (selectedSlot) {
        body.requestedDate = `${selectedSlot.date}T${selectedSlot.startTime}:00`
        body.locationType = selectedSlot.locationType
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" }
      const { accessToken: token } = useAuthStore.getState()
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(`${API_URL}/appointment-requests`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Erreur ${res.status}`)
      }

      setStep("done")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Close ───────────────────────────────────────────────────────────────

  function closeModal() {
    setModalOpen(false)
    setStep("slot")
    setSelectedSlot(null)
    setMotif("")
    setSubmitting(false)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      {/* Slots section */}
      <div className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <CalendarPlus size={16} className="text-indigo-500" />
          Prendre rendez-vous
        </h2>

        {loadingSlots ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <Loader2 size={14} className="animate-spin" /> Chargement des créneaux…
          </div>
        ) : slots.length > 0 ? (
          <SlotGrid slots={slots} onSelect={selectSlot} />
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">
              Pas de créneau en ligne pour le moment.
            </p>
            <button
              onClick={openFreeRequest}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: PRIMARY }}
            >
              <CalendarPlus size={14} /> Demander un rendez-vous
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <button
          onClick={() => (slots.length > 0 ? selectSlot(slots[0]) : openFreeRequest())}
          className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: PRIMARY }}
        >
          <CalendarPlus size={16} /> Prendre rendez-vous avec {providerFirstName}
        </button>
        <p className="mt-2 text-xs text-gray-400">
          Gratuit — votre demande sera confirmée par le soignant
        </p>
      </div>

      {/* ─── MODAL ──────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-base font-semibold text-gray-900">
                {step === "done" ? "Demande envoyée" : `Rendez-vous avec ${providerFirstName} ${providerLastName}`}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {/* ── STEP: AUTH ──────────────────────────────────────── */}
              {step === "auth" && (
                <div className="space-y-4">
                  {selectedSlot && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                      <div className="text-center min-w-[48px]">
                        <p className="text-[11px] text-gray-500">{formatSlotDate(selectedSlot.date)}</p>
                        <p className="text-base font-bold text-gray-900">{selectedSlot.startTime}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {locationIcon(selectedSlot.locationType)}
                        <span className="text-xs text-gray-600">{locationLabel(selectedSlot.locationType)}</span>
                      </div>
                    </div>
                  )}

                  {/* Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAuthMode("signup")}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                        authMode === "signup"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Créer un compte
                    </button>
                    <button
                      onClick={() => setAuthMode("login")}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                        authMode === "login"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      J&apos;ai déjà un compte
                    </button>
                  </div>

                  {authMode === "signup" ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <InputField icon={<User size={14} />} placeholder="Prénom *" value={firstName} onChange={setFirstName} />
                        <InputField icon={<User size={14} />} placeholder="Nom *" value={lastName} onChange={setLastName} />
                      </div>
                      <InputField icon={<Mail size={14} />} placeholder="Email *" type="email" value={email} onChange={setEmail} />
                      <InputField icon={<Lock size={14} />} placeholder="Mot de passe *" type="password" value={password} onChange={setPassword} />
                      <InputField icon={<Phone size={14} />} placeholder="Téléphone (optionnel)" value={phone} onChange={setPhone} />
                      <InputField
                        icon={<CalendarPlus size={14} />}
                        placeholder="Date de naissance"
                        type="date"
                        value={birthDate}
                        onChange={setBirthDate}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <InputField icon={<Mail size={14} />} placeholder="Email" type="email" value={email} onChange={setEmail} />
                      <InputField icon={<Lock size={14} />} placeholder="Mot de passe" type="password" value={password} onChange={setPassword} />
                    </div>
                  )}

                  <button
                    onClick={handleAuth}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                    style={{ background: PRIMARY }}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                    {authMode === "signup" ? "Créer mon compte" : "Se connecter"}
                  </button>
                </div>
              )}

              {/* ── STEP: MOTIF ─────────────────────────────────────── */}
              {step === "motif" && (
                <div className="space-y-4">
                  {selectedSlot && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                      <div className="text-center min-w-[48px]">
                        <p className="text-[11px] text-gray-500">{formatSlotDate(selectedSlot.date)}</p>
                        <p className="text-base font-bold text-gray-900">{selectedSlot.startTime}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {locationIcon(selectedSlot.locationType)}
                        <span className="text-xs text-gray-600">{locationLabel(selectedSlot.locationType)}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Motif de consultation (optionnel)
                    </label>
                    <textarea
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      placeholder="Décrivez brièvement votre motif de consultation…"
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    {!accessToken && (
                      <button
                        onClick={() => setStep("auth")}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        <ChevronLeft size={14} /> Retour
                      </button>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                      style={{ background: PRIMARY }}
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Confirmer la demande
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: DONE ──────────────────────────────────────── */}
              {step === "done" && (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Heart size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Votre demande a été envoyée
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {providerFirstName} vous contactera pour confirmer votre rendez-vous.
                      Vous recevrez un email de confirmation.
                    </p>
                  </div>
                  {selectedSlot && (
                    <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                      <div className="text-center">
                        <p className="text-[11px] text-gray-500">{formatSlotDate(selectedSlot.date)}</p>
                        <p className="text-sm font-bold text-gray-900">{selectedSlot.startTime}</p>
                      </div>
                      <span className="text-xs text-gray-400">En attente de confirmation</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => router.push("/soignants")}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Retour à l&apos;annuaire
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── SlotGrid — two-section display (recommended + available) ────────────────

function SlotButton({ slot, variant, onSelect }: {
  slot: PublicSlot
  variant: "recommended" | "default"
  onSelect: (s: PublicSlot) => void
}) {
  const isRec = variant === "recommended"
  return (
    <button
      onClick={() => onSelect(slot)}
      className={`flex items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors group ${
        isRec
          ? "border-teal-200 bg-teal-50 hover:border-teal-400 hover:bg-teal-100/60"
          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="text-center min-w-[52px]">
          <p className={`text-xs font-medium ${isRec ? "text-teal-600" : "text-gray-500"}`}>
            {formatSlotDate(slot.date)}
          </p>
          <p className={`text-base font-bold ${isRec ? "text-teal-800" : "text-gray-900"}`}>
            {slot.startTime}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            {locationIcon(slot.locationType)}
            <span className="text-xs text-gray-600">{locationLabel(slot.locationType)}</span>
          </div>
          {slot.consultationType && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={11} className="text-gray-400" />
              <span className="text-[11px] text-gray-400">
                {slot.consultationType.durationMinutes} min
              </span>
            </div>
          )}
        </div>
      </div>
      <ChevronRight
        size={13}
        className={`${isRec ? "text-teal-400 group-hover:text-teal-600" : "text-gray-300 group-hover:text-indigo-500"} transition-colors`}
      />
    </button>
  )
}

function SlotGrid({ slots, onSelect }: { slots: PublicSlot[]; onSelect: (s: PublicSlot) => void }) {
  const recommended = slots.filter((s) => s.priority === "recommended")
  const others = slots.filter((s) => s.priority === "available")

  return (
    <div className="space-y-4">
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={13} className="text-teal-600" />
            <h3 className="text-xs font-semibold text-teal-700">Créneaux recommandés</h3>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            Ces créneaux s&apos;enchaînent avec vos consultations — pas de trou d&apos;agenda
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {recommended.slice(0, 6).map((slot) => (
              <SlotButton key={slot.id} slot={slot} variant="recommended" onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          {recommended.length > 0 && (
            <h3 className="text-xs font-semibold text-gray-500 mb-2">Autres créneaux disponibles</h3>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {others.slice(0, recommended.length > 0 ? 4 : 6).map((slot) => (
              <SlotButton key={slot.id} slot={slot} variant="default" onSelect={onSelect} />
            ))}
          </div>
          {(recommended.length > 0 ? others.length > 4 : others.length > 6) && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              + {recommended.length > 0 ? others.length - 4 : others.length - 6} autres créneaux disponibles
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Input field helper ──────────────────────────────────────────────────────

function InputField({
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  icon: React.ReactNode
  placeholder: string
  type?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 outline-none"
      />
    </div>
  )
}
