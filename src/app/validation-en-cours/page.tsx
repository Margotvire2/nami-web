"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { onboardingApi } from "@/lib/api";
import { Clock, Mail, ShieldCheck } from "lucide-react";

export default function ValidationEnCoursPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  // Vérifier périodiquement si le compte a été validé
  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    const check = () => {
      onboardingApi.me(accessToken).then(({ profile }) => {
        if (profile.validatedStatus) {
          router.replace("/aujourd-hui");
        }
      }).catch(() => {});
    };

    // Vérification immédiate + toutes les 30 secondes
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [accessToken, router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 text-center">

        {/* Icône */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>

        {/* Titre */}
        <h1 className="text-xl font-semibold text-neutral-800 mb-2">
          Vérification en cours
        </h1>

        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          Nous vérifions votre identité professionnelle via l&apos;annuaire
          national des professionnels de santé. Vous recevrez un email
          dès que votre accès sera activé.
        </p>

        {/* Étapes */}
        <div className="space-y-3 text-left mb-8">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50">
            <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-teal-700">Compte créé</p>
              <p className="text-[10px] text-teal-500">Inscription confirmée</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-700">Vérification de votre identité professionnelle</p>
              <p className="text-[10px] text-amber-500">En cours — délai habituel : moins de 24h</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50">
            <Mail className="w-5 h-5 text-neutral-300 shrink-0" />
            <div>
              <p className="text-xs font-medium text-neutral-400">Accès activé</p>
              <p className="text-[10px] text-neutral-300">Vous recevrez un email de confirmation</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="mailto:contact@namipourlavie.com"
            className="block w-full px-4 py-2.5 text-sm font-medium text-teal-600 bg-teal-50 rounded-xl hover:bg-teal-100 transition"
          >
            Contacter le support
          </a>
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2.5 text-sm text-neutral-400 hover:text-neutral-600 transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
