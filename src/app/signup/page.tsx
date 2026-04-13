"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { track } from "@/lib/track";

const SPECIALTIES = [
  "Médecin généraliste",
  "Psychiatre",
  "Psychologue",
  "Diététicien(ne)",
  "Infirmier(ère)",
  "Kinésithérapeute",
  "Endocrinologue",
  "Cardiologue",
  "Autre",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm space-y-6 px-4 py-8">
        {/* Logo */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Nami</h1>
          <p className="text-sm text-muted-foreground">Créer votre compte soignant</p>
        </div>

        <Card>
          <CardHeader className="pb-2 pt-5">
            <p className="text-sm text-muted-foreground">
              Remplissez vos informations pour accéder au cockpit clinique
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="8 caractères minimum"
                  required
                />
              </div>

              {/* Rôle */}
              <div className="space-y-1.5">
                <Label>Rôle</Label>
                <div className="flex gap-2">
                  {(["PROVIDER", "PATIENT"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, roleType: r }))}
                      className={`flex-1 py-1.5 text-sm rounded-md border transition-colors ${
                        form.roleType === r
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-input text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {r === "PROVIDER" ? "Soignant" : "Patient"}
                    </button>
                  ))}
                </div>
              </div>

              {/* RPPS (soignant seulement) */}
              {form.roleType === "PROVIDER" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="rpps">Numéro RPPS <span className="text-muted-foreground">(optionnel)</span></Label>
                    <Input
                      id="rpps"
                      value={form.rppsNumber}
                      onChange={(e) => set("rppsNumber", e.target.value)}
                      placeholder="11 chiffres"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Spécialité(s)</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {SPECIALTIES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSpecialty(s)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            form.specialties.includes(s)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-input text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création…" : "Créer mon compte"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
