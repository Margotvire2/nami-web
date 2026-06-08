"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, mfaApi, organizationsApi, type User } from "@/lib/api";
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

  // INIT-646 — Accueil différencié patient/soignant.
  // Initial state SSR-safe via query (?role=patient ou ?surface=patient).
  // Re-évalué côté client si host = namipourlavie.com — symétrie avec
  // detectSurface() qui pilote déjà l'auth (loginPatient vs loginProvider).
  const queryIsPatient =
    searchParams.get("role") === "patient" || searchParams.get("surface") === "patient";
  const [isPatientContext, setIsPatientContext] = useState(queryIsPatient);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    const hostIsPatient = host === "namipourlavie.com" || host === "www.namipourlavie.com";
    if (hostIsPatient || queryIsPatient) setIsPatientContext(true);
    else setIsPatientContext(false);
  }, [queryIsPatient]);

  const heroTitle = "Bon retour";
  const heroSubtitle = isPatientContext
    ? "Retrouvez votre espace et vos soignant·es"
    : "Connectez-vous à votre cockpit soignant";
  const signupHintText = isPatientContext ? "Pas encore inscrit·e ?" : "Pas encore de compte ?";
  const signupHref = isPatientContext ? "/signup?role=patient" : "/signup";
  const signupHintCta = isPatientContext ? "Créer un espace patient" : "Créer un compte";

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email vérifié. Vous pouvez maintenant vous connecter.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (mfaStep) totpInputRef.current?.focus();
  }, [mfaStep]);

  // Calcule la route post-login selon le rôle dominant et sync le cookie
  // nami-admin-org-ids lu par le middleware pour les PLATFORM_ADMIN / ORG_ADMIN purs.
  // F-SEC-RENAME-PLATFORM-ADMIN — coexistence transitoire (V2 J+30 : retirer "ORG_ADMIN").
  async function resolvePostLoginRedirect(user: User, accessToken: string): Promise<string> {
    if (user.roleType === "PATIENT") return "/accueil";
    if (user.roleType === "SECRETARY") return "/secretariat";

    // PROVIDER ou PLATFORM_ADMIN/ORG_ADMIN → besoin de connaître les adhésions ADMIN.
    // Échec API non bloquant : on retombe sur /aujourd-hui pour ne pas
    // bloquer le login si /organizations/mine est down.
    let adminOrgIds: string[] = [];
    try {
      const orgs = await organizationsApi.mine(accessToken);
      // Backend filtre déjà status=ACTIVE et expose myRole directement.
      adminOrgIds = orgs
        .filter((o) => o.myRole === "ADMIN" || o.myRole === "OWNER")
        .map((o) => o.id);
    } catch {
      adminOrgIds = [];
    }

    if (typeof document !== "undefined") {
      const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
      const maxAge = 30 * 24 * 60 * 60;
      if (adminOrgIds.length > 0) {
        document.cookie = `nami-admin-org-ids=${adminOrgIds.join(",")}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
      } else {
        document.cookie = `nami-admin-org-ids=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      }
    }

    // 1. PROVIDER (avec ou sans adhésion admin) → cockpit soignant.
    if (user.providerProfile) return "/aujourd-hui";

    // Admin pur (!providerProfile) — hiérarchie stricte, jamais de fallback silencieux.
    // F-SEC-RENAME-PLATFORM-ADMIN — coexistence PLATFORM_ADMIN / ORG_ADMIN (legacy).
    if (adminOrgIds.length > 1) return "/structure/select";
    if (adminOrgIds.length === 1) return `/structure/${adminOrgIds[0]}/admin`;
    if (user.roleType === "PLATFORM_ADMIN") return "/admin/organization-applications";
    // ORG_ADMIN sans org active (org dissoute) ou rôle inconnu → refus explicite.
    return "/login?error=no_access";
  }

  // F-UX-PATIENT-V1-LAUNCH-1 — Détection surface (host ou query).
  // app.namipourlavie.com → loginProvider (403 si compte patient)
  // namipourlavie.com → loginPatient (403 si compte soignant)
  // localhost/preview → legacy login (smart fallback backend, pas d'enforcement)
  function detectSurface(): "patient" | "provider" | "legacy" {
    if (typeof window === "undefined") return "legacy";
    const host = window.location.hostname;
    if (host === "app.namipourlavie.com" || host.startsWith("app.localhost")) return "provider";
    if (host === "namipourlavie.com" || host === "www.namipourlavie.com") return "patient";
    const surface = searchParams.get("surface");
    if (surface === "patient" || surface === "provider") return surface;
    return "legacy";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const surface = detectSurface();
      const res =
        surface === "patient"  ? await authApi.loginPatient(email, password)
        : surface === "provider" ? await authApi.loginProvider(email, password)
        : await authApi.login(email, password);
      if (res.mfaRequired) {
        setMfaPendingToken(res.mfaPendingToken);
        setMfaStep(true);
        return;
      }
      const user = await authApi.me(res.accessToken);
      setAuth(user, res.accessToken, res.refreshToken);
      track.login({ method: "email" });
      const dest = await resolvePostLoginRedirect(user, res.accessToken);
      router.push(dest);
    } catch (err) {
      const apiErr = err as { status?: number; body?: { error?: string; message?: string } };
      if (apiErr?.status === 403 && apiErr?.body?.error === "role_mismatch") {
        toast.error(apiErr.body.message ?? "Vous n'avez pas accès à cet espace");
      } else {
        toast.error("Email ou mot de passe incorrect");
      }
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
      const dest = await resolvePostLoginRedirect(user, tokens.accessToken);
      router.push(dest);
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
              {heroTitle}
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {heroSubtitle}
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
                    style={{ color: "#374151" }}
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
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#374151" }}
                    >
                      Mot de passe
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs hover:underline underline-offset-2"
                      style={{ color: "#5B4EC4" }}
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
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

              <p className="text-center text-sm mt-8" style={{ color: "#6B7280" }}>
                {signupHintText}{" "}
                <Link
                  href={signupHref}
                  className="font-semibold hover:underline underline-offset-2"
                  style={{ color: "#5B4EC4" }}
                >
                  {signupHintCta}
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
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  Entrez le code à 6 chiffres de votre application authenticator
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="totp"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#374151" }}
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

              <p className="text-center text-xs" style={{ color: "#6B7280" }}>
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
            {isPatientContext ? (
              <>
                <p
                  className="text-xl font-bold leading-snug"
                  style={{ color: "#EEECEA", fontFamily: "var(--font-jakarta)" }}
                >
                  Votre parcours. Toute votre équipe.<br />
                  <span style={{ background: "linear-gradient(90deg, #5B4EC4, #2BA89C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Au même endroit.
                  </span>
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(238,236,234,0.45)" }}>
                  Le journal, les rendez-vous et vos soignants,<br />à portée de main.
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-10 flex items-center gap-6">
            {(isPatientContext
              ? [
                  { value: "1", label: "espace" },
                  { value: "Toute", label: "votre équipe" },
                  { value: "0", label: "papier perdu" },
                ]
              : [
                  { value: "60k+", label: "sources" },
                  { value: "131", label: "parcours" },
                  { value: "2 362", label: "étapes sourcées" },
                ]
            ).map((s) => (
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
