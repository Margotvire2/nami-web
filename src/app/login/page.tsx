"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, mfaApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { track } from "@/lib/track";

/* ── SVG connection illustration (nodes + edges) ── */
function ConnectionSVG() {
  return (
    <svg width="320" height="280" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Edges */}
      <line x1="160" y1="140" x2="80" y2="70"  stroke="rgba(91,78,196,0.35)" strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="160" y1="140" x2="240" y2="70"  stroke="rgba(43,168,156,0.35)" strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="160" y1="140" x2="60"  y2="190" stroke="rgba(91,78,196,0.25)" strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="160" y1="140" x2="260" y2="190" stroke="rgba(43,168,156,0.25)" strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="160" y1="140" x2="160" y2="230" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="80"  y1="70"  x2="240" y2="70"  stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 3"/>

      {/* Central node — patient */}
      <circle cx="160" cy="140" r="28" fill="rgba(91,78,196,0.15)" stroke="rgba(91,78,196,0.5)" strokeWidth="1.5"/>
      <circle cx="160" cy="140" r="18" fill="rgba(91,78,196,0.2)" stroke="rgba(91,78,196,0.6)" strokeWidth="1"/>
      <text x="160" y="145" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="600">Patient</text>

      {/* Soignant nodes */}
      <circle cx="80"  cy="70"  r="20" fill="rgba(43,168,156,0.12)" stroke="rgba(43,168,156,0.45)" strokeWidth="1.5"/>
      <text x="80"  y="66"  textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Diét.</text>
      <text x="80"  y="77"  textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Margot</text>

      <circle cx="240" cy="70"  r="20" fill="rgba(43,168,156,0.12)" stroke="rgba(43,168,156,0.45)" strokeWidth="1.5"/>
      <text x="240" y="66"  textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Psy.</text>
      <text x="240" y="77"  textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Claire</text>

      <circle cx="60"  cy="190" r="20" fill="rgba(91,78,196,0.1)" stroke="rgba(91,78,196,0.35)" strokeWidth="1.5"/>
      <text x="60"  y="186" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Médecin</text>
      <text x="60"  y="197" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Julien</text>

      <circle cx="260" cy="190" r="20" fill="rgba(91,78,196,0.1)" stroke="rgba(91,78,196,0.35)" strokeWidth="1.5"/>
      <text x="260" y="186" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Péd.</text>
      <text x="260" y="197" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Sophie</text>

      <circle cx="160" cy="230" r="16" fill="rgba(230,153,62,0.1)" stroke="rgba(230,153,62,0.35)" strokeWidth="1.5"/>
      <text x="160" y="226" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Parents</text>
      <text x="160" y="237" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="500">Gabrielle</text>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // MFA step
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaPendingToken, setMfaPendingToken] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const totpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email vérifié. Vous pouvez maintenant vous connecter.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (mfaStep) totpInputRef.current?.focus();
  }, [mfaStep]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.mfaRequired) {
        setMfaPendingToken(res.mfaPendingToken);
        setMfaStep(true);
        return;
      }
      const user = await authApi.me(res.accessToken);
      setAuth(user, res.accessToken, res.refreshToken);
      track.login({ method: "email" });
      router.push(user.roleType === "PATIENT" ? "/accueil" : user.roleType === "SECRETARY" ? "/secretariat" : "/aujourd-hui");
    } catch {
      toast.error("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totpCode.length !== 6) return;
    setLoading(true);
    try {
      const tokens = await mfaApi.validate(mfaPendingToken, totpCode);
      const user = await authApi.me(tokens.accessToken);
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      track.login({ method: "email_mfa" });
      router.push(user.roleType === "PATIENT" ? "/accueil" : user.roleType === "SECRETARY" ? "/secretariat" : "/aujourd-hui");
    } catch {
      toast.error("Code incorrect. Réessayez.");
      setTotpCode("");
      totpInputRef.current?.focus();
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
              Bon retour
            </h1>
            <p className="text-sm" style={{ color: "#8A8A96" }}>
              Connectez-vous à votre cockpit soignant
            </p>
          </div>

          {/* Form — étape 1 : email/mot de passe */}
          {!mfaStep && (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#4A4A5A" }}
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="h-11 rounded-xl border-0 text-sm"
                    style={{ background: "#F5F3EF", color: "#1A1A2E" }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#4A4A5A" }}
                  >
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl border-0 text-sm"
                    style={{ background: "#F5F3EF", color: "#1A1A2E" }}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0"
                  style={{ background: "#5B4EC4", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }}
                  disabled={loading}
                >
                  {loading ? "Connexion…" : "Se connecter"}
                </Button>
              </form>

              <p className="text-center text-sm mt-8" style={{ color: "#8A8A96" }}>
                Pas encore de compte ?{" "}
                <Link
                  href="/signup"
                  className="font-semibold hover:underline underline-offset-2"
                  style={{ color: "#5B4EC4" }}
                >
                  Créer un compte
                </Link>
              </p>
            </>
          )}

          {/* Form — étape 2 : code TOTP */}
          {mfaStep && (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div
                className="rounded-xl p-4 text-center space-y-1"
                style={{ background: "#F5F3EF" }}
              >
                <p className="text-2xl">🔐</p>
                <p className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
                  Vérification en deux étapes
                </p>
                <p className="text-xs" style={{ color: "#8A8A96" }}>
                  Entrez le code à 6 chiffres de votre application authenticator
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="totp"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#4A4A5A" }}
                >
                  Code à 6 chiffres
                </Label>
                <Input
                  id="totp"
                  ref={totpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  className="h-14 rounded-xl border-0 text-2xl text-center tracking-[0.5em] font-mono"
                  style={{ background: "#F5F3EF", color: "#1A1A2E" }}
                  autoComplete="one-time-code"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0"
                style={{ background: "#5B4EC4", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }}
                disabled={loading || totpCode.length !== 6}
              >
                {loading ? "Vérification…" : "Vérifier"}
              </Button>

              <p className="text-center text-xs" style={{ color: "#8A8A96" }}>
                Le code expire toutes les 30 secondes •{" "}
                <button
                  type="button"
                  onClick={() => { setMfaStep(false); setTotpCode(""); }}
                  className="underline"
                >
                  Retour
                </button>
              </p>
            </form>
          )}
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
        {/* Animated rings */}
        <style>{`
          @keyframes ring-pulse {
            0%, 100% { opacity: 0.06; transform: scale(1); }
            50% { opacity: 0.12; transform: scale(1.04); }
          }
          .ring { position: absolute; border-radius: 50%; border: 1px solid rgba(91,78,196,0.3); animation: ring-pulse 4s ease-in-out infinite; }
          .ring-1 { width: 220px; height: 220px; animation-delay: 0s; }
          .ring-2 { width: 320px; height: 320px; animation-delay: 1s; }
          .ring-3 { width: 420px; height: 420px; animation-delay: 2s; border-color: rgba(43,168,156,0.15); }
          .ring-4 { width: 520px; height: 520px; animation-delay: 0.5s; border-color: rgba(91,78,196,0.08); }
        `}</style>
        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />
        <div className="ring ring-4" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <ConnectionSVG />

          <div className="mt-8 space-y-2">
            <p
              className="text-xl font-bold leading-snug"
              style={{ color: "#EEECEA", fontFamily: "var(--font-jakarta)" }}
            >
              5 soignants. 1 dossier.<br />
              <span style={{ background: "linear-gradient(90deg, #5B4EC4, #2BA89C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                0 information perdue.
              </span>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(238,236,234,0.45)" }}>
              L&apos;orchestration du parcours,<br />au bout des doigts du soignant.
            </p>
          </div>

          {/* Stats row */}
          <div className="mt-10 flex items-center gap-6">
            {[
              { value: "865k+", label: "soignants" },
              { value: "22k", label: "fiches" },
              { value: "116k", label: "liens" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-extrabold" style={{ color: "#EEECEA", fontFamily: "var(--font-jakarta)" }}>{s.value}</p>
                <p className="text-[11px]" style={{ color: "rgba(238,236,234,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
