"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { PROFESSIONS, EXPERTISE_THEMES, PROFESSION_THEME_MAP } from "@/lib/data/specialties"
import {
  Check, ChevronRight, Loader2, ArrowLeft, ExternalLink,
  User, Stethoscope, FileText, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types de parcours patients ───────────────────────────────────────────────

const CASE_TYPES = [
  { id: "TCA",           label: "Troubles alimentaires / TCA" },
  { id: "OBESITY",       label: "Obésité / Surpoids" },
  { id: "MENTAL_HEALTH", label: "Santé mentale" },
  { id: "PEDIATRIC",     label: "Pédiatrie" },
  { id: "CHRONIC_PAIN",  label: "Douleur chronique" },
  { id: "METABOLIC",     label: "Métabolique / Diabète" },
  { id: "OTHER",         label: "Autre parcours" },
] as const

// ─── Indicateur d'étape ───────────────────────────────────────────────────────

const STEP_META = [
  { icon: <User size={14} />,        label: "Profil" },
  { icon: <Check size={14} />,       label: "Engagements" },
  { icon: <Stethoscope size={14} />, label: "1er patient" },
  { icon: <FileText size={14} />,    label: "1re note" },
]

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1">
      {STEP_META.map((s, i) => {
        const n = i + 1
        const done    = n < step
        const current = n === step
        return (
          <div key={n} className="flex items-center gap-1">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300",
              current ? "bg-[#5B4EC4] text-white"
                : done ? "bg-[#5B4EC4]/15 text-[#5B4EC4]"
                : "bg-[#F1F5F9] text-[#94A3B8]"
            )}>
              {done ? <Check size={11} strokeWidth={2.5} /> : s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < 3 && <div className={cn("w-4 h-px", n < step ? "bg-[#5B4EC4]/30" : "bg-[#E2E8F0]")} />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Preview droite : profil soignant ─────────────────────────────────────────

function ProfilePreview({
  firstName, lastName, professionLabel, domains
}: {
  firstName: string; lastName: string;
  professionLabel: string; domains: string[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E8ECF4] p-5 w-full max-w-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4EC4] to-[#2BA89C] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {firstName?.[0]?.toUpperCase() ?? "N"}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1A1A2E]">
            {firstName || "Prénom"} {lastName || "Nom"}
          </p>
          <p className="text-xs text-[#64748B]">{professionLabel || "Votre profession apparaît ici"}</p>
        </div>
      </div>
      {domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {domains.slice(0, 5).map((d) => (
            <span key={d} className="px-2 py-0.5 rounded-full bg-[#EDE9FC] text-[#5B4EC4] text-xs font-medium">
              {d}
            </span>
          ))}
          {domains.length > 5 && (
            <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs">
              +{domains.length - 5}
            </span>
          )}
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="text-[10px] text-[#94A3B8]">Visible dans l'annuaire Nami</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
      </div>
    </div>
  )
}

// ─── Preview droite : patient card ───────────────────────────────────────────

function PatientCardPreview({
  firstName, lastName, caseType
}: {
  firstName: string; lastName: string; caseType: string;
}) {
  const label = CASE_TYPES.find((c) => c.id === caseType)?.label ?? ""
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E8ECF4] p-5 w-full max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#EDE9FC] flex items-center justify-center text-[#5B4EC4] font-bold text-sm shrink-0">
            {firstName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A2E]">
              {firstName || "Prénom"} {lastName || "Nom"}
            </p>
            <p className="text-[11px] text-[#94A3B8]">Nouveau dossier de coordination</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-100">
          ACTIF
        </span>
      </div>
      {label && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EDE9FC] text-[#5B4EC4]">
          {label}
        </span>
      )}
      <div className="mt-3 pt-3 border-t border-[#F8F9FA] space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
          <div className="w-3 h-3 rounded-full bg-[#E2E8F0]" />
          <span>Indicateur de complétude</span>
          <div className="flex-1 h-1 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-[#5B4EC4]/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Preview droite : note ────────────────────────────────────────────────────

function NotePreview({ body }: { body: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E8ECF4] p-5 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#EDE9FC] flex items-center justify-center">
          <FileText size={13} className="text-[#5B4EC4]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1A1A2E]">Observation clinique</p>
          <p className="text-[10px] text-[#94A3B8]">Aujourd'hui</p>
        </div>
      </div>
      <div className="min-h-[80px] text-xs text-[#4A4A5A] leading-relaxed whitespace-pre-wrap">
        {body || <span className="text-[#CBD5E1] italic">Votre première observation apparaît ici…</span>}
      </div>
      <div className="mt-3 pt-3 border-t border-[#F8F9FA] flex items-center gap-1.5">
        <Sparkles size={11} className="text-[#5B4EC4]" />
        <span className="text-[10px] text-[#94A3B8]">Analysée par l'IA Nami — structuration automatique</span>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router    = useRouter()
  const { accessToken, user } = useAuthStore()

  const firstName  = user?.firstName ?? ""
  const lastName   = user?.lastName  ?? ""

  // ── Step 1 — Profession & Domaines ──
  const [professionId,    setProfessionId]    = useState("")
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [setupLoading,    setSetupLoading]    = useState(false)
  const [setupError,      setSetupError]      = useState<string | null>(null)

  // ── Step 2 — CGU ──
  const [acceptedCGU,    setAcceptedCGU]    = useState(false)
  const [acceptedDeonto, setAcceptedDeonto] = useState(false)
  const [acceptedRGPD,   setAcceptedRGPD]   = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError,   setConfirmError]   = useState<string | null>(null)

  // ── Step 3 — Premier patient ──
  const [patientFirstName, setPatientFirstName] = useState("")
  const [patientLastName,  setPatientLastName]  = useState("")
  const [patientBirthDate, setPatientBirthDate] = useState("")
  const [caseType,         setCaseType]         = useState("OTHER")
  const [creatingPatient,  setCreatingPatient]  = useState(false)
  const [patientError,     setPatientError]     = useState<string | null>(null)
  const [careCaseId,       setCareCaseId]       = useState<string | null>(null)

  // ── Step 4 — Première note ──
  const [noteBody,    setNoteBody]    = useState("")
  const [savingNote,  setSavingNote]  = useState(false)

  const [step, setStep] = useState(1)

  // Domaines filtrés selon la profession choisie
  const availableThemes = useMemo(() => {
    if (!professionId) return []
    const themeIds = PROFESSION_THEME_MAP[professionId] ?? []
    return EXPERTISE_THEMES.filter((t) => themeIds.includes(t.id))
  }, [professionId])

  const domainLabels = useMemo(() => {
    const labels: string[] = []
    EXPERTISE_THEMES.forEach((t) => {
      t.domains.forEach((d) => {
        if (selectedDomains.includes(d.id)) labels.push(d.label)
      })
    })
    return labels
  }, [selectedDomains])

  const professionLabel = PROFESSIONS.find((p) => p.id === professionId)?.label ?? ""

  // ── Handler step 1 → setup profil silencieux ──────────────────────────────
  const handleSetupProfile = async () => {
    if (!professionId || !accessToken) return
    setSetupLoading(true)
    setSetupError(null)
    const api = apiWithToken(accessToken)

    try {
      // Identité : spécialités = domaines sélectionnés ou la profession elle-même
      const specialties = selectedDomains.length > 0 ? selectedDomains : [professionId]
      await api.onboarding.saveIdentity({ specialties })
    } catch {
      setSetupError("Impossible de sauvegarder votre profil. Réessayez.")
      setSetupLoading(false)
      return
    }

    // Les étapes suivantes sont best-effort (ne bloquent pas)
    const api2 = apiWithToken(accessToken)
    await api2.onboarding.saveExercise({
      exerciseMode: "LIBERAL",
      acceptsCMU:   false,
      acceptsALD:   false,
      acceptsTele:  true,
    }).catch(() => {})

    await api2.onboarding.saveStructures([{
      name: "Cabinet", type: "CABINET",
      address: "À renseigner", city: "À renseigner", postalCode: "00000",
    }]).catch(() => {})

    await api2.onboarding.saveConsultation({
      consultationModes:    ["IN_PERSON"],
      acceptedPatientTypes: ["ADULT", "CHILD", "ADOLESCENT"],
      acceptingNewPatients: true,
    }).catch(() => {})

    await api2.onboarding.saveCertifications([]).catch(() => {})

    await api2.onboarding.saveNetwork({
      spokenLanguages:   ["fr"],
      geographicZones:   [],
      profileVisibility: "PUBLIC",
      addressingScope:   "NATIONAL",
    }).catch(() => {})

    setSetupLoading(false)
    setStep(2)
  }

  // ── Handler step 2 → confirm ──────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!accessToken) return
    setConfirmLoading(true)
    setConfirmError(null)
    try {
      await apiWithToken(accessToken).onboarding.confirm({
        acceptedCGU, acceptedDeonto, acceptedRGPD,
      })
      setStep(3)
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setConfirmLoading(false)
    }
  }

  // ── Handler step 3 → créer patient ───────────────────────────────────────
  const handleCreatePatient = async () => {
    if (!patientFirstName.trim() || !patientLastName.trim() || !accessToken) return
    setCreatingPatient(true)
    setPatientError(null)
    try {
      const result = await apiWithToken(accessToken).patients.createWithCase({
        firstName:   patientFirstName.trim(),
        lastName:    patientLastName.trim(),
        birthDate:   patientBirthDate || undefined,
        caseType:    caseType as any,
        caseTitle:   `${patientFirstName.trim()} ${patientLastName.trim()} — ${CASE_TYPES.find((c) => c.id === caseType)?.label ?? caseType}`,
        mainConcern: CASE_TYPES.find((c) => c.id === caseType)?.label,
      })
      setCareCaseId(result.careCase.id)
      setStep(4)
    } catch (err) {
      setPatientError(err instanceof Error ? err.message : "Erreur lors de la création du dossier")
    } finally {
      setCreatingPatient(false)
    }
  }

  // ── Handler step 4 → créer note + redirect ────────────────────────────────
  const handleCreateNote = async () => {
    if (!noteBody.trim() || !careCaseId || !accessToken) return
    setSavingNote(true)
    try {
      await apiWithToken(accessToken).notes.create(careCaseId, {
        noteType: "OBSERVATION",
        title:    "Première observation",
        body:     noteBody.trim(),
      })
    } catch { /* non bloquant */ }
    router.push(`/patients/${careCaseId}`)
  }

  const handleSkipNote = () => {
    if (careCaseId) router.push(`/patients/${careCaseId}`)
    else router.push("/patients")
  }

  const canConfirm = acceptedCGU && acceptedDeonto && acceptedRGPD

  return (
    <div className="min-h-screen bg-[#F0F2FA] flex flex-col" style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 sm:px-8 h-14 bg-white border-b border-[#E8ECF4] shrink-0">
        <div className="flex items-center gap-2.5">
          <img src="/nami-mascot.png" alt="Nami" className="w-7 h-7" style={{ borderRadius: 8, objectFit: "contain" }} />
          <span className="text-[14px] font-bold text-[#0F172A] tracking-tight">Nami</span>
        </div>
        <StepBar step={step} />
        <div className="text-xs text-[#94A3B8]">
          Étape {step} / 4
        </div>
      </div>

      {/* ── Layout split screen ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Gauche : formulaire ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 max-w-xl overflow-y-auto">

          {/* ══════════════════════════════════════════════════════════════
              STEP 1 — Profession & domaines d'expertise
          ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-7">
              <div>
                <p className="text-xs font-bold text-[#5B4EC4] tracking-widest uppercase mb-2">Bienvenue</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                  Bonjour {firstName} 👋
                </h1>
                <p className="mt-2 text-[#64748B] text-sm leading-relaxed">
                  Commençons par configurer votre profil soignant.
                </p>
              </div>

              {/* Profession */}
              <div>
                <label className="text-xs font-semibold text-[#4A4A5A] uppercase tracking-wide mb-2.5 block">
                  Votre profession
                </label>
                {/* Groupes par catégorie */}
                {(["medical", "paramedical", "sante_mentale", "social", "sport"] as const).map((cat) => {
                  const profs = PROFESSIONS.filter((p) => p.category === cat)
                  const catLabel: Record<string, string> = {
                    medical:      "Médecins",
                    paramedical:  "Paramédicaux",
                    sante_mentale:"Santé mentale",
                    social:       "Social",
                    sport:        "Sport & bien-être",
                  }
                  return (
                    <div key={cat} className="mb-3">
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">{catLabel[cat]}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profs.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { setProfessionId(p.id); setSelectedDomains([]) }}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150",
                              professionId === p.id
                                ? "bg-[#5B4EC4] text-white border-[#5B4EC4] shadow"
                                : "bg-white text-[#4A4A5A] border-[#E2E8F0] hover:border-[#5B4EC4] hover:text-[#5B4EC4]"
                            )}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Domaines d'expertise — s'affiche quand une profession est choisie */}
              {professionId && availableThemes.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-[#4A4A5A] uppercase tracking-wide mb-2.5 block">
                    Vos domaines d'expertise <span className="text-[#94A3B8] font-normal normal-case">(sélection multiple)</span>
                  </label>
                  <div className="space-y-2">
                    {availableThemes.map((theme) => (
                      <div key={theme.id}>
                        <p className="text-[10px] text-[#94A3B8] font-medium mb-1">{theme.icon} {theme.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {theme.domains.map((d) => {
                            const on = selectedDomains.includes(d.id)
                            return (
                              <button
                                key={d.id}
                                onClick={() =>
                                  setSelectedDomains((prev) =>
                                    on ? prev.filter((x) => x !== d.id) : [...prev, d.id]
                                  )
                                }
                                className={cn(
                                  "px-2 py-1 rounded-lg border text-xs transition-all duration-150",
                                  on
                                    ? "bg-[#EDE9FC] text-[#5B4EC4] border-[#5B4EC4]/30 font-medium"
                                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#5B4EC4]/40"
                                )}
                              >
                                {d.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {setupError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{setupError}</div>
              )}

              <button
                onClick={handleSetupProfile}
                disabled={!professionId || setupLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B4EC4] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4A3DB3] transition-all shadow-md"
              >
                {setupLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Configuration en cours…</>
                  : <><span>Continuer</span><ChevronRight size={16} /></>
                }
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 2 — CGU & consentements
          ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#5B4EC4] transition-colors">
                <ArrowLeft size={13} /> Retour
              </button>

              <div>
                <p className="text-xs font-bold text-[#5B4EC4] tracking-widest uppercase mb-2">Vos engagements</p>
                <h2 className="text-2xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                  Presque prêt.
                </h2>
                <p className="mt-2 text-[#64748B] text-sm">
                  Lisez et acceptez les engagements avant d'accéder à Nami.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: "cgu",
                    checked: acceptedCGU,
                    set: setAcceptedCGU,
                    text: (
                      <>J&apos;accepte les{" "}
                        <a href="/cgu" target="_blank" className="text-[#5B4EC4] hover:underline inline-flex items-center gap-0.5">
                          Conditions d&apos;utilisation <ExternalLink size={10} />
                        </a>
                      </>
                    ),
                  },
                  {
                    key: "deonto",
                    checked: acceptedDeonto,
                    set: setAcceptedDeonto,
                    text: "J'atteste que mes informations sont exactes et que je suis inscrit(e) à l'Ordre compétent (ou équivalent).",
                  },
                  {
                    key: "rgpd",
                    checked: acceptedRGPD,
                    set: setAcceptedRGPD,
                    text: (
                      <>J&apos;accepte la{" "}
                        <a href="/confidentialite" target="_blank" className="text-[#5B4EC4] hover:underline inline-flex items-center gap-0.5">
                          Politique de confidentialité <ExternalLink size={10} />
                        </a>{" "}(RGPD)
                      </>
                    ),
                  },
                ].map(({ key, checked, set, text }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => set(!checked)}
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                        checked ? "bg-[#5B4EC4] border-[#5B4EC4]" : "bg-white border-[#E2E8F0] group-hover:border-[#5B4EC4]"
                      )}
                    >
                      {checked && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>
                    <span className="text-sm text-[#4A4A5A] leading-relaxed">{text}</span>
                  </label>
                ))}
              </div>

              {confirmError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{confirmError}</div>
              )}

              <button
                onClick={handleConfirm}
                disabled={!canConfirm || confirmLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#5B4EC4] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4A3DB3] transition-all shadow-md"
              >
                {confirmLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Activation…</>
                  : <><Check size={16} /> Valider mes engagements</>
                }
              </button>

              <p className="text-[10px] text-[#94A3B8] text-center leading-relaxed">
                Conforme RGPD · Art. L.1110-12 CSP<br />
                Nami n&apos;est pas un dispositif médical au sens du règlement (UE) 2017/745.
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 3 — Premier patient
          ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-7">
              <div>
                <p className="text-xs font-bold text-[#5B4EC4] tracking-widest uppercase mb-2">Votre premier dossier</p>
                <h2 className="text-2xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                  Créez votre premier<br />dossier de coordination.
                </h2>
                <p className="mt-2 text-[#64748B] text-sm leading-relaxed">
                  C'est là que tout commence. Ajoutez un patient réel pour voir le cockpit prendre vie.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4A4A5A] mb-1.5 block">Prénom <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={patientFirstName}
                      onChange={(e) => setPatientFirstName(e.target.value)}
                      placeholder="ex : Marie"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A2E] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A4A5A] mb-1.5 block">Nom <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={patientLastName}
                      onChange={(e) => setPatientLastName(e.target.value)}
                      placeholder="ex : Dupont"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A2E] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4A4A5A] mb-1.5 block">Date de naissance <span className="text-[#94A3B8] font-normal">(optionnel)</span></label>
                  <input
                    type="date"
                    value={patientBirthDate}
                    onChange={(e) => setPatientBirthDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4A4A5A] mb-1.5 block">Type de parcours</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CASE_TYPES.map((ct) => (
                      <button
                        key={ct.id}
                        onClick={() => setCaseType(ct.id)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150",
                          caseType === ct.id
                            ? "bg-[#5B4EC4] text-white border-[#5B4EC4] shadow"
                            : "bg-white text-[#4A4A5A] border-[#E2E8F0] hover:border-[#5B4EC4] hover:text-[#5B4EC4]"
                        )}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {patientError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{patientError}</div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreatePatient}
                  disabled={!patientFirstName.trim() || !patientLastName.trim() || creatingPatient}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B4EC4] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4A3DB3] transition-all shadow-md"
                >
                  {creatingPatient
                    ? <><Loader2 size={16} className="animate-spin" /> Création…</>
                    : <><Stethoscope size={15} /> Créer ce dossier</>
                  }
                </button>
                <button
                  onClick={() => router.push("/patients")}
                  className="text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors"
                >
                  Passer cette étape →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 4 — Première note
          ══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-7">
              <div>
                <p className="text-xs font-bold text-[#5B4EC4] tracking-widest uppercase mb-2">Première observation</p>
                <h2 className="text-2xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                  Écrivez votre première<br />note clinique.
                </h2>
                <p className="mt-2 text-[#64748B] text-sm leading-relaxed">
                  L&apos;IA Nami la structurera automatiquement et l&apos;associera au dossier.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A4A5A] mb-1.5 block">
                  Observation pour{" "}
                  <span className="text-[#5B4EC4]">{patientFirstName} {patientLastName}</span>
                </label>
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  rows={6}
                  placeholder={`Ex : Première consultation. Patiente adressée par son MT pour prise en charge diététique dans le cadre d'une restriction alimentaire sévère. IMC ${patientFirstName ? `de ${patientFirstName}` : ""} à mesurer. Présentation anxieuse, déni partiel. À revoir dans 15 jours.`}
                  className="w-full px-3 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A2E] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition-all bg-white resize-none leading-relaxed"
                />
                <p className="text-[10px] text-[#94A3B8] mt-1.5 text-right">{noteBody.length} caractères</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateNote}
                  disabled={!noteBody.trim() || savingNote}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B4EC4] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4A3DB3] transition-all shadow-md"
                >
                  {savingNote
                    ? <><Loader2 size={16} className="animate-spin" /> Enregistrement…</>
                    : <><Sparkles size={15} /> Enregistrer et entrer dans Nami</>
                  }
                </button>
                <button
                  onClick={handleSkipNote}
                  className="text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors"
                >
                  Passer →
                </button>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F8F7FD] border border-[#EDE9FC]">
                <Sparkles size={13} className="text-[#5B4EC4] mt-0.5 shrink-0" />
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Votre note sera analysée par l&apos;IA Nami : extraction d&apos;observations, structuration, et proposition de points de complétude dans le dossier.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Droite : aperçu en direct ────────────────────────────────── */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-[#F0F2FA] to-[#E8ECF4]">
          <div className="w-full max-w-sm">
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Aperçu en direct</p>
            <p className="text-sm text-[#64748B] mb-5">
              {step === 1 && "Votre profil se construit au fur et à mesure."}
              {step === 2 && "Vos engagements sécurisent la confiance du réseau."}
              {step === 3 && "Le dossier apparaît dès que vous tapez un nom."}
              {step === 4 && "L'IA Nami structure et enrichit votre observation."}
            </p>

            {step === 1 && (
              <ProfilePreview
                firstName={firstName}
                lastName={lastName}
                professionLabel={professionLabel}
                domains={domainLabels}
              />
            )}
            {step === 2 && (
              <ProfilePreview
                firstName={firstName}
                lastName={lastName}
                professionLabel={professionLabel}
                domains={domainLabels}
              />
            )}
            {step === 3 && (
              <PatientCardPreview
                firstName={patientFirstName}
                lastName={patientLastName}
                caseType={caseType}
              />
            )}
            {step === 4 && (
              <NotePreview body={noteBody} />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
