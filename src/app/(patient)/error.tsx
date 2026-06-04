"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCcw, Home, LifeBuoy } from "lucide-react";
import Link from "next/link";

/**
 * F-WEB-PAGES-404-500-CUSTOM-ERROR-BOUNDARIES
 *
 * Error boundary du groupe (patient). Intercepte les erreurs des pages
 * patient (/accueil, /mes-documents, /mes-messages, /rendez-vous, etc.)
 *
 * - Sentry tag `boundary=patient`
 * - Bannière urgence vitale 15/112 visible (règle CLAUDE.md nami-web)
 * - JAMAIS de stack trace côté patient en prod
 * - Wording safe + ton rassurant
 */
export default function PatientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("boundary", "patient");
      scope.setTag("error.digest", error.digest ?? "unknown");
      Sentry.captureException(error);
    });
    if (process.env.NODE_ENV !== "production") {
      console.error("[Nami] Patient error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Bannière urgence vitale — règle Nami patient */}
      <div
        className="w-full text-center text-xs font-medium py-2 px-4"
        style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
      >
        En cas d&apos;urgence vitale, appelez le 15 (SAMU) ou le 112.
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
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
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "#6B7280" }}>
            Vos données sont en sécurité. Vous pouvez réessayer, revenir à votre accueil ou contacter notre support.
            {error.digest && (
              <span className="block mt-2 text-xs font-mono" style={{ color: "#9CA3AF" }}>
                Réf : {error.digest}
              </span>
            )}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
              style={{ backgroundColor: "#5B4EC4", color: "#FFFFFF" }}
            >
              <RotateCcw size={14} /> Réessayer
            </button>
            <div className="flex gap-3">
              <Link
                href="/accueil"
                className="flex-1 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: "#EEEDFB", color: "#5B4EC4" }}
              >
                <Home size={14} /> Accueil
              </Link>
              <Link
                href="/aide"
                className="flex-1 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: "#EEEDFB", color: "#5B4EC4" }}
              >
                <LifeBuoy size={14} /> Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
