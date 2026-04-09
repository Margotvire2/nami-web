"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  const sendTest = () => {
    try {
      throw new Error("Sentry test — Nami frontend " + new Date().toISOString());
    } catch (e) {
      Sentry.captureException(e);
      alert("Erreur envoyée à Sentry !");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <button
        className="px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        onClick={sendTest}
      >
        Envoyer une erreur test à Sentry
      </button>
      <p className="text-xs text-gray-400">
        DSN: {process.env.NEXT_PUBLIC_SENTRY_DSN ? "configuré" : "MANQUANT"}
      </p>
    </div>
  );
}
