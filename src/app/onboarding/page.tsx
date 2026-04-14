"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { CockpitPreview } from "@/components/onboarding/CockpitPreview"
import { Check, ChevronRight, Loader2, BookOpen, Play, Compass, ExternalLink, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Profession list (condensed) ─────────────────────────────────────────────

const PROFESSIONS = [
  { id: "medecin",            label: "Médecin" },
  { id: "dieteticien",        label: "Diététicien(ne)" },
  { id: "psychologue",        label: "Psychologue" },
  { id: "infirmier",          label: "Infirmier(e)" },
  { id: "kinesitherapeute",   label: "Kinésithérapeute" },
  { id: "orthophoniste",      label: "Orthophoniste" },
  { id: "podologue",          label: "Podologue" },
  { id: "sage_femme",         label: "Sage-femme" },
  { id: "pharmacien",         label: "Pharmacien(ne)" },
  { id: "ergotherapeute",     label: "Ergothérapeute" },
  { id: "psychomotricien",    label: "Psychomotricien(ne)" },
  { id: "assistante_sociale", label: "Assistant(e) social(e)" },
  { id: "autre",              label: "Autre profession de santé" },
]

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={cn(
            "rounded-full transition-all duration-300",
            n === step ? "w-6 h-2 bg-[#5B4EC4]" : n < step ? "w-2 h-2 bg-[#5B4EC4] opacity-40" : "w-2 h-2 bg-[#E2E8F0]"
          )}
        />
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { accessToken, user } = useAuthStore()

  const [step, setStep] = useState(1)
  const [professionId, setProfessionId] = useState("")
  const [patientFirstName, setPatientFirstName] = useState("")
  const [patientLastName, setPatientLastName] = useState("")
  const [acceptedCGU, setAcceptedCGU] = useState(false)
  const [acceptedDeonto, setAcceptedDeonto] = useState(false)
  const [acceptedRGPD, setAcceptedRGPD] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstName = user?.firstName ?? ""
  const lastName = user?.lastName ?? ""
  const professionLabel = PROFESSIONS.find((p) => p.id === professionId)?.label ?? ""

  const canConfirm = acceptedCGU && acceptedDeonto && acceptedRGPD

  const handleConfirm = async () => {
    if (!canConfirm || !accessToken) return
    setLoading(true)
    setError(null)
    try {
      await apiWithToken(accessToken).onboarding.confirm({ acceptedCGU, acceptedDeonto, acceptedRGPD })
      router.push("/aujourd-hui")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2FA] flex flex-col" style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 h-14 bg-white border-b border-[#E8ECF4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5B4EC4, #2BA89C)" }}>
            <span className="text-white text-xs font-extrabold">N</span>
          </div>
          <span className="text-[15px] font-bold text-[#0F172A] tracking-tight">Nami</span>
        </div>
        <StepDots step={step} />
        <div className="text-xs text-[#94A3B8]">
          Étape {step} sur 4
        </div>
      </div>

      {/* Split screen */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── Left: Form ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-12 py-10 max-w-xl">

          {/* ── STEP 1: Identité ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-7">
              <div>
                <p className="text-xs font-bold text-[#5B4EC4] tracking-widest uppercase mb-3">Bienvenue</p>
                <h1 className="text-3xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                  Bonjour {firstName} 👋
                </h1>
                <p className="mt-3 text-[#64748B] text-base leading-relaxed">
                  Nami est votre espace de coordination. Commençons par votre profession.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A4A5A] uppercase tracking-wide mb-3 block">
                  Votre profession
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROFESSIONS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProfessionId(p.id)}
                      className={cn(
                        "text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150",
                        professionId === p.id
                          ? "bg-[#5B4EC4] text-white border-[#5B4EC4] shadow-md"
                          : "bg-white text-[#4A4A5A] border-[#E2E8F0] hover:border-[#5B4EC4] hover:text-[#5B4EC4]"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!professionId}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B4EC4] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4A3DB3] transition-all shadow-md"
              >
                Continuer <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Premier patient ──────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-7">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#5B4EC4] transition-colors">
                <ArrowLeft size={13} /> Retour
              </button>

              <div>
                <p className="text-xs font-bold text-[#5B4EC4] tracking-widest uppercase mb-3">Votre premier patient</p>
                <h2 className="text-2xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                  Commencez par créer<br />un dossier de coordination.
                </h2>
                <p className="mt-3 text-[#64748B] text-sm leading-relaxed">
                  Ajoutez le nom d&apos;un patient pour voir apparaître son dossier en temps réel.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4A4A5A] mb-1.5 block">Prénom</label>
                    <input
                      type="text"
                      value={patientFirstName}
                      onChange={(e) => setPatientFirstName(e.target.value)}
                      placeholder="ex: Etienne"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A2E] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A4A5A] mb-1.5 block">Nom</label>
                    <input
                      type="text"
                      value={patientLastName}
                      onChange={(e) => setPatientLastName(e.target.value)}
                      placeholder="ex: Dupuis"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1A1A2E] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition-all bg-white"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#94A3B8]">
                  Ce dossier sera créé après validation. Vous pouvez ignorer cette étape.
                </p>
              </div>

              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B4EC4] text-white font-semibold text-sm hover:bg-[#4A3DB3] transition-all shadow-md"
              >
                Continuer <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 3: Comment commencer ────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-7">
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#5B4EC4] transition-colors">
                <ArrowLeft size={13} /> Retour
              </button>

              <div>
                <p className="text-xs font-bold text-[#5B4EC4] tracking-widest uppercase mb-3">Démarrer</p>
                <h2 className="text-2xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                  Comment voulez-vous<br />commencer ?
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: <BookOpen size={20} color="#5B4EC4" />,
                    bg: "rgba(91,78,196,0.08)",
                    title: "Tutoriel guidé",
                    body: "3 minutes pour maîtriser l'essentiel. Recommandé pour bien démarrer.",
                    badge: "Recommandé",
                  },
                  {
                    icon: <Play size={20} color="#2BA89C" />,
                    bg: "rgba(43,168,156,0.08)",
                    title: "Voir la démo",
                    body: "Explorez Nami avec des données d'exemple : Gabrielle, Marc, Léo.",
                    badge: null,
                  },
                  {
                    icon: <Compass size={20} color="#059669" />,
                    bg: "rgba(5,150,105,0.08)",
                    title: "Explorer seul",
                    body: "Vous préférez découvrir par vous-même. Le cockpit vous attend.",
                    badge: null,
                  },
                ].map((card) => (
                  <button
                    key={card.title}
                    onClick={() => setStep(4)}
                    className="w-full text-left flex items-start gap-4 p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#5B4EC4] hover:shadow-md transition-all duration-150 group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105" style={{ background: card.bg }}>
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-[#1A1A2E]">{card.title}</span>
                        {card.badge && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#5B4EC4] text-white text-[9px] font-bold">{card.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">{card.body}</p>
                    </div>
                    <ChevronRight size={14} className="text-[#CBD5E1] shrink-0 mt-2 group-hover:text-[#5B4EC4] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 4: Confirmation ─────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#5B4EC4] transition-colors">
                <ArrowLeft size={13} /> Retour
              </button>

              <div>
                <p className="text-xs font-bold text-[#5B4EC4] tracking-widest uppercase mb-3">Confirmation</p>
                <h2 className="text-2xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                  Presque prêt.
                </h2>
                <p className="mt-2 text-[#64748B] text-sm">
                  Vérifiez vos engagements avant de valider votre accès.
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
                    text: "J'atteste que mes informations sont exactes et que je suis inscrit(e) à l'Ordre compétent.",
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

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
              )}

              <button
                onClick={handleConfirm}
                disabled={!canConfirm || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#5B4EC4] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4A3DB3] transition-all shadow-md"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Activation en cours…</>
                ) : (
                  <><Check size={16} /> Accéder à Nami</>
                )}
              </button>

              <p className="text-[10px] text-[#94A3B8] text-center leading-relaxed">
                Conforme RGPD · Art. L.1110-12 CSP<br />
                Nami n&apos;est pas un dispositif médical au sens du règlement (UE) 2017/745.
              </p>
            </div>
          )}
        </div>

        {/* ─── Right: Live preview ─────────────────────────────────────── */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-[#F0F2FA] to-[#E8ECF4]">
          <div className="w-full max-w-md">
            {/* Section label */}
            <div className="mb-5">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Aperçu en direct</p>
              <p className="text-sm text-[#64748B]">
                {step === 1 && "Votre espace se configure à mesure que vous renseignez vos informations."}
                {step === 2 && "La card patient apparaît dès que vous tapez un nom."}
                {step === 3 && "Votre cockpit vous attend — choisissez comment y entrer."}
                {step === 4 && "Tout est prêt. Un clic pour commencer."}
              </p>
            </div>

            <CockpitPreview
              firstName={firstName}
              lastName={lastName}
              professionLabel={professionLabel}
              patientFirstName={patientFirstName}
              patientLastName={patientLastName}
              step={step}
              confirmed={step === 4 && canConfirm}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
