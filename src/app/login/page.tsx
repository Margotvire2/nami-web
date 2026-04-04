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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const tokens = await authApi.login(email, password);
      const user = await authApi.me(tokens.accessToken);
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.push("/dashboard");
    } catch {
      toast.error("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[380px] px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mx-auto shadow-[var(--shadow-sm)]">
            <span className="text-primary-foreground text-sm font-bold tracking-tight">N</span>
          </div>
          <h1 className="text-page-title text-foreground mt-4">Nami</h1>
          <p className="text-caption text-muted-foreground mt-1">Cockpit de coordination clinique</p>
        </div>

        {/* Form */}
        <div className="nami-card p-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre espace soignant
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-caption font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-caption font-medium">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
                required
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </div>

        <p className="text-center text-caption text-muted-foreground mt-6">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-2">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
