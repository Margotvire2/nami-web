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
  UserCheck,
} from "lucide-react";
import { invitationsApi, authApi, authActivateApi, type Invitation } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function acceptInvitation(token: string, accessToken: string, personId: string) {
  await fetch(`${API_URL}/invitations/${token}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ personId }),
  });
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { setAccessToken } = useAuthStore();

  const [step, setStep] = useState<"loading" | "welcome" | "signup" | "activate" | "done" | "error">("loading");
  const [invitation, setInvitation] = useState<Invitation | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  // Flux provider — signup complet
  async function handleSignup() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) return;
    setSubmitting(true);
    try {
      const { accessToken: at } = await authApi.signup({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roleType: "PROVIDER",
      });
      const me = await authApi.me(at);
      await acceptInvitation(token, at, me.id);
      setAccessToken(at);
      setStep("done");
      toast.success("Bienvenue sur Nami !");
      setTimeout(() => router.push("/aujourd-hui"), 1500);
    } catch (err: any) {
      const msg = err?.message?.includes("409")
        ? "Un compte avec cet email existe déjà. Connectez-vous."
        : "Erreur lors de la création du compte";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Flux patient — activation (compte sans mot de passe)
  async function handleActivate() {
    if (!email.trim() || password.length < 8) return;
    setSubmitting(true);
    try {
      const { accessToken: at } = await authActivateApi(email.trim(), password);
      const me = await authApi.me(at);
      await acceptInvitation(token, at, me.id);
      setAccessToken(at);
      setStep("done");
      toast.success("Bienvenue sur Nami !");
      setTimeout(() => router.push("/aujourd-hui"), 1500);
    } catch (err: any) {
      const msg = err?.message?.includes("déjà un mot de passe")
        ? "Ce compte a déjà été activé. Connectez-vous."
        : "Erreur lors de l'activation";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (!invitation) return;
    if (invitation.existingAccount && invitation.inviteeRoleType === "PATIENT") {
      setStep("activate");
    } else {
      setStep("signup");
    }
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

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
              ? "Cette invitation a expiré. Demandez à votre soignant d'en renvoyer une nouvelle."
              : "Ce lien d'invitation n'est pas valide. Vérifiez le lien ou contactez l'expéditeur."}
          </p>
          <Link href="/login">
            <Button variant="outline" className="text-xs">Se connecter</Button>
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
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-extrabold">N</span>
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">Nami</span>
              </div>

              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                  {invitation.existingAccount && invitation.inviteeRoleType === "PATIENT"
                    ? `${invitation.fromPerson.firstName} ${invitation.fromPerson.lastName} a créé votre dossier de suivi`
                    : `${invitation.fromPerson.firstName} ${invitation.fromPerson.lastName} vous invite à collaborer`}
                </h1>
                {invitation.careCase && (
                  <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <Stethoscope size={13} className="text-muted-foreground/60" />
                    {invitation.careCase.caseTitle}
                  </p>
                )}
              </div>

              {invitation.message && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    &quot;{invitation.message}&quot;
                  </p>
                </div>
              )}

              {invitation.existingAccount && invitation.inviteeRoleType === "PATIENT" && (
                <div className="bg-primary/5 rounded-xl p-4 text-sm text-foreground/80 flex items-start gap-2.5">
                  <UserCheck size={16} className="text-primary shrink-0 mt-0.5" />
                  <p>Votre dossier est prêt. Activez votre compte pour accéder à votre suivi et communiquer avec votre équipe soignante.</p>
                </div>
              )}

              <div className="space-y-2.5">
                <Button className="w-full h-11 text-sm gap-2" onClick={handleContinue}>
                  {invitation.existingAccount && invitation.inviteeRoleType === "PATIENT"
                    ? "Activer mon compte"
                    : "Créer mon compte"}
                  <ArrowRight size={15} />
                </Button>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full h-11 text-sm">
                    J&apos;ai déjà un compte
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield size={11} /> Données sécurisées</span>
              <span className="flex items-center gap-1"><Clock size={11} /> Inscription en 45 sec</span>
            </div>
          </div>
        )}

        {/* ── Signup (provider) ── */}
        {step === "signup" && invitation && (
          <div className="bg-card rounded-2xl border p-8 space-y-5">
            <div>
              <button onClick={() => setStep("welcome")} className="text-xs text-muted-foreground hover:text-primary transition-colors mb-3">
                ← Retour
              </button>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Créer votre compte</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Rejoignez l&apos;équipe de {invitation.fromPerson.firstName} {invitation.fromPerson.lastName}.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Prénom</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="h-9 text-xs mt-1" autoFocus />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Nom</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="h-9 text-xs mt-1" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Email professionnel</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@cabinet.fr" className="h-9 text-xs mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Mot de passe</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 caractères" className="h-9 text-xs mt-1" />
              </div>
            </div>

            <Button
              className="w-full h-10 text-sm gap-2"
              onClick={handleSignup}
              disabled={submitting || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Création du compte…" : "Rejoindre l'équipe"}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center">
              En créant votre compte, vous acceptez les conditions d&apos;utilisation de Nami.
            </p>
          </div>
        )}

        {/* ── Activate (patient) ── */}
        {step === "activate" && invitation && (
          <div className="bg-card rounded-2xl border p-8 space-y-5">
            <div>
              <button onClick={() => setStep("welcome")} className="text-xs text-muted-foreground hover:text-primary transition-colors mb-3">
                ← Retour
              </button>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Activer votre compte</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choisissez un mot de passe pour accéder à votre espace de suivi.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Votre email</label>
                <Input type="email" value={email} readOnly className="h-9 text-xs mt-1 bg-muted/40" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Choisissez un mot de passe</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 caractères"
                  className="h-9 text-xs mt-1"
                  autoFocus
                />
              </div>
            </div>

            <Button
              className="w-full h-10 text-sm gap-2"
              onClick={handleActivate}
              disabled={submitting || password.length < 8}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Activation…" : "Accéder à mon suivi"}
            </Button>
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
                Votre compte est actif. Vous allez être redirigé…
              </p>
            </div>
            <Link href="/aujourd-hui">
              <Button className="text-sm gap-2">
                Accéder à Nami <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
