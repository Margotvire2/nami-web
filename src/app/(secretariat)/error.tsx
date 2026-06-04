"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

/**
 * F-WEB-PAGES-404-500-CUSTOM-ERROR-BOUNDARIES
 *
 * Error boundary du groupe (secretariat). Intercepte les erreurs des
 * pages secrétariat (/secretariat, /secretariat/patients,
 * /secretariat/salle-attente, /secretariat/parametres) sans casser la
 * sidebar du layout.
 *
 * - Sentry tag `boundary=secretariat`
 * - JAMAIS de stack trace en prod
 */
export default function SecretariatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("boundary", "secretariat");
      scope.setTag("error.digest", error.digest ?? "unknown");
      Sentry.captureException(error);
    });
    if (process.env.NODE_ENV !== "production") {
      console.error("[Nami] Secretariat error:", error);
    }
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FAFAF8" }}>
      <div
        className="bg-white rounded-2xl p-10 max-w-md w-full text-center"
        style={{ border: "1px solid rgba(26,26,46,0.06)", boxShadow: "0 10px 40px rgba(26,26,46,0.06)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#FEE2E2" }}
        >
          <AlertTriangle size={28} style={{ color: "#DC2626" }} />
        </div>

        <h1
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "var(--font-jakarta), system-ui", color: "#1A1A2E" }}
        >
          Une erreur inattendue est survenue
        </h1>

        <p className="text-sm mb-4 leading-relaxed" style={{ color: "#6B7280" }}>
          Vous pouvez réessayer ou revenir à l&apos;agenda. Notre équipe a été notifiée.
          {error.digest && (
            <span className="block mt-2 text-xs font-mono" style={{ color: "#9CA3AF" }}>
              Réf : {error.digest}
            </span>
          )}
        </p>

        {isDev && (
          <pre
            className="mb-6 text-left text-[11px] rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap break-words"
            style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
          >
            {error?.message ?? String(error)}
            {error?.stack ? "\n\n" + error.stack : ""}
          </pre>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: "#5B4EC4", color: "#FFFFFF" }}
          >
            <RotateCcw size={14} /> Réessayer
          </button>
          <Link
            href="/secretariat"
            className="w-full sm:w-auto text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: "#EEEDFB", color: "#5B4EC4" }}
          >
            <Home size={14} /> Agenda
          </Link>
        </div>
      </div>
    </div>
  );
}
