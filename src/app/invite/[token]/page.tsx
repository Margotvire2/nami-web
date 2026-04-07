"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Loader2,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";
import { invitationsApi, authApi, type Invitation } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { setAccessToken } = useAuthStore();

  const [step, setStep] = useState<"loading" | "welcome" | "signup" | "done" | "error">("loading");
  const [invitation, setInvitation] = useState<Invitation | null>(null);

  // Signup form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load invitation on mount
  useEffect(() => {
    invitationsApi
      .get(token)
      .then((inv) => {
        setInvitation(inv);
        if (inv.toEmail) setEmail(inv.toEmail);
        if (inv.isExpired) {
          setStep("error");
        } else if (inv.status === "ACCEPTED") {
          setStep("done");
        } else {
          setStep("welcome");
        }
      })
      .catch(() => setStep("error"));
  }, [token]);

  async function handleSignup() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) return;
    setSubmitting(true);

    try {
      // 1. Create account
      const { accessToken } = await authApi.signup({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roleType: "PROVIDER",
      });

      // 2. Accept invitation
      const me = await authApi.me(accessToken);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/invitations/${token}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ personId: me.id }),
        }
      );

      // Auto-login
      setAccessToken(accessToken);

      setStep("done");
      toast.success("Bienvenue sur Nami !");

      // Redirect after brief delay
      setTimeout(() => router.push("/aujourd-hui"), 1500);
    } catch (err: any) {
      const msg = err?.message?.includes("409") || err?.message?.includes("Unique")
        ? "Un compte avec cet email existe déjà. Connectez-vous."
        : "Erreur lors de la création du compte";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Loading
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  // Error / expired
  if (step === "error") {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-2xl border p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} className="text-destructive" />
          </div>
          <h1 className="text-lg font-semibold">
            {invitation?.isExpired ? "Invitation expirée" : "Invitation introuvable"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {invitation?.isExpired
              ? "Cette invitation a expiré. Demandez à votre confrère d'en renvoyer une nouvelle."
              : "Ce lien d'invitation n'est pas valide. Vérifiez le lien ou contactez l'expéditeur."}
          </p>
          <Link href="/login">
            <Button variant="outline" className="text-xs">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">
        {/* ── Welcome ── */}
        {step === "welcome" && invitation && (
          <div className="space-y-5">
            <div className="bg-card rounded-2xl border p-8 space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-extrabold">N</span>
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">Nami</span>
              </div>

              {/* Invitation */}
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                  {invitation.fromPerson.firstName} {invitation.fromPerson.lastName} vous invite à collaborer
                </h1>
                {invitation.careCase && (
                  <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <Stethoscope size={13} className="text-muted-foreground/60" />
                    {invitation.careCase.caseTitle}
                  </p>
                )}
              </div>

              {/* Message */}
              {invitation.message && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    &quot;{invitation.message}&quot;
                  </p>
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-2.5">
                <Button
                  className="w-full h-11 text-sm gap-2"
                  onClick={() => setStep("signup")}
                >
                  Créer mon compte <ArrowRight size={15} />
                </Button>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full h-11 text-sm">
                    J&apos;ai déjà un compte
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield size={11} /> Données sécurisées</span>
              <span className="flex items-center gap-1"><Clock size={11} /> Inscription en 45 sec</span>
            </div>
          </div>
        )}

        {/* ── Signup ── */}
        {step === "signup" && invitation && (
          <div className="bg-card rounded-2xl border p-8 space-y-5">
            <div>
              <button
                onClick={() => setStep("welcome")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
              >
                ← Retour
              </button>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Créer votre compte
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Rejoignez l&apos;équipe de {invitation.fromPerson.firstName} {invitation.fromPerson.lastName}.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Prénom</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="h-9 text-xs mt-1"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Nom</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    className="h-9 text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Email professionnel</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@cabinet.fr"
                  className="h-9 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Mot de passe</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 caractères"
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>

            <Button
              className="w-full h-10 text-sm gap-2"
              onClick={handleSignup}
              disabled={submitting || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()}
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              {submitting ? "Création du compte…" : "Rejoindre l'équipe"}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              En créant votre compte, vous acceptez les conditions d&apos;utilisation de Nami.
            </p>
          </div>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div className="bg-card rounded-2xl border p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {firstName ? `Bienvenue, ${firstName} !` : "Bienvenue sur Nami !"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
                {invitation
                  ? `Vous faites maintenant partie de l'équipe de ${invitation.fromPerson.firstName} ${invitation.fromPerson.lastName}. Connectez-vous pour accéder à vos dossiers.`
                  : "Votre compte est créé. Connectez-vous pour commencer."}
              </p>
            </div>

            <Link href="/login">
              <Button className="text-sm gap-2">
                Se connecter <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
