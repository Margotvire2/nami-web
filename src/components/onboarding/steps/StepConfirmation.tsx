"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { CheckCircle, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { getProfession, findDomain } from "@/lib/data/specialties"
import { cn } from "@/lib/utils"

const MODE_LABELS: Record<string, string> = {
  LIBERAL: "Libéral", SALARIED: "Salarié", MIXED: "Mixte", HOSPITAL: "Hospitalier",
}

const CONSULTATION_MODE_LABELS: Record<string, string> = {
  IN_PERSON: "Présentiel", TELECONSULTATION: "Téléconsultation", HOME_VISIT: "Visite à domicile",
}

const VISIBILITY_LABELS: Record<string, string> = {
  ALL: "Profil public", VERIFIED_ONLY: "Professionnels vérifiés", PRIVATE: "Privé",
}

const ADDRESSING_SCOPE_LABELS: Record<string, string> = {
  LOCAL: "Local", REGIONAL: "Régional", NATIONAL: "National",
}

const DELAY_LABELS: Record<string, string> = {
  WITHIN_WEEK: "Sous 1 semaine", WITHIN_MONTH: "Sous 1 mois", OVER_MONTH: "Plus d'1 mois",
}

const SECTOR_LABELS: Record<string, string> = {
  SECTOR_1: "Secteur 1", SECTOR_2: "Secteur 2", SECTOR_3: "Secteur 3", OPTAM: "OPTAM",
}

const PATIENT_TYPE_LABELS: Record<string, string> = {
  adult: "Adultes", child: "Enfants (< 12 ans)", adolescent: "Adolescents (12-18 ans)",
  elderly: "Personnes âgées", pregnant: "Femmes enceintes", perinatal: "Périnatalité",
  disability: "Situations de handicap", precarity: "Grande précarité", athlete: "Sportifs",
  // Legacy uppercase IDs
  ADULT: "Adultes", CHILD: "Enfants", ADOLESCENT: "Adolescents",
  ELDERLY: "Personnes âgées", PERINATAL: "Périnatalité",
  DISABILITY: "Situations de handicap", PRECARITY: "Grande précarité",
}

const LANGUAGE_LABELS: Record<string, string> = {
  fr: "Français", en: "Anglais", es: "Espagnol", ar: "Arabe", pt: "Portugais",
  de: "Allemand", it: "Italien", ru: "Russe", zh: "Mandarin", wo: "Wolof",
  am: "Amazigh", tr: "Turc", fa: "Persan", ro: "Roumain", pl: "Polonais",
  ja: "Japonais", vi: "Vietnamien", ta: "Tamoul", lsf: "LSF",
}

export function StepConfirmation() {
  const { data, prevStep, markCompleted, reset } = useOnboardingStore()
  const { accessToken } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [acceptedCGU, setAcceptedCGU] = useState(false)
  const [acceptedDeonto, setAcceptedDeonto] = useState(false)
  const [acceptedRGPD, setAcceptedRGPD] = useState(false)

  const canSubmit = acceptedCGU && acceptedDeonto && acceptedRGPD

  const profession = getProfession(data.professionType ?? "")

  const handleSubmit = async () => {
    if (!canSubmit || !accessToken) return
    setLoading(true)
    setError(null)
    try {
      await apiWithToken(accessToken).onboarding.confirm({ acceptedCGU, acceptedDeonto, acceptedRGPD })
      markCompleted(7)
      reset()
      router?.push("/aujourd-hui")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{title}</h3>
      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-sm text-neutral-700 space-y-1">{children}</div>
    </div>
  )

  const Tag = ({ label }: { label: string }) => (
    <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs mr-1.5 mb-1.5">{label}</span>
  )

  const Row = ({ label, value }: { label: string; value?: string | null | boolean }) => {
    if (value === undefined || value === null || value === "") return null
    const display = typeof value === "boolean" ? (value ? "Oui" : "Non") : value
    return (
      <div className="flex justify-between gap-4">
        <span className="text-neutral-400 shrink-0">{label}</span>
        <span className="text-right">{display}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-800">Récapitulatif & Confirmation</h2>
        <p className="text-sm text-neutral-500 mt-1">Vérifiez vos informations avant de valider votre profil.</p>
      </div>

      <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
        {/* 1. Profession + Expertise */}
        <Section title="Identité professionnelle">
          {profession && <Tag label={profession.label} />}
          {data.specialties?.length ? (
            <div className="mt-1">
              <p className="text-[10px] text-neutral-400 mb-1">Domaines d&apos;expertise</p>
              {data.specialties.map(id => {
                const found = findDomain(id)
                return <Tag key={id} label={found?.domain.label ?? id} />
              })}
            </div>
          ) : null}
          {data.bio && <p className="text-xs text-neutral-500 mt-2 line-clamp-3">{data.bio}</p>}
        </Section>

        {/* 2. Mode d'exercice */}
        <Section title="Mode d'exercice">
          {data.exerciseMode && <Tag label={MODE_LABELS[data.exerciseMode] ?? data.exerciseMode} />}
          <Row label="Secteur" value={data.conventionSector ? SECTOR_LABELS[data.conventionSector] : null} />
          <div className="flex gap-4 pt-1 text-xs text-neutral-500">
            {data.acceptsCMU && <span>CMU/CSS</span>}
            {data.acceptsALD && <span>ALD</span>}
            {!!(data as Record<string, unknown>).acceptsAME && <span>AME</span>}
          </div>
        </Section>

        {/* 3. Structures */}
        <Section title="Structures d'exercice">
          {data.structures?.length ? (
            <div className="space-y-1">
              {data.structures.map((s, i) => (
                <p key={i} className="text-xs">{s.name} — {s.city} ({s.postalCode})</p>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 italic">Aucune structure renseignée</p>
          )}
        </Section>

        {/* 4. Consultation */}
        <Section title="Consultation">
          {data.consultationModes?.length ? (
            <div>{data.consultationModes.map(m => <Tag key={m} label={CONSULTATION_MODE_LABELS[m] ?? m} />)}</div>
          ) : null}
          {data.acceptedPatientTypes?.length ? (
            <div>{data.acceptedPatientTypes.map(t => <Tag key={t} label={PATIENT_TYPE_LABELS[t] ?? t} />)}</div>
          ) : null}
          <Row label="Nouveaux patients" value={data.acceptingNewPatients} />
          <Row label="Délai" value={data.newPatientDelay ? DELAY_LABELS[data.newPatientDelay] : null} />
        </Section>

        {/* 5. Formations */}
        <Section title="Formations">
          {data.certifications?.length ? (
            <div className="space-y-1">
              {data.certifications.map((c, i) => (
                <p key={i} className="text-xs">{c.name} {c.organism && `— ${c.organism}`} {c.year && `(${c.year})`}</p>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 italic">Aucune formation</p>
          )}
        </Section>

        {/* 6. Réseau */}
        <Section title="Réseau & Visibilité">
          <Row label="Visibilité" value={data.profileVisibility ? VISIBILITY_LABELS[data.profileVisibility] : null} />
          <Row label="Adressages" value={data.addressingScope ? ADDRESSING_SCOPE_LABELS[data.addressingScope] : null} />
          {data.spokenLanguages?.length ? (
            <div className="pt-1">{data.spokenLanguages.map(l => <Tag key={l} label={LANGUAGE_LABELS[l] ?? l} />)}</div>
          ) : null}
        </Section>
      </div>

      {/* Checkboxes légales */}
      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={acceptedCGU} onChange={(e) => setAcceptedCGU(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-teal-600 focus:ring-teal-500" />
          <span className="text-sm text-neutral-600">
            J&apos;accepte les{" "}
            <a href="/legal/cgu" target="_blank" className="text-teal-600 hover:underline inline-flex items-center gap-0.5">
              CGU <ExternalLink className="h-3 w-3" />
            </a>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={acceptedDeonto} onChange={(e) => setAcceptedDeonto(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-teal-600 focus:ring-teal-500" />
          <span className="text-sm text-neutral-600">
            J&apos;atteste que les informations renseignées sont exactes, que je suis inscrit(e) à l&apos;Ordre compétent 
            et qu&apos;aucune sanction disciplinaire en cours ne m&apos;interdit d&apos;exercer.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={acceptedRGPD} onChange={(e) => setAcceptedRGPD(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-teal-600 focus:ring-teal-500" />
          <span className="text-sm text-neutral-600">
            J&apos;ai pris connaissance de la{" "}
            <a href="/legal/privacy" target="_blank" className="text-teal-600 hover:underline inline-flex items-center gap-0.5">
              Politique de confidentialité <ExternalLink className="h-3 w-3" />
            </a>{" "}
            et j&apos;accepte que mes données soient traitées conformément au RGPD.
          </span>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={prevStep} disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition disabled:opacity-40">
          Retour
        </button>
        <button type="button" onClick={handleSubmit} disabled={!canSubmit || loading}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2",
            canSubmit && !loading ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          )}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</> : <><CheckCircle className="h-4 w-4" /> Valider mon profil</>}
        </button>
      </div>
    </div>
  )
}
