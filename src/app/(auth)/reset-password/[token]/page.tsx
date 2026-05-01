"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const OWASP_RE = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

function getStrengthHint(password: string): { ok: boolean; message: string } | null {
  if (!password) return null;
  if (password.length < 12) return { ok: false, message: "12 caractères minimum" };
  if (!OWASP_RE.upper.test(password)) return { ok: false, message: "Au moins une majuscule" };
  if (!OWASP_RE.lower.test(password)) return { ok: false, message: "Au moins une minuscule" };
  if (!OWASP_RE.digit.test(password)) return { ok: false, message: "Au moins un chiffre" };
  if (!OWASP_RE.special.test(password)) return { ok: false, message: "Au moins un caractère spécial (!@#…)" };
  return { ok: true, message: "Mot de passe valide" };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hint = getStrengthHint(password);
  const passwordsMatch = password === confirm;
  const canSubmit = hint?.ok && passwordsMatch && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 400) {
          if (data?.error?.includes("expiré") || data?.errors) {
            setError("Ce lien a expiré ou est invalide. Demandez un nouveau lien.");
          } else {
            setError(data?.error ?? "Erreur de validation.");
          }
          return;
        }
        setError("Une erreur est survenue. Veuillez réessayer.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
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
              className="rounded-xl p-5 space-y-2"
              style={{ background: "#F5F3EF" }}
            >
              <p className="text-2xl text-center">✅</p>
              <p className="text-sm font-semibold text-center" style={{ color: "#1A1A2E" }}>
                Mot de passe mis à jour
              </p>
              <p className="text-sm text-center" style={{ color: "#6B7280" }}>
                Redirection vers la connexion…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#374151" }}
                >
                  Nouveau mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-0 text-sm"
                  style={{ background: "#F5F3EF", color: "#1A1A2E" }}
                  required
                />
                {hint && (
                  <p
                    className="text-xs"
                    style={{ color: hint.ok ? "#059669" : "#D97706" }}
                  >
                    {hint.ok ? "✓ " : "· "}{hint.message}
                  </p>
                )}
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
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-11 rounded-xl border-0 text-sm"
                  style={{ background: "#F5F3EF", color: "#1A1A2E" }}
                  required
                />
                {confirm && !passwordsMatch && (
                  <p className="text-xs" style={{ color: "#D97706" }}>
                    · Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(220,38,38,0.06)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.15)" }}
                >
                  {error}
                  {error.includes("expiré") && (
                    <>
                      {" "}
                      <Link href="/forgot-password" className="underline font-medium">
                        Nouveau lien
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
            <span className="text-3xl">🔒</span>
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
