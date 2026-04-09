"use client";

export default function SentryTestPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        className="px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        onClick={() => {
          throw new Error("Sentry test — Nami frontend");
        }}
      >
        Envoyer une erreur test à Sentry
      </button>
    </div>
  );
}
