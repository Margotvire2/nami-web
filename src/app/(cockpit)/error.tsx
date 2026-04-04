"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function CockpitError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Nami] Cockpit error:", error);
  }, [error]);

  return (
    <div className="h-full flex items-center justify-center bg-[#F0F2F8]">
      <div className="bg-white rounded-2xl p-10 max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FEE2E2] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-[#DC2626]" />
        </div>

        <h1
          className="text-xl font-bold text-[#1E293B] mb-2"
          style={{ fontFamily: "var(--font-jakarta), system-ui" }}
        >
          Une erreur est survenue
        </h1>

        <p className="text-sm text-[#64748B] mb-8 leading-relaxed">
          Quelque chose s'est mal passé. Vous pouvez réessayer ou revenir à l'accueil.
          {error.digest && (
            <span className="block mt-2 text-xs text-[#94A3B8] font-mono">
              Réf: {error.digest}
            </span>
          )}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-[#4F46E5] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3B55E0] transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Réessayer
          </button>
          <Link
            href="/aujourd-hui"
            className="bg-[#EEF1FF] text-[#4F46E5] text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#E0E5FF] transition-colors flex items-center gap-2"
          >
            <Home size={14} /> Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
