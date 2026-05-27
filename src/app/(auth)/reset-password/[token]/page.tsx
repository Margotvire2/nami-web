"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authApi, ApiError } from "@/lib/api";
import {
  PasswordStrengthMeter,
  evaluatePassword,
} from "@/components/public/PasswordStrengthMeter";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = (params?.token as string | undefined) ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorIsExpired, setErrorIsExpired] = useState(false);

  const strength = evaluatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirm;
  const canSubmit = strength.isValid && passwordsMatch && !loading && token.length > 0;

  // Focus auto sur le champ password au mount
  useEffect(() => {
    document.getElementById("password")?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setErrorIsExpired(false);
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login?reset=success"), 2500);
    } catch (err) {
      if (err instanceof ApiError) {
        // Backend renvoie 400 pour : lien invalide / expiré / déjà utilisé.
        if (err.status === 400 || err.status === 401 || err.status === 410) {
          const body = err.body as { error?: string } | undefined;
          const msg = body?.error ?? "";
          if (
            msg.includes("expiré") ||
            msg.includes("invalide") ||
            msg.includes("déjà utilisé")
          ) {
            setError("Ce lien a expiré ou n'est plus valide. Demandez un nouveau lien.");
            setErrorIsExpired(true);
          } else {
            setError(msg || "Le lien n'est plus valide.");
          }
        } else {
          setError("Une erreur est survenue. Veuillez réessayer.");
        }
      } else {
        setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Cas : pas de token dans l'URL (route normalement impossible, mais
  // garde-fou si quelqu'un atterrit sur /reset-password/ sans token).
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#FAFAF8" }}>
        <div className="w-full max-w-[380px] text-center space-y-4">
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
          >
            Lien manquant
          </h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Ce lien de réinitialisation ne contient pas de jeton.
            Demandez un nouveau lien pour continuer.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#5B4EC4" }}
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAF8" }}>

      {/* ── Left panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 min-h-screen">
        <div className="w-full max-w-[380px]">

          {/* Logo */}
          <div className="mb-10">
            <img src="/nami-mascot.png" alt="Nami" className="w-10 h-10 mb-5" style={{ borderRadius: 12, objectFit: "contain" }} />
            <h1
              className="text-2xl font-extrabold tracking-tight mb-1"
              style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
            >
              Nouveau mot de passe
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Choisissez un mot de passe fort pour sécuriser votre compte.
            </p>
          </div>

          {done ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl p-5 space-y-2"
              style={{ background: "#F5F3EF" }}
            >
              <p className="text-2xl text-center" aria-hidden="true">✅</p>
              <p className="text-sm font-semibold text-center" style={{ color: "#1A1A2E" }}>
                Mot de passe mis à jour
              </p>
              <p className="text-sm text-center" style={{ color: "#6B7280" }}>
                Redirection vers la connexion…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#374151" }}
                >
                  Nouveau mot de passe
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-0 text-sm"
                  style={{ background: "#F5F3EF", color: "#1A1A2E" }}
                  required
                  aria-required="true"
                  aria-invalid={password.length > 0 && !strength.isValid}
                  aria-describedby="password-strength"
                  minLength={12}
                />
                <PasswordStrengthMeter password={password} id="password-strength" />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#374151" }}
                >
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-11 rounded-xl border-0 text-sm"
                  style={{ background: "#F5F3EF", color: "#1A1A2E" }}
                  required
                  aria-required="true"
                  aria-invalid={confirm.length > 0 && !passwordsMatch}
                  aria-describedby="confirm-feedback"
                />
                <p
                  id="confirm-feedback"
                  aria-live="polite"
                  className="text-xs min-h-[1rem]"
                  style={{ color: confirm.length > 0 && !passwordsMatch ? "#D97706" : "transparent" }}
                >
                  {confirm.length > 0 && !passwordsMatch
                    ? "Les mots de passe ne correspondent pas"
                    : "·"}
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(220,38,38,0.06)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.15)" }}
                >
                  {error}
                  {errorIsExpired && (
                    <>
                      {" "}
                      <Link
                        href="/forgot-password"
                        className="underline font-medium"
                      >
                        Demander un nouveau lien
                      </Link>
                    </>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0"
                style={{ background: "#5B4EC4", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }}
                disabled={!canSubmit}
              >
                {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm mt-8" style={{ color: "#6B7280" }}>
            <Link
              href="/login"
              className="font-semibold hover:underline underline-offset-2"
              style={{ color: "#5B4EC4" }}
            >
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel — visual ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          width: "480px",
          flexShrink: 0,
          background: "linear-gradient(160deg, #1A1A2E 0%, #1E1A3C 50%, #151F2E 100%)",
        }}
      >
        <style>{`
          @keyframes rp-ring-pulse {
            0%, 100% { opacity: 0.06; transform: scale(1); }
            50% { opacity: 0.12; transform: scale(1.04); }
          }
          .rp-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(91,78,196,0.3); animation: rp-ring-pulse 4s ease-in-out infinite; }
          .rp-ring-1 { width: 220px; height: 220px; animation-delay: 0s; }
          .rp-ring-2 { width: 320px; height: 320px; animation-delay: 1s; }
          .rp-ring-3 { width: 420px; height: 420px; animation-delay: 2s; border-color: rgba(43,168,156,0.15); }
          .rp-ring-4 { width: 520px; height: 520px; animation-delay: 0.5s; border-color: rgba(91,78,196,0.08); }
        `}</style>
        <div className="rp-ring rp-ring-1" />
        <div className="rp-ring rp-ring-2" />
        <div className="rp-ring rp-ring-3" />
        <div className="rp-ring rp-ring-4" />

        <div className="relative z-10 flex flex-col items-center text-center px-10 space-y-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(91,78,196,0.15)", border: "1px solid rgba(91,78,196,0.3)" }}
          >
            <span className="text-3xl" aria-hidden="true">🔒</span>
          </div>
          <p
            className="text-xl font-bold leading-snug"
            style={{ color: "#EEECEA", fontFamily: "var(--font-jakarta)" }}
          >
            Un seul usage.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(238,236,234,0.45)" }}>
            Ce lien expire dans 1 heure.<br />
            Toutes les sessions actives seront révoquées.
          </p>
        </div>
      </div>
    </div>
  );
}
