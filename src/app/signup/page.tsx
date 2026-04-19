"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { track } from "@/lib/track";

const SPECIALTIES = [
  "Médecin généraliste", "Psychiatre", "Psychologue", "Diététicien(ne)",
  "Infirmier(ère)", "Kinésithérapeute", "Endocrinologue", "Cardiologue", "Autre",
];

const PROFESSION_TYPES: { value: string; label: string; emoji: string }[] = [
  { value: "PHYSICIAN",       label: "Médecin",       emoji: "🩺" },
  { value: "DIETITIAN",       label: "Diét./Nutritio.", emoji: "🥗" },
  { value: "PSYCHOLOGIST",    label: "Psy./Psychiatre", emoji: "🧠" },
  { value: "PEDIATRICIAN",    label: "Pédiatre",      emoji: "👶" },
  { value: "ENDOCRINOLOGIST", label: "Endocrino.",    emoji: "⚗️" },
  { value: "OTHER",           label: "Autre soignant", emoji: "🏥" },
];

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleType: "PROVIDER" as "PROVIDER" | "PATIENT",
    rppsNumber: "",
    specialties: [] as string[],
    professionType: "" as string,
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleSpecialty(s: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoading(true);
    try {
      const tokens = await authApi.signup({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        roleType: form.roleType,
        rppsNumber: form.rppsNumber || undefined,
        specialties: form.specialties.length ? form.specialties : undefined,
        professionType: form.roleType === "PROVIDER" && form.professionType ? form.professionType : undefined,
      });
      const user = await authApi.me(tokens.accessToken);
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      track.signup({ roleType: form.roleType });
      router.push(user?.roleType === "PATIENT" ? "/accueil" : "/aujourd-hui");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  }

  // LEFT PANEL — form
  // RIGHT PANEL — visual dark with quote + stats + animation rings

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.06; transform: scale(1); }
          50% { opacity: 0.13; transform: scale(1.05); }
        }
        .signup-ring { position: absolute; border-radius: 50%; animation: ring-pulse 4s ease-in-out infinite; }
        @keyframes stat-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-badge { animation: stat-in 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .spec-card { transition: all 0.18s cubic-bezier(0.16,1,0.3,1); }
        .spec-card:hover { transform: scale(1.02); }
        .signup-btn { transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s; }
        .signup-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(91,78,196,0.35) !important; }
      `}</style>

      {/* ── Left panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-14 overflow-y-auto">
        <div className="w-full max-w-[400px]">

          {/* Logo */}
          <div className="mb-8">
            <img src="/nami-mascot.png" alt="Nami" className="w-10 h-10 mb-5" style={{ borderRadius: 12, objectFit: "contain" }} />
            <h1 className="text-2xl font-extrabold tracking-tight mb-1"
              style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>
              Créez votre espace.
            </h1>
            <p className="text-sm" style={{ color: "#8A8A96" }}>
              Rejoignez les soignants qui coordonnent mieux.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4A4A5A" }}>Je suis…</p>
              <div className="grid grid-cols-2 gap-3">
                {(["PROVIDER", "PATIENT"] as const).map((r, idx) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, roleType: r }))}
                    className="spec-card rounded-xl py-3 px-4 border text-sm font-semibold transition-all text-left"
                    style={{
                      borderColor: form.roleType === r ? "#5B4EC4" : "rgba(26,26,46,0.1)",
                      background: form.roleType === r ? "rgba(91,78,196,0.05)" : "#fff",
                      color: form.roleType === r ? "#5B4EC4" : "#4A4A5A",
                      boxShadow: form.roleType === r ? "0 0 0 2px rgba(91,78,196,0.15)" : "none",
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{idx === 0 ? "🩺" : "👤"}</div>
                    {r === "PROVIDER" ? "Soignant" : "Patient"}
                  </button>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4A4A5A" }}>Prénom</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
                  className="h-11 rounded-xl border-0 text-sm" style={{ background: "#F5F3EF" }} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4A4A5A" }}>Nom</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
                  className="h-11 rounded-xl border-0 text-sm" style={{ background: "#F5F3EF" }} required />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4A4A5A" }}>Email</Label>
              <Input id="email" type="email" autoComplete="email" value={form.email}
                onChange={(e) => set("email", e.target.value)} placeholder="vous@exemple.com"
                className="h-11 rounded-xl border-0 text-sm" style={{ background: "#F5F3EF" }} required />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4A4A5A" }}>Mot de passe</Label>
              <Input id="password" type="password" autoComplete="new-password" value={form.password}
                onChange={(e) => set("password", e.target.value)} placeholder="8 caractères minimum"
                className="h-11 rounded-xl border-0 text-sm" style={{ background: "#F5F3EF" }} required />
            </div>

            {/* Provider-only fields */}
            {form.roleType === "PROVIDER" && (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4A4A5A" }}>Je pratique en tant que…</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PROFESSION_TYPES.map((pt) => (
                      <button key={pt.value} type="button"
                        onClick={() => setForm((f) => ({ ...f, professionType: f.professionType === pt.value ? "" : pt.value }))}
                        className="spec-card rounded-xl py-2.5 px-2 border text-xs font-semibold text-center transition-all"
                        style={{
                          borderColor: form.professionType === pt.value ? "#5B4EC4" : "rgba(26,26,46,0.1)",
                          background: form.professionType === pt.value ? "rgba(91,78,196,0.05)" : "#fff",
                          color: form.professionType === pt.value ? "#5B4EC4" : "#4A4A5A",
                          boxShadow: form.professionType === pt.value ? "0 0 0 2px rgba(91,78,196,0.15)" : "none",
                        }}>
                        <div style={{ fontSize: 16, marginBottom: 2 }}>{pt.emoji}</div>
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rpps" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4A4A5A" }}>
                    RPPS <span style={{ color: "#B0B0BA", fontWeight: 400 }}>(optionnel)</span>
                  </Label>
                  <Input id="rpps" value={form.rppsNumber} onChange={(e) => set("rppsNumber", e.target.value)}
                    placeholder="11 chiffres" className="h-11 rounded-xl border-0 text-sm" style={{ background: "#F5F3EF" }} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4A4A5A" }}>Spécialité(s)</p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                        className="spec-card text-xs px-3 py-1.5 rounded-full border font-medium"
                        style={{
                          borderColor: form.specialties.includes(s) ? "#5B4EC4" : "rgba(26,26,46,0.12)",
                          background: form.specialties.includes(s) ? "rgba(91,78,196,0.08)" : "#fff",
                          color: form.specialties.includes(s) ? "#5B4EC4" : "#4A4A5A",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="signup-btn w-full h-11 rounded-xl text-sm font-semibold text-white border-0 mt-2"
              style={{ background: "#5B4EC4", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }} disabled={loading}>
              {loading ? "Création…" : "Créer mon espace"}
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "#8A8A96" }}>
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold hover:underline underline-offset-2" style={{ color: "#5B4EC4" }}>
              Se connecter
            </Link>
          </p>
          <p className="text-center text-xs mt-4" style={{ color: "#B0B0BA" }}>
            En cas d&apos;urgence vitale : 15 / 112
          </p>
        </div>
      </div>

      {/* ── Right panel — visual ── */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden"
        style={{ width: 460, flexShrink: 0, background: "linear-gradient(160deg, #1A1A2E 0%, #1E1A3C 50%, #151F2E 100%)" }}>

        <div className="signup-ring" style={{ width: 200, height: 200, border: "1px solid rgba(91,78,196,0.3)", animationDelay: "0s" }} />
        <div className="signup-ring" style={{ width: 300, height: 300, border: "1px solid rgba(91,78,196,0.2)", animationDelay: "1s" }} />
        <div className="signup-ring" style={{ width: 400, height: 400, border: "1px solid rgba(43,168,156,0.15)", animationDelay: "2s" }} />
        <div className="signup-ring" style={{ width: 520, height: 520, border: "1px solid rgba(91,78,196,0.07)", animationDelay: "0.5s" }} />

        <div className="relative z-10 px-10 text-center">
          <blockquote className="text-lg font-bold leading-snug mb-8"
            style={{ color: "#EEECEA", fontFamily: "var(--font-jakarta)" }}>
            &quot;Quand votre patient voit 5 soignants,{" "}
            <span style={{ background: "linear-gradient(90deg,#5B4EC4,#2BA89C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              chacun sait ce que les autres ont fait.
            </span>&quot;
          </blockquote>

          <div className="space-y-3">
            {[
              { value: "60 000+", label: "sources cliniques indexées", delay: "0.3s" },
              { value: "10", label: "référentiels internationaux", delay: "0.5s" },
              { value: "131", label: "parcours structurés", delay: "0.7s" },
            ].map((s) => (
              <div key={s.label} className="stat-badge flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", animationDelay: s.delay }}>
                <span className="font-extrabold text-base" style={{ color: "#EEECEA", fontFamily: "var(--font-jakarta)", minWidth: 72 }}>{s.value}</span>
                <span className="text-xs" style={{ color: "rgba(238,236,234,0.4)" }}>{s.label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs mt-8" style={{ color: "rgba(238,236,234,0.2)" }}>
            Nami · Coordination des parcours complexes
          </p>
        </div>
      </div>
    </div>
  );
}
