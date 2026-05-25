import Link from "next/link";
import { ShieldCheck } from "lucide-react";

/**
 * En-tête de la page "Mes données et mes droits".
 *
 * Présente le cadre RGPD général + mention HDS (cohérent avec
 * /confidentialite §3) + renvoi vers la politique de confidentialité
 * complète pour les détails sous-traitants / transferts.
 */
export function MesDonneesHero() {
  return (
    <header className="space-y-4">
      <h1
        className="text-3xl md:text-4xl font-bold text-[#1A1A2E] tracking-tight"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        Mes données et mes droits
      </h1>

      <p className="text-[15px] leading-relaxed text-[#374151] max-w-2xl">
        Conformément au Règlement Général sur la Protection des Données (RGPD),
        vous disposez de plusieurs droits sur les données personnelles que Nami
        traite à votre sujet. Vous pouvez exercer ces droits ci-dessous.
      </p>

      <div
        role="note"
        className="flex gap-3 p-4 rounded-xl border border-[rgba(91,78,196,0.18)] bg-[rgba(91,78,196,0.05)]"
      >
        <ShieldCheck
          className="w-5 h-5 text-[#5B4EC4] shrink-0 mt-0.5"
          strokeWidth={2}
          aria-hidden="true"
        />
        <p className="text-sm text-[#374151] leading-relaxed">
          Vos données sont hébergées en France sur une infrastructure conforme
          à l&apos;agrément <strong>Hébergeur de Données de Santé (HDS)</strong> au
          sens de l&apos;article L.1111-8 du Code de la santé publique. Pour le
          détail des traitements et des sous-traitants, consultez la{" "}
          <Link
            href="/confidentialite"
            className="text-[#5B4EC4] underline underline-offset-2 hover:text-[#4A3EA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded-sm transition-colors duration-150"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </header>
  );
}
