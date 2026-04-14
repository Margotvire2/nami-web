"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        // Redirect vers /login?verified=true après 2s
        setTimeout(() => router.replace("/login?verified=true"), 2000);
      })
      .catch(() => setStatus("error"));
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-500">Vérification en cours…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-teal-500" />
            </div>
            <h1 className="text-lg font-semibold text-neutral-800 mb-2">Email confirmé</h1>
            <p className="text-sm text-neutral-500">Redirection vers la connexion…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-lg font-semibold text-neutral-800 mb-2">Lien invalide</h1>
            <p className="text-sm text-neutral-500 mb-5">
              Ce lien de vérification est expiré ou déjà utilisé.
            </p>
            <button
              onClick={() => router.replace("/login")}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
