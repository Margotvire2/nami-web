import Link from "next/link";
import { Edit3, ArrowRight } from "lucide-react";

/**
 * Art. 16 RGPD — Droit de rectification.
 *
 * V1 : on ne réimplémente pas un formulaire ici (déjà présent sur /mon-compte).
 * On redirige le patient vers la page existante.
 *
 * Note : pour les données saisies par un soignant (notes, observations,
 * documents), le responsable de traitement est le soignant — la rectification
 * doit lui être demandée directement (Art. 28 RGPD, sous-traitance Nami).
 */
export function MesDonneesRectifSection() {
  return (
    <section
      aria-labelledby="rectif-heading"
      className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6 md:p-8 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(91,78,196,0.08)] flex items-center justify-center shrink-0">
          <Edit3
            className="w-5 h-5 text-[#5B4EC4]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        <h2
          id="rectif-heading"
          className="text-xl font-semibold text-[#1A1A2E]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Corriger mes données
        </h2>
      </div>

      <p className="text-sm text-[#6B7280] leading-relaxed">
        Art. 16 RGPD — droit de rectification. Vous pouvez corriger vos
        informations personnelles (nom, prénom, e-mail, téléphone, date de
        naissance) directement depuis votre compte.
      </p>

      <Link
        href="/mon-compte"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#5B4EC4] bg-[rgba(91,78,196,0.08)] hover:bg-[rgba(91,78,196,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 transition-colors duration-150"
      >
        Aller dans mon compte
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>

      <p className="text-xs text-[#6B7280] leading-relaxed border-t border-[rgba(26,26,46,0.06)] pt-4">
        Pour signaler une erreur dans une information saisie par un
        professionnel de santé (par exemple un compte-rendu ou un document
        partagé), contactez directement le soignant concerné : il est le
        responsable du traitement de ces données au sens de l&apos;article 28 du
        RGPD.
      </p>
    </section>
  );
}
