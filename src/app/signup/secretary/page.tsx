"use client";

// F-SECRETAIRE-SIGNUP-FLOW-V1 — wizard inscription secrétaire / assistant·e médical·e.
//
// 4 étapes :
//   1. Credentials (email + password + CGU + mention RGPD scope)
//   2. Profile      (firstName + lastName + phone + city)
//   3. Soignants    (recherche live debounced, multi-select, min 1 / max 20)
//   4. Confirmation (récap + message + RGPD + submit → écran succès)
//
// Backend : POST /auth/signup/secretary
// Pas de rattachement à une structure en V1 — uniquement liens directs aux soignants.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { track } from "@/lib/track";

import { Step1Credentials, step1Valid, type Step1Values } from "./_components/Step1Credentials";
import { Step2Profile,     step2Valid, type Step2Values } from "./_components/Step2Profile";
import { Step3ProviderSearch, step3Valid, type Step3Values } from "./_components/Step3ProviderSearch";
import { Step4Confirmation,  step4Valid, type Step4Values } from "./_components/Step4Confirmation";

const STEPS = [
  { num: 1, label: "Compte"      },
  { num: 2, label: "Identité"    },
  { num: 3, label: "Soignants"   },
  { num: 4, label: "Validation"  },
];

export default function SecretarySignupPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step,    setStep]    = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<null | {
    linkRequestsCount:  number;
    invalidProviderIds: string[];
  }>(null);

  const [s1, setS1] = useState<Step1Values>({
    email: "", password: "", acceptedCGU: false,
  });
  const [s2, setS2] = useState<Step2Values>({
    firstName: "", lastName: "", phone: "", city: "",
  });
  const [s3, setS3] = useState<Step3Values>({ selectedProviders: [] });
  const [s4, setS4] = useState<Step4Values>({
    requestMessage: "", acceptedRGPD: false,
  });

  const canAdvance = useMemo(() => {
    if (step === 1) return step1Valid(s1);
    if (step === 2) return step2Valid(s2);
    if (step === 3) return step3Valid(s3);
    if (step === 4) return step4Valid(s4);
    return false;
  }, [step, s1, s2, s3, s4]);

  function set1<K extends keyof Step1Values>(k: K, v: Step1Values[K]) { setS1((s) => ({ ...s, [k]: v })); }
  function set2<K extends keyof Step2Values>(k: K, v: Step2Values[K]) { setS2((s) => ({ ...s, [k]: v })); }
  function set4<K extends keyof Step4Values>(k: K, v: Step4Values[K]) { setS4((s) => ({ ...s, [k]: v })); }

  function next() {
    if (!canAdvance) {
      toast.error("Complétez les champs requis avant de continuer.");
      return;
    }
    setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  }
  function back() {
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdvance) {
      toast.error("Vous devez consentir au traitement de vos données.");
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.signupSecretary({
        email:                s1.email.trim(),
        password:             s1.password,
        firstName:            s2.firstName.trim(),
        lastName:             s2.lastName.trim(),
        phone:                s2.phone.trim() || undefined,
        city:                 s2.city.trim() || undefined,
        requestedProviderIds: s3.selectedProviders.map((p) => p.id),
        requestMessage:       s4.requestMessage.trim() || undefined,
        acceptedCGU:          true,
        acceptedRGPD:         true,
      });

      const user = await authApi.me(result.accessToken);
      setAuth(user, result.accessToken, result.refreshToken);
      track.signup({ roleType: "SECRETARY" });

      setSuccess({
        linkRequestsCount:  result.linkRequestsCount,
        invalidProviderIds: result.invalidProviderIds,
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  }

  // ─── Écran succès ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF8" }}>
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
          <Link href="/" className="flex items-center gap-2">
            <img src="/nami-mascot.png" alt="Nami" className="w-8 h-8" style={{ borderRadius: 8, objectFit: "contain" }} />
            <span className="text-sm font-bold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>Nami</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="max-w-md w-full space-y-6 text-center">
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "#EEEDFB" }}
            >
              <CheckCircle2 size={36} color="#5B4EC4" />
            </div>
            <h1
              className="text-2xl font-extrabold"
              style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
            >
              Compte créé.
            </h1>
            <p className="text-sm" style={{ color: "#374151" }}>
              {success.linkRequestsCount} soignant
              {success.linkRequestsCount > 1 ? "s" : ""} vont recevoir votre
              demande de rattachement par email. Vous serez notifié·e dès qu&apos;une
              demande sera acceptée.
            </p>
            {success.invalidProviderIds.length > 0 && (
              <div
                className="rounded-xl p-3 text-xs"
                style={{ background: "#FEF9F0", border: "1px solid #FAE6BB", color: "#7B4F00" }}
              >
                {success.invalidProviderIds.length} soignant
                {success.invalidProviderIds.length > 1 ? "s" : ""} n&apos;ont pas
                pu être contacté·e·s (profil introuvable). Les autres demandes
                ont bien été envoyées.
              </div>
            )}
            <Button
              type="button"
              onClick={() => router.push("/secretariat")}
              className="rounded-xl h-11 px-6 text-sm font-semibold text-white border-0"
              style={{ background: "#5B4EC4", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }}
            >
              Accéder à mon espace
            </Button>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              Vous pouvez vérifier votre email à tout moment depuis votre boîte
              de réception.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ─── Wizard ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF8" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/nami-mascot.png" alt="Nami" className="w-8 h-8" style={{ borderRadius: 8, objectFit: "contain" }} />
          <span className="text-sm font-bold" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>Nami</span>
        </Link>
        <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: "#5B4EC4" }}>
          Déjà un compte ?
        </Link>
      </header>

      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(26,26,46,0.04)" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-1.5">
          {STEPS.map((s, i) => {
            const active = step === s.num;
            const done   = step >  s.num;
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
            );
          })}
        </div>
        <p className="max-w-3xl mx-auto text-xs mt-2 font-medium" style={{ color: "#6B7280" }}>
          Étape {step} / 4 — {STEPS[step - 1].label}
        </p>
      </div>

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
          {step === 1 && <Step1Credentials values={s1} onChange={set1} />}
          {step === 2 && <Step2Profile     values={s2} onChange={set2} />}
          {step === 3 && (
            <Step3ProviderSearch values={s3} onChange={setS3} />
          )}
          {step === 4 && (
            <Step4Confirmation
              email={s1.email}
              firstName={s2.firstName}
              lastName={s2.lastName}
              selectedProviders={s3.selectedProviders}
              values={s4}
              onChange={set4}
            />
          )}

          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                className="text-sm font-semibold hover:underline"
                style={{ color: "#6B7280" }}
              >
                ← Retour
              </button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={next}
                disabled={!canAdvance}
                className="rounded-xl h-11 px-6 text-sm font-semibold text-white border-0"
                style={{
                  background: canAdvance ? "#5B4EC4" : "rgba(91,78,196,0.4)",
                  boxShadow: "0 2px 10px rgba(91,78,196,0.3)",
                }}
              >
                Continuer →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !canAdvance}
                className="rounded-xl h-11 px-6 text-sm font-semibold text-white border-0"
                style={{
                  background: canAdvance ? "#5B4EC4" : "rgba(91,78,196,0.4)",
                  boxShadow: "0 2px 10px rgba(91,78,196,0.3)",
                }}
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
  );
}
