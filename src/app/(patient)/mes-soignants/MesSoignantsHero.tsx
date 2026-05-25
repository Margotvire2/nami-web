"use client";

import { Info } from "lucide-react";

interface MesSoignantsHeroProps {
  count: number;
}

/**
 * En-tête de la page /mes-soignants.
 *
 * Mention RGPD Art. 7§3 explicite : retrait du consentement à tout moment.
 * Wording MDR-safe : "dossier de coordination", "accès à vos données".
 */
export function MesSoignantsHero({ count }: MesSoignantsHeroProps) {
  return (
    <header className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A2E] tracking-tight">
          Mes soignants
        </h1>
        <p className="text-sm md:text-base text-[#6B7280] leading-relaxed">
          {count === 0
            ? "Aucun soignant n'a accès à votre dossier de coordination pour le moment."
            : `${count} soignant${count > 1 ? "s ont" : " a"} accès à votre dossier de coordination.`}
        </p>
      </div>

      <div
        role="note"
        aria-label="Information sur le retrait du consentement"
        className="flex gap-3 p-4 rounded-xl border border-[rgba(37,99,235,0.18)] bg-[rgba(37,99,235,0.05)]"
      >
        <Info
          className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5"
          strokeWidth={2}
          aria-hidden="true"
        />
        <p className="text-sm text-[#1A1A2E] leading-relaxed">
          Conformément à l&apos;
          <strong className="font-semibold">article 7§3 du RGPD</strong>, vous pouvez
          retirer à tout moment votre consentement à l&apos;accès d&apos;un soignant à vos
          données. La révocation est immédiate et sans conséquence sur les soins reçus
          jusqu&apos;ici.
        </p>
      </div>
    </header>
  );
}
