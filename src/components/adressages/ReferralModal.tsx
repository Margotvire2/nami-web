"use client"

import { useState, useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  X, Users, Search, ChevronRight, ChevronLeft,
  CheckCircle2, ArrowLeftRight,
  Loader2, BadgeCheck, Video, MapPin, Sparkles,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReferralModalProps {
  open: boolean
  onClose: () => void
  careCaseId: string
  patientFirstName: string
  senderRoleType: string
  taskId?: string
  initialClinicalReason?: string
}

interface ProviderOption {
  id: string
  personId: string
  firstName: string
  lastName: string
  specialties: string[]
  consultationCity?: string | null
  teleconsultAvailable?: boolean
  badges?: { rppsVerified?: boolean }
  isOnNami: boolean
}

type Urgency = "ROUTINE" | "URGENT" | "EMERGENCY"

const URGENCY_OPTIONS: { value: Urgency; label: string; desc: string; color: string }[] = [
  { value: "ROUTINE", label: "Routine", desc: "Consultation dans les 4-6 semaines", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { value: "URGENT", label: "Sous 15 jours", desc: "Prise en charge rapide mais non urgente", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { value: "EMERGENCY", label: "Urgent", desc: "Prise en charge dans les 48-72h", color: "bg-red-50 border-red-200 text-red-700" },
]

// ─── Modal ──────────────────────────────────────────────────────────────────

export function ReferralModal({
  open, onClose, careCaseId, patientFirstName, senderRoleType, taskId, initialClinicalReason,
}: ReferralModalProps) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()

  const [step, setStep] = useState(1)
  const [searchMode, setSearchMode] = useState<"contacts" | "search" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(null)
  const [clinicalReason, setClinicalReason] = useState(initialClinicalReason ?? "")
  const [urgency, setUrgency] = useState<Urgency>("ROUTINE")
  const [personalMessage, setPersonalMessage] = useState("")
  const [patientConsent, setPatientConsent] = useState(false)
  const [letterDraft, setLetterDraft] = useState<string | null>(null)
  const [letterLoading, setLetterLoading] = useState(false)

  const isPhysician = senderRoleType === "PHYSICIAN"
  const actionLabel = isPhysician ? "Adressage" : "Demande de coordination"
  const actionVerb = isPhysician ? "Adresser" : "Demander une coordination pour"

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

  const { data: colleagues = [], isLoading: loadingColleagues } = useQuery({
    queryKey: ["my-colleagues"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/providers/my-colleagues`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) return []
      return res.json()
    },
    enabled: open && searchMode === "contacts",
  })

  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ["provider-search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return []
      const res = await fetch(
        `${API_URL}/providers/public?specialty=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!res.ok) return []
      const data = await res.json()
      return (data.results ?? []).map((p: any) => ({
        id: p.id,
        personId: p.personId,
        firstName: p.firstName,
        lastName: p.lastName,
        specialties: p.specialties ?? [],
        consultationCity: p.consultationCity,
        teleconsultAvailable: p.teleconsultAvailable,
        badges: p.badges,
        isOnNami: true,
      }))
    },
    enabled: open && searchMode === "search" && searchQuery.length >= 2,
  })

  const createReferral = useMutation({
    mutationFn: () =>
      api.referrals.create({
        careCaseId,
        targetProviderId: selectedProvider?.id,
        mode: "DIRECT",
        priority: urgency,
        clinicalReason,
        personalMessage: personalMessage || undefined,
        patientConsent: true,
        referralType: isPhysician ? "REFERRAL" : "COORDINATION_REQUEST",
        taskId,
      }),
    onSuccess: () => {
      setStep(3)
      qc.invalidateQueries({ queryKey: ["referrals"] })
      qc.invalidateQueries({ queryKey: ["care-case", careCaseId] })
      qc.invalidateQueries({ queryKey: ["timeline", careCaseId] })
      qc.invalidateQueries({ queryKey: ["tasks-mine"] })
      qc.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de l'envoi")
    },
  })

  async function generateLetter() {
    if (!clinicalReason.trim()) {
      toast.error("Renseignez d'abord le motif clinique")
      return
    }
    setLetterLoading(true)
    try {
      const res = await fetch(`${API_URL}/intelligence/referral-letter/${careCaseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          clinicalReason,
          urgency,
          targetSpecialty: selectedProvider?.specialties?.[0],
          targetProviderName: selectedProvider ? `${selectedProvider.firstName} ${selectedProvider.lastName}` : undefined,
        }),
      })
      if (!res.ok) throw new Error("Erreur génération lettre")
      const data = await res.json()
      setLetterDraft(data.letter)
      setClinicalReason(data.letter)
    } catch {
      toast.error("Impossible de générer la lettre d'adressage")
    } finally {
      setLetterLoading(false)
    }
  }

  const handleClose = useCallback(() => {
    setStep(1)
    setSearchMode(null)
    setSearchQuery("")
    setSelectedProvider(null)
    setClinicalReason(initialClinicalReason ?? "")
    setUrgency("ROUTINE")
    setPersonalMessage("")
    setPatientConsent(false)
    setLetterDraft(null)
    onClose()
  }, [onClose, initialClinicalReason])

  if (!open) return null

  const colleagueOptions: ProviderOption[] = (colleagues as any[])
    .filter((c: any) => !!c.provider?.id)
    .map((c: any) => ({
      id: c.provider.id,
      personId: c.person?.id,
      firstName: c.person?.firstName ?? "",
      lastName: c.person?.lastName ?? "",
      specialties: c.provider?.specialties ?? [],
      isOnNami: true,
    }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 cockpit-glass-overlay" onClick={handleClose} />

      <div className="relative w-full max-w-2xl rounded-xl border bg-white shadow-2xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold text-[15px]">
              {step === 1 && `${actionVerb} ${patientFirstName}`}
              {step === 2 && `Détails de la demande`}
              {step === 3 && `Demande envoyée`}
            </h2>
            {step < 3 && (
              <p className="text-xs text-gray-400 mt-0.5">Étape {step} sur 2</p>
            )}
          </div>
          <button onClick={handleClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP 1 — Vers qui ── */}
          {step === 1 && !searchMode && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">Choisissez le destinataire</p>

              <button
                onClick={() => setSearchMode("contacts")}
                className="flex w-full items-center gap-4 rounded-xl border p-4 text-left hover:border-[#5B4EC4]/30 hover:bg-[#5B4EC4]/5 transition-all"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#EEEDFB] text-[#5B4EC4]">
                  <Users className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Mes contacts Nami</p>
                  <p className="text-xs text-[#8A8A96]">Un confrère de mon réseau</p>
                </div>
                <ChevronRight className="size-4 text-[#8A8A96]" />
              </button>

              <button
                onClick={() => setSearchMode("search")}
                className="flex w-full items-center gap-4 rounded-xl border p-4 text-left hover:border-[#5B4EC4]/30 hover:bg-[#5B4EC4]/5 transition-all"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-[rgba(43,168,156,0.08)] text-[#2BA89C]">
                  <Search className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Recherche annuaire</p>
                  <p className="text-xs text-[#8A8A96]">Trouver un spécialiste sur Nami ou RPPS</p>
                </div>
                <ChevronRight className="size-4 text-[#8A8A96]" />
              </button>
            </div>
          )}

          {/* ── STEP 1 — Contacts list ── */}
          {step === 1 && searchMode === "contacts" && (
            <div className="space-y-3">
              <button onClick={() => setSearchMode(null)} className="text-xs text-[#8A8A96] hover:text-[#4A4A5A] flex items-center gap-1">
                <ChevronLeft className="size-3" /> Retour
              </button>
              {loadingColleagues ? (
                <div className="py-8 text-center"><Loader2 className="size-5 animate-spin mx-auto text-[#8A8A96]" /></div>
              ) : colleagueOptions.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#8A8A96]">Aucun contact trouvé</p>
              ) : (
                colleagueOptions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProvider(p); setStep(2) }}
                    className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:border-[#5B4EC4]/30 transition-all"
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#EEEDFB] text-[#5B4EC4] text-xs font-bold">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-[#8A8A96] truncate">{p.specialties[0] ?? "Soignant"}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(43,168,156,0.08)] text-[#2BA89C] font-medium">Sur Nami</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* ── STEP 1 — Search mode ── */}
          {step === 1 && searchMode === "search" && (
            <div className="space-y-3">
              <button onClick={() => setSearchMode(null)} className="text-xs text-[#8A8A96] hover:text-[#4A4A5A] flex items-center gap-1">
                <ChevronLeft className="size-3" /> Retour
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8A8A96]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Psychologue TCA Paris..."
                  className="w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30"
                  autoFocus
                />
              </div>
              {loadingSearch && <div className="py-4 text-center"><Loader2 className="size-5 animate-spin mx-auto text-[#8A8A96]" /></div>}
              {searchResults?.map((p: ProviderOption) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProvider(p); setStep(2) }}
                  className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:border-[#5B4EC4]/30 transition-all"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#EEEDFB] text-[#5B4EC4] text-xs font-bold">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-[#8A8A96] truncate">{p.specialties[0] ?? "Soignant"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.consultationCity && <span className="text-[10px] text-[#8A8A96] flex items-center gap-0.5"><MapPin className="size-2.5" />{p.consultationCity}</span>}
                      {p.teleconsultAvailable && <span className="text-[10px] text-[#2BA89C] flex items-center gap-0.5"><Video className="size-2.5" />Téléconsult</span>}
                    </div>
                  </div>
                  {p.badges?.rppsVerified && <BadgeCheck className="size-4 text-[#2BA89C] shrink-0" />}
                </button>
              ))}
              {searchQuery.length >= 2 && !loadingSearch && (searchResults?.length ?? 0) === 0 && (
                <p className="py-4 text-center text-sm text-[#8A8A96]">Aucun résultat</p>
              )}
            </div>
          )}

          {/* ── STEP 2 — Détails ── */}
          {step === 2 && selectedProvider && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl border bg-[#FAFAF8] p-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#EEEDFB] text-[#5B4EC4] text-xs font-bold">
                  {selectedProvider.firstName[0]}{selectedProvider.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedProvider.firstName} {selectedProvider.lastName}</p>
                  <p className="text-xs text-[#8A8A96]">{selectedProvider.specialties[0] ?? "Soignant"}</p>
                </div>
                <button onClick={() => { setSelectedProvider(null); setStep(1) }} className="text-xs text-[#5B4EC4] hover:underline">
                  Changer
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#4A4A5A]">
                    Motif de la {actionLabel.toLowerCase()}
                  </label>
                  <button
                    type="button"
                    onClick={generateLetter}
                    disabled={letterLoading}
                    className="flex items-center gap-1 text-[10px] font-medium text-[#5B4EC4] hover:text-[#4c44b0] disabled:opacity-50 transition-colors"
                  >
                    {letterLoading
                      ? <><Loader2 size={10} className="animate-spin" /> Rédaction du brouillon…</>
                      : <><Sparkles size={10} /> Rédiger un brouillon à partir du motif</>
                    }
                  </button>
                </div>
                {letterDraft && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-1.5">
                    <Sparkles size={9} /> Brouillon IA — à relire et valider avant envoi
                  </div>
                )}
                <Textarea
                  value={clinicalReason}
                  onChange={(e) => { setClinicalReason(e.target.value); setLetterDraft(null) }}
                  placeholder="Décrivez le motif clinique. L'IA pourra ensuite rédiger un brouillon de lettre d'adressage à partir de votre saisie."
                  rows={letterDraft ? 10 : 3}
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#4A4A5A] mb-2 block">Degré d&apos;urgence</label>
                <div className="grid grid-cols-3 gap-2">
                  {URGENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setUrgency(opt.value)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        urgency === opt.value ? opt.color + " border-current" : "hover:bg-[#FAFAF8]"
                      }`}
                    >
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5 leading-tight">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#4A4A5A] mb-1.5 block">
                  Message personnel <span className="font-normal text-[#8A8A96]">(optionnel)</span>
                </label>
                <Textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Message privé au destinataire..."
                  rows={2}
                />
                <p className="text-[10px] text-[#8A8A96] mt-1">Visible uniquement par le destinataire</p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patientConsent}
                    onChange={(e) => setPatientConsent(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-gray-300 text-[#5B4EC4] focus:ring-[#5B4EC4]/30"
                  />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      J&apos;ai informé {patientFirstName} de cette {actionLabel.toLowerCase()} et obtenu son accord
                    </p>
                    <p className="text-[10px] text-amber-600 mt-1">
                      Le consentement du patient est obligatoire pour tout adressage (art. L.1110-4 CSP)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Confirmation ── */}
          {step === 3 && (
            <div className="py-6 text-center space-y-4">
              <CheckCircle2 className="size-12 text-[#2BA89C] mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A2E]">{actionLabel} envoyé(e)</h3>
                <p className="text-sm text-[#4A4A5A] mt-1">
                  {selectedProvider?.firstName} {selectedProvider?.lastName} a reçu votre demande dans son espace Nami.
                </p>
              </div>

              <div className="rounded-xl border bg-[#FAFAF8] p-4 text-left max-w-sm mx-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A96]">Destinataire</span>
                  <span className="font-medium text-[#1A1A2E]">{selectedProvider?.firstName} {selectedProvider?.lastName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A96]">Patient</span>
                  <span className="font-medium text-[#1A1A2E]">{patientFirstName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A96]">Urgence</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${URGENCY_OPTIONS.find((o) => o.value === urgency)?.color}`}>
                    {URGENCY_OPTIONS.find((o) => o.value === urgency)?.label}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          {step === 1 && (
            <div className="flex w-full justify-end">
              <Button variant="outline" onClick={handleClose}>Annuler</Button>
            </div>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="size-4 mr-1" /> Retour
              </Button>
              <Button
                onClick={() => createReferral.mutate()}
                disabled={!clinicalReason.trim() || !patientConsent || createReferral.isPending}
                className="gap-1.5"
              >
                {createReferral.isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> Envoi…</>
                ) : (
                  <><ArrowLeftRight className="size-4" /> Envoyer la demande</>
                )}
              </Button>
            </>
          )}
          {step === 3 && (
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Fermer</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
