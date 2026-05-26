import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

/**
 * Garanties compliance et sécurité — synthèse pour DPO / RSSI institutionnel.
 *
 * Cohérent verbatim avec /(legal)/confidentialite (PR #49) :
 *   - Hébergement HDS prévu 2026 (pas certifié à ce jour)
 *   - Sous-traitant RGPD Art. 28
 *   - Aucune donnée hors UE
 *   - Anonymisation 30 jours (RGPD Art. 17)
 */
export function PartenairesCompliance() {
  const points = [
    {
      title: "Hébergement en France",
      detail:
        "Données hébergées en Union européenne. Migration vers une infrastructure HDS certifiée (Hébergeur de Données de Santé, art. L.1111-8 CSP) prévue en 2026.",
    },
    {
      title: "Conformité RGPD",
      detail:
        "Nami intervient en qualité de sous-traitant au sens de l'article 28 du RGPD. Convention de sous-traitance établie avec chaque partenaire institutionnel.",
    },
    {
      title: "Aucun transfert hors UE",
      detail:
        "Les données de santé à caractère personnel ne sont pas transférées hors de l'Union européenne.",
    },
    {
      title: "Droit à l'effacement",
      detail:
        "Anonymisation des données sous 30 jours en cas de demande d'effacement (RGPD Art. 17).",
    },
    {
      title: "DPO accessible",
      detail:
        "Délégué à la Protection des Données joignable à contact@namipourlavie.com pour toute question relative au traitement.",
    },
    {
      title: "Notification breach 72h",
      detail:
        "Engagement de notification dans les 72 heures en cas de violation de données, conformément à l'article 33 du RGPD.",
    },
  ];

  return (
    <section
      aria-labelledby="compliance-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#FAFAF8" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ background: "rgba(91,78,196,0.08)", color: "#5B4EC4" }}
            aria-hidden="true"
          >
            <ShieldCheck size={26} strokeWidth={1.8} />
          </div>
          <h2
            id="compliance-title"
            className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.02em",
            }}
          >
            Garanties compliance et sécurité
          </h2>
          <p
            className="text-base"
            style={{ color: "#6B7280", maxWidth: 560, margin: "0 auto" }}
          >
            Les engagements de Nami vis-à-vis des partenaires institutionnels.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-5 mb-8">
          {points.map((p) => (
            <article
              key={p.title}
              className="p-5 rounded-xl"
              style={{
                background: "#fff",
                border: "1px solid rgba(26,26,46,0.06)",
              }}
            >
              <h3
                className="text-sm md:text-base font-bold mb-2"
                style={{
                  color: "#1A1A2E",
                  fontFamily: "var(--font-jakarta)",
                }}
              >
                {p.title}
              </h3>
              <p
                className="text-xs md:text-sm"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                {p.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/confidentialite"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-3 py-1"
            style={{ color: "#5B4EC4" }}
          >
            Voir la politique de confidentialité complète
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
