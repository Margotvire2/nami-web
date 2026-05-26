"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";

/**
 * État vide : aucun soignant autorisé.
 *
 * CTA principal : trouver un soignant via l'annuaire public.
 * Wording MDR-safe : pas de "prise en charge", pas de "traitement".
 */
export function MesSoignantsEmptyState() {
  return (
    <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.08)] p-8 md:p-12 text-center shadow-[0_1px_3px_rgba(26,26,46,0.04)]">
      <div
        aria-hidden="true"
        className="w-14 h-14 mx-auto rounded-full bg-[rgba(91,78,196,0.10)] text-[#5B4EC4] flex items-center justify-center"
      >
        <UserPlus className="w-7 h-7" strokeWidth={2} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-[#1A1A2E]">
        Aucun soignant pour le moment
      </h2>
      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed max-w-md mx-auto">
        Lorsque vous accordez un accès à un soignant, vous le retrouvez ici et pouvez
        gérer son accès en un clic.
      </p>
      <div className="mt-6">
        <Link
          href="/trouver-un-soignant"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#5B4EC4] hover:bg-[#4A3EA6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 transition-colors duration-150"
        >
          <UserPlus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          Trouver un soignant
        </Link>
      </div>
    </div>
  );
}
