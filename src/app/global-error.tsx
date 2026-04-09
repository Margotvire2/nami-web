"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-xl font-semibold text-neutral-800">Une erreur est survenue</h2>
          <p className="text-sm text-neutral-500">L&apos;équipe technique a été notifiée.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
