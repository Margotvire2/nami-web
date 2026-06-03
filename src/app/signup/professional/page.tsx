"use client"

// F-SOIGNANT-SIGNUP-PAR-METIER — wizard signup soignant 7 étapes.
//
// Étapes :
//   1. Identité (prénom, nom, email, mot de passe)
//   2. Profession (12 métiers)
//   3. Identifiant pro (RPPS / ADELI / DEAS — adapté à la profession)
//   4. Mode d'exercice (libéral / salarié structure / mixte)
//   5. Spécialité wedge (TCA / Obésité / Endocrino / Pédia / Généraliste / Autre)
//   6. Profil public initial (photo URL + bio courte)
//   7. CGU + RGPD + soumission

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { track } from "@/lib/track"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProfessionSelector } from "@/components/signup/ProfessionSelector"
import { ProIdentifierInput } from "@/components/signup/ProIdentifierInput"
import { ExerciseModeSelector } from "@/components/signup/ExerciseModeSelector"
import {
  getProfession,
  IDENTIFIER_PATTERNS,
  SPECIALTY_VIEWS,
  type Profession,
  type ExerciseMode,
  type SpecialtyView,
} from "@/components/signup/professions"

type WizardState = {
  firstName:     string
  lastName:      string
  email:         string
  password:      string
  phone:         string
  profession:    Profession | ""
  proIdentifier: string
  exerciseMode:  ExerciseMode | ""
  specialtyView: SpecialtyView | ""
  publicBio:     string
  photoUrl:      string
  acceptedCGU:   boolean
  acceptedRGPD:  boolean
}

const INITIAL: WizardState = {
  firstName:     "",
  lastName:      "",
  email:         "",
  password:      "",
  phone:         "",
  profession:    "",
  proIdentifier: "",
  exerciseMode:  "",
  specialtyView: "",
  publicBio:     "",
  photoUrl:      "",
  acceptedCGU:   false,
  acceptedRGPD:  false,
}

const STEPS = [
  { num: 1, label: "Identité"      },
  { num: 2, label: "Profession"    },
  { num: 3, label: "Identifiant"   },
  { num: 4, label: "Exercice"      },
  { num: 5, label: "Spécialité"    },
  { num: 6, label: "Profil public" },
  { num: 7, label: "Validation"    },
]

export default function ProfessionalSignupPage() {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState<WizardState>(INITIAL)
  const [loading, setLoading] = useState(false)

  const set = <K extends keyof WizardState>(field: K, value: WizardState[K]) =>
    setForm((f) => ({ ...f, [field]: value }))

  // ─── Validations par étape ────────────────────────────────────────────────
  function canAdvance(): boolean {
    if (step === 1) {
      return (
        form.firstName.trim().length > 0 &&
        form.lastName.trim().length  > 0 &&
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) &&
        form.password.length >= 8
      )
    }
    if (step === 2) return Boolean(form.profession)
    if (step === 3) {
      const meta = getProfession(form.profession)
      if (!meta) return false
      return IDENTIFIER_PATTERNS[meta.identifierType].test(form.proIdentifier.trim())
    }
    if (step === 4) return Boolean(form.exerciseMode)
    if (step === 5) return Boolean(form.specialtyView)
    if (step === 6) return true // Profil public 100% optionnel V1
    if (step === 7) return form.acceptedCGU && form.acceptedRGPD
    return false
  }

  function next() {
    if (!canAdvance()) {
      toast.error("Complétez les champs requis avant de continuer.")
      return
    }
    setStep((s) => Math.min(7, s + 1))
  }
  function back() { setStep((s) => Math.max(1, s - 1)) }

  // ─── Soumission ────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canAdvance()) {
      toast.error("Vous devez accepter les CGU et la politique RGPD.")
      return
    }
    if (!form.profession || !form.exerciseMode) return

    setLoading(true)
    try {
      const result = await authApi.signupProvider({
        email:         form.email,
        password:      form.password,
        firstName:     form.firstName,
        lastName:      form.lastName,
        phone:         form.phone || undefined,
        profession:    form.profession,
        proIdentifier: form.proIdentifier.trim(),
        exerciseMode:  form.exerciseMode,
        specialtyView: form.specialtyView || undefined,
        publicBio:     form.publicBio.trim() || undefined,
        photoUrl:      form.photoUrl.trim() || undefined,
        acceptedCGU:   true,
        acceptedRGPD:  true,
      })
      const user = await authApi.me(result.accessToken)
      setAuth(user, result.accessToken, result.refreshToken)
      track.signup({ roleType: "PROVIDER" })

      if (result.needsManualReview) {
        toast.success("Compte créé. Votre profil sera vérifié par l'équipe Nami sous 24 h.")
      } else {
        toast.success("Compte créé et validé. Bienvenue !")
      }
      router.push("/aujourd-hui")
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la création du compte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF8" }}>
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/nami-mascot.png" alt="Nami" className="w-8 h-8" style={{ borderRadius: 8, objectFit: "contain" }} />
          <span className="text-sm font-bold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>Nami</span>
        </Link>
        <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: "#5B4EC4" }}>
          Déjà un compte ?
        </Link>
      </header>

      {/* ── Stepper ── */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(26,26,46,0.04)" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-1.5">
          {STEPS.map((s, i) => {
            const active = step === s.num
            const done   = step >  s.num
            return (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className="h-1 flex-1 rounded-full transition-all"
                  style={{ background: (active || done) ? "#5B4EC4" : "rgba(26,26,46,0.08)" }}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Étape ${s.num} : ${s.label}`}
                />
                {i < STEPS.length - 1 && <div className="w-1" />}
              </div>
            )
          })}
        </div>
        <p className="max-w-3xl mx-auto text-xs mt-2 font-medium" style={{ color: "#6B7280" }}>
          Étape {step} / 7 — {STEPS[step - 1].label}
        </p>
      </div>

      {/* ── Body ── */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">

          {/* Step 1 — Identité */}
          {step === 1 && (
            <section className="space-y-4">
              <h1 className="text-2xl font-extrabold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>
                Créez votre espace soignant.
              </h1>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Quelques informations pour démarrer. Nous validons ensuite votre profil
                manuellement sous 24 h.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email professionnel</Label>
                <Input id="email" type="email" autoComplete="email" value={form.email}
                  onChange={(e) => set("email", e.target.value)} placeholder="vous@cabinet.fr" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" autoComplete="new-password" value={form.password}
                  onChange={(e) => set("password", e.target.value)} placeholder="8 caractères minimum" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  Téléphone <span style={{ color: "#B0B0BA", fontWeight: 400 }}>(optionnel)</span>
                </Label>
                <Input id="phone" type="tel" autoComplete="tel" value={form.phone}
                  onChange={(e) => set("phone", e.target.value)} placeholder="06 12 34 56 78" />
              </div>
            </section>
          )}

          {/* Step 2 — Profession */}
          {step === 2 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>
                Quelle est votre profession ?
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Sélectionnez votre métier pour adapter le reste de l&apos;inscription.
              </p>
              <ProfessionSelector value={form.profession} onChange={(p) => set("profession", p)} />
            </section>
          )}

          {/* Step 3 — Identifiant pro */}
          {step === 3 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>
                Votre identifiant pro.
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Permet à l&apos;équipe Nami de valider votre profil. Confidentiel —
                jamais affiché publiquement.
              </p>
              <ProIdentifierInput
                profession={form.profession}
                value={form.proIdentifier}
                onChange={(v) => set("proIdentifier", v)}
              />
            </section>
          )}

          {/* Step 4 — Mode d'exercice */}
          {step === 4 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>
                Comment exercez-vous ?
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Vous pourrez ajouter ou modifier vos structures plus tard.
              </p>
              <ExerciseModeSelector value={form.exerciseMode} onChange={(m) => set("exerciseMode", m)} />
            </section>
          )}

          {/* Step 5 — Spécialité wedge */}
          {step === 5 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>
                Votre domaine principal.
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Aide à pré-orienter votre cockpit — vous pourrez en ajouter d&apos;autres.
              </p>
              <div className="space-y-2.5" role="radiogroup" aria-label="Spécialité">
                {SPECIALTY_VIEWS.map((s) => {
                  const selected = form.specialtyView === s.value
                  return (
                    <button
                      key={s.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => set("specialtyView", s.value)}
                      className="w-full text-left rounded-xl p-4 border transition-all hover:scale-[1.005]"
                      style={{
                        borderColor: selected ? "#5B4EC4" : "rgba(26,26,46,0.1)",
                        background:  selected ? "rgba(91,78,196,0.06)" : "#fff",
                        boxShadow:   selected ? "0 0 0 2px rgba(91,78,196,0.15)" : "none",
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-0.5"
                        style={{ color: selected ? "#5B4EC4" : "#1A1A2E" }}
                      >
                        {s.label}
                      </div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>{s.description}</div>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Step 6 — Profil public initial */}
          {step === 6 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>
                Profil public initial.
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Visible par vos confrères dans l&apos;annuaire Nami. Tout est modifiable plus tard.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="photoUrl">
                  Photo (URL) <span style={{ color: "#B0B0BA", fontWeight: 400 }}>(optionnel)</span>
                </Label>
                <Input id="photoUrl" type="url" value={form.photoUrl}
                  onChange={(e) => set("photoUrl", e.target.value)} placeholder="https://..." />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="publicBio">
                  Présentation courte <span style={{ color: "#B0B0BA", fontWeight: 400 }}>(optionnel)</span>
                </Label>
                <textarea id="publicBio" rows={4} value={form.publicBio}
                  onChange={(e) => set("publicBio", e.target.value)}
                  maxLength={1000}
                  placeholder="Votre approche, vos consultations, votre patientèle..."
                  className="w-full rounded-xl border-0 px-4 py-3 text-sm resize-y"
                  style={{ background: "#F5F3EF", color: "#1A1A2E" }}
                />
                <p className="text-xs" style={{ color: "#6B7280" }}>{form.publicBio.length} / 1000</p>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                💡 Les tarifs et structures se configurent dans le tunnel d&apos;onboarding
                cockpit après votre première connexion.
              </p>
            </section>
          )}

          {/* Step 7 — Validation CGU + RGPD */}
          {step === 7 && (
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>
                Dernière étape.
              </h2>

              <div className="rounded-xl p-4 space-y-3" style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.06)" }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acceptedCGU}
                    onChange={(e) => set("acceptedCGU", e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm" style={{ color: "#374151" }}>
                    J&apos;accepte les{" "}
                    <Link href="/cgu" target="_blank" className="font-semibold hover:underline" style={{ color: "#5B4EC4" }}>
                      conditions générales d&apos;utilisation
                    </Link>
                    {" "}et les{" "}
                    <Link href="/mentions-legales" target="_blank" className="font-semibold hover:underline" style={{ color: "#5B4EC4" }}>
                      mentions légales
                    </Link>.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acceptedRGPD}
                    onChange={(e) => set("acceptedRGPD", e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm" style={{ color: "#374151" }}>
                    J&apos;ai lu la{" "}
                    <Link href="/confidentialite" target="_blank" className="font-semibold hover:underline" style={{ color: "#5B4EC4" }}>
                      politique de confidentialité
                    </Link>
                    {" "}et je consens au traitement de mes données (RGPD Art. 6.1.b).
                  </span>
                </label>
              </div>

              <div className="rounded-xl p-4 text-xs leading-relaxed" style={{ background: "#FEF9F0", border: "1px solid #FAE6BB", color: "#7B4F00" }}>
                Votre compte est créé immédiatement. L&apos;équipe Nami vérifie votre
                identifiant pro sous 24 h. Vous pouvez utiliser le cockpit pendant cette
                période — certaines fonctionnalités (annuaire public, messagerie inter-soignants)
                seront déverrouillées après validation.
              </div>
            </section>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button type="button" onClick={back} className="text-sm font-semibold hover:underline" style={{ color: "#6B7280" }}>
                ← Retour
              </button>
            ) : (
              <span />
            )}

            {step < 7 ? (
              <Button
                type="button"
                onClick={next}
                disabled={!canAdvance()}
                className="rounded-xl h-11 px-6 text-sm font-semibold text-white border-0"
                style={{ background: canAdvance() ? "#5B4EC4" : "rgba(91,78,196,0.4)", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }}
              >
                Continuer →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !canAdvance()}
                className="rounded-xl h-11 px-6 text-sm font-semibold text-white border-0"
                style={{ background: canAdvance() ? "#5B4EC4" : "rgba(91,78,196,0.4)", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }}
              >
                {loading ? "Création…" : "Créer mon compte"}
              </Button>
            )}
          </div>

          <p className="text-center text-xs pt-4" style={{ color: "#B0B0BA" }}>
            En cas d&apos;urgence vitale : 15 / 112
          </p>
        </form>
      </main>
    </div>
  )
}
