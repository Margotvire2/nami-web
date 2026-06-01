"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import VerifyEmailHero, { type VerifyStatus } from "./VerifyEmailHero";

// Client component : orchestration des 4 states (loading/success/expired/invalid)
// + state "no-token" si l'utilisateur arrive sur /verify-email sans paramètre
// (cas typique : il vient de cliquer sur "Renvoyer l'email" ou a tapé l'URL).
//
// Backend route GET /auth/verify-email?token=XXX retourne :
//   - 200 { message }         → success (couvre aussi "déjà vérifié", idempotent)
//   - 400 { error }           → token manquant (n'arrive jamais ici, on aurait le state no-token)
//   - 404 { error }           → token invalide ou déjà invalidé
//   - 410 / 401               → token expiré (non implémenté backend V1, mais on l'anticipe)
//
// Pas de POST /auth/resend-verification côté backend V1 → on n'expose pas de CTA
// fonctionnel pour le renvoi (ticket V2 dérivé : F-AUTH-PATIENT-VERIFY-EMAIL-RESEND-LIMIT).
export default function VerifyEmailClient({ token }: { token: string | null }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<VerifyStatus>(token ? "loading" : "no-token");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    authApi
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Le helper request() throw une ApiError avec .status. On considère
        // 410/401 comme "expired" et tout autre échec comme "invalid".
        const httpStatus = err instanceof ApiError ? err.status : 0;
        if (httpStatus === 410 || httpStatus === 401) {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // CTA "Continuer" en cas de succès : si on a déjà un user en session
  // (cas : utilisateur déjà loggé qui vérifie depuis un autre device), on
  // route vers son espace ; sinon on l'envoie vers /login.
  function handleContinue() {
    if (user) {
      const target =
        user.roleType === "PATIENT"
          ? "/accueil"
          : user.roleType === "SECRETARY"
          ? "/secretariat"
          : "/aujourd-hui";
      router.push(target);
    } else {
      router.push("/login?verified=true");
    }
  }

  function handleBackToLogin() {
    router.push("/login");
  }

  return (
    <VerifyEmailHero
      status={status}
      onContinue={handleContinue}
      onBackToLogin={handleBackToLogin}
    />
  );
}
