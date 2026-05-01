"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // silently ignored — anti-enumeration: always show confirmation
    } finally {
      setLoading(false);
      setSubmitted(true);
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
              Mot de passe oublié
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Entrez votre email. Si un compte existe, vous recevrez un lien de réinitialisation.
            </p>
          </div>

          {!submitted ? (
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

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0"
                style={{ background: "#5B4EC4", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }}
                disabled={loading}
              >
                {loading ? "Envoi…" : "Envoyer le lien"}
              </Button>
            </form>
          ) : (
            <div
              className="rounded-xl p-5 space-y-2"
              style={{ background: "#F5F3EF" }}
            >
              <p className="text-2xl text-center">📬</p>
              <p className="text-sm font-semibold text-center" style={{ color: "#1A1A2E" }}>
                Vérifiez votre boîte mail
              </p>
              <p className="text-sm text-center" style={{ color: "#6B7280" }}>
                Si un compte est associé à{" "}
                <span className="font-medium" style={{ color: "#1A1A2E" }}>{email}</span>,
                vous recevrez un email dans quelques minutes.
              </p>
            </div>
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
          @keyframes fp-ring-pulse {
            0%, 100% { opacity: 0.06; transform: scale(1); }
            50% { opacity: 0.12; transform: scale(1.04); }
          }
          .fp-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(91,78,196,0.3); animation: fp-ring-pulse 4s ease-in-out infinite; }
          .fp-ring-1 { width: 220px; height: 220px; animation-delay: 0s; }
          .fp-ring-2 { width: 320px; height: 320px; animation-delay: 1s; }
          .fp-ring-3 { width: 420px; height: 420px; animation-delay: 2s; border-color: rgba(43,168,156,0.15); }
          .fp-ring-4 { width: 520px; height: 520px; animation-delay: 0.5s; border-color: rgba(91,78,196,0.08); }
        `}</style>
        <div className="fp-ring fp-ring-1" />
        <div className="fp-ring fp-ring-2" />
        <div className="fp-ring fp-ring-3" />
        <div className="fp-ring fp-ring-4" />

        <div className="relative z-10 flex flex-col items-center text-center px-10 space-y-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(91,78,196,0.15)", border: "1px solid rgba(91,78,196,0.3)" }}
          >
            <span className="text-3xl">🔑</span>
          </div>
          <p
            className="text-xl font-bold leading-snug"
            style={{ color: "#EEECEA", fontFamily: "var(--font-jakarta)" }}
          >
            Sécurité d&apos;abord.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(238,236,234,0.45)" }}>
            Vos données de santé sont chiffrées<br />
            et hébergées en France (HDS).
          </p>
        </div>
      </div>
    </div>
  );
}
