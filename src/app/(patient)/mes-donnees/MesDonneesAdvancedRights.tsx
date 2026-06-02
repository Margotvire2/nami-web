import Link from "next/link";
import { Shield, ChevronDown, ExternalLink } from "lucide-react";

/**
 * Droits RGPD avancés — Art. 18 (limitation) + Art. 21 (opposition).
 *
 * UX : <details>/<summary> natif HTML, fully a11y (clavier + lecteur d'écran),
 * pas de JS. Le browser gère l'ouverture/fermeture.
 *
 * Wording aligné avec /confidentialite §6 (sous-traitants IA, droit
 * d'opposition aux traitements automatisés).
 *
 * Contact DPO : dpo@namipourlavie.com (cohérent avec la politique de
 * confidentialité publiée).
 */
export function MesDonneesAdvancedRights() {
  return (
    <section
      aria-labelledby="advanced-heading"
      className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6 md:p-8 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(91,78,196,0.08)] flex items-center justify-center shrink-0">
          <Shield
            className="w-5 h-5 text-[#5B4EC4]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        <h2
          id="advanced-heading"
          className="text-xl font-semibold text-[#1A1A2E]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Autres droits RGPD
        </h2>
      </div>

      <p className="text-sm text-[#6B7280] leading-relaxed">
        Pour exercer les droits ci-dessous, contactez notre référent à la
        protection des données par e-mail. Nous répondons sous un mois maximum.
      </p>

      <div className="space-y-3">
        {/* Art. 18 — Limitation du traitement */}
        <details className="group rounded-xl border border-[rgba(26,26,46,0.08)] overflow-hidden">
          <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5B4EC4]/40 transition-colors duration-150">
            <span className="text-sm font-semibold text-[#1A1A2E]">
              Limiter le traitement de mes données — Art. 18 RGPD
            </span>
            <ChevronDown
              className="w-4 h-4 text-[#6B7280] shrink-0 transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="px-4 pb-4 pt-1 text-sm text-[#374151] leading-relaxed space-y-2">
            <p>
              Vous pouvez demander la <strong>limitation</strong> du traitement
              de vos données dans certaines situations prévues par l&apos;article 18
              du RGPD : contestation de l&apos;exactitude des données, traitement
              illicite auquel vous vous opposez, ou si vous en avez besoin pour
              constater, exercer ou défendre un droit en justice.
            </p>
            <p>
              Pour formuler une demande :{" "}
              <a
                href="mailto:dpo@namipourlavie.com"
                className="text-[#5B4EC4] underline underline-offset-2 hover:text-[#4A3EA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded-sm"
              >
                dpo@namipourlavie.com
              </a>
            </p>
          </div>
        </details>

        {/* Art. 21 — Droit d'opposition */}
        <details className="group rounded-xl border border-[rgba(26,26,46,0.08)] overflow-hidden">
          <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5B4EC4]/40 transition-colors duration-150">
            <span className="text-sm font-semibold text-[#1A1A2E]">
              M&apos;opposer à un traitement — Art. 21 RGPD
            </span>
            <ChevronDown
              className="w-4 h-4 text-[#6B7280] shrink-0 transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="px-4 pb-4 pt-1 text-sm text-[#374151] leading-relaxed space-y-2">
            <p>
              Vous pouvez vous opposer, pour des raisons tenant à votre
              situation particulière, à un traitement fondé sur l&apos;intérêt
              légitime de Nami. Vous pouvez également vous opposer aux
              traitements automatisés décrits dans la{" "}
              <Link
                href="/confidentialite"
                className="text-[#5B4EC4] underline underline-offset-2 hover:text-[#4A3EA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded-sm"
              >
                politique de confidentialité
              </Link>{" "}
              (structuration des notes, synthèses, extraction de bilans).
            </p>
            <p>
              Pour formuler une demande :{" "}
              <a
                href="mailto:dpo@namipourlavie.com"
                className="text-[#5B4EC4] underline underline-offset-2 hover:text-[#4A3EA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded-sm"
              >
                dpo@namipourlavie.com
              </a>
            </p>
          </div>
        </details>
      </div>

      <div
        role="note"
        className="text-xs text-[#6B7280] leading-relaxed border-t border-[rgba(26,26,46,0.06)] pt-4"
      >
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez
          introduire une réclamation auprès de la Commission Nationale de
          l&apos;Informatique et des Libertés (CNIL).
        </p>
        <a
          href="https://www.cnil.fr/fr/plaintes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-[#5B4EC4] underline underline-offset-2 hover:text-[#4A3EA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded-sm"
        >
          Déposer une plainte sur cnil.fr
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
