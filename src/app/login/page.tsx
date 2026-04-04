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
      <div className="w-full max-w-[400px] px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-[var(--shadow-md)]">
            <span className="text-primary-foreground text-xl font-bold">N</span>
          </div>
          <h1 className="text-page-title text-foreground mt-5">Nami</h1>
          <p className="text-sm text-muted-foreground mt-1">Cockpit de coordination clinique</p>
        </div>

        {/* Form */}
        <div className="nami-card p-8 space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Connectez-vous à votre espace soignant
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline underline-offset-2">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
