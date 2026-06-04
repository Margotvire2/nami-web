"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * F-WEB-PAGES-404-500-CUSTOM-ERROR-BOUNDARIES
 *
 * Fallback root layout — utilisé UNIQUEMENT si une erreur survient dans
 * `src/app/layout.tsx` lui-même (avant que le RootError ne puisse s'afficher).
 * Doit inclure <html> + <body>. Styles inline (pas de Tailwind garanti).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("boundary", "global-root");
      scope.setTag("error.digest", error.digest ?? "unknown");
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAFAF8",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 40,
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            border: "1px solid rgba(26,26,46,0.06)",
            boxShadow: "0 10px 40px rgba(26,26,46,0.06)",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1A1A2E",
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            Une erreur inattendue est survenue
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 0, marginBottom: 24 }}>
            Notre équipe a été notifiée. Vous pouvez réessayer ou revenir à l&apos;accueil.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#5B4EC4",
              color: "#FFFFFF",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 24px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
